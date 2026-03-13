import {
  createEmployeeCodeSession,
  deleteSessionByToken,
  ensureDefaultActionConfigs,
  getEmployeeById,
  getLeaveRequestById,
  insertDocument,
  insertLeaveRequest,
  listActionConfigs,
  requestEmployeeOtp,
  upsertActionConfig,
  upsertEmployeeRecord,
  updateLeaveRequestStatus,
  verifyEmployeeOtp,
} from "../db/queries";
import {
  buildEmployeeChangeSet,
  resolveEmployeeLifecycleAction,
} from "../services/actionResolver";
import { uploadEmployeeDocumentToR2 } from "../storage/r2";
import type { GraphQLContext } from "./schema";
import { executeTriggeredAction } from "./helpers";

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
  triggerFields: string[];
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
