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
    level: text("level").notNull(),
    hireDate: text("hire_date").notNull(),
    terminationDate: text("termination_date"),
    status: text("status").notNull(),
    numberOfVacationDays: integer("number_of_vacation_days"),
    isSalaryCompany: integer("is_salary_company", { mode: "boolean" }),
    isKpi: integer("is_kpi", { mode: "boolean" }),
    birthDayAndMonth: text("birth_day_and_month"),
    birthdayPoster: text("birthday_poster"),
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
  email: text("email").notNull().unique(),
});

export const actions = sqliteTable(
  "actions",
  {
    id: text("id").primaryKey(),
    name: text("name").notNull().unique(),
    phase: text("phase").notNull(),
    triggerFields: text("trigger_fields").notNull(),
  },
  (table) => [index("actions_name_idx").on(table.name)],
);

export const schema = {
  employees,
  documents,
  auditLog,
  recipients,
  actions,
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
