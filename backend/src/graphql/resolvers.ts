import { GraphQLScalarType, Kind, type ValueNode } from "graphql";

import {
  createTriggeredActionRecords,
  ensureDefaultActionConfigs,
  getEmployeeById,
  getAuditLogs,
  getDocuments,
  listActionConfigs,
  updateAuditLogNotified,
  upsertEmployeeRecord,
  upsertActionConfig,
} from "../db/queries";
import { dispatchNotification } from "../notifications/dispatchNotification";
import {
  buildEmployeeChangeSet,
  resolveEmployeeLifecycleAction,
} from "../services/actionResolver";
import type { GraphQLContext } from "./schema";

type Ctx = GraphQLContext;

// ── Arg shapes ─────────────────────────────────────────────────────────────

interface DocumentsArgs {
  employeeId: string;
}

interface AuditLogsArgs {
  employeeId?: string | null;
}

interface TriggerActionArgs {
  employeeId: string;
  action: string;
}

interface UpsertEmployeeInput {
  id: string;
  employeeCode: string;
  firstName: string;
  lastName: string;
  firstNameEng?: string | null;
  lastNameEng?: string | null;
  entraId?: string | null;
  email?: string | null;
  imageUrl?: string | null;
  github?: string | null;
  department: string;
  branch: string;
  level: string;
  hireDate: string;
  terminationDate?: string | null;
  status: string;
  numberOfVacationDays?: number | null;
  isSalaryCompany?: boolean | null;
  isKpi?: boolean | null;
  birthDayAndMonth?: string | null;
  birthdayPoster?: string | null;
}

interface ResolveEmployeeActionInput {
  employeeId: string;
  changedFields: string[];
  oldValues: Record<string, unknown>;
  newValues: Record<string, unknown>;
}

interface UpdateRegistryInput {
  name: string;
  phase: string;
  triggerFields: string[];
}

// ── JSON scalar ────────────────────────────────────────────────────────────

type JsonValue =
  | string
  | number
  | boolean
  | null
  | JsonValue[]
  | { [key: string]: JsonValue };

function parseJsonLiteral(valueNode: ValueNode): JsonValue {
  switch (valueNode.kind) {
    case Kind.STRING:
    case Kind.BOOLEAN:
      return valueNode.value;
    case Kind.INT:
    case Kind.FLOAT:
      return Number(valueNode.value);
    case Kind.NULL:
      return null;
    case Kind.OBJECT:
      return Object.fromEntries(
        valueNode.fields.map((field) => [
          field.name.value,
          parseJsonLiteral(field.value),
        ]),
      );
    case Kind.LIST:
      return valueNode.values.map((item) => parseJsonLiteral(item));
    default:
      return null;
  }
}

const jsonScalar = new GraphQLScalarType({
  name: "JSON",
  serialize: (value) => value,
  parseValue: (value) => value,
  parseLiteral: (valueNode) => parseJsonLiteral(valueNode),
});

// ── Shared helper ──────────────────────────────────────────────────────────

async function executeTriggeredAction(
  ctx: Ctx,
  employeeId: string,
  action: string,
) {
  const resendApiKey =
    (ctx.env as CloudflareBindings & { RESEND_API_KEY?: string })
      .RESEND_API_KEY ?? "";

  const result = await createTriggeredActionRecords(ctx.db, employeeId, action);

  const notificationResult = await dispatchNotification({
    db: ctx.db,
    employee: result.employee,
    documents: result.documents,
    action,
    apiKey: resendApiKey,
  });

  if (notificationResult.notified) {
    await updateAuditLogNotified(ctx.db, result.auditEntry.id, true);
    result.auditEntry.recipientsNotified = true;
  }

  return {
    employee: result.employee,
    documents: result.documents,
    auditLog: result.auditEntry,
  };
}

// ── Resolvers ──────────────────────────────────────────────────────────────

export const resolvers = {
  JSON: jsonScalar,

  Query: {
    documents: (_: unknown, args: DocumentsArgs, ctx: Ctx) =>
      getDocuments(ctx.db, args.employeeId),

    auditLogs: (_: unknown, args: AuditLogsArgs, ctx: Ctx) =>
      getAuditLogs(ctx.db, args.employeeId),

    actions: async (_: unknown, __: unknown, ctx: Ctx) => {
      await ensureDefaultActionConfigs(ctx.db);
      return listActionConfigs(ctx.db);
    },
  },

  Mutation: {
    triggerAction: (_: unknown, args: TriggerActionArgs, ctx: Ctx) =>
      executeTriggeredAction(ctx, args.employeeId, args.action),

    upsertEmployee: async (
      _: unknown,
      args: { input: UpsertEmployeeInput },
      ctx: Ctx,
    ) => {
      const persisted = await upsertEmployeeRecord(ctx.db, args.input);
      await ensureDefaultActionConfigs(ctx.db);

      const changeSet = buildEmployeeChangeSet(
        persisted.previousEmployee,
        persisted.employee,
      );

      const actionConfigs = await listActionConfigs(ctx.db);
      const resolvedAction = resolveEmployeeLifecycleAction(
        {
          employeeId: persisted.employee.id,
          changedFields: changeSet.changedFields,
          oldValues: changeSet.oldValues,
          newValues: changeSet.newValues,
        },
        { actionConfigs },
      );

      const triggeredActionResult = resolvedAction
        ? await executeTriggeredAction(
            ctx,
            persisted.employee.id,
            resolvedAction,
          )
        : null;

      return {
        employee: persisted.employee,
        resolvedAction,
        triggeredActionResult,
      };
    },

    resolveEmployeeAction: async (
      _: unknown,
      args: { input: ResolveEmployeeActionInput },
      ctx: Ctx,
    ) => {
      const employee = await getEmployeeById(ctx.db, args.input.employeeId);

      if (!employee) {
        throw new Error(`Employee not found for id ${args.input.employeeId}`);
      }

      await ensureDefaultActionConfigs(ctx.db);
      const actionConfigs = await listActionConfigs(ctx.db);
      const action = resolveEmployeeLifecycleAction(args.input, {
        actionConfigs,
      });

      return action ? { action } : null;
    },

    updateRegistry: (
      _: unknown,
      args: { input: UpdateRegistryInput },
      ctx: Ctx,
    ) => upsertActionConfig(ctx.db, args.input),
  },
};
