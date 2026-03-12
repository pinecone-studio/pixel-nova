import { desc, eq } from "drizzle-orm";

import { createSessionToken, generateOtpCode, hashSecret, maskEmail } from "../../auth/otp";
import type { DbClient } from "../client";
import { authSessions, otpCodes } from "../schema";
import { getEmployeeByCode, getEmployeeById } from "./employee";
import { sendEmailWithRetry } from "../../notifications/sendEmailWithRetry";

const OTP_TTL_MS = 10 * 60 * 1000;
const SESSION_TTL_MS = 7 * 24 * 60 * 60 * 1000;
const OTP_MAX_ATTEMPTS = 5;

function isExpired(isoTimestamp: string) {
  return new Date(isoTimestamp).getTime() <= Date.now();
}

export async function requestEmployeeOtp(
  db: DbClient,
  employeeCode: string,
  apiKey: string,
  testOtpEmail?: string | null,
) {
  const normalizedCode = employeeCode.trim().toUpperCase();
  const employee = await getEmployeeByCode(db, normalizedCode);
  const deliveryEmail = testOtpEmail?.trim() || employee?.email || null;

  if (!employee) {
    throw new Error("Employee code not found");
  }

  if (!deliveryEmail) {
    throw new Error("Employee email is missing and TEST_OTP_EMAIL is not configured");
  }

  const otpCode = generateOtpCode();
  const now = new Date();
  const expiresAt = new Date(now.getTime() + OTP_TTL_MS).toISOString();

  await db.delete(otpCodes).where(eq(otpCodes.employeeId, employee.id));
  await db.insert(otpCodes).values({
    id: crypto.randomUUID(),
    employeeId: employee.id,
    codeHash: await hashSecret(otpCode),
    attemptsRemaining: OTP_MAX_ATTEMPTS,
    expiresAt,
    createdAt: now.toISOString(),
  });

  await sendEmailWithRetry({
    to: [deliveryEmail],
    subject: "EPAS login code",
    text: `Your EPAS one-time password is: ${otpCode}. The code expires in 10 minutes.`,
    html: `<p>Your EPAS one-time password is: <strong>${otpCode}</strong></p><p>The code expires in 10 minutes.</p>`,
    apiKey,
  });

  return {
    employee,
    maskedEmail: maskEmail(deliveryEmail),
    expiresAt,
  };
}

export async function verifyEmployeeOtp(
  db: DbClient,
  employeeCode: string,
  code: string,
) {
  const normalizedCode = employeeCode.trim().toUpperCase();
  const employee = await getEmployeeByCode(db, normalizedCode);

  if (!employee) {
    throw new Error("Employee code not found");
  }

  const [otpRecord] = await db
    .select()
    .from(otpCodes)
    .where(eq(otpCodes.employeeId, employee.id))
    .orderBy(desc(otpCodes.createdAt))
    .limit(1);

  if (!otpRecord || isExpired(otpRecord.expiresAt)) {
    throw new Error("OTP expired or not requested");
  }

  if (otpRecord.attemptsRemaining <= 0) {
    await db.delete(otpCodes).where(eq(otpCodes.id, otpRecord.id));
    throw new Error("OTP attempts exceeded");
  }

  const inputHash = await hashSecret(code.trim());
  if (inputHash !== otpRecord.codeHash) {
    const attemptsRemaining = otpRecord.attemptsRemaining - 1;
    if (attemptsRemaining <= 0) {
      await db.delete(otpCodes).where(eq(otpCodes.id, otpRecord.id));
    } else {
      await db
        .update(otpCodes)
        .set({ attemptsRemaining })
        .where(eq(otpCodes.id, otpRecord.id));
    }
    throw new Error("OTP code is invalid");
  }

  await db.delete(otpCodes).where(eq(otpCodes.id, otpRecord.id));
  await db.delete(authSessions).where(eq(authSessions.employeeId, employee.id));

  const token = createSessionToken();
  const now = new Date();
  const expiresAt = new Date(now.getTime() + SESSION_TTL_MS).toISOString();

  await db.insert(authSessions).values({
    id: crypto.randomUUID(),
    employeeId: employee.id,
    tokenHash: await hashSecret(token),
    expiresAt,
    createdAt: now.toISOString(),
  });

  return {
    token,
    expiresAt,
    employee,
  };
}

export async function createEmployeeCodeSession(
  db: DbClient,
  employeeCode: string,
) {
  const normalizedCode = employeeCode.trim().toUpperCase();
  const employee = await getEmployeeByCode(db, normalizedCode);

  if (!employee) {
    throw new Error("Employee code not found");
  }

  await db.delete(authSessions).where(eq(authSessions.employeeId, employee.id));

  const token = createSessionToken();
  const now = new Date();
  const expiresAt = new Date(now.getTime() + SESSION_TTL_MS).toISOString();

  await db.insert(authSessions).values({
    id: crypto.randomUUID(),
    employeeId: employee.id,
    tokenHash: await hashSecret(token),
    expiresAt,
    createdAt: now.toISOString(),
  });

  return {
    token,
    expiresAt,
    employee,
  };
}

export async function getSessionByToken(db: DbClient, token: string) {
  const tokenHash = await hashSecret(token);
  const [session] = await db
    .select()
    .from(authSessions)
    .where(eq(authSessions.tokenHash, tokenHash))
    .limit(1);

  if (!session) {
    return null;
  }

  if (isExpired(session.expiresAt)) {
    await db.delete(authSessions).where(eq(authSessions.id, session.id));
    return null;
  }

  const employee = await getEmployeeById(db, session.employeeId);
  if (!employee) {
    await db.delete(authSessions).where(eq(authSessions.id, session.id));
    return null;
  }

  return {
    session,
    employee,
  };
}

export async function deleteSessionByToken(db: DbClient, token: string) {
  const tokenHash = await hashSecret(token);
  await db.delete(authSessions).where(eq(authSessions.tokenHash, tokenHash));
  return true;
}
