import { inArray } from "drizzle-orm";

import type { DbClient } from "../db/client";
import { recipients } from "../db/schema";

export async function resolveRecipients(db: DbClient, roles: string[]): Promise<string[]> {
  if (roles.length === 0) return [];

  const rows = await db
    .select({ email: recipients.email })
    .from(recipients)
    .where(inArray(recipients.role, roles));

  return rows.map((r) => r.email);
}

export async function getAllRecipientEmails(db: DbClient): Promise<string[]> {
  const rows = await db.select({ email: recipients.email }).from(recipients);
  return rows.map((r) => r.email);
}
