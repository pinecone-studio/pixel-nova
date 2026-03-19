import type { ActionConfig } from "@/lib/types";

// ---------------------------------------------------------------------------
// Template token categories
// ---------------------------------------------------------------------------

export interface TemplateToken {
  key: string;
  label: string;          // Mongolian label
  source: "employee" | "documentProfile" | "computed";
  example: string;
}

export interface TemplateInfo {
  id: string;
  label: string;          // Mongolian label
  filename: string;       // e.g. "employment_contract.html"
  phase: "onboarding" | "working" | "offboarding";
  tokens: TemplateToken[];
  requiredFields: string[];
}

// ---------------------------------------------------------------------------
// All available tokens
// ---------------------------------------------------------------------------

export const ALL_TOKENS: TemplateToken[] = [
  // Employee core
  { key: "employee_first_name", label: "Овог", source: "employee", example: "Батхүү" },
  { key: "employee_last_name", label: "Нэр", source: "employee", example: "Сүхбаатар" },
  { key: "employee_full_name", label: "Бүтэн нэр", source: "computed", example: "Сүхбаатар Батхүү" },
  { key: "employee_code", label: "Ажилтны код", source: "employee", example: "EMP-0042" },
  { key: "employee_email", label: "И-мэйл", source: "employee", example: "bat@company.mn" },
  { key: "employee_register_no", label: "Регистрийн дугаар", source: "documentProfile", example: "УБ12345678" },
  { key: "employee_position", label: "Албан тушаал", source: "employee", example: "Програм хангамжийн инженер" },
  { key: "department", label: "Хэлтэс", source: "employee", example: "Технологийн хэлтэс" },
  { key: "branch", label: "Салбар", source: "employee", example: "Улаанбаатар" },
  { key: "level", label: "Түвшин", source: "employee", example: "L3" },
  { key: "employee_address", label: "Ажилтны хаяг", source: "documentProfile", example: "СБД 3-р хороо" },

  // Company
  { key: "company_name", label: "Компанийн нэр", source: "documentProfile", example: "Пиксел Студио ХХК" },
  { key: "company_address", label: "Компанийн хаяг", source: "documentProfile", example: "БЗД 1-р хороо" },
  { key: "company_register_no", label: "Компанийн регистр", source: "documentProfile", example: "1234567" },
  { key: "employer_representative", label: "Ажил олгогчийн төлөөлөл", source: "documentProfile", example: "Б.Ганбат" },
  { key: "ceo_name", label: "Захирлын нэр", source: "documentProfile", example: "Ганбат" },

  // Dates
  { key: "contract_date", label: "Гэрээний огноо", source: "computed", example: "2024-02-24" },
  { key: "hire_date", label: "Ажилд орсон огноо", source: "employee", example: "2024-01-15" },
  { key: "termination_date", label: "Чөлөөлөх огноо", source: "employee", example: "2024-12-31" },

  // Salary
  { key: "monthly_base_salary_amount", label: "Сарын цалин (тоо)", source: "documentProfile", example: "5,000,000" },
  { key: "monthly_base_salary_words", label: "Сарын цалин (үсгээр)", source: "documentProfile", example: "Таван сая" },
  { key: "base_salary_prev", label: "Өмнөх цалин", source: "computed", example: "4,000,000" },
  { key: "base_salary_new", label: "Шинэ цалин", source: "computed", example: "5,000,000" },
  { key: "increase_amount", label: "Нэмэгдэл дүн", source: "computed", example: "1,000,000" },
  { key: "increase_percent", label: "Нэмэгдэл хувь", source: "computed", example: "25%" },

  // Work conditions
  { key: "workplace_location", label: "Ажлын байршил", source: "documentProfile", example: "Улаанбаатар оффис" },
  { key: "work_conditions", label: "Хөдөлмөрийн нөхцөл", source: "documentProfile", example: "Хэвийн" },
  { key: "work_schedule_type", label: "Ажлын цагийн горим", source: "documentProfile", example: "Бүтэн цагаар" },
  { key: "workday_from", label: "Ажлын өдөр (эхлэх)", source: "documentProfile", example: "Даваа" },
  { key: "workday_to", label: "Ажлын өдөр (дуусах)", source: "documentProfile", example: "Баасан" },
  { key: "daily_work_hours", label: "Өдрийн цаг", source: "documentProfile", example: "8" },
  { key: "weekly_work_hours", label: "Долоо хоногийн цаг", source: "documentProfile", example: "40" },
  { key: "salary_pay_day_1", label: "Цалин олгох 1-р өдөр", source: "documentProfile", example: "10" },
  { key: "salary_pay_day_2", label: "Цалин олгох 2-р өдөр", source: "documentProfile", example: "25" },

  // Position change
  { key: "from_position", label: "Өмнөх албан тушаал", source: "computed", example: "Junior Engineer" },
  { key: "to_position", label: "Шинэ албан тушаал", source: "computed", example: "Senior Engineer" },
  { key: "from_department", label: "Өмнөх хэлтэс", source: "computed", example: "Dev" },
  { key: "to_department", label: "Шинэ хэлтэс", source: "computed", example: "Platform" },
];

// ---------------------------------------------------------------------------
// Template definitions
// ---------------------------------------------------------------------------

