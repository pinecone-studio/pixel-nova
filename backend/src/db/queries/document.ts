import { desc, eq } from "drizzle-orm";

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
