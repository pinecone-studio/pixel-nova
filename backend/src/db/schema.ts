import { index, integer, sqliteTable, text } from "drizzle-orm/sqlite-core";

export const employees = sqliteTable(
  "employees",
  {
    id: text("id").primaryKey(),
    employeeCode: text("employee_code").notNull().unique(),
    firstName: text("first_name").notNull(),
    lastName: text("last_name").notNull(),
    firstNameEng: text("first_name_eng"),
    lastNameEng: text("last_name_eng"),
    entraId: text("entra_id"),
    email: text("email"),
    imageUrl: text("image_url"),
    github: text("github"),
    department: text("department").notNull(),
    branch: text("branch").notNull(),
    jobTitle: text("job_title").notNull().default(""),
    level: text("level").notNull(),
    hireDate: text("hire_date").notNull(),
    terminationDate: text("termination_date"),
    status: text("status").notNull(),
    numberOfVacationDays: integer("number_of_vacation_days"),
    isSalaryCompany: integer("is_salary_company", { mode: "boolean" }),
    isKpi: integer("is_kpi", { mode: "boolean" }),
    birthDayAndMonth: text("birth_day_and_month"),
    birthdayPoster: text("birthday_poster"),
    documentProfile: text("document_profile").notNull().default("{}"),
  },
  (table) => [index("employees_employee_code_idx").on(table.employeeCode)],
);

export const documents = sqliteTable(
  "documents",
  {
    id: text("id").primaryKey(),
    employeeId: text("employee_id")
      .notNull()
      .references(() => employees.id, { onDelete: "cascade" }),
    action: text("action").notNull(),
    documentName: text("document_name").notNull(),
    storageUrl: text("storage_url").notNull(),
    createdAt: text("created_at").notNull(),
  },
  (table) => [index("documents_employee_id_idx").on(table.employeeId)],
);

export const auditLog = sqliteTable(
  "audit_log",
  {
    id: text("id").primaryKey(),
    employeeId: text("employee_id")
      .notNull()
      .references(() => employees.id, { onDelete: "cascade" }),
    action: text("action").notNull(),
    phase: text("phase").notNull(),
    actorId: text("actor_id"),
    actorRole: text("actor_role").notNull().default("unknown"),
    documentIds: text("document_ids").notNull().default("[]"),
    recipientRoles: text("recipient_roles").notNull().default("[]"),
    recipientEmails: text("recipient_emails").notNull().default("[]"),
    incompleteFields: text("incomplete_fields").notNull().default("[]"),
    documentsGenerated: integer("documents_generated", { mode: "boolean" })
      .notNull()
      .default(false),
    notificationAttempted: integer("notification_attempted", { mode: "boolean" })
      .notNull()
      .default(false),
    recipientsNotified: integer("recipients_notified", { mode: "boolean" })
      .notNull()
      .default(false),
    notificationError: text("notification_error"),
    timestamp: text("timestamp").notNull(),
  },
  (table) => [index("audit_log_employee_id_idx").on(table.employeeId)],
);

export const recipients = sqliteTable("recipients", {
  id: text("id").primaryKey(),
  role: text("role").notNull(),
  email: text("email").notNull(),
});

export const actions = sqliteTable(
  "actions",
  {
    id: text("id").primaryKey(),
    name: text("name").notNull().unique(),
    phase: text("phase").notNull(),
    triggerCondition: text("trigger_condition"),
    triggerFields: text("trigger_fields").notNull(),
    requiredEmployeeFields: text("required_employee_fields")
      .notNull()
      .default("[]"),
    recipients: text("recipients").notNull().default("[]"),
    documents: text("documents").notNull().default("[]"),
  },
  (table) => [index("actions_name_idx").on(table.name)],
);

export const processedEvents = sqliteTable(
  "processed_events",
  {
    eventId: text("event_id").primaryKey(),
    eventType: text("event_type").notNull(),
    employeeId: text("employee_id").notNull(),
    action: text("action"),
    status: text("status").notNull(),
    payload: text("payload").notNull(),
    lastError: text("last_error"),
    processedAt: text("processed_at").notNull(),
  },
  (table) => [
    index("processed_events_employee_id_idx").on(table.employeeId),
    index("processed_events_status_idx").on(table.status),
  ],
);

export const otpCodes = sqliteTable(
  "otp_codes",
  {
    id: text("id").primaryKey(),
    employeeId: text("employee_id")
      .notNull()
      .references(() => employees.id, { onDelete: "cascade" }),
    codeHash: text("code_hash").notNull(),
    attemptsRemaining: integer("attempts_remaining").notNull().default(5),
    expiresAt: text("expires_at").notNull(),
    createdAt: text("created_at").notNull(),
  },
  (table) => [index("otp_codes_employee_id_idx").on(table.employeeId)],
);

