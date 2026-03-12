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
  documentsGenerated: boolean;
  recipientsNotified: boolean;
  timestamp: string;
}

export interface ActionConfig {
  id: string;
  name: string;
  phase: string;
  triggerFields: string[];
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
