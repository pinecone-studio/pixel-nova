import { getDb } from "./client";
import {
  getDocuments,
  insertDocument,
  insertEmployee,
  getEmployeeById,
} from "./queries";

export async function runDbSmoke(env: Pick<CloudflareBindings, "DB">) {
  const db = getDb(env);
  const employeeId = crypto.randomUUID();

  const insertedEmployee = await insertEmployee(db, {
    id: employeeId,
    employeeCode: `EMP-${employeeId.slice(0, 8)}`,
    firstName: "Smoke",
    lastName: "Test",
    department: "Engineering",
    branch: "HQ",
    level: "L1",
    hireDate: new Date().toISOString(),
    terminationDate: null,
    status: "active",
  });

  const fetchedEmployee = await getEmployeeById(db, employeeId);

  const insertedDocument = await insertDocument(db, {
    id: crypto.randomUUID(),
    employeeId,
    action: "smoke-test",
    documentName: "smoke-test.txt",
    storageUrl: "",
    createdAt: new Date().toISOString(),
  });

  const employeeDocuments = await getDocuments(db, employeeId);

  return {
    insertedEmployee,
    fetchedEmployee,
    insertedDocument,
    employeeDocuments,
  };
}
