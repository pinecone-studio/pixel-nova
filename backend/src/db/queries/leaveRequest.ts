import { desc, eq } from "drizzle-orm";

import type { DbClient } from "../client";
import { employees, leaveRequests } from "../schema";

export async function insertLeaveRequest(
  db: DbClient,
  data: {
    employeeId: string;
    type: string;
    startTime: string;
    endTime: string;
    reason: string;
  },
) {
  const id = crypto.randomUUID();
  const now = new Date().toISOString();

  await db.insert(leaveRequests).values({
    id,
    employeeId: data.employeeId,
    type: data.type,
    startTime: data.startTime,
    endTime: data.endTime,
    reason: data.reason,
    status: "pending",
    createdAt: now,
    updatedAt: now,
  });

  const [row] = await db
    .select()
    .from(leaveRequests)
    .where(eq(leaveRequests.id, id))
    .limit(1);

  return row ?? null;
}

export async function getLeaveRequests(
  db: DbClient,
  opts?: { employeeId?: string; status?: string },
) {
  const rows = await db
    .select({
      id: leaveRequests.id,
      employeeId: leaveRequests.employeeId,
      type: leaveRequests.type,
      startTime: leaveRequests.startTime,
      endTime: leaveRequests.endTime,
      reason: leaveRequests.reason,
      status: leaveRequests.status,
      note: leaveRequests.note,
      createdAt: leaveRequests.createdAt,
      updatedAt: leaveRequests.updatedAt,
      employee: employees,
    })
    .from(leaveRequests)
    .innerJoin(employees, eq(leaveRequests.employeeId, employees.id))
    .orderBy(desc(leaveRequests.createdAt));

  return rows.filter((r) => {
    if (opts?.employeeId && r.employeeId !== opts.employeeId) return false;
    if (opts?.status && r.status !== opts.status) return false;
    return true;
  });
}

export async function getLeaveRequestById(db: DbClient, id: string) {
  const rows = await db
    .select({
      id: leaveRequests.id,
      employeeId: leaveRequests.employeeId,
      type: leaveRequests.type,
      startTime: leaveRequests.startTime,
      endTime: leaveRequests.endTime,
      reason: leaveRequests.reason,
      status: leaveRequests.status,
      note: leaveRequests.note,
      createdAt: leaveRequests.createdAt,
      updatedAt: leaveRequests.updatedAt,
      employee: employees,
    })
    .from(leaveRequests)
    .innerJoin(employees, eq(leaveRequests.employeeId, employees.id))
    .where(eq(leaveRequests.id, id))
    .limit(1);

  return rows[0] ?? null;
}

export async function updateLeaveRequestStatus(
  db: DbClient,
  id: string,
  status: "approved" | "rejected",
  note?: string | null,
) {
  await db
    .update(leaveRequests)
    .set({ status, note: note ?? null, updatedAt: new Date().toISOString() })
    .where(eq(leaveRequests.id, id));

  return getLeaveRequestById(db, id);
}
