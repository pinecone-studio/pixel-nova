import {
  createTriggeredActionRecords,
  updateAuditLogNotified,
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

  const bucket = (ctx.env as CloudflareBindings & { epas_documents?: R2Bucket })
    .epas_documents;

  const result = await createTriggeredActionRecords(ctx.db, employeeId, action, bucket);

  const notificationResult = await dispatchNotification({
    db: ctx.db,
    employee: result.employee,
    documents: result.documents,
    action,
    apiKey: resendApiKey,
  });

  if (notificationResult.notified) {
    await updateAuditLogNotified(ctx.db, result.auditEntry.id, true);
    result.auditEntry.recipientsNotified = true;
  }

  return {
    employee: result.employee,
    documents: result.documents,
    auditLog: result.auditEntry,
  };
}
