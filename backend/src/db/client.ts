import { drizzle } from "drizzle-orm/d1";

import { schema } from "./schema";

export function getDb(env: Pick<CloudflareBindings, "DB">) {
  return drizzle(env.DB, { schema });
}

export type DbClient = ReturnType<typeof getDb>;
