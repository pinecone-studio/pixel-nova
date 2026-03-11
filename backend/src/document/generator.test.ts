import { expect, test } from "@jest/globals";

import { buildTemplateData, validateRequiredFields } from "./templateData.js";

import type { Employee } from "../db/schema.js";

const mockEmployee: Employee = {
  id: "emp-001",
  employeeCode: "EMP-0042",
  firstName: "Дорж",
  lastName: "Бат-Эрдэнэ",
  firstNameEng: "Dorj",
  lastNameEng: "Bat-Erdene",
  entraId: "entra-001",
  email: "dorj@company.mn",
  imageUrl: null,
  github: "dorj-dev",
  department: "Engineering",
  branch: "Улаанбаатар",
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

const generatedAt = "2024-02-24T10:00:00.000Z";

test("maps employee firstName correctly", () => {
  const data = buildTemplateData(mockEmployee, generatedAt);
  expect(data.employee_first_name).toBe("Дорж");
});

test("maps employee lastName correctly", () => {
  const data = buildTemplateData(mockEmployee, generatedAt);
  expect(data.employee_last_name).toBe("Бат-Эрдэнэ");
});

test("maps employee full name as lastName + firstName", () => {
  const data = buildTemplateData(mockEmployee, generatedAt);
  expect(data.employee_full_name).toBe("Бат-Эрдэнэ Дорж");
  expect(data.employee_name).toBe("Бат-Эрдэнэ Дорж");
});

test("maps employee code correctly", () => {
  const data = buildTemplateData(mockEmployee, generatedAt);
  expect(data.employee_code).toBe("EMP-0042");
});

test("maps department and department_name", () => {
  const data = buildTemplateData(mockEmployee, generatedAt);
  expect(data.department).toBe("Engineering");
  expect(data.department_name).toBe("Engineering");
  expect(data.current_department).toBe("Engineering");
});

test("maps branch correctly", () => {
  const data = buildTemplateData(mockEmployee, generatedAt);
  expect(data.branch).toBe("Улаанбаатар");
});

test("maps level to position fields", () => {
  const data = buildTemplateData(mockEmployee, generatedAt);
  expect(data.level).toBe("Senior Developer");
  expect(data.position_name).toBe("Senior Developer");
  expect(data.employee_position).toBe("Senior Developer");
});

test("maps contract date parts from generatedAt", () => {
  const data = buildTemplateData(mockEmployee, generatedAt);
  expect(data.contract_date_year_short).toBe("24");
  expect(data.contract_date_month).toBe("02");
  expect(data.contract_date_day).toBe("24");
});

test("maps hire date parts correctly", () => {
  const data = buildTemplateData(mockEmployee, generatedAt);
  expect(data.hire_date).toBe("2024-02-24");
  expect(data.hire_date_year_short).toBe("24");
  expect(data.hire_date_month).toBe("02");
  expect(data.hire_date_day).toBe("24");
  expect(data.contract_start_date).toBe("2024-02-24");
});

test("maps boolean isKpi=true to Тийм", () => {
  const data = buildTemplateData(mockEmployee, generatedAt);
  expect(data.is_kpi).toBe("Тийм");
});

test("maps boolean isSalaryCompany=true to Тийм", () => {
  const data = buildTemplateData(mockEmployee, generatedAt);
  expect(data.is_salary_company).toBe("Тийм");
});

test("maps boolean false values to Үгүй", () => {
  const emp = { ...mockEmployee, isKpi: false, isSalaryCompany: false };
  const data = buildTemplateData(emp, generatedAt);
  expect(data.is_kpi).toBe("Үгүй");
  expect(data.is_salary_company).toBe("Үгүй");
});

test("handles null terminationDate gracefully", () => {
  const data = buildTemplateData(mockEmployee, generatedAt);
  expect(data.termination_date).toBe("");
  expect(data.termination_date_year_short).toBe("");
  expect(data.termination_date_month).toBe("");
  expect(data.termination_date_day).toBe("");
});

test("maps terminationDate when present", () => {
  const emp = { ...mockEmployee, terminationDate: "2025-01-10" };
  const data = buildTemplateData(emp, generatedAt);
  expect(data.termination_date).toBe("2025-01-10");
  expect(data.termination_date_year_short).toBe("25");
  expect(data.termination_date_month).toBe("01");
  expect(data.termination_date_day).toBe("10");
});

test("maps numberOfVacationDays to string", () => {
  const data = buildTemplateData(mockEmployee, generatedAt);
  expect(data.number_of_vacation_days).toBe("15");
});

test("handles null numberOfVacationDays", () => {
  const emp = { ...mockEmployee, numberOfVacationDays: null };
  const data = buildTemplateData(emp, generatedAt);
  expect(data.number_of_vacation_days).toBe("");
});

test("maps email correctly", () => {
  const data = buildTemplateData(mockEmployee, generatedAt);
  expect(data.employee_email).toBe("dorj@company.mn");
});

test("maps birthDayAndMonth correctly", () => {
  const data = buildTemplateData(mockEmployee, generatedAt);
  expect(data.birth_day_and_month).toBe("03-15");
});

test("maps order date parts same as generatedAt", () => {
  const data = buildTemplateData(mockEmployee, generatedAt);
  expect(data.order_date_year_short).toBe("24");
  expect(data.order_date_month).toBe("02");
  expect(data.order_date_day).toBe("24");
});

test("maps handover employee fields", () => {
  const data = buildTemplateData(mockEmployee, generatedAt);
  expect(data.handover_employee_name).toBe("Бат-Эрдэнэ Дорж");
  expect(data.handover_employee_department).toBe("Engineering");
  expect(data.handover_employee_position).toBe("Senior Developer");
});

test("sets default work schedule values", () => {
  const data = buildTemplateData(mockEmployee, generatedAt);
  expect(data.daily_work_hours).toBe("8");
  expect(data.weekly_work_hours).toBe("40");
  expect(data.workday_from).toBe("Даваа");
  expect(data.workday_to).toBe("Баасан");
});

test("maps position change fields to current employee data", () => {
  const data = buildTemplateData(mockEmployee, generatedAt);
  expect(data.to_department).toBe("Engineering");
  expect(data.to_position).toBe("Senior Developer");
  expect(data.new_department).toBe("Engineering");
  expect(data.new_position).toBe("Senior Developer");
});

test("maps English first and last name", () => {
  const data = buildTemplateData(mockEmployee, generatedAt);
  expect(data.employee_first_name_eng).toBe("Dorj");
  expect(data.employee_last_name_eng).toBe("Bat-Erdene");
});

test("maps English full name as lastNameEng + firstNameEng", () => {
  const data = buildTemplateData(mockEmployee, generatedAt);
  expect(data.employee_full_name_eng).toBe("Bat-Erdene Dorj");
});

test("handles null English name fields", () => {
  const emp = { ...mockEmployee, firstNameEng: null, lastNameEng: null };
  const data = buildTemplateData(emp, generatedAt);
  expect(data.employee_first_name_eng).toBe("");
  expect(data.employee_last_name_eng).toBe("");
  expect(data.employee_full_name_eng).toBe("");
});

test("validateRequiredFields returns empty list when all required fields are filled", () => {
  const data = buildTemplateData(mockEmployee, generatedAt);
  const result = validateRequiredFields(data, [
    "employee_first_name",
    "employee_last_name",
    "department",
    "level",
  ]);
  expect(result.incompleteFields).toEqual([]);
  expect(result.data.employee_first_name).toBe("Дорж");
});

test("validateRequiredFields marks empty required fields with [БҮРЭН БУС]", () => {
  const emp = { ...mockEmployee, email: null, terminationDate: null };
  const data = buildTemplateData(emp, generatedAt);
  const result = validateRequiredFields(data, [
    "employee_email",
    "termination_date",
    "employee_first_name",
  ]);
  expect(result.incompleteFields).toEqual(["employee_email", "termination_date"]);
  expect(result.data.employee_email).toBe("[БҮРЭН БУС]");
  expect(result.data.termination_date).toBe("[БҮРЭН БУС]");
  expect(result.data.employee_first_name).toBe("Дорж");
});

test("validateRequiredFields does not modify non-required empty fields", () => {
  const emp = { ...mockEmployee, email: null };
  const data = buildTemplateData(emp, generatedAt);
  const result = validateRequiredFields(data, ["employee_first_name"]);
  expect(result.data.employee_email).toBe("");
  expect(result.incompleteFields).toEqual([]);
});
