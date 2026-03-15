import { expect, test } from "@jest/globals";

import { buildEmployeeDocumentObjectKey } from "../../src/storage/r2.js";

test("builds TDD-compliant path: employeeCode_name/phase/date_action/order_template", () => {
  const key = buildEmployeeDocumentObjectKey({
    employeeCode: "EMP-0042",
    lastName: "Bat-Erdene",
    firstName: "Dorj",
    phase: "onboarding",
    action: "add_employee",
    order: "01",
    templateId: "employment_contract",
    createdAt: "2024-02-24T10:00:00.000Z",
  });

  expect(key).toBe(
    "documents/EMP-0042_Bat-ErdeneDorj/onboarding/2024-02-24_add_employee/01_employment_contract.pdf",
  );
});

test("builds correct path for offboarding action", () => {
  const key = buildEmployeeDocumentObjectKey({
    employeeCode: "EMP-0099",
    lastName: "Bold",
    firstName: "Tsolmon",
    phase: "offboarding",
    action: "offboard_employee",
    order: "02",
    templateId: "handover_sheet",
    createdAt: "2025-01-10T08:30:00.000Z",
  });

  expect(key).toBe(
    "documents/EMP-0099_BoldTsolmon/offboarding/2025-01-10_offboard_employee/02_handover_sheet.pdf",
  );
});

test("builds correct path for working phase promotion", () => {
  const key = buildEmployeeDocumentObjectKey({
    employeeCode: "EMP-0042",
    lastName: "Bat-Erdene",
    firstName: "Dorj",
    phase: "working",
    action: "promote_employee",
    order: "01",
    templateId: "salary_increase_order",
    createdAt: "2024-06-15T14:00:00.000Z",
  });

  expect(key).toBe(
    "documents/EMP-0042_Bat-ErdeneDorj/working/2024-06-15_promote_employee/01_salary_increase_order.pdf",
  );
});

test("sanitizes special characters in employee name", () => {
  const key = buildEmployeeDocumentObjectKey({
    employeeCode: "EMP 001",
    lastName: "O'Brien",
    firstName: "Мөнх Жаргал",
    phase: "onboarding",
    action: "add_employee",
    order: "01",
    templateId: "nda",
    createdAt: "2024-01-01T00:00:00.000Z",
  });

  expect(key.startsWith("documents/EMP-001_")).toBe(true);
  expect(key.includes("/onboarding/")).toBe(true);
  expect(key.includes("/2024-01-01_add_employee/")).toBe(true);
  expect(key.endsWith("/01_nda.pdf")).toBe(true);
});

test("different timestamps create non-overlapping paths (non-destructive)", () => {
  const base = {
    employeeCode: "EMP-0042",
    lastName: "Bat-Erdene",
    firstName: "Dorj",
    phase: "onboarding",
    action: "add_employee",
    order: "01",
    templateId: "employment_contract",
  };

  const key1 = buildEmployeeDocumentObjectKey({ ...base, createdAt: "2024-02-24T10:00:00.000Z" });
  const key2 = buildEmployeeDocumentObjectKey({ ...base, createdAt: "2024-03-01T10:00:00.000Z" });

  expect(key1).not.toBe(key2);
  expect(key1.includes("2024-02-24")).toBe(true);
  expect(key2.includes("2024-03-01")).toBe(true);
});
