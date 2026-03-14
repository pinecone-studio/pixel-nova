import { expect, test } from "@jest/globals";

import {
  buildDocumentDeliveryUrl,
  validateDocumentAccess,
} from "../../src/notifications/documentLinks.js";

test("builds signed backend document endpoint when origin and secret are available", async () => {
  const url = await buildDocumentDeliveryUrl({
    documentId: "doc-123",
    storageUrl: "r2://documents/abc.pdf",
    publicOrigin: "https://backend.example.com",
    signingSecret: "super-secret",
    now: Date.UTC(2026, 2, 11, 0, 0, 0),
  });

  expect(url).not.toBeNull();

  const parsed = new URL(url!);
  expect(parsed.origin).toBe("https://backend.example.com");
  expect(parsed.pathname).toBe("/documents/doc-123");
  expect(parsed.searchParams.get("expires")).toBe("1773792000");
  expect(parsed.searchParams.get("signature")).toBeTruthy();
});

test("trims trailing slash from public origin", async () => {
  const url = await buildDocumentDeliveryUrl({
    documentId: "doc-123",
    storageUrl: "r2://documents/abc.pdf",
    publicOrigin: "https://backend.example.com///",
    signingSecret: "super-secret",
    now: Date.UTC(2026, 2, 11, 0, 0, 0),
  });

  expect(url).toMatch(/^https:\/\/backend\.example\.com\/documents\/doc-123\?/);
});

test("falls back to http storage url when no signing context is available", async () => {
  await expect(
    buildDocumentDeliveryUrl({
      documentId: "doc-123",
      storageUrl: "https://cdn.example.com/doc-123.pdf",
      publicOrigin: null,
      signingSecret: null,
    }),
  ).resolves.toBe("https://cdn.example.com/doc-123.pdf");
});

test("returns null for internal-only storage urls when signing context is missing", async () => {
  await expect(
    buildDocumentDeliveryUrl({
      documentId: "doc-123",
      storageUrl: "r2://documents/abc.pdf",
      publicOrigin: "https://backend.example.com",
      signingSecret: null,
    }),
  ).resolves.toBeNull();
});

test("validates signed document access before expiry", async () => {
  const now = Date.UTC(2026, 2, 11, 0, 0, 0);
  const url = await buildDocumentDeliveryUrl({
    documentId: "doc-123",
    storageUrl: "r2://documents/abc.pdf",
    publicOrigin: "https://backend.example.com",
    signingSecret: "super-secret",
    now,
  });

  const parsed = new URL(url!);
  await expect(
    validateDocumentAccess({
      documentId: "doc-123",
      expires: parsed.searchParams.get("expires"),
      signature: parsed.searchParams.get("signature"),
      signingSecret: "super-secret",
      now: now + 60_000,
    }),
  ).resolves.toBe(true);
});

test("rejects expired or tampered signed document access", async () => {
  const now = Date.UTC(2026, 2, 11, 0, 0, 0);
  const url = await buildDocumentDeliveryUrl({
    documentId: "doc-123",
    storageUrl: "r2://documents/abc.pdf",
    publicOrigin: "https://backend.example.com",
    signingSecret: "super-secret",
    now,
  });

  const parsed = new URL(url!);
  await expect(
    validateDocumentAccess({
      documentId: "doc-123",
      expires: parsed.searchParams.get("expires"),
      signature: "tampered",
      signingSecret: "super-secret",
      now: now + 60_000,
    }),
  ).resolves.toBe(false);

  await expect(
    validateDocumentAccess({
      documentId: "doc-123",
      expires: parsed.searchParams.get("expires"),
      signature: parsed.searchParams.get("signature"),
      signingSecret: "super-secret",
      now: now + (8 * 24 * 60 * 60 * 1000),
    }),
  ).resolves.toBe(false);
});
