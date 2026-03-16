export interface EmployeeDocumentProfile {
  company_address?: string;
  company_register_no?: string;
  company_name?: string;
  employer_representative?: string;
  employee_address?: string;
  employee_register_no?: string;
  company_legal_address?: string;
  company_legal_phone?: string;
  company_legal_fax?: string;
  employee_legal_address?: string;
  employee_legal_phone?: string;
  employee_legal_fax?: string;
  contract_term?: string;
  workplace_location?: string;
  work_conditions?: string;
  work_schedule_type?: string;
  workday_from?: string;
  workday_to?: string;
  workdays_count?: string;
  daily_work_hours?: string;
  weekly_work_hours?: string;
  work_start_time?: string;
  work_end_time?: string;
  break_start_time?: string;
  break_end_time?: string;
  monthly_base_salary_amount?: string;
  monthly_base_salary_words?: string;
  salary_pay_day_1?: string;
  salary_pay_day_2?: string;
}

export interface Employee {
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
  jobTitle: string;
  level: string;
  hireDate: string;
  terminationDate?: string | null;
  status: string;
  numberOfVacationDays?: number | null;
  isSalaryCompany?: boolean | null;
  isKpi?: boolean | null;
  birthDayAndMonth?: string | null;
  birthdayPoster?: string | null;
  documentProfile?: EmployeeDocumentProfile | null;
}

export interface Document {
  id: string;
  employeeId: string;
  action: string;
  documentName: string;
  storageUrl: string;
  createdAt: string;
}

export interface AuditLog {
  id: string;
  employeeId: string;
  action: string;
  phase: string;
  actorId?: string | null;
  actorRole: string;
  documentIds: string[];
  recipientRoles: string[];
  recipientEmails: string[];
  incompleteFields: string[];
  documentsGenerated: boolean;
  notificationAttempted: boolean;
  recipientsNotified: boolean;
  notificationError?: string | null;
  timestamp: string;
}

export interface ActionConfig {
  id: string;
  name: string;
  phase: string;
  triggerCondition?: string | null;
  triggerFields: string[];
  requiredEmployeeFields: string[];
  recipients: string[];
  documents: Array<{
    id: string;
    template: string;
    order: number;
  }>;
}

export interface DocumentContent {
  id: string;
  documentName: string;
  contentType: string;
  content: string;
}

export interface TriggerActionResult {
  employee: Employee;
  documents: Document[];
  auditLog: AuditLog;
}

export interface UpsertEmployeeResult {
  employee: Employee;
  resolvedAction?: string | null;
  triggeredActionResult?: TriggerActionResult | null;
}

export interface UploadHrDocumentInput {
  employeeId: string;
  action: string;
  documentName: string;
  contentType: string;
  contentBase64: string;
}

export interface UpsertEmployeeInput {
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
  jobTitle?: string | null;
  level: string;
  hireDate: string;
  terminationDate?: string | null;
  status: string;
  numberOfVacationDays?: number | null;
  isSalaryCompany?: boolean | null;
  isKpi?: boolean | null;
  birthDayAndMonth?: string | null;
  birthdayPoster?: string | null;
  documentProfile?: EmployeeDocumentProfile | null;
}

export interface RequestOtpResult {
  success: boolean;
  maskedEmail: string;
  expiresAt: string;
}

export interface AuthSession {
  token: string;
  expiresAt: string;
  employee: Employee;
}

export interface LeaveRequest {
  id: string;
  employeeId: string;
  employee: Employee;
  type: string;
  startTime: string;
  endTime: string;
  reason: string;
  status: "pending" | "approved" | "rejected";
  note?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface ContractRequest {
  id: string;
  employeeId: string;
  employee: Employee;
  templateIds: string[];
  status: "pending" | "approved" | "rejected";
  note?: string | null;
  signatureMode: string;
  createdAt: string;
  updatedAt: string;
  decidedAt?: string | null;
}

export interface EmployeeSignatureStatus {
  hasSignature: boolean;
  hasPasscode: boolean;
  updatedAt?: string | null;
}
