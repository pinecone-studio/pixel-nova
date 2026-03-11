import {
  ensureDefaultActionConfigs,
  getEmployeeById,
  listActionConfigs,
  upsertActionConfig,
  upsertEmployeeRecord,
} from "../db/queries";
import {
  buildEmployeeChangeSet,
  resolveEmployeeLifecycleAction,
} from "../services/actionResolver";
import type { GraphQLContext } from "./schema";
import { executeTriggeredAction } from "./helpers";

type Ctx = GraphQLContext;

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

export const mutationResolvers = {
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
};
