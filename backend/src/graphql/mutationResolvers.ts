import {
  createEmployeeCodeSession,
  getActionConfigByName,
  getAuditLogByDocumentId,
  deleteDocument,
  deleteSessionByToken,
  ensureDefaultActionConfigs,
  getAuditLogById,
  getDocumentById,
  getEmployeeById,
  getEmployeeSignatureByEmployeeId,
  getEmployerSignatureByUserId,
  getContractRequestById,
  getLeaveRequestById,
  getDocuments,
  getDocumentsByIds,
  insertDocument,
  insertContractRequest,
  insertLeaveRequest,
  insertEmployeeNotification,
  insertAnnouncementNotificationsForAudience,
  areAllDocumentsEmployeeSigned,
  areAllDocumentsHrSigned,
  insertAnnouncementDraft as insertAnnouncementDraftRecord,
  updateAnnouncementDraft as updateAnnouncementDraftRecord,
  publishAnnouncement as publishAnnouncementRecord,
  listActionConfigs,
  requestEmployeeOtp,
  updateAuditLogDelivery,
  updateAuditLogHrSigned,
  updateAuditLogSignature,
  updateContractRequestStatus,
  updateDocumentEmployeeSignature,
  updateDocumentHrSignature,
  updateLeaveRequestStatus,
  updateEmployeeDocumentProfile,
  updateEmployeeStatus,
  upsertActionConfig,
  upsertEmployeeRecord,
  upsertEmployeeSignature,
  upsertEmployerSignature,
  getEmployeeSignatureStatus,
  getEmployerSignatureStatus,
  deleteEmployerSignatureByUserId,
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
import { generateEmployeeDocument } from "../document/generator";
import { renderPdfFromService } from "../document/pdfRenderer";
import { uploadEmployeeDocumentToR2 } from "../storage/r2";
import type { GraphQLContext } from "./schema";
import { executeTriggeredAction } from "./helpers";
import { buildTemplateData, validateRequiredFields } from "../document/templateData";
import {
  buildContractActionConfig,
  normalizeContractTemplateIds,
} from "../services/contractTemplates";
import {
  renderSignedDocumentArtifact,
  type SigningRole,
} from "./documentSigning";
import {
  ensureEmployeeSignatureTable,
  ensureEmployerSignatureTable,
} from "../db/ensureRuntimeTables";

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

function requireHrActor(ctx: Ctx) {
  if (ctx.actor.role !== "hr" && ctx.actor.role !== "admin") {
    throw new Error("Unauthorized");
  }
}

function buildSignatureHtml(signatureData: string) {
  return `<img src="${signatureData}" style="height:40px; filter: brightness(0) saturate(100%);" />`;
}

function parseStoredTemplateData(document: {
  templateData?: string | null;
}) {
  try {
    const parsed = JSON.parse(document.templateData ?? "{}");
    return parsed && typeof parsed === "object"
      ? Object.fromEntries(
          Object.entries(parsed).map(([key, value]) => [key, String(value ?? "")]),
        )
      : {};
  } catch {
    return {};
  }
}

async function rerenderSignedDocument(
  ctx: Ctx,
  document: {
    id: string;
    employeeId: string;
    action: string;
    documentName: string;
    storageUrl: string;
    templateId?: string | null;
    templateFile?: string | null;
    templateData?: string | null;
    createdAt: string;
    hrSignatureData?: string | null;
    hrSignedAt?: string | null;
    employeeSignatureData?: string | null;
    employeeSignedAt?: string | null;
  },
  employee: Awaited<ReturnType<typeof getEmployeeById>>,
  signatureOverrides?: Record<string, string>,
  phaseOverride?: string | null,
) {
  if (!employee) {
    throw new Error("Employee not found");
  }
  if (!document.templateFile || !document.templateId) {
    return document.storageUrl;
  }

  const mergedTemplateData = {
    ...parseStoredTemplateData(document),
    ...(document.hrSignatureData
      ? {
          employer_signature: buildSignatureHtml(document.hrSignatureData),
          employer_sign_line: buildSignatureHtml(document.hrSignatureData),
          issuer_signature: buildSignatureHtml(document.hrSignatureData),
          issuer_sign_line: buildSignatureHtml(document.hrSignatureData),
          company_ceo_sign_line: buildSignatureHtml(document.hrSignatureData),
          hr_manager_signature: buildSignatureHtml(document.hrSignatureData),
        }
      : {}),
    ...(document.employeeSignatureData
      ? {
          employee_signature: buildSignatureHtml(document.employeeSignatureData),
          employee_sign_line: buildSignatureHtml(document.employeeSignatureData),
        }
      : {}),
    ...(signatureOverrides ?? {}),
  };

  const generated = generateEmployeeDocument({
    employee,
    action: document.action,
    generatedAt: document.createdAt,
    documentId: document.id,
    templateFile: document.templateFile,
    templateData: mergedTemplateData,
  });

  const rendererUrl =
    (ctx.env as CloudflareBindings & { PDF_RENDERER_URL?: string })
      .PDF_RENDERER_URL ?? "";
  const rendererSecret =
    (ctx.env as CloudflareBindings & { PDF_RENDERER_SECRET?: string })
      .PDF_RENDERER_SECRET ?? "";
  const bucket = (ctx.env as CloudflareBindings & { epas_documents?: R2Bucket })
    .epas_documents;

  let renderedPdf = Boolean(rendererUrl.trim());
  let bytes: Uint8Array;
  if (renderedPdf) {
    try {
      bytes = await renderPdfFromService({
        html: generated.html,
        documentName: document.documentName,
        serviceUrl: rendererUrl,
        secret: rendererSecret,
      });
    } catch (error) {
      console.error("Failed to re-render signed document", error);
      renderedPdf = false;
      bytes = new TextEncoder().encode(generated.html);
    }
  } else {
    bytes = new TextEncoder().encode(generated.html);
  }

  if (bucket) {
    const r2Key = await uploadEmployeeDocumentToR2({
      bucket,
      employeeId: employee.id,
      employeeCode: employee.employeeCode,
      lastName: employee.lastName,
      firstName: employee.firstName,
      phase: phaseOverride ?? "signed",
      action: document.action,
      order: document.documentName.split("_", 1)[0] || "01",
      templateId: document.templateId,
      documentId: document.id,
      documentName: document.documentName,
      content: bytes,
      contentType: renderedPdf ? "application/pdf" : "text/html",
      createdAt: document.createdAt,
    });
    return `r2://${r2Key}`;
  }

  return renderedPdf
    ? `data:application/pdf;base64,${Buffer.from(bytes).toString("base64")}`
    : `data:text/html;charset=utf-8,${encodeURIComponent(generated.html)}`;
}

async function signEmployeeDocumentCore(
  ctx: Ctx,
  documentId: string,
  options?: {
    signatureMode?: string | null;
    signatureData?: string | null;
    passcode?: string | null;
  },
) {
  await ensureEmployeeSignatureTable(ctx.env);

  if (ctx.actor.role !== "employee" || !ctx.actor.id) {
    throw new Error("Unauthorized");
  }

  const document = await getDocumentById(ctx.db, documentId);
  if (!document) {
    throw new Error("Document not found");
  }
  if (document.employeeId !== ctx.actor.id) {
    throw new Error("Unauthorized");
  }
  if (!document.hrSigned) {
    throw new Error("HR must sign this document first");
  }

  const signature = await getEmployeeSignatureByEmployeeId(
    ctx.db,
    ctx.actor.id,
  );
  const signatureMode = (options?.signatureMode ?? "").toLowerCase().trim();
  const signatureData = options?.signatureData?.trim() ?? "";
  const passcode = options?.passcode?.trim() ?? "";

  const wantsRedraw =
    signatureMode === "redraw" || (!signatureMode && Boolean(signatureData));
  const wantsReuse =
    signatureMode === "reuse" || (!signatureMode && !wantsRedraw);

  let resolvedSignatureData = signature?.signatureData ?? "";
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
        throw new Error("Код буруу байна. Дахин оруулна уу.");
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
    resolvedSignatureData = signatureData;
  }

  const employee = await getEmployeeById(ctx.db, document.employeeId);
  if (!employee) {
    throw new Error("Employee not found");
  }

  const actionConfig = await getActionConfigByName(ctx.db, document.action);
  const nowIso = new Date().toISOString();
  const storageUrl = await rerenderSignedDocument(
    ctx,
    {
      ...document,
      employeeSignatureData: resolvedSignatureData,
      employeeSignedAt: nowIso,
    },
    employee,
    {
      employee_signature: buildSignatureHtml(resolvedSignatureData),
      employee_sign_line: buildSignatureHtml(resolvedSignatureData),
      employee_sign_date: nowIso.slice(0, 10),
    },
    actionConfig?.phase ?? null,
  );

  const updatedDocument = await updateDocumentEmployeeSignature(
    ctx.db,
    document.id,
    {
      employeeSignatureData: resolvedSignatureData,
      employeeSignedAt: nowIso,
      storageUrl,
    },
  );
  if (!updatedDocument) {
    throw new Error("Failed to update document");
  }

  const auditEntry = await getAuditLogByDocumentId(ctx.db, document.id);
  if (!auditEntry) {
    throw new Error("Audit log not found for document");
  }

  const allSigned = await areAllDocumentsEmployeeSigned(
    ctx.db,
    auditEntry.documentIds,
  );
  if (allSigned && !auditEntry.employeeSigned) {
    await updateAuditLogSignature(ctx.db, auditEntry.id, {
      employeeSigned: true,
      employeeSignedAt: nowIso,
    });

    if (employee.status !== "ACTIVE") {
      await updateEmployeeStatus(ctx.db, employee.id, "ACTIVE");
    }
  }

  const updatedAuditLog = await getAuditLogById(ctx.db, auditEntry.id);
  if (!updatedAuditLog) {
    throw new Error("Failed to load audit log");
  }

  return {
    document: updatedDocument,
    auditLog: updatedAuditLog,
    allSigned,
  };
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
    const isNewEmployee = false;
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
    args: {
      type: string;
      startTime: string;
      endTime: string;
      reason: string;
      attachments?: Array<{
        documentName: string;
        contentType: string;
        contentBase64: string;
      }> | null;
    },
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

    const employee = await getEmployeeById(ctx.db, ctx.actor.id);
    if (!employee) {
      throw new Error("Employee not found");
    }

    const attachments = (args.attachments ?? []).filter(
      (attachment) =>
        attachment.documentName?.trim() &&
        attachment.contentType?.trim() &&
        attachment.contentBase64?.trim(),
    );

    if (attachments.length > 0) {
      const bucket = (ctx.env as CloudflareBindings & { epas_documents?: R2Bucket })
        .epas_documents;
      const action = `leave-request:${row.id}`;

      for (const [index, attachment] of attachments.entries()) {
        const createdAt = new Date().toISOString();
        const documentId = crypto.randomUUID();
        let storageUrl: string;

        if (bucket) {
          const r2Key = await uploadEmployeeDocumentToR2({
            bucket,
            employeeId: employee.id,
            employeeCode: employee.employeeCode,
            lastName: employee.lastName,
            firstName: employee.firstName,
            phase: "leave-request",
            action,
            order: String(index + 1),
            templateId: documentId,
            documentId,
            documentName: attachment.documentName.trim(),
            content: Uint8Array.from(
              Buffer.from(attachment.contentBase64.trim(), "base64"),
            ),
            contentType: attachment.contentType.trim(),
            createdAt,
          });

          storageUrl = `r2://${r2Key}`;
        } else {
          storageUrl = `data:${attachment.contentType.trim()};base64,${attachment.contentBase64.trim()}`;
        }

        await insertDocument(ctx.db, {
          id: documentId,
          employeeId: employee.id,
          action,
          documentName: attachment.documentName.trim(),
          storageUrl,
          createdAt,
        });
      }
    }

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
    await insertEmployeeNotification(ctx.db, {
      employeeId: row.employeeId,
      title: "Чөлөөний хүсэлт батлагдлаа",
      body: args.note?.trim()
        ? `Таны ${row.type} хүсэлт батлагдлаа.\nТайлбар: ${args.note.trim()}`
        : `Таны ${row.type} хүсэлт батлагдлаа.`,
    });
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
    await insertEmployeeNotification(ctx.db, {
      employeeId: row.employeeId,
      title: "Чөлөөний хүсэлт татгалзагдлаа",
      body: args.note?.trim()
        ? `Таны ${row.type} хүсэлт татгалзагдлаа.\nТайлбар: ${args.note.trim()}`
        : `Таны ${row.type} хүсэлт татгалзагдлаа.`,
    });
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
    await ensureEmployeeSignatureTable(ctx.env);

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
    await ensureEmployerSignatureTable(ctx.env);

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

  deleteEmployerSignature: async (
    _: unknown,
    __: unknown,
    ctx: Ctx,
  ) => {
    if ((ctx.actor.role !== "hr" && ctx.actor.role !== "admin") || !ctx.actor.id) {
      throw new Error("Unauthorized");
    }

    return deleteEmployerSignatureByUserId(ctx.db, ctx.actor.id);
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
    await insertEmployeeNotification(ctx.db, {
      employeeId: updated.employeeId,
      title: "Гэрээний хүсэлт татгалзагдлаа",
      body: args.note?.trim()
        ? `Таны гэрээний хүсэлт татгалзагдлаа.\nТайлбар: ${args.note.trim()}`
        : "Таны гэрээний хүсэлт татгалзагдлаа.",
    });
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

    await insertEmployeeNotification(ctx.db, {
      employeeId: employee.id,
      title: "Шинэ баримт нэмэгдлээ",
      body: `"${documentName}" баримтыг HR нэмлээ.`,
    });

    return inserted;
  },

  deleteDocument: async (
    _: unknown,
    args: { id: string },
    ctx: Ctx,
  ) => {
    if (ctx.actor.role !== "hr" && ctx.actor.role !== "admin") {
      throw new Error("Unauthorized");
    }
    return deleteDocument(ctx.db, args.id);
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
      overrideRecipients: employee.email ? [employee.email] : [],
      templateKind: "employee",
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

  signDocument: async (
    _: unknown,
    args: {
      documentId: string;
      signatureMode?: string | null;
      signatureData?: string | null;
      passcode?: string | null;
    },
    ctx: Ctx,
  ) => {
    await ensureEmployerSignatureTable(ctx.env);

    requireHrActor(ctx);

    const document = await getDocumentById(ctx.db, args.documentId);
    if (!document) {
      throw new Error("Document not found");
    }

    const employee = await getEmployeeById(ctx.db, document.employeeId);
    if (!employee) {
      throw new Error("Employee not found");
    }

    const actionConfig = await getActionConfigByName(ctx.db, document.action);
    const nowIso = new Date().toISOString();
    const signatureMode = (args.signatureMode ?? "").toLowerCase().trim();
    const signatureDataArg = args.signatureData?.trim() ?? "";
    const wantsRedraw =
      signatureMode === "redraw" || (!signatureMode && Boolean(signatureDataArg));
    const wantsReuse = signatureMode === "reuse" || (!signatureMode && !wantsRedraw);

    let signatureData = signatureDataArg;

    if (wantsReuse) {
      if (!ctx.actor.id) {
        throw new Error("Unauthorized");
      }

      const savedSignature = await getEmployerSignatureByUserId(ctx.db, ctx.actor.id);
      if (!savedSignature?.signatureData) {
        throw new Error("Saved employer signature not found. Please save it in settings first.");
      }

      const verification = await verifyEmployerSignaturePasscode(
        ctx.db,
        ctx.actor.id,
        args.passcode?.trim() ?? "",
      );
      if (verification.hasPasscode && !verification.ok) {
        throw new Error("Invalid employer signature passcode.");
      }

      signatureData = savedSignature.signatureData;
    }

    if (!signatureData) {
      throw new Error("Signature data is required.");
    }

    const storageUrl = await rerenderSignedDocument(
      ctx,
      {
        ...document,
        hrSignatureData: signatureData,
        hrSignedAt: nowIso,
      },
      employee,
      {
        employer_signature: buildSignatureHtml(signatureData),
        employer_sign_line: buildSignatureHtml(signatureData),
        issuer_signature: buildSignatureHtml(signatureData),
        issuer_sign_line: buildSignatureHtml(signatureData),
        company_ceo_sign_line: buildSignatureHtml(signatureData),
        hr_manager_signature: buildSignatureHtml(signatureData),
        employer_sign_date: nowIso.slice(0, 10),
        issuer_date: nowIso.slice(0, 10),
      },
      actionConfig?.phase ?? null,
    );

    const updatedDocument = await updateDocumentHrSignature(ctx.db, document.id, {
      hrSignatureData: signatureData,
      hrSignedAt: nowIso,
      storageUrl,
    });
    if (!updatedDocument) {
      throw new Error("Failed to update document");
    }

    const auditEntry = await getAuditLogByDocumentId(ctx.db, document.id);
    if (!auditEntry) {
      throw new Error("Audit log not found for document");
    }

    const allSigned = await areAllDocumentsHrSigned(ctx.db, auditEntry.documentIds);
    if (allSigned && !auditEntry.employeeSigned) {
      await updateAuditLogHrSigned(ctx.db, auditEntry.id, {
        hrSignedAll: true,
        hrSignedAllAt: nowIso,
      });

      const employeeEmail = employee.email?.trim() ?? "";
      if (employeeEmail) {
        const resendApiKey =
          (ctx.env as CloudflareBindings & { RESEND_API_KEY?: string })
            .RESEND_API_KEY ?? "";
        const documentLinkSecret =
          (ctx.env as CloudflareBindings & { DOCUMENT_LINK_SECRET?: string })
            .DOCUMENT_LINK_SECRET ?? "";
        const docs = await getDocumentsByIds(ctx.db, auditEntry.documentIds);
        const result = await dispatchNotification({
          db: ctx.db,
          employee,
          documents: docs,
          action: auditEntry.action,
          apiKey: resendApiKey,
          publicOrigin: ctx.publicOrigin,
          documentLinkSecret,
          overrideRecipients: [employeeEmail],
          templateKind: "employee",
        });

        await updateAuditLogDelivery(ctx.db, auditEntry.id, {
          recipientEmails: result.recipientEmails,
          notificationAttempted: result.notificationAttempted,
          recipientsNotified: result.notified,
          notificationError: result.error ?? null,
        });
      } else {
        await updateAuditLogDelivery(ctx.db, auditEntry.id, {
          recipientEmails: [],
          notificationAttempted: false,
          recipientsNotified: false,
          notificationError: "Employee email missing for signing notification.",
        });
      }
    }

    const updatedAuditLog = await getAuditLogById(ctx.db, auditEntry.id);
    if (!updatedAuditLog) {
      throw new Error("Failed to load audit log");
    }

    return {
      document: updatedDocument,
      auditLog: updatedAuditLog,
      allSigned,
    };
  },

  employeeSignDocument: async (
    _: unknown,
    args: {
      documentId: string;
      signatureMode?: string | null;
      signatureData?: string | null;
      passcode?: string | null;
    },
    ctx: Ctx,
  ) => {
    return signEmployeeDocumentCore(ctx, args.documentId, {
      signatureMode: args.signatureMode,
      signatureData: args.signatureData,
      passcode: args.passcode,
    });
  },

  signAuditLog: async (
    _: unknown,
    args: {
      auditLogId: string;
      signatureMode?: string | null;
      signatureData?: string | null;
      passcode?: string | null;
    },
    ctx: Ctx,
  ) => {
    if (ctx.actor.role !== "employee" || !ctx.actor.id) {
      throw new Error("Unauthorized");
    }

    const entry = await getAuditLogById(ctx.db, args.auditLogId);
    if (!entry) {
      throw new Error("Audit log not found");
    }
    if (entry.employeeId !== ctx.actor.id) {
      throw new Error("Unauthorized");
    }

    const documents = await getDocumentsByIds(ctx.db, entry.documentIds);
    for (const document of documents) {
      if (document.employeeSigned) {
        continue;
      }
      await signEmployeeDocumentCore(ctx, document.id, {
        signatureMode: args.signatureMode,
        signatureData: args.signatureData,
        passcode: args.passcode,
      });
    }

    const updated = await getAuditLogById(ctx.db, entry.id);
    return updated ?? entry;
  },
};
