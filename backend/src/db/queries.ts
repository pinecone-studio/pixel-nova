import { and, desc, eq } from "drizzle-orm";

import type { DbClient } from "./client";
import { actions, auditLog, documents, employees } from "./schema";
import { generateEmployeeDocument } from "../document/generator";
import { uploadEmployeeDocumentToR2 } from "../storage/r2";
import {
  DEFAULT_LIFECYCLE_ACTION_CONFIGS,
  type LifecycleActionConfig,
} from "../services/actionResolver";

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
        firstNameEng: employee.firstNameEng ?? previousEmployee.firstNameEng,
        lastNameEng: employee.lastNameEng ?? previousEmployee.lastNameEng,
        entraId: employee.entraId ?? previousEmployee.entraId,
        email: employee.email ?? previousEmployee.email,
        imageUrl: employee.imageUrl ?? previousEmployee.imageUrl,
        github: employee.github ?? previousEmployee.github,
        department: employee.department,
        branch: employee.branch,
        level: employee.level,
        hireDate: employee.hireDate,
        terminationDate,
        status: employee.status,
        numberOfVacationDays: employee.numberOfVacationDays ?? previousEmployee.numberOfVacationDays,
        isSalaryCompany: employee.isSalaryCompany ?? previousEmployee.isSalaryCompany,
        isKpi: employee.isKpi ?? previousEmployee.isKpi,
        birthDayAndMonth: employee.birthDayAndMonth ?? previousEmployee.birthDayAndMonth,
        birthdayPoster: employee.birthdayPoster ?? previousEmployee.birthdayPoster,
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

export async function ensureDefaultActionConfigs(db: DbClient) {
  for (const config of DEFAULT_LIFECYCLE_ACTION_CONFIGS) {
    await db
      .insert(actions)
      .values({
        id: crypto.randomUUID(),
        name: config.name,
        phase: config.phase,
        triggerFields: JSON.stringify(config.triggerFields),
      })
      .onConflictDoNothing({
        target: actions.name,
      });
  }
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
  bucket?: R2Bucket,
) {
  const employee = await getEmployeeById(db, employeeId);

  if (!employee) {
    throw new Error(`Employee not found for id ${employeeId}`);
  }

  const now = new Date().toISOString();
  const auditId = crypto.randomUUID();
  const normalizedAction = actionName.trim();

  // action-registry.json-оос тухайн action-ийн document list-ийг авна
  const actionRegistry = await import("../config/action-registry.json");
  const actionConfig = (actionRegistry.actions as Record<string, { documents?: Array<{ id: string; template: string; order: number }> }>)[normalizedAction];
  const docTemplates = actionConfig?.documents ?? [{ id: "default", template: "default.html", order: 1 }];

  // Template тус бүрд document үүсгэнэ
  const documentInserts: Array<{
    id: string;
    employeeId: string;
    action: string;
    documentName: string;
    storageUrl: string;
    createdAt: string;
  }> = [];

  for (const tmpl of docTemplates.sort((a, b) => a.order - b.order)) {
    const documentId = crypto.randomUUID();
    const orderPrefix = String(tmpl.order).padStart(2, "0");
    const generated = generateEmployeeDocument({
      employee,
      action: normalizedAction,
      generatedAt: now,
      documentId,
      templateFile: tmpl.template,
    });

    let storageUrl = generated.storageUrl;

    // R2 bucket байвал upload хийнэ
    if (bucket) {
      try {
        const r2Key = await uploadEmployeeDocumentToR2({
          bucket,
          employeeId,
          documentId,
          documentName: `${orderPrefix}_${tmpl.id}.html`,
          content: generated.content,
          contentType: generated.contentType,
          createdAt: now,
        });
        storageUrl = `r2://${r2Key}`;
      } catch (err) {
        console.error(`R2 upload failed for ${tmpl.id}:`, err);
        // Fallback: data URL хэвээр хадгалагдана
        if (!storageUrl) {
          storageUrl = `data:${generated.contentType};charset=utf-8,${encodeURIComponent(generated.content)}`;
        }
      }
    } else if (!storageUrl) {
      // R2 байхгүй бол data URL-д хадгална
      storageUrl = `data:${generated.contentType};charset=utf-8,${encodeURIComponent(generated.content)}`;
    }

    documentInserts.push({
      id: documentId,
      employeeId,
      action: normalizedAction,
      documentName: `${orderPrefix}_${tmpl.id}.html`,
      storageUrl,
      createdAt: now,
    });
  }

  // Бүх document + audit log-ийг batch insert хийнэ
  const batchOps = [
    ...documentInserts.map((doc) => db.insert(documents).values(doc)),
    db.insert(auditLog).values({
      id: auditId,
      employeeId,
      action: normalizedAction,
      documentsGenerated: true,
      recipientsNotified: false,
      timestamp: now,
    }),
  ];

  await db.batch(batchOps as [typeof batchOps[0], ...typeof batchOps]);

  // Үүссэн document-уудыг query хийнэ
  const createdDocuments = await db
    .select()
    .from(documents)
    .where(and(eq(documents.employeeId, employeeId), eq(documents.action, normalizedAction)))
    .orderBy(documents.documentName);

  const [auditEntry] = await db
    .select()
    .from(auditLog)
    .where(and(eq(auditLog.id, auditId), eq(auditLog.employeeId, employeeId)))
    .limit(1);

  if (createdDocuments.length === 0 || !auditEntry) {
    throw new Error("Failed to create trigger action records");
  }

  return { employee, documents: createdDocuments, auditEntry };
}
