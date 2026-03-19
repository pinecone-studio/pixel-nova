import { and, desc, eq, gte, lte } from "drizzle-orm";

import type { DbClient } from "../client";
import { auditLog } from "../schema";

function parseJsonList(value: string | null | undefined) {
  if (!value) {
    return [];
  }

  try {
    const parsed = JSON.parse(value);
    return Array.isArray(parsed)
      ? parsed.filter((item): item is string => typeof item === "string")
      : [];
  } catch {
    return [];
  }
}

export function normalizeAuditLog(row: typeof auditLog.$inferSelect) {
  return {
    ...row,
    documentIds: parseJsonList(row.documentIds),
    recipientRoles: parseJsonList(row.recipientRoles),
    recipientEmails: parseJsonList(row.recipientEmails),
    incompleteFields: parseJsonList(row.incompleteFields),
  };
}

export async function getAuditLogs(
  db: DbClient,
  filters?: {
    employeeId?: string | null;
    action?: string | null;
    fromDate?: string | null;
    toDate?: string | null;
  },
) {
  const conditions = [];

  if (filters?.employeeId) {
    conditions.push(eq(auditLog.employeeId, filters.employeeId));
  }
  if (filters?.action) {
    conditions.push(eq(auditLog.action, filters.action));
  }
  if (filters?.fromDate) {
    conditions.push(gte(auditLog.timestamp, filters.fromDate));
  }
  if (filters?.toDate) {
    conditions.push(lte(auditLog.timestamp, filters.toDate));
  }

  const query = db.select().from(auditLog);
  const rows = conditions.length > 0
    ? await query.where(and(...conditions)).orderBy(desc(auditLog.timestamp))
    : await query.orderBy(desc(auditLog.timestamp));

  return rows.map(normalizeAuditLog);
}

export async function getAuditLogById(db: DbClient, auditId: string) {
  const [row] = await db
    .select()
    .from(auditLog)
    .where(eq(auditLog.id, auditId))
    .limit(1);

  return row ? normalizeAuditLog(row) : null;
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

  return row ? normalizeAuditLog(row) : null;
}

export async function updateAuditLogDelivery(
  db: DbClient,
  auditId: string,
  input: {
    recipientEmails: string[];
    notificationAttempted: boolean;
    recipientsNotified: boolean;
    notificationError?: string | null;
  },
) {
  await db
    .update(auditLog)
    .set({
      recipientEmails: JSON.stringify(input.recipientEmails),
      notificationAttempted: input.notificationAttempted,
      recipientsNotified: input.recipientsNotified,
      notificationError: input.notificationError ?? null,
    })
    .where(eq(auditLog.id, auditId));
}
