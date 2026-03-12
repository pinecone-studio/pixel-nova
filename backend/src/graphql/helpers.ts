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
  options?: { dryRun?: boolean; overrideRecipients?: string[] },
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
  const documentLinkSecret =
    (ctx.env as CloudflareBindings & { DOCUMENT_LINK_SECRET?: string })
      .DOCUMENT_LINK_SECRET ?? "";

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

  // dryRun=true үед email dispatch алгасна (document үүсгэнэ, email илгээхгүй)
  if (options?.dryRun) {
    await updateAuditLogDelivery(ctx.db, result.auditEntry.id, {
      recipientEmails: [],
      notificationAttempted: false,
      recipientsNotified: false,
      notificationError: "dryRun: email dispatch skipped",
    });
    result.auditEntry.notificationAttempted = false;
    result.auditEntry.recipientsNotified = false;
    result.auditEntry.notificationError = "dryRun: email dispatch skipped";
  } else {
    const notificationResult = await dispatchNotification({
      db: ctx.db,
      employee: result.employee,
      documents: result.documents,
      action,
      apiKey: resendApiKey,
      publicOrigin: ctx.publicOrigin,
      documentLinkSecret,
      overrideRecipients: options?.overrideRecipients,
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
  }

  return {
    employee: result.employee,
    documents: result.documents,
    auditLog: result.auditEntry,
    incompleteFields: result.incompleteFields,
  };
}
