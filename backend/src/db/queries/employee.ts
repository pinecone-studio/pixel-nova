import { eq } from "drizzle-orm";

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
