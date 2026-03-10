import { and, desc, eq } from "drizzle-orm";

import type { DbClient } from "./client";
import { actions, auditLog, documents, employees } from "./schema";
import { generateEmployeeDocument } from "../document/generator";
import type { LifecycleActionConfig } from "../services/actionResolver";

export type ActorRole = "admin" | "hr" | "employee" | "unknown";

export interface Actor {
  id: string | null;
  role: ActorRole;
}

export interface RequestContext {
  actor: Actor;
}

export interface ActionRegistryInput {
  name: string;
  phase: string;
  triggerFields: string[];
}

export interface NormalizedActionConfig
  extends Omit<typeof actions.$inferSelect, "triggerFields" | "name">,
    LifecycleActionConfig {}

function toJsonArray(input: string): string[] {
  try {
    const parsed = JSON.parse(input);
    return Array.isArray(parsed)
      ? parsed.filter((value): value is string => typeof value === "string")
      : [];
  } catch {
    return [];
  }
}

export function normalizeActionConfig(row: typeof actions.$inferSelect) {
  return {
    ...row,
    triggerFields: toJsonArray(row.triggerFields),
  } as NormalizedActionConfig;
}

export async function getEmployeeById(db: DbClient, employeeId: string) {
  const [employee] = await db
    .select()
    .from(employees)
    .where(eq(employees.id, employeeId))
    .limit(1);

  return employee ?? null;
}

export async function getEmployeeByCode(db: DbClient, employeeCode: string) {
  const [employee] = await db
    .select()
    .from(employees)
    .where(eq(employees.employeeCode, employeeCode))
    .limit(1);

  return employee ?? null;
}

export async function insertEmployee(
  db: DbClient,
  employee: typeof employees.$inferInsert,
) {
  await db.insert(employees).values(employee);
  return getEmployeeById(db, employee.id);
}

export async function updateEmployee(
  db: DbClient,
  employeeId: string,
  employee: Omit<typeof employees.$inferInsert, "id">,
) {
  await db
    .update(employees)
    .set(employee)
    .where(eq(employees.id, employeeId));

  return getEmployeeById(db, employeeId);
}

export async function upsertEmployeeRecord(
  db: DbClient,
  employee: typeof employees.$inferInsert,
) {
  const previousEmployee = await getEmployeeById(db, employee.id);
  const terminationDate =
    employee.terminationDate === undefined
      ? previousEmployee?.terminationDate ?? null
      : employee.terminationDate ?? null;

  const nextEmployee = previousEmployee
    ? await updateEmployee(db, employee.id, {
        employeeCode: employee.employeeCode,
        firstName: employee.firstName,
        lastName: employee.lastName,
        department: employee.department,
        branch: employee.branch,
        level: employee.level,
        hireDate: employee.hireDate,
        terminationDate,
        status: employee.status,
      })
    : await insertEmployee(db, {
        ...employee,
        terminationDate,
      });

  if (!nextEmployee) {
    throw new Error(`Failed to upsert employee ${employee.id}`);
  }

  return {
    previousEmployee,
    employee: nextEmployee,
  };
}

export async function getDocuments(
  db: DbClient,
  employeeId?: string | null,
) {
  const query = db.select().from(documents);

  const rows = employeeId
    ? await query.where(eq(documents.employeeId, employeeId)).orderBy(desc(documents.createdAt))
    : await query.orderBy(desc(documents.createdAt));

  return rows;
}

export async function insertDocument(
  db: DbClient,
  document: typeof documents.$inferInsert,
) {
  await db.insert(documents).values(document);
  const [row] = await db
    .select()
    .from(documents)
    .where(eq(documents.id, document.id))
    .limit(1);

  return row ?? null;
}

export async function getAuditLogs(
  db: DbClient,
  employeeId?: string | null,
) {
  const query = db.select().from(auditLog);

  const rows = employeeId
    ? await query.where(eq(auditLog.employeeId, employeeId)).orderBy(desc(auditLog.timestamp))
    : await query.orderBy(desc(auditLog.timestamp));

  return rows;
}

export async function insertAuditLog(
  db: DbClient,
  entry: typeof auditLog.$inferInsert,
) {
  await db.insert(auditLog).values(entry);
  const [row] = await db
    .select()
    .from(auditLog)
    .where(eq(auditLog.id, entry.id))
    .limit(1);

  return row ?? null;
}

export async function listActionConfigs(db: DbClient) {
  const rows = await db.select().from(actions).orderBy(actions.name);
  return rows.map(normalizeActionConfig);
}

export async function upsertActionConfig(
  db: DbClient,
  input: ActionRegistryInput,
) {
  const id = crypto.randomUUID();

  await db
    .insert(actions)
    .values({
      id,
      name: input.name,
      phase: input.phase,
      triggerFields: JSON.stringify(input.triggerFields),
    })
    .onConflictDoUpdate({
      target: actions.name,
      set: {
        phase: input.phase,
        triggerFields: JSON.stringify(input.triggerFields),
      },
    });

  const [row] = await db
    .select()
    .from(actions)
    .where(eq(actions.name, input.name))
    .limit(1);

  if (!row) {
    throw new Error("Failed to upsert action registry entry");
  }

  return normalizeActionConfig(row);
}

export async function updateAuditLogNotified(
  db: DbClient,
  auditId: string,
  notified: boolean,
) {
  await db
    .update(auditLog)
    .set({ recipientsNotified: notified })
    .where(eq(auditLog.id, auditId));
}

export async function createTriggeredActionRecords(
  db: DbClient,
  employeeId: string,
  actionName: string,
) {
  const employee = await getEmployeeById(db, employeeId);

  if (!employee) {
    throw new Error(`Employee not found for id ${employeeId}`);
  }

  const now = new Date().toISOString();
  const documentId = crypto.randomUUID();
  const auditId = crypto.randomUUID();
  const normalizedAction = actionName.trim();
  const generatedDocument = generateEmployeeDocument({
    employee,
    action: normalizedAction,
    generatedAt: now,
    documentId,
  });

  await db.batch([
    db.insert(documents).values({
      id: documentId,
      employeeId,
      action: normalizedAction,
      documentName: generatedDocument.documentName,
      storageUrl: generatedDocument.storageUrl,
      createdAt: now,
    }),
    db.insert(auditLog).values({
      id: auditId,
      employeeId,
      action: normalizedAction,
      documentsGenerated: true,
      recipientsNotified: false,
      timestamp: now,
    }),
  ]);

  const [document] = await db
    .select()
    .from(documents)
    .where(and(eq(documents.id, documentId), eq(documents.employeeId, employeeId)))
    .limit(1);
  const [auditEntry] = await db
    .select()
    .from(auditLog)
    .where(and(eq(auditLog.id, auditId), eq(auditLog.employeeId, employeeId)))
    .limit(1);

  if (!document || !auditEntry) {
    throw new Error("Failed to create trigger action records");
  }

  return { employee, document, auditEntry };
}
