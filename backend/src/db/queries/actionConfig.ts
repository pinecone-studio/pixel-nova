import { eq } from "drizzle-orm";

import type { DbClient } from "../client";
import { actions } from "../schema";
import type { LifecycleActionConfig } from "../../services/actionResolver";
import actionRegistry from "../../config/action-registry.json";
import type { ActionRegistryInput } from "./types";

export interface NormalizedActionConfig
  extends Omit<
      typeof actions.$inferSelect,
      "triggerFields" | "name" | "requiredEmployeeFields" | "recipients" | "documents"
    >,
    LifecycleActionConfig {
  triggerCondition: string | null;
  requiredEmployeeFields: string[];
  recipients: string[];
  documents: ActionDocumentConfig[];
}

export interface ActionDocumentConfig {
  id: string;
  template: string;
  order: number;
}

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

function toJsonValue<T>(input: string, fallback: T): T {
  try {
    return JSON.parse(input) as T;
  } catch {
    return fallback;
  }
}

export function normalizeActionConfig(row: typeof actions.$inferSelect) {
  return {
    ...row,
    triggerFields: toJsonArray(row.triggerFields),
    requiredEmployeeFields: toJsonArray(row.requiredEmployeeFields),
    recipients: toJsonArray(row.recipients),
    documents: toJsonValue<ActionDocumentConfig[]>(row.documents, []).filter(
      (document) =>
        document &&
        typeof document.id === "string" &&
        typeof document.template === "string" &&
        typeof document.order === "number",
    ),
  } as NormalizedActionConfig;
}

export async function listActionConfigs(db: DbClient) {
  const rows = await db.select().from(actions).orderBy(actions.name);
  return rows.map(normalizeActionConfig);
}

export async function getActionConfigByName(db: DbClient, actionName: string) {
  const [row] = await db
    .select()
    .from(actions)
    .where(eq(actions.name, actionName))
    .limit(1);

  return row ? normalizeActionConfig(row) : null;
}

export async function ensureDefaultActionConfigs(db: DbClient) {
  for (const [name, config] of Object.entries(actionRegistry.actions)) {
    await db
      .insert(actions)
      .values({
        id: crypto.randomUUID(),
        name,
        phase: config.phase,
        triggerCondition:
          "triggerCondition" in config ? (config.triggerCondition ?? null) : null,
        triggerFields: JSON.stringify(config.triggerFields),
        requiredEmployeeFields: JSON.stringify(config.requiredEmployeeFields ?? []),
        recipients: JSON.stringify(config.recipients ?? []),
        documents: JSON.stringify(config.documents ?? []),
      })
      .onConflictDoUpdate({
        target: actions.name,
        set: {
          phase: config.phase,
          triggerCondition:
            "triggerCondition" in config ? (config.triggerCondition ?? null) : null,
          triggerFields: JSON.stringify(config.triggerFields),
          requiredEmployeeFields: JSON.stringify(config.requiredEmployeeFields ?? []),
          recipients: JSON.stringify(config.recipients ?? []),
          documents: JSON.stringify(config.documents ?? []),
        },
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
      triggerCondition: input.triggerCondition ?? null,
      triggerFields: JSON.stringify(input.triggerFields),
      requiredEmployeeFields: JSON.stringify(input.requiredEmployeeFields ?? []),
      recipients: JSON.stringify(input.recipients ?? []),
      documents: JSON.stringify(input.documents ?? []),
    })
    .onConflictDoUpdate({
      target: actions.name,
      set: {
        phase: input.phase,
        triggerCondition: input.triggerCondition ?? null,
        triggerFields: JSON.stringify(input.triggerFields),
        requiredEmployeeFields: JSON.stringify(input.requiredEmployeeFields ?? []),
        recipients: JSON.stringify(input.recipients ?? []),
        documents: JSON.stringify(input.documents ?? []),
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
