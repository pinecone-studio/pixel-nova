import { and, asc, eq } from "drizzle-orm";

import type { DbClient } from "../client";
import { employees } from "../schema";

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

export async function listEmployees(
  db: DbClient,
  filters?: {
    search?: string;
    status?: string;
    department?: string;
  },
) {
  const search = filters?.search?.trim();
  const whereClause = search
    ? and(
        filters?.status ? eq(employees.status, filters.status) : undefined,
        filters?.department ? eq(employees.department, filters.department) : undefined,
        // SQLite doesn't support ILIKE, so match several columns with LIKE
        // and let OR semantics happen via repeated queries would be wasteful.
      )
    : and(
        filters?.status ? eq(employees.status, filters.status) : undefined,
        filters?.department ? eq(employees.department, filters.department) : undefined,
      );

  if (!search) {
    return db.select().from(employees).where(whereClause).orderBy(asc(employees.lastName), asc(employees.firstName));
  }

  const term = `%${search}%`;
  return db
    .select()
    .from(employees)
    .where(
      and(
        filters?.status ? eq(employees.status, filters.status) : undefined,
        filters?.department ? eq(employees.department, filters.department) : undefined,
      ),
    )
    .orderBy(asc(employees.lastName), asc(employees.firstName))
    .then((rows) =>
      rows.filter((row) =>
        [
          row.firstName,
          row.lastName,
          row.employeeCode,
          row.email ?? "",
          row.department,
          row.jobTitle,
        ].some((value) => value.toLowerCase().includes(search.toLowerCase())),
      ),
    );
}

async function generateEmployeeCode(db: DbClient) {
  const rows = await db
    .select({ employeeCode: employees.employeeCode })
    .from(employees);

  const maxNumeric = rows.reduce((max, row) => {
    const match = row.employeeCode.match(/(\d+)$/);
    if (!match) return max;
    return Math.max(max, Number(match[1]));
  }, 0);

  return `EMP${String(maxNumeric + 1).padStart(4, "0")}`;
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

export async function updateEmployeeDocumentProfile(
  db: DbClient,
  employeeId: string,
  documentProfile: string,
) {
  await db
    .update(employees)
    .set({ documentProfile })
    .where(eq(employees.id, employeeId));

  return getEmployeeById(db, employeeId);
}

export async function updateEmployeeStatus(
  db: DbClient,
  employeeId: string,
  status: string,
) {
  await db
    .update(employees)
    .set({ status })
    .where(eq(employees.id, employeeId));

  return getEmployeeById(db, employeeId);
}

export async function upsertEmployeeRecord(
  db: DbClient,
  employee: Omit<typeof employees.$inferInsert, "employeeCode"> & { employeeCode?: string | null },
) {
  const previousEmployee = await getEmployeeById(db, employee.id);
  const resolvedEmployeeCode = employee.employeeCode?.trim()
    ? employee.employeeCode.trim().toUpperCase()
    : previousEmployee?.employeeCode ?? await generateEmployeeCode(db);
  const terminationDate =
    employee.terminationDate === undefined
      ? previousEmployee?.terminationDate ?? null
      : employee.terminationDate ?? null;
  const documentProfile =
    employee.documentProfile === undefined
      ? previousEmployee?.documentProfile ?? "{}"
      : employee.documentProfile ?? "{}";

  const nextEmployee = previousEmployee
    ? await updateEmployee(db, employee.id, {
        employeeCode: resolvedEmployeeCode,
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
        jobTitle: employee.jobTitle ?? previousEmployee.jobTitle ?? previousEmployee.level,
        level: employee.level,
        hireDate: employee.hireDate,
        terminationDate,
        status: employee.status,
        numberOfVacationDays: employee.numberOfVacationDays ?? previousEmployee.numberOfVacationDays,
        isSalaryCompany: employee.isSalaryCompany ?? previousEmployee.isSalaryCompany,
        isKpi: employee.isKpi ?? previousEmployee.isKpi,
        birthDayAndMonth: employee.birthDayAndMonth ?? previousEmployee.birthDayAndMonth,
        birthdayPoster: employee.birthdayPoster ?? previousEmployee.birthdayPoster,
        documentProfile,
      })
    : await insertEmployee(db, {
        ...employee,
        employeeCode: resolvedEmployeeCode,
        terminationDate,
        documentProfile,
      });

  if (!nextEmployee) {
    throw new Error(`Failed to upsert employee ${employee.id}`);
  }

  return {
    previousEmployee,
    employee: nextEmployee,
  };
}
