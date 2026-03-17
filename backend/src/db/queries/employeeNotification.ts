import { and, desc, eq } from "drizzle-orm";

import type { DbClient } from "../client";
import { employeeNotifications, employees } from "../schema";

export async function insertEmployeeNotification(
  db: DbClient,
  data: {
    employeeId: string;
    title: string;
    body: string;
    announcementId?: string | null;
  },
) {
  const id = crypto.randomUUID();
  const now = new Date().toISOString();

  await db.insert(employeeNotifications).values({
    id,
    employeeId: data.employeeId,
    announcementId: data.announcementId ?? null,
    title: data.title,
    body: data.body,
    status: "unread",
    createdAt: now,
    readAt: null,
  });

  const [row] = await db
    .select()
    .from(employeeNotifications)
    .where(eq(employeeNotifications.id, id))
    .limit(1);

  return row ?? null;
}

export async function getEmployeeNotifications(
  db: DbClient,
  employeeId: string,
) {
  return db
    .select()
    .from(employeeNotifications)
    .where(eq(employeeNotifications.employeeId, employeeId))
    .orderBy(desc(employeeNotifications.createdAt));
}

export async function markEmployeeNotificationRead(
  db: DbClient,
  id: string,
  employeeId: string,
) {
  const now = new Date().toISOString();
  await db
    .update(employeeNotifications)
    .set({ status: "read", readAt: now })
    .where(
      and(
        eq(employeeNotifications.id, id),
        eq(employeeNotifications.employeeId, employeeId),
      ),
    );

  const [row] = await db
    .select()
    .from(employeeNotifications)
    .where(eq(employeeNotifications.id, id))
    .limit(1);

  return row ?? null;
}

export async function insertAnnouncementNotificationsForAudience(
  db: DbClient,
  data: { title: string; body: string; announcementId: string; audience: string },
) {
  const now = new Date().toISOString();
  const rows = await db
    .select({ id: employees.id, department: employees.department })
    .from(employees);
  const recipients = rows.filter((row) => {
    if (data.audience === "hr") return row.department === "HR";
    if (data.audience === "employees") return row.department !== "HR";
    return true;
  });
  if (recipients.length === 0) return 0;

  const values = recipients.map((row) => ({
    id: crypto.randomUUID(),
    employeeId: row.id,
    announcementId: data.announcementId,
    title: data.title,
    body: data.body,
    status: "unread" as const,
    createdAt: now,
    readAt: null,
  }));

  await db.insert(employeeNotifications).values(values);
  return values.length;
}
