import { desc, eq } from "drizzle-orm";

import type { DbClient } from "../client";
import { auditLog } from "../schema";

export async function getAuditLogs(
  db: DbClient,
  employeeId?: string | null,
) {
  const query = db.select().from(auditLog);

  const rows = employeeId
    ? await query.where(eq(auditLog.employeeId, employeeId)).orderBy(desc(auditLog.timestamp))
    : await query.orderBy(desc(auditLog.timestamp));

  return rows;
}

export async function insertAuditLog(
  db: DbClient,
  entry: typeof auditLog.$inferInsert,
) {
  await db.insert(auditLog).values(entry);
  const [row] = await db
    .select()
    .from(auditLog)
    .where(eq(auditLog.id, entry.id))
    .limit(1);

  return row ?? null;
}

export async function updateAuditLogNotified(
  db: DbClient,
  auditId: string,
  notified: boolean,
) {
  await db
    .update(auditLog)
    .set({ recipientsNotified: notified })
    .where(eq(auditLog.id, auditId));
}
