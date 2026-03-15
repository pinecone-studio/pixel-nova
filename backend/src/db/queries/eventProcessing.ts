import { eq } from "drizzle-orm";

import type { DbClient } from "../client";
import { processedEvents } from "../schema";

export async function getProcessedEventById(db: DbClient, eventId: string) {
  const [row] = await db
    .select()
    .from(processedEvents)
    .where(eq(processedEvents.eventId, eventId))
    .limit(1);

  return row ?? null;
}

export async function tryStartProcessedEvent(
  db: DbClient,
  input: {
    eventId: string;
    eventType: string;
    employeeId: string;
    payload: string;
  },
) {
  const before = await getProcessedEventById(db, input.eventId);
  if (before) {
    return { inserted: false, event: before };
  }

  await db
    .insert(processedEvents)
    .values({
      eventId: input.eventId,
      eventType: input.eventType,
      employeeId: input.employeeId,
      action: null,
      status: "processing",
      payload: input.payload,
      lastError: null,
      processedAt: new Date().toISOString(),
    })
    .onConflictDoNothing({ target: processedEvents.eventId });

  const after = await getProcessedEventById(db, input.eventId);
  if (!after) {
    throw new Error(`Failed to persist processed event ${input.eventId}`);
  }

  return {
    inserted: after.status === "processing",
    event: after,
  };
}

export async function finishProcessedEvent(
  db: DbClient,
  input: {
    eventId: string;
    status: "ignored" | "completed" | "failed";
    action?: string | null;
    lastError?: string | null;
  },
) {
  await db
    .update(processedEvents)
    .set({
      status: input.status,
      action: input.action ?? null,
      lastError: input.lastError ?? null,
      processedAt: new Date().toISOString(),
    })
    .where(eq(processedEvents.eventId, input.eventId));

  return getProcessedEventById(db, input.eventId);
}
