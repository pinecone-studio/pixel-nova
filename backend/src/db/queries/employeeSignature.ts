import { eq } from "drizzle-orm";

import type { DbClient } from "../client";
import { employeeSignatures } from "../schema";
import { hashPasscode, verifyPasscode } from "../../security/passcode";

export async function getEmployeeSignatureByEmployeeId(
  db: DbClient,
  employeeId: string,
) {
  const [row] = await db
    .select()
    .from(employeeSignatures)
    .where(eq(employeeSignatures.employeeId, employeeId))
    .limit(1);

  return row ?? null;
}

export async function upsertEmployeeSignature(
  db: DbClient,
  input: {
    employeeId: string;
    signatureData: string;
    passcode?: string | null;
  },
) {
  const existing = await getEmployeeSignatureByEmployeeId(db, input.employeeId);
  const now = new Date().toISOString();

  let passcodeSalt = existing?.passcodeSalt ?? null;
  let passcodeHash = existing?.passcodeHash ?? null;

  if (input.passcode) {
    const hashed = await hashPasscode(input.passcode);
    passcodeSalt = hashed.salt;
    passcodeHash = hashed.hash;
  }

  const createdAt = existing?.createdAt ?? now;
  const id = existing?.id ?? crypto.randomUUID();

  await db
    .insert(employeeSignatures)
    .values({
      id,
      employeeId: input.employeeId,
      signatureData: input.signatureData,
      passcodeSalt,
      passcodeHash,
      createdAt,
      updatedAt: now,
    })
    .onConflictDoUpdate({
      target: employeeSignatures.employeeId,
      set: {
        signatureData: input.signatureData,
        passcodeSalt,
        passcodeHash,
        updatedAt: now,
      },
    });

  return getEmployeeSignatureByEmployeeId(db, input.employeeId);
}

export async function verifyEmployeeSignaturePasscode(
  db: DbClient,
  employeeId: string,
  passcode: string,
) {
  const signature = await getEmployeeSignatureByEmployeeId(db, employeeId);

  if (!signature?.passcodeHash || !signature.passcodeSalt) {
    return { ok: true, hasPasscode: false };
  }

  const ok = await verifyPasscode(
    passcode,
    signature.passcodeSalt,
    signature.passcodeHash,
  );

  return { ok, hasPasscode: true };
}

export async function getEmployeeSignatureStatus(
  db: DbClient,
  employeeId: string,
) {
  const signature = await getEmployeeSignatureByEmployeeId(db, employeeId);
  return {
    hasSignature: Boolean(signature?.signatureData),
    hasPasscode: Boolean(signature?.passcodeHash),
    updatedAt: signature?.updatedAt ?? null,
  };
}
