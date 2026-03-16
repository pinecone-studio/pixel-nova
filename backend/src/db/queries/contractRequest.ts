import { desc, eq } from "drizzle-orm";

import type { DbClient } from "../client";
import { contractRequests, employees } from "../schema";

function parseTemplateIds(raw: string | null | undefined) {
  if (!raw) return [] as string[];
  try {
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed)
      ? parsed.filter((value): value is string => typeof value === "string")
      : [];
  } catch {
    return [];
  }
}

export async function insertContractRequest(
  db: DbClient,
  data: {
    employeeId: string;
    templateIds: string[];
    signatureMode: string;
  },
) {
  const id = crypto.randomUUID();
  const now = new Date().toISOString();

  await db.insert(contractRequests).values({
    id,
    employeeId: data.employeeId,
    templateIds: JSON.stringify(data.templateIds),
    status: "pending",
    signatureMode: data.signatureMode,
    createdAt: now,
    updatedAt: now,
  });

  const [row] = await db
    .select()
    .from(contractRequests)
    .where(eq(contractRequests.id, id))
    .limit(1);

  return row ? { ...row, templateIds: parseTemplateIds(row.templateIds) } : null;
}

export async function getContractRequests(
  db: DbClient,
  opts?: { employeeId?: string; status?: string },
) {
  const rows = await db
    .select({
      id: contractRequests.id,
      employeeId: contractRequests.employeeId,
      templateIds: contractRequests.templateIds,
      status: contractRequests.status,
      note: contractRequests.note,
      signatureMode: contractRequests.signatureMode,
      createdAt: contractRequests.createdAt,
      updatedAt: contractRequests.updatedAt,
      decidedAt: contractRequests.decidedAt,
      employee: employees,
    })
    .from(contractRequests)
    .innerJoin(employees, eq(contractRequests.employeeId, employees.id))
    .orderBy(desc(contractRequests.createdAt));

  return rows
    .filter((row) => {
      if (opts?.employeeId && row.employeeId !== opts.employeeId) return false;
      if (opts?.status && row.status !== opts.status) return false;
      return true;
    })
    .map((row) => ({
      ...row,
      templateIds: parseTemplateIds(row.templateIds),
    }));
}

export async function getContractRequestById(db: DbClient, id: string) {
  const rows = await db
    .select({
      id: contractRequests.id,
      employeeId: contractRequests.employeeId,
      templateIds: contractRequests.templateIds,
      status: contractRequests.status,
      note: contractRequests.note,
      signatureMode: contractRequests.signatureMode,
      createdAt: contractRequests.createdAt,
      updatedAt: contractRequests.updatedAt,
      decidedAt: contractRequests.decidedAt,
      employee: employees,
    })
    .from(contractRequests)
    .innerJoin(employees, eq(contractRequests.employeeId, employees.id))
    .where(eq(contractRequests.id, id))
    .limit(1);

  const row = rows[0];
  if (!row) return null;
  return {
    ...row,
    templateIds: parseTemplateIds(row.templateIds),
  };
}

export async function updateContractRequestStatus(
  db: DbClient,
  id: string,
  status: "approved" | "rejected",
  note?: string | null,
) {
  const now = new Date().toISOString();
  await db
    .update(contractRequests)
    .set({
      status,
      note: note ?? null,
      updatedAt: now,
      decidedAt: now,
    })
    .where(eq(contractRequests.id, id));

  return getContractRequestById(db, id);
}
