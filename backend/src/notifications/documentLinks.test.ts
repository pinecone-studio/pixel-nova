import { expect, test } from "@jest/globals";

import { buildDocumentDeliveryUrl } from "./documentLinks.js";

test("builds backend document endpoint when public origin is available", () => {
  expect(
    buildDocumentDeliveryUrl({
      documentId: "doc-123",
      storageUrl: "r2://documents/abc.html",
      publicOrigin: "https://backend.example.com",
    }),
  ).toBe("https://backend.example.com/documents/doc-123");
});

test("trims trailing slash from public origin", () => {
  expect(
    buildDocumentDeliveryUrl({
      documentId: "doc-123",
      storageUrl: "data:text/plain,hello",
      publicOrigin: "https://backend.example.com///",
    }),
  ).toBe("https://backend.example.com/documents/doc-123");
});

test("falls back to http storage url when no public origin is available", () => {
  expect(
    buildDocumentDeliveryUrl({
      documentId: "doc-123",
      storageUrl: "https://cdn.example.com/doc-123.html",
      publicOrigin: null,
    }),
  ).toBe("https://cdn.example.com/doc-123.html");
});

test("returns null for internal-only storage urls when public origin is missing", () => {
  expect(
    buildDocumentDeliveryUrl({
      documentId: "doc-123",
      storageUrl: "r2://documents/abc.html",
      publicOrigin: null,
    }),
  ).toBeNull();
});
