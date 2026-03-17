import {
  createEmployeeCodeSession,
  deleteSessionByToken,
  ensureDefaultActionConfigs,
  getEmployeeById,
  getEmployeeSignatureByEmployeeId,
  getContractRequestById,
  insertDocument,
  insertContractRequest,
  insertEmployeeNotification,
  insertAnnouncementNotificationsForAudience,
  insertAnnouncementDraft as insertAnnouncementDraftRecord,
  updateAnnouncementDraft as updateAnnouncementDraftRecord,
  publishAnnouncement as publishAnnouncementRecord,
  listActionConfigs,
  requestEmployeeOtp,
  updateContractRequestStatus,
  updateEmployeeDocumentProfile,
  upsertActionConfig,
  upsertEmployeeRecord,
  upsertEmployeeSignature,
  verifyEmployeeSignaturePasscode,
  verifyEmployeeOtp,
  markEmployeeNotificationRead,
} from "../db/queries";
import {
  buildEmployeeChangeSet,
  resolveEmployeeLifecycleAction,
} from "../services/actionResolver";
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
}

interface UpsertEmployeeInput {
  id: string;
  employeeCode: string;
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

  approveContractRequest: async (
    _: unknown,
    args: { id: string; note?: string | null },
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

    const signatureHtml = `<img src="${signature.signatureData}" style="height:40px; filter: brightness(0) saturate(100%);" />`;
    const signDate = nowIso.slice(0, 10);

    await executeTriggeredAction(ctx, request.employeeId, "contract_request", {
      actionConfig,
      templateDataOverrides: {
        employee_sign_date: signDate,
        ...(signatureHtml
          ? {
              employee_signature: signatureHtml,
              employee_sign_line: signatureHtml,
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
};
