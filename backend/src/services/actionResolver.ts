export const SUPPORTED_LIFECYCLE_ACTIONS = [
  "add_employee",
  "promote_employee",
  "change_position",
  "offboard_employee",
] as const;

export type LifecycleAction = (typeof SUPPORTED_LIFECYCLE_ACTIONS)[number];

export interface LifecycleActionConfig {
  name: LifecycleAction;
  phase: string;
  triggerFields: string[];
}

export const DEFAULT_LIFECYCLE_ACTION_CONFIGS: LifecycleActionConfig[] = [
  {
    name: "add_employee",
    phase: "onboarding",
    triggerFields: ["status", "hireDate"],
  },
  {
    name: "promote_employee",
    phase: "working",
    triggerFields: ["level", "numberOfVacationDays", "isSalaryCompany"],
  },
  {
    name: "change_position",
    phase: "working",
    triggerFields: ["department", "branch", "level"],
  },
  {
    name: "offboard_employee",
    phase: "offboarding",
    triggerFields: ["terminationDate", "status"],
  },
];

export const EMPLOYEE_CHANGE_FIELDS = [
  "employeeCode",
  "firstName",
  "lastName",
  "firstNameEng",
  "lastNameEng",
  "email",
  "department",
  "branch",
  "level",
  "hireDate",
  "terminationDate",
  "status",
  "numberOfVacationDays",
  "isSalaryCompany",
  "isKpi",
  "birthDayAndMonth",
] as const;

export type EmployeeChangeField = (typeof EMPLOYEE_CHANGE_FIELDS)[number];
export type ValueRecord = Record<string, unknown> &
  Partial<Record<EmployeeChangeField, unknown>>;

export interface EmployeeChangeSet {
  changedFields: EmployeeChangeField[];
  oldValues: ValueRecord;
  newValues: ValueRecord;
}

export interface ResolveEmployeeActionInput {
  employeeId: string;
  changedFields: string[];
  oldValues: ValueRecord;
  newValues: ValueRecord;
}

export interface ResolveEmployeeActionOptions {
  actionConfigs: LifecycleActionConfig[];
}

const ACTION_PRIORITY: LifecycleAction[] = [
  "offboard_employee",
  "add_employee",
  "promote_employee",
  "change_position",
];

export function buildEmployeeChangeSet(
  previousValues: ValueRecord | null,
  nextValues: ValueRecord,
): EmployeeChangeSet {
  const changedFields: EmployeeChangeField[] = [];

  for (const field of EMPLOYEE_CHANGE_FIELDS) {
    const previousValue = previousValues?.[field] ?? null;
    const nextValue = nextValues[field] ?? null;

    if (!Object.is(previousValue, nextValue)) {
      changedFields.push(field);
    }
  }

  return {
    changedFields,
    oldValues: previousValues ?? {},
    newValues: nextValues,
  };
}

function normalizeFieldName(field: string) {
  return field.trim();
}

function normalizeChangedFields(changedFields: string[]) {
  return new Set(
    changedFields
      .filter((field): field is string => typeof field === "string")
      .map(normalizeFieldName)
      .filter(Boolean),
  );
}

function normalizeConfigMap(actionConfigs: LifecycleActionConfig[]) {
  return new Map(
    actionConfigs
      .filter((config): config is LifecycleActionConfig =>
        SUPPORTED_LIFECYCLE_ACTIONS.includes(config.name),
      )
      .map((config) => [
        config.name,
        {
          ...config,
          triggerFields: config.triggerFields.map(normalizeFieldName).filter(Boolean),
        },
      ]),
  );
}

function hasTriggerFieldOverlap(triggerFields: string[], changedFields: Set<string>) {
  return triggerFields.some((field) => changedFields.has(field));
}

function getValue(source: ValueRecord, field: string) {
  return source[field];
}

function getCurrentValue(input: ResolveEmployeeActionInput, field: string) {
  const nextValue = getValue(input.newValues, field);
  return nextValue === undefined ? getValue(input.oldValues, field) : nextValue;
}

function hasValue(value: unknown) {
  if (value === null || value === undefined) {
    return false;
  }

  if (typeof value === "string") {
    return value.trim().length > 0;
  }

  return true;
}

