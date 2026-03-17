import { and, desc, eq } from "drizzle-orm";

import type { DbClient } from "../client";
import { announcements, employeeNotifications } from "../schema";

export async function listAnnouncements(db: DbClient) {
  const rows = await db
    .select()
    .from(announcements)
    .orderBy(desc(announcements.createdAt));

  const withStats = await Promise.all(
    rows.map(async (row) => {
      const total = await db
        .select({ count: employeeNotifications.id })
        .from(employeeNotifications)
        .where(eq(employeeNotifications.announcementId, row.id));
      const read = await db
        .select({ count: employeeNotifications.id })
        .from(employeeNotifications)
        .where(
          and(
            eq(employeeNotifications.announcementId, row.id),
            eq(employeeNotifications.status, "read"),
          ),
        );
      return {
        ...row,
        recipientCount: total.length,
        readCount: read.length,
      };
    }),
  );

  return withStats;
}

export async function insertAnnouncementDraft(
  db: DbClient,
  data: {
    title: string;
    body: string;
    audience?: string | null;
    createdBy?: string | null;
  },
) {
  const id = crypto.randomUUID();
  const now = new Date().toISOString();
  await db.insert(announcements).values({
    id,
    title: data.title,
    body: data.body,
    audience: data.audience ?? "all",
    status: "draft",
    createdBy: data.createdBy ?? null,
    createdAt: now,
    updatedAt: now,
    publishedAt: null,
  });

  const [row] = await db
    .select()
    .from(announcements)
    .where(eq(announcements.id, id))
    .limit(1);
  return row ?? null;
}

export async function updateAnnouncementDraft(
  db: DbClient,
  id: string,
  data: { title: string; body: string; audience?: string | null },
) {
  const now = new Date().toISOString();
  await db
    .update(announcements)
    .set({
      title: data.title,
      body: data.body,
      audience: data.audience ?? "all",
      updatedAt: now,
    })
    .where(eq(announcements.id, id))
    .where(eq(announcements.status, "draft"));

  const [row] = await db
    .select()
    .from(announcements)
    .where(eq(announcements.id, id))
    .limit(1);
  return row ?? null;
}

export async function publishAnnouncement(
  db: DbClient,
  id: string,
) {
  const now = new Date().toISOString();
  await db
    .update(announcements)
    .set({
      status: "published",
      publishedAt: now,
      updatedAt: now,
    })
    .where(eq(announcements.id, id));

  const [row] = await db
    .select()
    .from(announcements)
    .where(eq(announcements.id, id))
    .limit(1);
  return row ?? null;
}
