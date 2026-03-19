import type { DbClient } from "../db/client";
import type { Document, Employee } from "../db/schema";
import { buildEmailTemplate } from "./buildEmailTemplate";
import { buildDocumentDeliveryUrl } from "./documentLinks";
import { getAllRecipientEmails, resolveRecipients } from "./resolveRecipients";
import { sendEmailWithRetry } from "./sendEmailWithRetry";

export interface DispatchNotificationInput {
  db: DbClient;
  employee: Employee;
  documents: Document[];
  action: string;
  apiKey: string;
  publicOrigin?: string | null;
  documentLinkSecret?: string | null;
  overrideRecipients?: string[];
  recipientRoles?: string[];
}

export interface DispatchNotificationResult {
  notified: boolean;
  notificationAttempted: boolean;
  recipientCount: number;
  recipientEmails: string[];
  error?: string;
}

function normalizeEmails(emails: string[]) {
  return [...new Set(
    emails
      .map((email) => email.trim())
      .filter(Boolean),
  )];
}

export async function dispatchNotification(
  input: DispatchNotificationInput,
): Promise<DispatchNotificationResult> {
  // overrideRecipients байвал registry-ийн recipients-г солино
  let emails: string[];
  if (input.overrideRecipients && input.overrideRecipients.length > 0) {
    emails = normalizeEmails(input.overrideRecipients);
  } else {
    const roles = input.recipientRoles ?? [];
    const resolvedEmails = roles.length > 0
      ? await resolveRecipients(input.db, roles)
      : await getAllRecipientEmails(input.db);
    emails = normalizeEmails(resolvedEmails);
  }

  if (emails.length === 0) {
    return {
      notified: false,
      notificationAttempted: false,
      recipientCount: 0,
      recipientEmails: [],
      error: "No recipients resolved for notification.",
    };
  }

  const maybeLinks = await Promise.all(
    input.documents.map(async (document) => {
      const url = await buildDocumentDeliveryUrl({
        documentId: document.id,
        storageUrl: document.storageUrl,
        publicOrigin: input.publicOrigin,
        signingSecret: input.documentLinkSecret,
      });

      return url
        ? { name: document.documentName, url }
        : null;
    }),
  );

  const documentLinks = maybeLinks
    .filter((document): document is { name: string; url: string } => document !== null);

  if (documentLinks.length === 0) {
    return {
      notified: false,
      notificationAttempted: false,
      recipientCount: 0,
      recipientEmails: [],
      error: "No deliverable document URLs could be generated for notification.",
    };
  }

  if (!input.apiKey || input.apiKey.trim().length === 0) {
    return {
      notified: false,
      notificationAttempted: false,
      recipientCount: emails.length,
      recipientEmails: emails,
    };
  }

  const template = buildEmailTemplate({
    employeeName: `${input.employee.firstName} ${input.employee.lastName}`,
    employeeCode: input.employee.employeeCode,
    action: input.action,
    documents: documentLinks,
    generatedAt: input.documents[0]?.createdAt ?? new Date().toISOString(),
  });

  try {
    await sendEmailWithRetry({
      to: emails,
      subject: template.subject,
      text: template.text,
      html: template.html,
      apiKey: input.apiKey,
    });

    return {
      notified: true,
      notificationAttempted: true,
      recipientCount: emails.length,
      recipientEmails: emails,
    };
  } catch (err) {
    const error = err instanceof Error ? err.message : String(err);
    return {
      notified: false,
      notificationAttempted: true,
      recipientCount: 0,
      recipientEmails: emails,
      error,
    };
  }
}
