import { and, eq } from "drizzle-orm";

import type { DbClient } from "../client";
import { auditLog, documents } from "../schema";
import { generateEmployeeDocument } from "../../document/generator";
import { uploadEmployeeDocumentToR2 } from "../../storage/r2";
import { getEmployeeById } from "./employee";

export async function createTriggeredActionRecords(
  db: DbClient,
  employeeId: string,
  actionName: string,
  bucket?: R2Bucket,
) {
  const employee = await getEmployeeById(db, employeeId);

  if (!employee) {
    throw new Error(`Employee not found for id ${employeeId}`);
  }

  const now = new Date().toISOString();
  const auditId = crypto.randomUUID();
  const normalizedAction = actionName.trim();

  // action-registry.json-оос тухайн action-ийн document list-ийг авна
  const actionRegistry = await import("../../config/action-registry.json");
  const actionConfig = (actionRegistry.actions as Record<string, { documents?: Array<{ id: string; template: string; order: number }> }>)[normalizedAction];
  const docTemplates = actionConfig?.documents ?? [{ id: "default", template: "default.html", order: 1 }];

  // Template тус бүрд document үүсгэнэ
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

    // R2 bucket байвал upload хийнэ
    if (bucket) {
      try {
        const r2Key = await uploadEmployeeDocumentToR2({
          bucket,
          employeeId,
          documentId,
          documentName: `${orderPrefix}_${tmpl.id}.html`,
          content: generated.content,
          contentType: generated.contentType,
          createdAt: now,
        });
        storageUrl = `r2://${r2Key}`;
      } catch (err) {
        console.error(`R2 upload failed for ${tmpl.id}:`, err);
        // Fallback: data URL хэвээр хадгалагдана
        if (!storageUrl) {
          storageUrl = `data:${generated.contentType};charset=utf-8,${encodeURIComponent(generated.content)}`;
        }
      }
    } else if (!storageUrl) {
      // R2 байхгүй бол data URL-д хадгална
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

  // Бүх document + audit log-ийг batch insert хийнэ
  const batchOps = [
    ...documentInserts.map((doc) => db.insert(documents).values(doc)),
    db.insert(auditLog).values({
      id: auditId,
      employeeId,
      action: normalizedAction,
      documentsGenerated: true,
      recipientsNotified: false,
      timestamp: now,
    }),
  ];

  await db.batch(batchOps as [typeof batchOps[0], ...typeof batchOps]);

  // Үүссэн document-уудыг query хийнэ
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

  return { employee, documents: createdDocuments, auditEntry };
}