export const TEMPLATE_REGISTRY: TemplateInfo[] = [
  {
    id: "employment_contract",
    label: "Хөдөлмөрийн гэрээ",
    filename: "employment_contract.html",
    phase: "onboarding",
    tokens: ALL_TOKENS.filter(t =>
      ["employee_first_name", "employee_last_name", "employee_full_name", "employee_code",
       "employee_email", "employee_register_no", "employee_position", "department", "branch",
       "company_name", "company_address", "company_register_no", "employer_representative",
       "contract_date", "hire_date", "monthly_base_salary_amount", "monthly_base_salary_words",
       "workplace_location", "work_conditions", "work_schedule_type", "workday_from", "workday_to",
       "daily_work_hours", "weekly_work_hours", "salary_pay_day_1", "salary_pay_day_2",
       "employee_address"].includes(t.key),
    ),
    requiredFields: ["employee_register_no", "company_name", "monthly_base_salary_amount"],
  },
  {
    id: "probation_order",
    label: "Туршилтаар авах тушаал",
    filename: "probation_order.html",
    phase: "onboarding",
    tokens: ALL_TOKENS.filter(t =>
      ["employee_full_name", "employee_code", "employee_position", "department",
       "hire_date", "company_name", "ceo_name", "contract_date"].includes(t.key),
    ),
    requiredFields: ["company_name", "ceo_name"],
  },
  {
    id: "job_description",
    label: "Албан тушаалын тодорхойлолт",
    filename: "job_description.html",
    phase: "onboarding",
    tokens: ALL_TOKENS.filter(t =>
      ["employee_full_name", "employee_position", "department", "branch", "level",
       "company_name", "contract_date"].includes(t.key),
    ),
    requiredFields: ["company_name"],
  },
  {
    id: "nda",
    label: "Нууцын гэрээ",
    filename: "nda.html",
    phase: "onboarding",
    tokens: ALL_TOKENS.filter(t =>
      ["employee_full_name", "employee_code", "employee_register_no",
       "company_name", "company_address", "employer_representative", "contract_date"].includes(t.key),
    ),
    requiredFields: ["employee_register_no", "company_name"],
  },
  {
    id: "salary_increase_order",
    label: "Цалин нэмэх тушаал",
    filename: "salary_increase_order.html",
    phase: "working",
    tokens: ALL_TOKENS.filter(t =>
      ["employee_full_name", "employee_code", "employee_position", "department",
       "base_salary_prev", "base_salary_new", "increase_amount", "increase_percent",
       "company_name", "ceo_name", "contract_date"].includes(t.key),
    ),
    requiredFields: ["company_name", "ceo_name"],
  },
  {
    id: "position_update_order",
    label: "Албан тушаал өөрчлөх тушаал",
    filename: "position_update_order.html",
    phase: "working",
    tokens: ALL_TOKENS.filter(t =>
      ["employee_full_name", "employee_code", "from_position", "to_position",
       "from_department", "to_department", "company_name", "ceo_name", "contract_date"].includes(t.key),
    ),
    requiredFields: ["company_name", "ceo_name"],
  },
  {
    id: "contract_addendum",
    label: "Гэрээний нэмэлт",
    filename: "contract_addendum.html",
    phase: "working",
    tokens: ALL_TOKENS.filter(t =>
      ["employee_full_name", "employee_code", "employee_register_no",
       "company_name", "company_address", "employer_representative", "contract_date",
       "monthly_base_salary_amount"].includes(t.key),
    ),
    requiredFields: ["employee_register_no", "company_name"],
  },
  {
    id: "termination_order",
    label: "Ажил дуусгавар болгох тушаал",
    filename: "termination_order.html",
    phase: "offboarding",
    tokens: ALL_TOKENS.filter(t =>
      ["employee_full_name", "employee_code", "employee_position", "department",
       "termination_date", "company_name", "ceo_name", "contract_date"].includes(t.key),
    ),
    requiredFields: ["company_name", "ceo_name", "termination_date"],
  },
  {
    id: "handover_sheet",
    label: "Хүлээлгэн өгөх акт",
    filename: "handover_sheet.html",
    phase: "offboarding",
    tokens: ALL_TOKENS.filter(t =>
      ["employee_full_name", "employee_code", "employee_position", "department",
       "termination_date", "company_name", "contract_date"].includes(t.key),
    ),
    requiredFields: ["company_name", "termination_date"],
  },
];

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

export function getTemplateById(id: string): TemplateInfo | undefined {
  return TEMPLATE_REGISTRY.find(t => t.id === id);
}

export function getTemplatesByPhase(phase: string): TemplateInfo[] {
  return TEMPLATE_REGISTRY.filter(t => t.phase === phase);
}

export function getTemplatesByAction(action: string): TemplateInfo[] {
  const phaseMap: Record<string, string> = {
    add_employee: "onboarding",
    promote_employee: "working",
    change_position: "working",
    offboard_employee: "offboarding",
  };
  const phase = phaseMap[action];
  if (!phase) return [];
  return TEMPLATE_REGISTRY.filter(t => t.phase === phase);
}

/**
 * Check which required documentProfile fields are missing for a given template.
 */
export function getMissingFields(
  templateId: string,
  documentProfile?: Record<string, string | undefined> | null,
): TemplateToken[] {
  const template = getTemplateById(templateId);
  if (!template) return [];

  return template.tokens.filter(token => {
    if (!template.requiredFields.includes(token.key)) return false;
    if (token.source !== "documentProfile") return false;
    const value = documentProfile?.[token.key];
    return !value || value.trim() === "";
  });
}

export const PHASE_LABELS: Record<string, string> = {
  onboarding: "Ажилд орох үе",
  working: "Ажиллах үе",
  offboarding: "Ажлаас гарах үе",
};

export const SOURCE_LABELS: Record<string, string> = {
  employee: "Ажилтны мэдээлэл",
  documentProfile: "Гэрээний профайл",
  computed: "Автомат тооцоолол",
};
