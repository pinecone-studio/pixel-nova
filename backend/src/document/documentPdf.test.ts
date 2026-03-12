import { expect, test } from "@jest/globals";

import { generateEmployeeDocument } from "./generator.js";

import type { Employee } from "../db/schema.js";

const mockEmployee: Employee = {
  id: "emp-001",
  employeeCode: "EMP-0042",
  firstName: "Dorj",
  lastName: "Bat-Erdene",
  firstNameEng: "Dorj",
  lastNameEng: "Bat-Erdene",
  entraId: "entra-001",
  email: "dorj@company.mn",
  imageUrl: null,
  github: "dorj-dev",
  department: "Engineering",
  branch: "Ulaanbaatar",
  jobTitle: "Software Engineer",
  level: "Senior Developer",
  hireDate: "2024-02-24",
  terminationDate: null,
  status: "ACTIVE",
  numberOfVacationDays: 15,
  isSalaryCompany: true,
  isKpi: true,
  birthDayAndMonth: "03-15",
  birthdayPoster: null,
};

test("generateEmployeeDocument returns rendered html for a known template", () => {
  const generated = generateEmployeeDocument({
    employee: mockEmployee,
    action: "add_employee",
    generatedAt: "2024-02-24T10:00:00.000Z",
    documentId: "doc-123",
    templateFile: "nda.html",
  });

  expect(generated.documentName.endsWith(".pdf")).toBe(true);
  expect(generated.html.includes("EPAS Document Metadata")).toBe(true);
  expect(generated.html.includes("EMP-0042")).toBe(true);
});

test("generateEmployeeDocument returns html fallback when template is missing", () => {
  const generated = generateEmployeeDocument({
    employee: mockEmployee,
    action: "custom_action",
    generatedAt: "2024-02-24T10:00:00.000Z",
    documentId: "doc-456",
  });

  expect(generated.documentName.endsWith(".pdf")).toBe(true);
  expect(generated.html.includes("<!doctype html>")).toBe(true);
  expect(generated.html.includes("custom_action")).toBe(true);
});
