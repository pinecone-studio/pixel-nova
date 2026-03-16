import type { Employee } from "../db/schema";

const INCOMPLETE_MARKER = "[БҮРЭН БУС]";

/**
 * Required template field-уудыг шалгаж, хоосон талбарт marker тавина.
 * Хоосон ("") утгатай required field-ийг INCOMPLETE_MARKER-р солиод
 * incompleteFields list-д нэмнэ.
 */
export function validateRequiredFields(
  data: Record<string, string>,
  requiredKeys: string[],
): { data: Record<string, string>; incompleteFields: string[] } {
  const incompleteFields: string[] = [];
  const patched = { ...data };

  for (const key of requiredKeys) {
    if (key in patched && patched[key] === "") {
      patched[key] = INCOMPLETE_MARKER;
      incompleteFields.push(key);
    }
  }

  return { data: patched, incompleteFields };
}

/**
 * Employee объектоос template placeholder data үүсгэнэ.
 * Template дотор {{employee_first_name}}, {{department}} гэх мэт token-ууд
 * employee data-аар солигдоно.
 */
export function buildTemplateData(
  employee: Employee,
  generatedAt: string,
): Record<string, string> {
  let documentProfile: Record<string, string> = {};

  try {
    const parsed = JSON.parse(employee.documentProfile ?? "{}");
    if (parsed && typeof parsed === "object") {
      documentProfile = Object.fromEntries(
        Object.entries(parsed).map(([key, value]) => [key, value == null ? "" : String(value)]),
      );
    }
  } catch {
    documentProfile = {};
  }

  const date = new Date(generatedAt);
  const hireDate = employee.hireDate ? new Date(employee.hireDate) : null;
  const termDate = employee.terminationDate ? new Date(employee.terminationDate) : null;
  const jobTitle = employee.jobTitle ?? employee.level ?? "";

  return {
    // Employee fields
    employee_first_name: employee.firstName ?? "",
    employee_last_name: employee.lastName ?? "",
    employee_full_name: `${employee.lastName ?? ""} ${employee.firstName ?? ""}`.trim(),
    employee_name: `${employee.lastName ?? ""} ${employee.firstName ?? ""}`.trim(),
    employee_first_name_eng: employee.firstNameEng ?? "",
    employee_last_name_eng: employee.lastNameEng ?? "",
    employee_full_name_eng: `${employee.lastNameEng ?? ""} ${employee.firstNameEng ?? ""}`.trim(),
    employee_code: employee.employeeCode ?? "",
    employee_email: employee.email ?? "",
    employee_register_no: "",
    employee_address: "",
    employee_legal_address: "",
    employee_legal_phone: "",
    employee_legal_fax: "",
    employee_phone: "",
    employee_position: jobTitle,
    employee_position_clause: jobTitle,
    employee_position_signature: jobTitle,
    employee_department: employee.department ?? "",
    employee_first_name_clause: employee.firstName ?? "",
    employee_last_name_clause: employee.lastName ?? "",
    employee_first_name_signature: employee.firstName ?? "",
    employee_last_name_signature: employee.lastName ?? "",
    employee_first_name_ack: employee.firstName ?? "",
    employee_last_name_ack: employee.lastName ?? "",

    // Department / Branch / Level
    department: employee.department ?? "",
    department_name: employee.department ?? "",
    current_department: employee.department ?? "",
    branch: employee.branch ?? "",
    level: employee.level ?? "",
    position_name: jobTitle,
    position_title: jobTitle,
    job_grade_level: employee.level ?? "",

    // Dates — contract
    contract_date_year_short: String(date.getFullYear()).slice(2),
    contract_date_month: String(date.getMonth() + 1).padStart(2, "0"),
    contract_date_day: String(date.getDate()).padStart(2, "0"),
    contract_number: employee.employeeCode ?? "",
    contract_start_date: employee.hireDate ?? "",
    contract_term: "",

    // Dates — hire
    hire_date: employee.hireDate ?? "",
    hire_date_year_short: hireDate ? String(hireDate.getFullYear()).slice(2) : "",
    hire_date_month: hireDate ? String(hireDate.getMonth() + 1).padStart(2, "0") : "",
    hire_date_day: hireDate ? String(hireDate.getDate()).padStart(2, "0") : "",

    // Dates — termination
    termination_date: employee.terminationDate ?? "",
    termination_date_year_short: termDate ? String(termDate.getFullYear()).slice(2) : "",
    termination_date_month: termDate ? String(termDate.getMonth() + 1).padStart(2, "0") : "",
    termination_date_day: termDate ? String(termDate.getDate()).padStart(2, "0") : "",
    termination_effective_year_short: termDate ? String(termDate.getFullYear()).slice(2) : "",
    termination_effective_month: termDate ? String(termDate.getMonth() + 1).padStart(2, "0") : "",
    termination_effective_day: termDate ? String(termDate.getDate()).padStart(2, "0") : "",

    // Dates — order / approval / effective / NDA / transfer / handover
    order_date_year_short: String(date.getFullYear()).slice(2),
    order_date_month: String(date.getMonth() + 1).padStart(2, "0"),
    order_date_day: String(date.getDate()).padStart(2, "0"),
    order_number: employee.employeeCode ?? "",
    approval_date_year_short: String(date.getFullYear()).slice(2),
    approval_date_month: String(date.getMonth() + 1).padStart(2, "0"),
    approval_date_day: String(date.getDate()).padStart(2, "0"),
    approved_date_year_short: String(date.getFullYear()).slice(2),
    approved_date_month: String(date.getMonth() + 1).padStart(2, "0"),
    approved_date_day: String(date.getDate()).padStart(2, "0"),
    effective_date_year_short: String(date.getFullYear()).slice(2),
    effective_date_month: String(date.getMonth() + 1).padStart(2, "0"),
    effective_date_day: String(date.getDate()).padStart(2, "0"),
    effective_date_year_short_clause: String(date.getFullYear()).slice(2),
    effective_date_month_clause: String(date.getMonth() + 1).padStart(2, "0"),
    effective_date_day_clause: String(date.getDate()).padStart(2, "0"),
    nda_date_year_short: String(date.getFullYear()).slice(2),
    nda_date_month: String(date.getMonth() + 1).padStart(2, "0"),
    nda_date_day: String(date.getDate()).padStart(2, "0"),
    nda_number: employee.employeeCode ?? "",
    transfer_date_year_short: String(date.getFullYear()).slice(2),
    transfer_date_month: String(date.getMonth() + 1).padStart(2, "0"),
    transfer_date_day: String(date.getDate()).padStart(2, "0"),
    ack_date_year_short: String(date.getFullYear()).slice(2),
    ack_date_month: String(date.getMonth() + 1).padStart(2, "0"),
    ack_date_day: String(date.getDate()).padStart(2, "0"),
    handover_date_year_short: String(date.getFullYear()).slice(2),
    handover_date_month: String(date.getMonth() + 1).padStart(2, "0"),
    handover_date_day: String(date.getDate()).padStart(2, "0"),
    handover_termination_year_short: termDate ? String(termDate.getFullYear()).slice(2) : "",
    handover_termination_month: termDate ? String(termDate.getMonth() + 1).padStart(2, "0") : "",
    handover_termination_day: termDate ? String(termDate.getDate()).padStart(2, "0") : "",

    // Employee benefits
    number_of_vacation_days: employee.numberOfVacationDays != null ? String(employee.numberOfVacationDays) : "",
    is_kpi: employee.isKpi ? "Тийм" : "Үгүй",
    is_salary_company: employee.isSalaryCompany ? "Тийм" : "Үгүй",
    birth_day_and_month: employee.birthDayAndMonth ?? "",
    probation_months: "3",

    // Handover sheet employee info
    handover_employee_name: `${employee.lastName ?? ""} ${employee.firstName ?? ""}`.trim(),
    handover_employee_department: employee.department ?? "",
    handover_employee_position: jobTitle,

    // Salary (placeholder defaults)
    monthly_base_salary_amount: "",
    monthly_base_salary_words: "",
    salary_amount: "",
    salary_amount_words: "",
    base_salary_prev: "",
    base_salary_prev_clause: "",
    base_salary_new: "",
    base_salary_new_clause: "",
    increase_amount: "",
    increase_percent: "",

    // Company info (defaults — can be overridden by config)
    company_name: "",
    company_name_full: "",
    company_name_in_title: "",
    company_name_purpose: "",
    company_name_for_signature: "",
    company_name_signature: "",
    company_name_handover: "",
    company_address: "",
    company_register_no: "",
    company_legal_address: "",
    company_legal_phone: "",
    company_legal_fax: "",
    company_phone: "",
    employer_representative: "",
    employer_first_name: "",
    employer_last_name: "",
    ceo_name: "",

    // Work conditions (defaults)
    workplace_location: "",
    work_conditions: "",
    work_schedule_type: "",
    workday_from: "Даваа",
    workday_to: "Баасан",
    workdays_count: "5",
    workdays: "5",
    daily_work_hours: "8",
    weekly_work_hours: "40",
    work_start_time: "09:00",
    work_end_time: "18:00",
    break_start_time: "13:00",
    break_end_time: "14:00",
    weekly_plan_cycle_days: "7",
    special_work_conditions: "",
    travel_requirement_details: "",

    // Position change fields
    from_department: "",
    from_position: "",
    to_department: employee.department ?? "",
    to_position: jobTitle,
    new_department: employee.department ?? "",
    new_position: jobTitle,
    current_position: jobTitle,
    ...documentProfile,
  };
}
