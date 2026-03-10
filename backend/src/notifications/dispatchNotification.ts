import type { DbClient } from "../db/client";
import type { Document, Employee } from "../db/schema";
import { buildEmailTemplate } from "./buildEmailTemplate";
import { getAllRecipientEmails } from "./resolveRecipients";
import { sendEmailWithRetry } from "./sendEmailWithRetry";

export interface DispatchNotificationInput {
  db: DbClient;
  employee: Employee;
  document: Document;
  action: string;
  apiKey: string;
}

export interface DispatchNotificationResult {
  notified: boolean;
  recipientCount: number;
  error?: string;
}

export async function dispatchNotification(
  input: DispatchNotificationInput,
): Promise<DispatchNotificationResult> {
  const emails = await getAllRecipientEmails(input.db);

  if (emails.length === 0) {
    return { notified: false, recipientCount: 0 };
  }

  const template = buildEmailTemplate({
    employeeName: `${input.employee.firstName} ${input.employee.lastName}`,
    employeeCode: input.employee.employeeCode,
    action: input.action,
    documentName: input.document.documentName,
    documentUrl: input.document.storageUrl,
    generatedAt: input.document.createdAt,
  });

  try {
    await sendEmailWithRetry({
      to: emails,
      subject: template.subject,
      text: template.text,
      apiKey: input.apiKey,
    });

    return { notified: true, recipientCount: emails.length };
  } catch (err) {
    const error = err instanceof Error ? err.message : String(err);
    return { notified: false, recipientCount: 0, error };
  }
}
