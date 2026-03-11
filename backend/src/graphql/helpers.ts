import {
  createTriggeredActionRecords,
  updateAuditLogDelivery,
} from "../db/queries";
import { dispatchNotification } from "../notifications/dispatchNotification";
import type { GraphQLContext } from "./schema";

export async function executeTriggeredAction(
  ctx: GraphQLContext,
  employeeId: string,
  action: string,
) {
  const resendApiKey =
    (ctx.env as CloudflareBindings & { RESEND_API_KEY?: string })
      .RESEND_API_KEY ?? "";
  const pdfRendererUrl =
    (ctx.env as CloudflareBindings & { PDF_RENDERER_URL?: string })
      .PDF_RENDERER_URL ?? "";
  const pdfRendererSecret =
    (ctx.env as CloudflareBindings & { PDF_RENDERER_SECRET?: string })
      .PDF_RENDERER_SECRET ?? "";

  const bucket = (ctx.env as CloudflareBindings & { epas_documents?: R2Bucket })
    .epas_documents;

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
  );

  const notificationResult = await dispatchNotification({
    db: ctx.db,
    employee: result.employee,
    documents: result.documents,
    action,
    apiKey: resendApiKey,
    publicOrigin: ctx.publicOrigin,
  });

  await updateAuditLogDelivery(ctx.db, result.auditEntry.id, {
    recipientEmails: notificationResult.recipientEmails,
    notificationAttempted: notificationResult.notificationAttempted,
    recipientsNotified: notificationResult.notified,
    notificationError: notificationResult.error ?? null,
  });

  result.auditEntry.recipientEmails = notificationResult.recipientEmails;
  result.auditEntry.notificationAttempted = notificationResult.notificationAttempted;
  result.auditEntry.recipientsNotified = notificationResult.notified;
  result.auditEntry.notificationError = notificationResult.error ?? null;

  return {
    employee: result.employee,
    documents: result.documents,
    auditLog: result.auditEntry,
    incompleteFields: result.incompleteFields,
  };
}
