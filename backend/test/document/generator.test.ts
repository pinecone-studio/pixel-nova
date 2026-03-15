import { expect, test } from "@jest/globals";

import {
  buildTemplateData,
  validateRequiredFields,
} from "../../src/document/templateData.js";

import type { Employee } from "../../src/db/schema.js";

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
  jobTitle: "Программ хангамжийн инженер",
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

test("maps employee identity fields", () => {
  const data = buildTemplateData(mockEmployee, generatedAt);

  expect(data.employee_first_name).toBe("Дорж");
  expect(data.employee_last_name).toBe("Бат-Эрдэнэ");
  expect(data.employee_full_name).toBe("Бат-Эрдэнэ Дорж");
  expect(data.employee_code).toBe("EMP-0042");
});

test("maps job title and level separately", () => {
  const data = buildTemplateData(mockEmployee, generatedAt);

  expect(data.level).toBe("Senior Developer");
  expect(data.position_name).toBe("Программ хангамжийн инженер");
  expect(data.position_title).toBe("Программ хангамжийн инженер");
  expect(data.employee_position).toBe("Программ хангамжийн инженер");
  expect(data.job_grade_level).toBe("Senior Developer");
});

test("maps handover and position-change fields from job title", () => {
  const data = buildTemplateData(mockEmployee, generatedAt);

  expect(data.handover_employee_position).toBe("Программ хангамжийн инженер");
  expect(data.to_position).toBe("Программ хангамжийн инженер");
  expect(data.new_position).toBe("Программ хангамжийн инженер");
  expect(data.current_position).toBe("Программ хангамжийн инженер");
});

test("maps date and boolean fields", () => {
  const data = buildTemplateData(mockEmployee, generatedAt);

  expect(data.hire_date).toBe("2024-02-24");
  expect(data.contract_date_year_short).toBe("24");
  expect(data.is_kpi).toBe("Тийм");
  expect(data.is_salary_company).toBe("Тийм");
});

test("validateRequiredFields marks empty required values", () => {
  const data = buildTemplateData({ ...mockEmployee, email: null }, generatedAt);
  const result = validateRequiredFields(data, ["employee_email", "employee_first_name"]);

  expect(result.incompleteFields).toEqual(["employee_email"]);
  expect(result.data.employee_email).toBe("[БҮРЭН БУС]");
  expect(result.data.employee_first_name).toBe("Дорж");
});
