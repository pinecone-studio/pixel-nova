import { desc, eq } from "drizzle-orm";

import type { DbClient } from "../client";
import { employeeNotifications } from "../schema";

export async function insertEmployeeNotification(
  db: DbClient,
  data: {
    employeeId: string;
    title: string;
    body: string;
  },
) {
  const id = crypto.randomUUID();
  const now = new Date().toISOString();

  await db.insert(employeeNotifications).values({
    id,
    employeeId: data.employeeId,
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
    .where(eq(employeeNotifications.id, id))
    .where(eq(employeeNotifications.employeeId, employeeId));

  const [row] = await db
    .select()
    .from(employeeNotifications)
    .where(eq(employeeNotifications.id, id))
    .limit(1);

  return row ?? null;
}
