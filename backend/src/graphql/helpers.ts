import {
  createTriggeredActionRecords,
  ensureDefaultActionConfigs,
  getActionConfigByName,
  updateAuditLogDelivery,
} from "../db/queries";
import type { GraphQLContext } from "./schema";

export async function executeTriggeredAction(
  ctx: GraphQLContext,
  employeeId: string,
  action: string,
  options?: {
    dryRun?: boolean;
    overrideRecipients?: string[];
    actionConfig?: Awaited<ReturnType<typeof getActionConfigByName>>;
    templateDataOverrides?: Record<string, string>;
  },
) {
  const pdfRendererUrl =
    (ctx.env as CloudflareBindings & { PDF_RENDERER_URL?: string })
      .PDF_RENDERER_URL ?? "";
  const pdfRendererSecret =
    (ctx.env as CloudflareBindings & { PDF_RENDERER_SECRET?: string })
      .PDF_RENDERER_SECRET ?? "";

  const bucket = (ctx.env as CloudflareBindings & { epas_documents?: R2Bucket })
    .epas_documents;
  await ensureDefaultActionConfigs(ctx.db);
  const actionConfig =
    options?.actionConfig ?? await getActionConfigByName(ctx.db, action);

  const result = await createTriggeredActionRecords(
    ctx.db,
    employeeId,
    action,
    bucket,
    ctx.actor,
    {
      serviceUrl: pdfRendererUrl,
      secret: pdfRendererSecret,
    },
    actionConfig,
    options?.templateDataOverrides,
  );

  await updateAuditLogDelivery(ctx.db, result.auditEntry.id, {
    recipientEmails: [],
    notificationAttempted: false,
    recipientsNotified: false,
    notificationError: null,
  });

  result.auditEntry.recipientEmails = [];
  result.auditEntry.notificationAttempted = false;
  result.auditEntry.recipientsNotified = false;
  result.auditEntry.notificationError = null;

  return {
    employee: result.employee,
    documents: result.documents,
    auditLog: result.auditEntry,
    incompleteFields: result.incompleteFields,
  };
}
