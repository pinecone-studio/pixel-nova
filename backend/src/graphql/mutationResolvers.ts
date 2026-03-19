import {
  createEmployeeCodeSession,
  deleteSessionByToken,
  ensureDefaultActionConfigs,
  getAuditLogById,
  getEmployeeById,
  getEmployeeSignatureByEmployeeId,
  getEmployerSignatureByUserId,
  getContractRequestById,
  getLeaveRequestById,
  getDocuments,
  insertDocument,
  insertContractRequest,
  insertLeaveRequest,
  insertEmployeeNotification,
  insertAnnouncementNotificationsForAudience,
  insertAnnouncementDraft as insertAnnouncementDraftRecord,
  updateAnnouncementDraft as updateAnnouncementDraftRecord,
  publishAnnouncement as publishAnnouncementRecord,
  listActionConfigs,
  requestEmployeeOtp,
  updateAuditLogDelivery,
  updateContractRequestStatus,
  updateLeaveRequestStatus,
  updateEmployeeDocumentProfile,
  upsertActionConfig,
  upsertEmployeeRecord,
  upsertEmployeeSignature,
  upsertEmployerSignature,
  getEmployeeSignatureStatus,
  getEmployerSignatureStatus,
  verifyEmployeeSignaturePasscode,
  verifyEmployerSignaturePasscode,
  verifyEmployeeOtp,
  markEmployeeNotificationRead,
} from "../db/queries";
import {
  buildEmployeeChangeSet,
  resolveEmployeeLifecycleAction,
} from "../services/actionResolver";
import { dispatchNotification } from "../notifications/dispatchNotification";
import { sendEmailWithRetry } from "../notifications/sendEmailWithRetry";
import { uploadEmployeeDocumentToR2 } from "../storage/r2";
import type { GraphQLContext } from "./schema";
import { executeTriggeredAction } from "./helpers";
import { buildTemplateData, validateRequiredFields } from "../document/templateData";
import {
  buildContractActionConfig,
  normalizeContractTemplateIds,
} from "../services/contractTemplates";

type Ctx = GraphQLContext;

interface TriggerActionArgs {
  employeeId: string;
  action: string;
  dryRun?: boolean | null;
  overrideRecipients?: string[] | null;
  templateDataOverrides?: Record<string, string> | null;
}

interface UpsertEmployeeInput {
  id: string;
  employeeCode?: string | null;
  firstName: string;
  lastName: string;
  firstNameEng?: string | null;
  lastNameEng?: string | null;
  entraId?: string | null;
  email?: string | null;
  imageUrl?: string | null;
  github?: string | null;
  department: string;
  branch: string;
  jobTitle?: string | null;
  level: string;
  hireDate: string;
  terminationDate?: string | null;
  status: string;
  numberOfVacationDays?: number | null;
  isSalaryCompany?: boolean | null;
  isKpi?: boolean | null;
  birthDayAndMonth?: string | null;
  birthdayPoster?: string | null;
  documentProfile?: Record<string, unknown> | null;
}

interface ResolveEmployeeActionInput {
  employeeId: string;
  changedFields: string[];
  oldValues: Record<string, unknown>;
  newValues: Record<string, unknown>;
}

interface UpdateRegistryInput {
  name: string;
  phase: string;
  triggerCondition?: string | null;
  triggerFields: string[];
  requiredEmployeeFields?: string[];
  recipients?: string[];
  documents?: Array<{
    id: string;
    template: string;
    order: number;
  }>;
}

interface UploadHrDocumentInput {
  employeeId: string;
  action: string;
  documentName: string;
  contentType: string;
  contentBase64: string;
}

