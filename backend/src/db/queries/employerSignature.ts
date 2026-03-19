import { eq } from "drizzle-orm";

import type { DbClient } from "../client";
import { employerSignatures } from "../schema";
import { hashPasscode, verifyPasscode } from "../../security/passcode";

export async function getEmployerSignatureByUserId(
  db: DbClient,
  userId: string,
) {
  const [row] = await db
    .select()
    .from(employerSignatures)
    .where(eq(employerSignatures.userId, userId))
    .limit(1);

  return row ?? null;
}

export async function upsertEmployerSignature(
  db: DbClient,
  input: {
    userId: string;
    signatureData: string;
    passcode?: string | null;
  },
) {
  const existing = await getEmployerSignatureByUserId(db, input.userId);
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
    .insert(employerSignatures)
    .values({
      id,
      userId: input.userId,
      signatureData: input.signatureData,
      passcodeSalt,
      passcodeHash,
      createdAt,
      updatedAt: now,
    })
    .onConflictDoUpdate({
      target: employerSignatures.userId,
      set: {
        signatureData: input.signatureData,
        passcodeSalt,
        passcodeHash,
        updatedAt: now,
      },
    });

  return getEmployerSignatureByUserId(db, input.userId);
}

export async function verifyEmployerSignaturePasscode(
  db: DbClient,
  userId: string,
  passcode: string,
) {
  const signature = await getEmployerSignatureByUserId(db, userId);

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

export async function getEmployerSignatureStatus(
  db: DbClient,
  userId: string,
) {
  const signature = await getEmployerSignatureByUserId(db, userId);
  return {
    hasSignature: Boolean(signature?.signatureData),
    hasPasscode: Boolean(signature?.passcodeHash),
    updatedAt: signature?.updatedAt ?? null,
  };
}
