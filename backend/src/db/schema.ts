import { index, integer, sqliteTable, text } from "drizzle-orm/sqlite-core";

export const employees = sqliteTable(
  "employees",
  {
    id: text("id").primaryKey(),
    employeeCode: text("employee_code").notNull().unique(),
    firstName: text("first_name").notNull(),
    lastName: text("last_name").notNull(),
    department: text("department").notNull(),
    branch: text("branch").notNull(),
    level: text("level").notNull(),
    numberOfVacationDays: integer("number_of_vacation_days")
      .notNull()
      .default(0),
    isSalaryCompany: integer("is_salary_company", { mode: "boolean" })
      .notNull()
      .default(false),
    hireDate: text("hire_date").notNull(),
    terminationDate: text("termination_date"),
    status: text("status").notNull(),
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
    documentsGenerated: integer("documents_generated", { mode: "boolean" })
      .notNull()
      .default(false),
    recipientsNotified: integer("recipients_notified", { mode: "boolean" })
      .notNull()
      .default(false),
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
