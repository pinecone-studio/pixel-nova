import type { DbClient } from "../db/client";
import type { Document, Employee } from "../db/schema";
import { buildEmailTemplate } from "./buildEmailTemplate";
import { getAllRecipientEmails, resolveRecipients } from "./resolveRecipients";
import { sendEmailWithRetry } from "./sendEmailWithRetry";
import actionRegistry from "../config/action-registry.json";

export interface DispatchNotificationInput {
  db: DbClient;
  employee: Employee;
  documents: Document[];
  action: string;
  apiKey: string;
}

export interface DispatchNotificationResult {
  notified: boolean;
  recipientCount: number;
  error?: string;
}

function getRecipientsForAction(action: string): string[] {
  const config = (actionRegistry.actions as Record<string, { recipients?: string[] }>)[action];
  return config?.recipients ?? [];
}

export async function dispatchNotification(
  input: DispatchNotificationInput,
): Promise<DispatchNotificationResult> {
  // action-registry.json-оос тухайн action-д хамаарах role-уудыг авна
  const roles = getRecipientsForAction(input.action);

  // Role-уудаар recipients table-ээс email хайна
  const emails = roles.length > 0
    ? await resolveRecipients(input.db, roles)
    : await getAllRecipientEmails(input.db);

  if (emails.length === 0) {
    return { notified: false, recipientCount: 0 };
  }

  // Олон document-ийн мэдээллийг email-д нэгтгэнэ
  const documentLines = input.documents
    .map((doc, i) => `${i + 1}. ${doc.documentName} --> ${doc.storageUrl}`)
    .join("\n");

  const template = buildEmailTemplate({
    employeeName: `${input.employee.firstName} ${input.employee.lastName}`,
    employeeCode: input.employee.employeeCode,
    action: input.action,
    documentName: input.documents.map((d) => d.documentName).join(", "),
    documentUrl: documentLines,
    generatedAt: input.documents[0]?.createdAt ?? new Date().toISOString(),
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
