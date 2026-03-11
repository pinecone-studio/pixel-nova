import { and, eq } from "drizzle-orm";

import type { DbClient } from "../client";
import { auditLog, documents } from "../schema";
import { generateEmployeeDocument } from "../../document/generator";
import { buildTemplateData, validateRequiredFields } from "../../document/templateData";
import { uploadEmployeeDocumentToR2 } from "../../storage/r2";
import { getEmployeeById } from "./employee";
import type { Actor } from "./types";

export async function createTriggeredActionRecords(
  db: DbClient,
  employeeId: string,
  actionName: string,
  bucket?: R2Bucket,
  actor?: Actor,
) {
  const employee = await getEmployeeById(db, employeeId);

  if (!employee) {
    throw new Error(`Employee not found for id ${employeeId}`);
  }

  const now = new Date().toISOString();
  const auditId = crypto.randomUUID();
  const normalizedAction = actionName.trim();

  const actionRegistry = await import("../../config/action-registry.json");
  const actionConfig = (actionRegistry.actions as Record<string, {
    phase?: string;
    recipients?: string[];
    requiredEmployeeFields?: string[];
    documents?: Array<{ id: string; template: string; order: number }>;
  }>)[normalizedAction];
  const docTemplates = actionConfig?.documents ?? [{ id: "default", template: "default.html", order: 1 }];
  const phase = actionConfig?.phase ?? "unknown";
  const recipientRoles = actionConfig?.recipients ?? [];
  const requiredEmployeeFields = actionConfig?.requiredEmployeeFields ?? [];

  const templateData = buildTemplateData(employee, now);
  const { incompleteFields } = validateRequiredFields(templateData, requiredEmployeeFields);

  const documentInserts: Array<{
    id: string;
    employeeId: string;
    action: string;
    documentName: string;
    storageUrl: string;
    createdAt: string;
  }> = [];

  for (const tmpl of docTemplates.sort((a, b) => a.order - b.order)) {
    const documentId = crypto.randomUUID();
    const orderPrefix = String(tmpl.order).padStart(2, "0");
    const generated = generateEmployeeDocument({
      employee,
      action: normalizedAction,
      generatedAt: now,
      documentId,
      templateFile: tmpl.template,
    });

    let storageUrl = generated.storageUrl;

    if (bucket) {
      try {
        const r2Key = await uploadEmployeeDocumentToR2({
          bucket,
          employeeId,
          employeeCode: employee.employeeCode,
          lastName: employee.lastName,
          firstName: employee.firstName,
          phase,
          action: normalizedAction,
          order: orderPrefix,
          templateId: tmpl.id,
          documentId,
          documentName: `${orderPrefix}_${tmpl.id}.html`,
          content: generated.content,
          contentType: generated.contentType,
          createdAt: now,
        });
        storageUrl = `r2://${r2Key}`;
      } catch (err) {
        console.error(`R2 upload failed for ${tmpl.id}:`, err);
        if (!storageUrl) {
          storageUrl = `data:${generated.contentType};charset=utf-8,${encodeURIComponent(generated.content)}`;
        }
      }
    } else if (!storageUrl) {
      storageUrl = `data:${generated.contentType};charset=utf-8,${encodeURIComponent(generated.content)}`;
    }

    documentInserts.push({
      id: documentId,
      employeeId,
      action: normalizedAction,
      documentName: `${orderPrefix}_${tmpl.id}.html`,
      storageUrl,
      createdAt: now,
    });
  }

  const batchOps = [
    ...documentInserts.map((doc) => db.insert(documents).values(doc)),
    db.insert(auditLog).values({
      id: auditId,
      employeeId,
      action: normalizedAction,
      phase,
      actorId: actor?.id ?? null,
      actorRole: actor?.role ?? "unknown",
      documentIds: JSON.stringify(documentInserts.map((doc) => doc.id)),
      recipientRoles: JSON.stringify(recipientRoles),
      recipientEmails: JSON.stringify([]),
      incompleteFields: JSON.stringify(incompleteFields),
      documentsGenerated: true,
      notificationAttempted: false,
      recipientsNotified: false,
      notificationError: null,
      timestamp: now,
    }),
  ];

  await db.batch(batchOps as [typeof batchOps[0], ...typeof batchOps]);

  const createdDocuments = await db
    .select()
    .from(documents)
    .where(and(eq(documents.employeeId, employeeId), eq(documents.action, normalizedAction)))
    .orderBy(documents.documentName);

  const [auditEntry] = await db
    .select()
    .from(auditLog)
    .where(and(eq(auditLog.id, auditId), eq(auditLog.employeeId, employeeId)))
    .limit(1);

  if (createdDocuments.length === 0 || !auditEntry) {
    throw new Error("Failed to create trigger action records");
  }

  return {
    employee,
    documents: createdDocuments,
    auditEntry: {
      ...auditEntry,
      documentIds: documentInserts.map((doc) => doc.id),
      recipientRoles,
      recipientEmails: [] as string[],
      incompleteFields,
    },
    incompleteFields,
  };
}
