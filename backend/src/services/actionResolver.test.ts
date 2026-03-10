import test from "node:test";
import assert from "node:assert/strict";

import {
  DEFAULT_LIFECYCLE_ACTION_CONFIGS,
  resolveEmployeeLifecycleAction,
  type ResolveEmployeeActionInput,
} from "./actionResolver.js";

function resolve(input: Partial<ResolveEmployeeActionInput>) {
  return resolveEmployeeLifecycleAction(
    {
      employeeId: "emp_123",
      changedFields: [],
      oldValues: {},
      newValues: {},
      ...input,
    },
    {
      actionConfigs: DEFAULT_LIFECYCLE_ACTION_CONFIGS,
    },
  );
}

test("resolves add_employee when status becomes ACTIVE for a new hire", () => {
  const action = resolve({
    changedFields: ["status"],
    oldValues: { status: "PENDING" },
    newValues: { status: "ACTIVE" },
  });

  assert.equal(action, "add_employee");
});

test("resolves add_employee when hireDate is first set alongside ACTIVE status", () => {
  const action = resolve({
    changedFields: ["status", "hireDate"],
    oldValues: { status: "PENDING", hireDate: null },
    newValues: { status: "ACTIVE", hireDate: "2026-03-10" },
  });

  assert.equal(action, "add_employee");
});

test("resolves offboard_employee when terminationDate is newly set", () => {
  const action = resolve({
    changedFields: ["terminationDate"],
    oldValues: { terminationDate: null },
    newValues: { terminationDate: "2026-03-10" },
  });

  assert.equal(action, "offboard_employee");
});

test("resolves offboard_employee when status becomes TERMINATED", () => {
  const action = resolve({
    changedFields: ["status"],
    oldValues: { status: "ACTIVE" },
    newValues: { status: "TERMINATED" },
  });

  assert.equal(action, "offboard_employee");
});

test("resolves promote_employee when level increases", () => {
  const action = resolve({
    changedFields: ["level"],
    oldValues: { level: "L1" },
    newValues: { level: "L2" },
  });

  assert.equal(action, "promote_employee");
});

test("resolves promote_employee when numberOfVacationDays changes", () => {
  const action = resolve({
    changedFields: ["numberOfVacationDays"],
    oldValues: { numberOfVacationDays: 15 },
    newValues: { numberOfVacationDays: 20 },
  });

  assert.equal(action, "promote_employee");
});

test("resolves promote_employee when isSalaryCompany changes", () => {
  const action = resolve({
    changedFields: ["isSalaryCompany"],
    oldValues: { isSalaryCompany: false },
    newValues: { isSalaryCompany: true },
  });

  assert.equal(action, "promote_employee");
});

test("resolves change_position when department changes", () => {
  const action = resolve({
    changedFields: ["department"],
    oldValues: { department: "Engineering" },
    newValues: { department: "Finance" },
  });

  assert.equal(action, "change_position");
});

test("resolves change_position when branch changes", () => {
  const action = resolve({
    changedFields: ["branch"],
    oldValues: { branch: "HQ" },
    newValues: { branch: "West" },
  });

  assert.equal(action, "change_position");
});

test("resolves change_position when level decreases", () => {
  const action = resolve({
    changedFields: ["level"],
    oldValues: { level: "L3" },
    newValues: { level: "L2" },
  });

  assert.equal(action, "change_position");
});

test("resolves change_position when level changes laterally", () => {
  const action = resolve({
    changedFields: ["level"],
    oldValues: { level: "L3" },
    newValues: { level: "L3" },
  });

  assert.equal(action, "change_position");
});

test("returns null when no supported lifecycle rule matches", () => {
  const action = resolve({
    changedFields: ["firstName"],
    oldValues: { firstName: "Jane" },
    newValues: { firstName: "Janet" },
  });

  assert.equal(action, null);
});

test("offboarding wins priority when termination and promotion signals overlap", () => {
  const action = resolve({
    changedFields: ["terminationDate", "level"],
    oldValues: { terminationDate: null, level: "L1" },
    newValues: { terminationDate: "2026-03-10", level: "L2" },
  });

  assert.equal(action, "offboard_employee");
});

test("returns null when the matching action is missing from the registry config", () => {
  const action = resolveEmployeeLifecycleAction(
    {
      employeeId: "emp_123",
      changedFields: ["terminationDate"],
      oldValues: { terminationDate: null },
      newValues: { terminationDate: "2026-03-10" },
    },
    {
      actionConfigs: DEFAULT_LIFECYCLE_ACTION_CONFIGS.filter(
        (config) => config.name !== "offboard_employee",
      ),
    },
  );

  assert.equal(action, null);
});

test("returns null when registry trigger fields do not overlap the change event", () => {
  const action = resolveEmployeeLifecycleAction(
    {
      employeeId: "emp_123",
      changedFields: ["terminationDate"],
      oldValues: { terminationDate: null },
      newValues: { terminationDate: "2026-03-10" },
    },
    {
      actionConfigs: DEFAULT_LIFECYCLE_ACTION_CONFIGS.map((config) =>
        config.name === "offboard_employee"
          ? { ...config, triggerFields: ["status"] }
          : config,
      ),
    },
  );

  assert.equal(action, null);
});
