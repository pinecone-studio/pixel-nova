import {
  ensureDefaultActionConfigs,
  finishProcessedEvent,
  getActionConfigByName,
  getEmployeeById,
  listActionConfigs,
  tryStartProcessedEvent,
  upsertEmployeeRecord,
} from "../db/queries";
import type { Actor } from "../db/queries";
import type { Employee } from "../db/schema";
import { buildEmployeeChangeSet, resolveEmployeeLifecycleAction } from "../services/actionResolver";
import type { GraphQLContext } from "../graphql/schema";
import { executeTriggeredAction } from "../graphql/helpers";

export interface EmployeeLifecycleQueueMessage {
  eventId?: string;
  eventType?: string;
  employeeId: string;
  occurredAt?: string;
  actor?: Actor;
  changedFields?: string[];
  oldValues?: Record<string, unknown>;
  newValues?: Record<string, unknown>;
  employee?: Partial<Employee>;
}

function normalizeString(value: unknown) {
  return typeof value === "string" ? value.trim() : "";
}

function pickValue(
  message: EmployeeLifecycleQueueMessage,
  existing: Employee | null,
  key: keyof Employee,
) {
  return (
    message.employee?.[key] ??
    message.newValues?.[key as string] ??
    message.oldValues?.[key as string] ??
    existing?.[key] ??
    null
  );
}

function pickString(
  message: EmployeeLifecycleQueueMessage,
  existing: Employee | null,
  key: keyof Employee,
) {
  const value = pickValue(message, existing, key);
  return typeof value === "string" ? value : "";
}

function pickNullableString(
  message: EmployeeLifecycleQueueMessage,
  existing: Employee | null,
  key: keyof Employee,
) {
  const value = pickValue(message, existing, key);
  return typeof value === "string" ? value : null;
}

function pickNumber(
  message: EmployeeLifecycleQueueMessage,
  existing: Employee | null,
  key: keyof Employee,
) {
  const value = pickValue(message, existing, key);
  return typeof value === "number" ? value : null;
}

function pickBoolean(
  message: EmployeeLifecycleQueueMessage,
  existing: Employee | null,
  key: keyof Employee,
) {
  const value = pickValue(message, existing, key);
  return typeof value === "boolean" ? value : null;
}

function buildEventId(message: EmployeeLifecycleQueueMessage) {
  const explicit = normalizeString(message.eventId);
  if (explicit) {
    return explicit;
  }

  return `${normalizeString(message.eventType) || "employee.changed"}:${message.employeeId}:${message.occurredAt ?? "unknown"}`;
}

function buildUpsertPayload(message: EmployeeLifecycleQueueMessage, existing: Employee | null) {
  const payload = {
    id: normalizeString(message.employeeId),
    employeeCode: pickString(message, existing, "employeeCode"),
    firstName: pickString(message, existing, "firstName"),
    lastName: pickString(message, existing, "lastName"),
    firstNameEng: pickNullableString(message, existing, "firstNameEng"),
    lastNameEng: pickNullableString(message, existing, "lastNameEng"),
    entraId: pickNullableString(message, existing, "entraId"),
    email: pickNullableString(message, existing, "email"),
    imageUrl: pickNullableString(message, existing, "imageUrl"),
    github: pickNullableString(message, existing, "github"),
    department: pickString(message, existing, "department"),
    branch: pickString(message, existing, "branch"),
    jobTitle: pickNullableString(message, existing, "jobTitle") ?? undefined,
    level: pickString(message, existing, "level"),
    hireDate: pickString(message, existing, "hireDate"),
    terminationDate: pickNullableString(message, existing, "terminationDate"),
    status: pickString(message, existing, "status"),
    numberOfVacationDays: pickNumber(message, existing, "numberOfVacationDays"),
    isSalaryCompany: pickBoolean(message, existing, "isSalaryCompany"),
    isKpi: pickBoolean(message, existing, "isKpi"),
    birthDayAndMonth: pickNullableString(message, existing, "birthDayAndMonth"),
    birthdayPoster: pickNullableString(message, existing, "birthdayPoster"),
  };

  for (const field of [
    "id",
    "employeeCode",
    "firstName",
    "lastName",
    "department",
    "branch",
    "level",
    "hireDate",
    "status",
  ] as const) {
    if (!payload[field]) {
      throw new Error(`Queue event is missing required employee field "${field}"`);
    }
  }

  return payload;
}

export async function processEmployeeLifecycleEvent(
  ctx: GraphQLContext,
  message: EmployeeLifecycleQueueMessage,
) {
  const eventId = buildEventId(message);
  const eventType = normalizeString(message.eventType) || "employee.changed";
  const employeeId = normalizeString(message.employeeId);

  const started = await tryStartProcessedEvent(ctx.db, {
    eventId,
    eventType,
    employeeId,
    payload: JSON.stringify(message),
  });

  if (!started.inserted) {
    return {
      duplicate: true,
      action: started.event.action,
      status: started.event.status,
    };
  }

  try {
    await ensureDefaultActionConfigs(ctx.db);

    const previousEmployee = await getEmployeeById(ctx.db, employeeId);
    const persisted = await upsertEmployeeRecord(
      ctx.db,
      buildUpsertPayload(message, previousEmployee),
    );
    const actionConfigs = await listActionConfigs(ctx.db);
    const changedFields = message.changedFields?.length
      ? message.changedFields
      : buildEmployeeChangeSet(
          persisted.previousEmployee,
          persisted.employee,
        ).changedFields;

    const resolvedAction = resolveEmployeeLifecycleAction(
      {
        employeeId,
        changedFields,
        oldValues: message.oldValues ?? persisted.previousEmployee ?? {},
        newValues: message.newValues ?? persisted.employee,
      },
      { actionConfigs },
    );

    if (!resolvedAction) {
      await finishProcessedEvent(ctx.db, {
        eventId,
        status: "ignored",
      });

      return {
        duplicate: false,
        action: null,
        status: "ignored" as const,
      };
    }

    const actionConfig = await getActionConfigByName(ctx.db, resolvedAction);
    const result = await executeTriggeredAction(
      {
        ...ctx,
        actor: message.actor ?? { id: "queue-consumer", role: "hr" },
        currentEmployee: null,
        sessionToken: null,
      },
      persisted.employee.id,
      resolvedAction,
      { actionConfig },
    );

    await finishProcessedEvent(ctx.db, {
      eventId,
      action: resolvedAction,
      status: "completed",
    });

    return {
      duplicate: false,
      action: resolvedAction,
      status: "completed" as const,
      result,
    };
  } catch (error) {
    await finishProcessedEvent(ctx.db, {
      eventId,
      status: "failed",
      lastError: error instanceof Error ? error.message : String(error),
    });
    throw error;
  }
}
