import { expect, test } from "@jest/globals";

import { resolveRecipients, getAllRecipientEmails } from "./resolveRecipients.js";
import type { DbClient } from "../db/client.js";

function makeMockDb(rows: { email: string }[]): DbClient {
  return {
    select: () => ({
      from: () => ({
        where: () => Promise.resolve(rows),
      }),
    }),
  } as unknown as DbClient;
}

function makeMockDbNoWhere(rows: { email: string }[]): DbClient {
  return {
    select: () => ({
      from: () => Promise.resolve(rows),
    }),
  } as unknown as DbClient;
}

// ── resolveRecipients ─────────────────────────────────────────────────────────

test("returns emails for matching roles", async () => {
  const db = makeMockDb([{ email: "hr@example.com" }, { email: "admin@example.com" }]);

  const result = await resolveRecipients(db, ["hr", "admin"]);

  expect(result).toEqual(["hr@example.com", "admin@example.com"]);
});

test("returns empty array when roles list is empty", async () => {
  const db = makeMockDb([]);

  const result = await resolveRecipients(db, []);

  expect(result).toEqual([]);
});

test("returns empty array when no recipients match the roles", async () => {
  const db = makeMockDb([]);

  const result = await resolveRecipients(db, ["unknown_role"]);

  expect(result).toEqual([]);
});

test("trims whitespace from emails", async () => {
  const db = makeMockDb([{ email: "  hr@example.com  " }]);

  const result = await resolveRecipients(db, ["hr"]);

  expect(result).toEqual(["hr@example.com"]);
});

test("filters out empty email strings", async () => {
  const db = makeMockDb([{ email: "" }, { email: "hr@example.com" }]);

  const result = await resolveRecipients(db, ["hr"]);

  expect(result).toEqual(["hr@example.com"]);
});

// ── getAllRecipientEmails ──────────────────────────────────────────────────────

test("returns all recipient emails", async () => {
  const db = makeMockDbNoWhere([
    { email: "hr@example.com" },
    { email: "admin@example.com" },
  ]);

  const result = await getAllRecipientEmails(db);

  expect(result).toEqual(["hr@example.com", "admin@example.com"]);
});

test("returns empty array when no recipients exist", async () => {
  const db = makeMockDbNoWhere([]);

  const result = await getAllRecipientEmails(db);

  expect(result).toEqual([]);
});

test("trims whitespace from emails in getAllRecipientEmails", async () => {
  const db = makeMockDbNoWhere([{ email: "  admin@example.com  " }]);

  const result = await getAllRecipientEmails(db);

  expect(result).toEqual(["admin@example.com"]);
});
