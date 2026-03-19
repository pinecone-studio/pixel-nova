import { desc, eq, inArray } from "drizzle-orm";

import type { DbClient } from "../client";
import { documents } from "../schema";

export async function getDocuments(
  db: DbClient,
  employeeId?: string | null,
) {
  const query = db.select().from(documents);

  const rows = employeeId
    ? await query.where(eq(documents.employeeId, employeeId)).orderBy(desc(documents.createdAt))
    : await query.orderBy(desc(documents.createdAt));

  return rows;
}

export async function getDocumentById(db: DbClient, documentId: string) {
  const [doc] = await db
    .select()
    .from(documents)
    .where(eq(documents.id, documentId))
    .limit(1);
  return doc ?? null;
}

export async function getDocumentsByIds(db: DbClient, documentIds: string[]) {
  if (documentIds.length === 0) {
    return [];
  }

  const rows = await db
    .select()
    .from(documents)
    .where(inArray(documents.id, documentIds));

  const rowById = new Map(rows.map((row) => [row.id, row]));
  return documentIds
    .map((documentId) => rowById.get(documentId))
    .filter((row): row is typeof documents.$inferSelect => Boolean(row));
}

export async function updateDocumentStorage(
  db: DbClient,
  documentId: string,
  storageUrl: string,
) {
  await db
    .update(documents)
    .set({ storageUrl })
    .where(eq(documents.id, documentId));

  return getDocumentById(db, documentId);
}

export async function updateDocumentHrSignature(
  db: DbClient,
  documentId: string,
  input: {
    hrSignatureData: string;
    hrSignedAt: string;
    storageUrl?: string;
  },
) {
  await db
    .update(documents)
    .set({
      hrSigned: true,
      hrSignatureData: input.hrSignatureData,
      hrSignedAt: input.hrSignedAt,
      ...(input.storageUrl ? { storageUrl: input.storageUrl } : {}),
    })
    .where(eq(documents.id, documentId));

  return getDocumentById(db, documentId);
}

export async function updateDocumentEmployeeSignature(
  db: DbClient,
  documentId: string,
  input: {
    employeeSignatureData: string;
    employeeSignedAt: string;
    storageUrl?: string;
  },
) {
  await db
    .update(documents)
    .set({
      employeeSigned: true,
      employeeSignatureData: input.employeeSignatureData,
      employeeSignedAt: input.employeeSignedAt,
      ...(input.storageUrl ? { storageUrl: input.storageUrl } : {}),
    })
    .where(eq(documents.id, documentId));

  return getDocumentById(db, documentId);
}

export async function areAllDocumentsHrSigned(
  db: DbClient,
  documentIds: string[],
) {
  const rows = await getDocumentsByIds(db, documentIds);
  return rows.length > 0 && rows.every((row) => row.hrSigned);
}

export async function areAllDocumentsEmployeeSigned(
  db: DbClient,
  documentIds: string[],
) {
  const rows = await getDocumentsByIds(db, documentIds);
  return rows.length > 0 && rows.every((row) => row.employeeSigned);
}

export async function deleteDocument(db: DbClient, documentId: string) {
  const doc = await getDocumentById(db, documentId);
  if (!doc) return null;
  await db.delete(documents).where(eq(documents.id, documentId));
  return doc;
}

export async function insertDocument(
  db: DbClient,
  document: typeof documents.$inferInsert,
) {
  await db.insert(documents).values(document);
  const [row] = await db
    .select()
    .from(documents)
    .where(eq(documents.id, document.id))
    .limit(1);

  return row ?? null;
}
