import { expect, test } from "@jest/globals";

import { normalizeAuditLog } from "../../../src/db/queries/auditLog.js";

test("normalizeAuditLog parses JSON list fields into arrays", () => {
  const normalized = normalizeAuditLog({
    id: "audit-1",
    employeeId: "emp-1",
    action: "add_employee",
    phase: "onboarding",
    actorId: "user-1",
    actorRole: "hr",
    documentIds: '["doc-1","doc-2"]',
    recipientRoles: '["hr_team","department_chief"]',
    recipientEmails: '["hr@example.com","chief@example.com"]',
    incompleteFields: '["employee_email"]',
    documentsGenerated: true,
    notificationAttempted: true,
    recipientsNotified: true,
    notificationError: null,
    employeeSigned: false,
    employeeSignedAt: null,
    timestamp: "2026-03-11T10:00:00.000Z",
  });

  expect(normalized.documentIds).toEqual(["doc-1", "doc-2"]);
  expect(normalized.recipientRoles).toEqual(["hr_team", "department_chief"]);
  expect(normalized.recipientEmails).toEqual(["hr@example.com", "chief@example.com"]);
  expect(normalized.incompleteFields).toEqual(["employee_email"]);
});

test("normalizeAuditLog falls back to empty arrays for invalid JSON", () => {
  const normalized = normalizeAuditLog({
    id: "audit-1",
    employeeId: "emp-1",
    action: "add_employee",
    phase: "onboarding",
    actorId: null,
    actorRole: "unknown",
    documentIds: "not-json",
    recipientRoles: "",
    recipientEmails: "null",
    incompleteFields: "{}",
    documentsGenerated: true,
    notificationAttempted: false,
    recipientsNotified: false,
    notificationError: "No recipients resolved",
    employeeSigned: false,
    employeeSignedAt: null,
    timestamp: "2026-03-11T10:00:00.000Z",
  });

  expect(normalized.documentIds).toEqual([]);
  expect(normalized.recipientRoles).toEqual([]);
  expect(normalized.recipientEmails).toEqual([]);
  expect(normalized.incompleteFields).toEqual([]);
});