export const authSessions = sqliteTable(
  "auth_sessions",
  {
    id: text("id").primaryKey(),
    employeeId: text("employee_id")
      .notNull()
      .references(() => employees.id, { onDelete: "cascade" }),
    tokenHash: text("token_hash").notNull().unique(),
    expiresAt: text("expires_at").notNull(),
    createdAt: text("created_at").notNull(),
  },
  (table) => [index("auth_sessions_employee_id_idx").on(table.employeeId)],
);

export const employeeNotifications = sqliteTable(
  "employee_notifications",
  {
    id: text("id").primaryKey(),
    employeeId: text("employee_id")
      .notNull()
      .references(() => employees.id, { onDelete: "cascade" }),
    announcementId: text("announcement_id"),
    title: text("title").notNull(),
    body: text("body").notNull(),
    status: text("status").notNull().default("unread"),
    createdAt: text("created_at").notNull(),
    readAt: text("read_at"),
  },
  (table) => [
    index("employee_notifications_employee_id_idx").on(table.employeeId),
    index("employee_notifications_announcement_id_idx").on(table.announcementId),
  ],
);

export const announcements = sqliteTable(
  "announcements",
  {
    id: text("id").primaryKey(),
    title: text("title").notNull(),
    body: text("body").notNull(),
    status: text("status").notNull().default("draft"),
    audience: text("audience").notNull().default("all"),
    createdBy: text("created_by"),
    createdAt: text("created_at").notNull(),
    updatedAt: text("updated_at").notNull(),
    publishedAt: text("published_at"),
  },
  (table) => [index("announcements_status_idx").on(table.status)],
);

export const contractRequests = sqliteTable(
  "contract_requests",
  {
    id: text("id").primaryKey(),
    employeeId: text("employee_id")
      .notNull()
      .references(() => employees.id, { onDelete: "cascade" }),
    templateIds: text("template_ids").notNull().default("[]"),
    status: text("status").notNull().default("pending"),
    note: text("note"),
    signatureMode: text("signature_mode").notNull().default("none"),
    createdAt: text("created_at").notNull(),
    updatedAt: text("updated_at").notNull(),
    decidedAt: text("decided_at"),
  },
  (table) => [index("contract_requests_employee_id_idx").on(table.employeeId)],
);

export const employeeSignatures = sqliteTable(
  "employee_signatures",
  {
    id: text("id").primaryKey(),
    employeeId: text("employee_id")
      .notNull()
      .references(() => employees.id, { onDelete: "cascade" })
      .unique(),
    signatureData: text("signature_data").notNull(),
    passcodeSalt: text("passcode_salt"),
    passcodeHash: text("passcode_hash"),
    createdAt: text("created_at").notNull(),
    updatedAt: text("updated_at").notNull(),
  },
  (table) => [index("employee_signatures_employee_id_idx").on(table.employeeId)],
);

export const schema = {
  employees,
  documents,
  auditLog,
  recipients,
  actions,
  processedEvents,
  otpCodes,
  authSessions,
  employeeNotifications,
  announcements,
  contractRequests,
  employeeSignatures,
};

export type Employee = typeof employees.$inferSelect;
export type NewEmployee = typeof employees.$inferInsert;
export type Document = typeof documents.$inferSelect;
export type NewDocument = typeof documents.$inferInsert;
export type AuditLogEntry = typeof auditLog.$inferSelect;
export type NewAuditLogEntry = typeof auditLog.$inferInsert;
export type Recipient = typeof recipients.$inferSelect;
export type NewRecipient = typeof recipients.$inferInsert;
export type ActionConfig = typeof actions.$inferSelect;
export type NewActionConfig = typeof actions.$inferInsert;
export type ProcessedEvent = typeof processedEvents.$inferSelect;
export type NewProcessedEvent = typeof processedEvents.$inferInsert;
export type OtpCode = typeof otpCodes.$inferSelect;
export type NewOtpCode = typeof otpCodes.$inferInsert;
export type AuthSession = typeof authSessions.$inferSelect;
export type NewAuthSession = typeof authSessions.$inferInsert;
export type EmployeeNotification = typeof employeeNotifications.$inferSelect;
export type NewEmployeeNotification = typeof employeeNotifications.$inferInsert;
export type Announcement = typeof announcements.$inferSelect;
export type NewAnnouncement = typeof announcements.$inferInsert;
export type ContractRequest = typeof contractRequests.$inferSelect;
export type NewContractRequest = typeof contractRequests.$inferInsert;
export type EmployeeSignature = typeof employeeSignatures.$inferSelect;
export type NewEmployeeSignature = typeof employeeSignatures.$inferInsert;