function normalizeStatus(value: unknown) {
  return typeof value === "string" ? value.trim().toUpperCase() : "";
}

function parseLevelValue(value: unknown) {
  if (typeof value !== "string") {
    return null;
  }

  const match = value.trim().toUpperCase().match(/^L(\d+)$/);
  if (!match) {
    return null;
  }

  return Number.parseInt(match[1], 10);
}

function hasChanged(changedFields: Set<string>, field: string) {
  return changedFields.has(field);
}

function resolvesOffboarding(input: ResolveEmployeeActionInput, changedFields: Set<string>) {
  if (
    hasChanged(changedFields, "terminationDate") &&
    !hasValue(getValue(input.oldValues, "terminationDate")) &&
    hasValue(getValue(input.newValues, "terminationDate"))
  ) {
    return true;
  }

  if (!hasChanged(changedFields, "status")) {
    return false;
  }

  const newStatus = normalizeStatus(getValue(input.newValues, "status"));
  return newStatus === "TERMINATED" || newStatus === "INACTIVE";
}

function resolvesAddEmployee(input: ResolveEmployeeActionInput, changedFields: Set<string>) {
  const oldStatus = normalizeStatus(getValue(input.oldValues, "status"));
  const newStatus = normalizeStatus(getCurrentValue(input, "status"));
  if (newStatus !== "ACTIVE") {
    return false;
  }

  const becameActive =
    hasChanged(changedFields, "status") && newStatus === "ACTIVE" && oldStatus !== "ACTIVE";
  const oldHireDate = getValue(input.oldValues, "hireDate");
  const newHireDate = getCurrentValue(input, "hireDate");
  const firstHireSignal =
    hasChanged(changedFields, "hireDate") &&
    !hasValue(oldHireDate) &&
    hasValue(newHireDate);

  return becameActive || firstHireSignal;
}

function resolvesPromotion(input: ResolveEmployeeActionInput, changedFields: Set<string>) {
  // level дээшилсэн бол promotion
  if (hasChanged(changedFields, "level")) {
    const oldLevel = parseLevelValue(getValue(input.oldValues, "level"));
    const newLevel = parseLevelValue(getValue(input.newValues, "level"));

    if (oldLevel !== null && newLevel !== null && newLevel > oldLevel) {
      return true;
    }
  }

  // numberOfVacationDays өөрчлөгдсөн бол promotion (benefit change)
  if (hasChanged(changedFields, "numberOfVacationDays")) {
    return true;
  }

  // isSalaryCompany өөрчлөгдсөн бол promotion
  if (hasChanged(changedFields, "isSalaryCompany")) {
    return true;
  }

  return false;
}

function resolvesPositionChange(
  input: ResolveEmployeeActionInput,
  changedFields: Set<string>,
) {
  if (hasChanged(changedFields, "department") || hasChanged(changedFields, "branch")) {
    return true;
  }

  if (!hasChanged(changedFields, "level")) {
    return false;
  }

  const oldLevel = parseLevelValue(getValue(input.oldValues, "level"));
  const newLevel = parseLevelValue(getValue(input.newValues, "level"));

  if (oldLevel === null || newLevel === null) {
    return true;
  }

  return newLevel <= oldLevel;
}

const ACTION_RULES: Record<
  LifecycleAction,
  (input: ResolveEmployeeActionInput, changedFields: Set<string>) => boolean
> = {
  add_employee: resolvesAddEmployee,
  promote_employee: resolvesPromotion,
  change_position: resolvesPositionChange,
  offboard_employee: resolvesOffboarding,
};

export function resolveEmployeeLifecycleAction(
  input: ResolveEmployeeActionInput,
  options: ResolveEmployeeActionOptions,
): LifecycleAction | null {
  const changedFields = normalizeChangedFields(input.changedFields);
  const actionConfigs = normalizeConfigMap(options.actionConfigs);

  for (const action of ACTION_PRIORITY) {
    const config = actionConfigs.get(action);
    if (!config) {
      continue;
    }

    if (!hasTriggerFieldOverlap(config.triggerFields, changedFields)) {
      continue;
    }

    if (ACTION_RULES[action](input, changedFields)) {
      return action;
    }
  }

  return null;
}