export const mutationResolvers = {
  requestOtp: async (_: unknown, args: { employeeCode: string }, ctx: Ctx) => {
    const resendApiKey =
      (ctx.env as CloudflareBindings & { RESEND_API_KEY?: string }).RESEND_API_KEY ?? "";
    const testOtpEmail =
      (ctx.env as CloudflareBindings & { TEST_OTP_EMAIL?: string }).TEST_OTP_EMAIL ?? "";

    if (!resendApiKey) {
      throw new Error("RESEND_API_KEY is not configured");
    }

    const result = await requestEmployeeOtp(
      ctx.db,
      args.employeeCode,
      resendApiKey,
      testOtpEmail,
    );
    return {
      success: true,
      maskedEmail: result.maskedEmail,
      expiresAt: result.expiresAt,
    };
  },

  verifyOtp: async (_: unknown, args: { employeeCode: string; code: string }, ctx: Ctx) =>
    verifyEmployeeOtp(ctx.db, args.employeeCode, args.code),

  loginWithCode: async (_: unknown, args: { employeeCode: string }, ctx: Ctx) =>
    createEmployeeCodeSession(ctx.db, args.employeeCode),

  logout: async (_: unknown, __: unknown, ctx: Ctx) => {
    if (!ctx.sessionToken) {
      return true;
    }

    return deleteSessionByToken(ctx.db, ctx.sessionToken);
  },

  triggerAction: (_: unknown, args: TriggerActionArgs, ctx: Ctx) =>
    executeTriggeredAction(ctx, args.employeeId, args.action, {
      dryRun: args.dryRun ?? false,
      overrideRecipients: args.overrideRecipients ?? undefined,
      templateDataOverrides: args.templateDataOverrides ?? undefined,
    }),

  upsertEmployee: async (
    _: unknown,
    args: { input: UpsertEmployeeInput },
    ctx: Ctx,
  ) => {
    const persisted = await upsertEmployeeRecord(ctx.db, {
      ...args.input,
      jobTitle: args.input.jobTitle ?? undefined,
      documentProfile:
        args.input.documentProfile === undefined
          ? undefined
          : JSON.stringify(args.input.documentProfile ?? {}),
    });
    await ensureDefaultActionConfigs(ctx.db);

    const changeSet = buildEmployeeChangeSet(
      persisted.previousEmployee,
      persisted.employee,
    );

    const actionConfigs = await listActionConfigs(ctx.db);
    const resolvedAction = resolveEmployeeLifecycleAction(
      {
        employeeId: persisted.employee.id,
        changedFields: changeSet.changedFields,
        oldValues: changeSet.oldValues,
        newValues: changeSet.newValues,
      },
      { actionConfigs },
    );

    const triggeredActionResult = resolvedAction
      ? await executeTriggeredAction(
          ctx,
          persisted.employee.id,
          resolvedAction,
        )
      : null;

    // Send employee code to new employee's email
    const isNewEmployee = !persisted.previousEmployee;
    const employeeEmail = persisted.employee.email;
    if (isNewEmployee && employeeEmail) {
      const apiKey =
        (ctx.env as CloudflareBindings & { RESEND_API_KEY?: string })
          .RESEND_API_KEY ?? "";
      if (apiKey) {
        const code = persisted.employee.employeeCode;
        const name = `${persisted.employee.lastName ?? ""} ${persisted.employee.firstName ?? ""}`.trim();
        try {
          await sendEmailWithRetry({
            to: [employeeEmail],
            subject: "EPAS — Таны ажилтны код",
            text: `Сайн байна уу ${name},\n\nТаны ажилтны код: ${code}\n\nЭнэ кодоор системд нэвтэрнэ үү.\n\nХүндэтгэсэн,\nPinecone LLC HR`,
            html: `
              <div style="font-family:sans-serif;max-width:480px;margin:0 auto;padding:24px;">
                <h2 style="color:#111827;margin-bottom:16px;">Сайн байна уу, ${name}!</h2>
                <p style="color:#374151;font-size:15px;">Таны ажилтны код:</p>
                <div style="background:#F0FDF4;border:1px solid #BBF7D0;border-radius:12px;padding:16px 24px;text-align:center;margin:16px 0;">
                  <span style="font-size:28px;font-weight:700;color:#111827;letter-spacing:2px;">${code}</span>
                </div>
                <p style="color:#6B7280;font-size:14px;">Энэ кодоор EPAS системд нэвтэрнэ үү.</p>
                <hr style="border:none;border-top:1px solid #E5E7EB;margin:24px 0;" />
                <p style="color:#9CA3AF;font-size:12px;">Pinecone LLC — HR System</p>
              </div>
            `,
            apiKey,
          });
        } catch {
          // Non-critical — don't fail the mutation if email fails
          console.error(`Failed to send employee code email to ${employeeEmail}`);
        }
      }
    }

    return {
      employee: persisted.employee,
      resolvedAction,
      triggeredActionResult,
    };
  },

  resolveEmployeeAction: async (
    _: unknown,
    args: { input: ResolveEmployeeActionInput },
    ctx: Ctx,
  ) => {
    const employee = await getEmployeeById(ctx.db, args.input.employeeId);

    if (!employee) {
      throw new Error(`Employee not found for id ${args.input.employeeId}`);
    }

    await ensureDefaultActionConfigs(ctx.db);
    const actionConfigs = await listActionConfigs(ctx.db);
    const action = resolveEmployeeLifecycleAction(args.input, {
      actionConfigs,
    });

    return action ? { action } : null;
  },

  updateRegistry: (
    _: unknown,
    args: { input: UpdateRegistryInput },
    ctx: Ctx,
  ) => upsertActionConfig(ctx.db, args.input),

  updateMyDocumentProfile: async (
    _: unknown,
    args: { input: Record<string, unknown> },
    ctx: Ctx,
  ) => {
    if (ctx.actor.role !== "employee" || !ctx.actor.id) {
      throw new Error("Unauthorized");
    }

    const updated = await updateEmployeeDocumentProfile(
      ctx.db,
      ctx.actor.id,
      JSON.stringify(args.input ?? {}),
    );

    if (!updated) {
      throw new Error("Failed to update document profile");
    }

    return updated;
  },

  submitLeaveRequest: async (
    _: unknown,
    args: { type: string; startTime: string; endTime: string; reason: string },
    ctx: Ctx,
  ) => {
    if (ctx.actor.role !== "employee" || !ctx.actor.id) {
      throw new Error("Unauthorized");
    }
    const row = await insertLeaveRequest(ctx.db, {
      employeeId: ctx.actor.id,
      type: args.type,
      startTime: args.startTime,
      endTime: args.endTime,
      reason: args.reason,
    });
    if (!row) throw new Error("Failed to create leave request");
    return getLeaveRequestById(ctx.db, row.id);
  },

  approveLeaveRequest: async (
    _: unknown,
    args: { id: string; note?: string | null },
    ctx: Ctx,
  ) => {
    if (ctx.actor.role !== "hr" && ctx.actor.role !== "admin") {
      throw new Error("Unauthorized");
    }
    const row = await updateLeaveRequestStatus(ctx.db, args.id, "approved", args.note);
    if (!row) throw new Error("Leave request not found");
    return row;
  },

  rejectLeaveRequest: async (
    _: unknown,
    args: { id: string; note?: string | null },
    ctx: Ctx,
  ) => {
    if (ctx.actor.role !== "hr" && ctx.actor.role !== "admin") {
      throw new Error("Unauthorized");
    }
    const row = await updateLeaveRequestStatus(ctx.db, args.id, "rejected", args.note);
    if (!row) throw new Error("Leave request not found");
    return row;
  },

  submitContractRequest: async (
    _: unknown,
    args: {
      templateIds: string[];
      signatureMode?: string | null;
      passcode?: string | null;
      signatureData?: string | null;
    },
    ctx: Ctx,
  ) => {
    if (ctx.actor.role !== "employee" || !ctx.actor.id) {
      throw new Error("Unauthorized");
    }

    const normalized = normalizeContractTemplateIds(args.templateIds ?? []);
    if (normalized.length === 0) {
      throw new Error("Гэрээний загвар сонгоогүй байна.");
    }
    if (normalized.length > 3) {
      throw new Error("Нэг дор 3 хүртэл гэрээ сонгох боломжтой.");
    }

    const signature = await getEmployeeSignatureByEmployeeId(ctx.db, ctx.actor.id);
    const signatureMode = (args.signatureMode ?? "").toLowerCase().trim();
    const signatureData = args.signatureData?.trim() ?? "";
    const passcode = args.passcode?.trim() ?? "";

    const wantsRedraw = signatureMode === "redraw" || (!signatureMode && Boolean(signatureData));
    const wantsReuse = signatureMode === "reuse" || (!signatureMode && !wantsRedraw);

    if (wantsReuse) {
      if (!signature?.signatureData) {
        throw new Error("Гарын үсэг олдсонгүй. Эхлээд гарын үсгээ зурна уу.");
      }

      if (signature.passcodeHash) {
        if (!passcode) {
          throw new Error("4 оронтой кодоо оруулна уу.");
        }

        const verification = await verifyEmployeeSignaturePasscode(
          ctx.db,
          ctx.actor.id,
          passcode,
        );
        if (!verification.ok) {
          throw new Error("Код буруу байна. Дахин оролдоно уу.");
        }
      }
    }

    if (wantsRedraw) {
      if (!signatureData) {
        throw new Error("Гарын үсгээ зурна уу.");
      }

      if (passcode && !/^[0-9]{4}$/.test(passcode)) {
        throw new Error("4 оронтой код шаардлагатай.");
      }

      await upsertEmployeeSignature(ctx.db, {
        employeeId: ctx.actor.id,
        signatureData,
        passcode: passcode || undefined,
      });
    }

    const inserted = await insertContractRequest(ctx.db, {
      employeeId: ctx.actor.id,
      templateIds: normalized,
      signatureMode: wantsRedraw ? "redraw" : "reuse",
    });

    if (!inserted) {
      throw new Error("Failed to create contract request");
    }

    const full = await getContractRequestById(ctx.db, inserted.id);
    if (!full) throw new Error("Failed to load contract request");
    return full;
  },

  saveMySignature: async (
    _: unknown,
    args: { signatureData: string; passcode?: string | null },
    ctx: Ctx,
  ) => {
    if (ctx.actor.role !== "employee" || !ctx.actor.id) {
      throw new Error("Unauthorized");
    }

    const signatureData = args.signatureData?.trim() ?? "";
    const passcode = args.passcode?.trim() ?? "";
    if (!signatureData) {
      throw new Error("Гарын үсгээ зурна уу.");
    }
    if (passcode && !/^[0-9]{4}$/.test(passcode)) {
      throw new Error("4 оронтой код шаардлагатай.");
    }

    await upsertEmployeeSignature(ctx.db, {
      employeeId: ctx.actor.id,
      signatureData,
      passcode: passcode || undefined,
    });

    return getEmployeeSignatureStatus(ctx.db, ctx.actor.id);
  },

  saveEmployerSignature: async (
    _: unknown,
    args: { signatureData: string; passcode?: string | null },
    ctx: Ctx,
  ) => {
    if (ctx.actor.role !== "hr" && ctx.actor.role !== "admin") {
      throw new Error("Unauthorized");
    }
    if (!ctx.actor.id) {
      throw new Error("Actor ID required");
    }

    const signatureData = args.signatureData?.trim() ?? "";
    const passcode = args.passcode?.trim() ?? "";
    if (!signatureData) {
      throw new Error("Гарын үсгээ зурна уу.");
    }
    if (passcode && !/^[0-9]{4}$/.test(passcode)) {
      throw new Error("4 оронтой код шаардлагатай.");
    }

    await upsertEmployerSignature(ctx.db, {
      userId: ctx.actor.id,
      signatureData,
      passcode: passcode || undefined,
    });

    return getEmployerSignatureStatus(ctx.db, ctx.actor.id);
  },

  approveContractRequest: async (
    _: unknown,
    args: {
      id: string;
      note?: string | null;
      employerSignatureMode?: string | null;
      employerPasscode?: string | null;
      employerSignatureData?: string | null;
    },
    ctx: Ctx,
  ) => {
    if (ctx.actor.role !== "hr" && ctx.actor.role !== "admin") {
      throw new Error("Unauthorized");
    }

    const request = await getContractRequestById(ctx.db, args.id);
    if (!request) {
      throw new Error("Contract request not found");
    }
    if (request.status !== "pending") {
      throw new Error("Энэ хүсэлт аль хэдийн шийдвэрлэгдсэн байна.");
    }

    const normalized = normalizeContractTemplateIds(request.templateIds ?? []);
    if (normalized.length === 0) {
      throw new Error("Гэрээний загвар сонгоогүй байна.");
    }
    if (normalized.length > 3) {
      throw new Error("Нэг дор 3 хүртэл гэрээ сонгох боломжтой.");
    }

    const actionConfig = buildContractActionConfig(normalized);
    const nowIso = new Date().toISOString();
    const templateData = buildTemplateData(request.employee, nowIso);
    const { incompleteFields } = validateRequiredFields(
      templateData,
      actionConfig.requiredEmployeeFields,
    );

    if (incompleteFields.length > 0) {
      throw new Error(
        `Дутуу мэдээлэл байна: ${incompleteFields.join(", ")}`,
      );
    }

    const signature = await getEmployeeSignatureByEmployeeId(
      ctx.db,
      request.employeeId,
    );
    if (!signature?.signatureData) {
      throw new Error("Ажилтны гарын үсэг олдсонгүй.");
    }

    // --- Employer (HR) signature handling ---
    const employerSignatureMode = (args.employerSignatureMode ?? "").toLowerCase().trim();
    const employerSignatureDataArg = args.employerSignatureData?.trim() ?? "";
    const employerPasscode = args.employerPasscode?.trim() ?? "";

    const wantsEmployerRedraw =
      employerSignatureMode === "redraw" || (!employerSignatureMode && Boolean(employerSignatureDataArg));
    const wantsEmployerReuse =
      employerSignatureMode === "reuse" || (!employerSignatureMode && !wantsEmployerRedraw);

    if (wantsEmployerRedraw && employerSignatureDataArg && ctx.actor.id) {
      if (employerPasscode && !/^[0-9]{4}$/.test(employerPasscode)) {
        throw new Error("4 оронтой код шаардлагатай.");
      }
      await upsertEmployerSignature(ctx.db, {
        userId: ctx.actor.id,
        signatureData: employerSignatureDataArg,
        passcode: employerPasscode || undefined,
      });
    }

    if (wantsEmployerReuse && ctx.actor.id) {
      const existingEmployerSig = await getEmployerSignatureByUserId(ctx.db, ctx.actor.id);
      if (existingEmployerSig?.passcodeHash && employerPasscode) {
        const verification = await verifyEmployerSignaturePasscode(
          ctx.db,
          ctx.actor.id,
          employerPasscode,
        );
        if (!verification.ok) {
          throw new Error("Ажил олгогчийн гарын үсгийн код буруу байна.");
        }
      }
    }

    // Get employer signature (either newly saved or existing)
    const employerSignature = ctx.actor.id
      ? await getEmployerSignatureByUserId(ctx.db, ctx.actor.id)
      : null;

    const signatureHtml = `<img src="${signature.signatureData}" style="height:40px; filter: brightness(0) saturate(100%);" />`;
    const employerSignatureHtml = employerSignature?.signatureData
      ? `<img src="${employerSignature.signatureData}" style="height:40px; filter: brightness(0) saturate(100%);" />`
      : "";
    const signDate = nowIso.slice(0, 10);

    await executeTriggeredAction(ctx, request.employeeId, "contract_request", {
      actionConfig,
      templateDataOverrides: {
        employee_sign_date: signDate,
        employer_sign_date: signDate,
        ...(signatureHtml
          ? {
              employee_signature: signatureHtml,
              employee_sign_line: signatureHtml,
            }
          : {}),
        ...(employerSignatureHtml
          ? {
              employer_signature: employerSignatureHtml,
              employer_sign_line: employerSignatureHtml,
              issuer_signature: employerSignatureHtml,
              issuer_sign_line: employerSignatureHtml,
              company_ceo_sign_line: employerSignatureHtml,
            }
          : {}),
      },
    });

    const updated = await updateContractRequestStatus(
      ctx.db,
      args.id,
      "approved",
      args.note,
    );
    if (!updated) throw new Error("Failed to update contract request");

    await insertEmployeeNotification(ctx.db, {
      employeeId: request.employeeId,
      title: "Гэрээ батлагдлаа",
      body: `Таны гэрээний хүсэлт батлагдлаа. (${normalized.join(", ")})`,
    });

    return updated;
  },

  rejectContractRequest: async (
    _: unknown,
    args: { id: string; note?: string | null },
    ctx: Ctx,
  ) => {
    if (ctx.actor.role !== "hr" && ctx.actor.role !== "admin") {
      throw new Error("Unauthorized");
    }
    const updated = await updateContractRequestStatus(
      ctx.db,
      args.id,
      "rejected",
      args.note,
    );
    if (!updated) throw new Error("Contract request not found");
    return updated;
  },

  markNotificationRead: async (
    _: unknown,
    args: { id: string },
    ctx: Ctx,
  ) => {
    if (ctx.actor.role !== "employee" || !ctx.actor.id) {
      throw new Error("Unauthorized");
    }
    const updated = await markEmployeeNotificationRead(
      ctx.db,
      args.id,
      ctx.actor.id,
    );
    if (!updated) {
      throw new Error("Notification not found");
    }
    return updated;
  },

  sendAnnouncement: async (
    _: unknown,
    args: { title: string; body: string },
    ctx: Ctx,
  ) => {
    if (ctx.actor.role !== "hr" && ctx.actor.role !== "admin") {
      throw new Error("Unauthorized");
    }
    const count = await insertAnnouncementNotificationsForAudience(ctx.db, {
      title: args.title,
      body: args.body,
      announcementId: crypto.randomUUID(),
      audience: "all",
    });
    return count;
  },

  createAnnouncementDraft: async (
    _: unknown,
    args: { title: string; body: string; audience?: string | null },
    ctx: Ctx,
  ) => {
    if (ctx.actor.role !== "hr" && ctx.actor.role !== "admin") {
      throw new Error("Unauthorized");
    }
    const draft = await insertAnnouncementDraftRecord(ctx.db, {
      title: args.title,
      body: args.body,
      audience: args.audience ?? "all",
      createdBy: ctx.actor.id ?? null,
    });
    if (!draft) throw new Error("Failed to create announcement");
    return draft;
  },

  updateAnnouncementDraft: async (
    _: unknown,
    args: { id: string; title: string; body: string; audience?: string | null },
    ctx: Ctx,
  ) => {
    if (ctx.actor.role !== "hr" && ctx.actor.role !== "admin") {
      throw new Error("Unauthorized");
    }
    const draft = await updateAnnouncementDraftRecord(ctx.db, args.id, {
      title: args.title,
      body: args.body,
      audience: args.audience ?? "all",
    });
    if (!draft) throw new Error("Announcement not found");
    return draft;
  },

  publishAnnouncement: async (
    _: unknown,
    args: { id: string },
    ctx: Ctx,
  ) => {
    if (ctx.actor.role !== "hr" && ctx.actor.role !== "admin") {
      throw new Error("Unauthorized");
    }
    const row = await publishAnnouncementRecord(ctx.db, args.id);
    if (!row) throw new Error("Announcement not found");
    await insertAnnouncementNotificationsForAudience(ctx.db, {
      title: row.title,
      body: row.body,
      announcementId: row.id,
      audience: row.audience ?? "all",
    });
    return row;
  },

  uploadHrDocument: async (
    _: unknown,
    args: { input: UploadHrDocumentInput },
    ctx: Ctx,
  ) => {
    if (ctx.actor.role !== "hr" && ctx.actor.role !== "admin") {
      throw new Error("Unauthorized");
    }

    const employee = await getEmployeeById(ctx.db, args.input.employeeId);
    if (!employee) {
      throw new Error("Employee not found");
    }

    const createdAt = new Date().toISOString();
    const documentId = crypto.randomUUID();
    const action = args.input.action.trim() || "hr-upload";
    const documentName = args.input.documentName.trim() || "Баримт";
    const bucket = (ctx.env as CloudflareBindings & { epas_documents?: R2Bucket })
      .epas_documents;

    let storageUrl: string;

    if (bucket) {
      const r2Key = await uploadEmployeeDocumentToR2({
        bucket,
        employeeId: employee.id,
        employeeCode: employee.employeeCode,
        lastName: employee.lastName,
        firstName: employee.firstName,
        phase: "hr-upload",
        action,
        order: "manual",
        templateId: documentId,
        documentId,
        documentName,
        content: Uint8Array.from(Buffer.from(args.input.contentBase64, "base64")),
        contentType: args.input.contentType,
        createdAt,
      });

      storageUrl = `r2://${r2Key}`;
    } else {
      storageUrl = `data:${args.input.contentType};base64,${args.input.contentBase64}`;
    }

    const inserted = await insertDocument(ctx.db, {
      id: documentId,
      employeeId: employee.id,
      action,
      documentName,
      storageUrl,
      createdAt,
    });

    if (!inserted) {
      throw new Error("Failed to save document");
    }

    return inserted;
  },

  retryNotification: async (
    _: unknown,
    args: { auditLogId: string },
    ctx: Ctx,
  ) => {
    if (ctx.actor.role !== "hr" && ctx.actor.role !== "admin") {
      throw new Error("Unauthorized");
    }

    const entry = await getAuditLogById(ctx.db, args.auditLogId);
    if (!entry) {
      throw new Error("Audit log not found");
    }

    const employee = await getEmployeeById(ctx.db, entry.employeeId);
    if (!employee) {
      throw new Error("Employee not found");
    }

    // Get associated documents
    const allDocs = await getDocuments(ctx.db, entry.employeeId);
    const docs = allDocs.filter((d) =>
      entry.documentIds.includes(d.id),
    );

    const resendApiKey =
      (ctx.env as CloudflareBindings & { RESEND_API_KEY?: string })
        .RESEND_API_KEY ?? "";
    const documentLinkSecret =
      (ctx.env as CloudflareBindings & { DOCUMENT_LINK_SECRET?: string })
        .DOCUMENT_LINK_SECRET ?? "";

    const result = await dispatchNotification({
      db: ctx.db,
      employee,
      documents: docs,
      action: entry.action,
      apiKey: resendApiKey,
      publicOrigin: ctx.publicOrigin,
      documentLinkSecret,
    });

    await updateAuditLogDelivery(ctx.db, entry.id, {
      recipientEmails: result.recipientEmails,
      notificationAttempted: result.notificationAttempted,
      recipientsNotified: result.notified,
      notificationError: result.error ?? null,
    });

    const updated = await getAuditLogById(ctx.db, entry.id);
    return updated ?? entry;
  },
};
