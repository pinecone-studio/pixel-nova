import { eq } from "drizzle-orm";

import type { DbClient } from "../client";
import { actions } from "../schema";
import {
  DEFAULT_LIFECYCLE_ACTION_CONFIGS,
  type LifecycleActionConfig,
} from "../../services/actionResolver";
import type { ActionRegistryInput } from "./types";

export interface NormalizedActionConfig
  extends Omit<typeof actions.$inferSelect, "triggerFields" | "name">,
    LifecycleActionConfig {}

function toJsonArray(input: string): string[] {
  try {
    const parsed = JSON.parse(input);
    return Array.isArray(parsed)
      ? parsed.filter((value): value is string => typeof value === "string")
      : [];
  } catch {
    return [];
  }
}

export function normalizeActionConfig(row: typeof actions.$inferSelect) {
  return {
    ...row,
    triggerFields: toJsonArray(row.triggerFields),
  } as NormalizedActionConfig;
}

export async function listActionConfigs(db: DbClient) {
  const rows = await db.select().from(actions).orderBy(actions.name);
  return rows.map(normalizeActionConfig);
}

export async function ensureDefaultActionConfigs(db: DbClient) {
  for (const config of DEFAULT_LIFECYCLE_ACTION_CONFIGS) {
    await db
      .insert(actions)
      .values({
        id: crypto.randomUUID(),
        name: config.name,
        phase: config.phase,
        triggerFields: JSON.stringify(config.triggerFields),
      })
      .onConflictDoNothing({
        target: actions.name,
      });
  }
}

export async function upsertActionConfig(
  db: DbClient,
  input: ActionRegistryInput,
) {
  const id = crypto.randomUUID();

  await db
    .insert(actions)
    .values({
      id,
      name: input.name,
      phase: input.phase,
      triggerFields: JSON.stringify(input.triggerFields),
    })
    .onConflictDoUpdate({
      target: actions.name,
      set: {
        phase: input.phase,
        triggerFields: JSON.stringify(input.triggerFields),
      },
    });

  const [row] = await db
    .select()
    .from(actions)
    .where(eq(actions.name, input.name))
    .limit(1);

  if (!row) {
    throw new Error("Failed to upsert action registry entry");
  }

  return normalizeActionConfig(row);
}
