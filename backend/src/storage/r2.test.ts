import assert from "node:assert/strict";
import test from "node:test";

import { buildEmployeeDocumentObjectKey } from "./r2.js";

test("buildEmployeeDocumentObjectKey creates deterministic html object key", () => {
  const key = buildEmployeeDocumentObjectKey({
    employeeId: "emp-001",
    documentId: "doc-123",
    documentName: "EMP001-promotion-2026-03-10.html",
    createdAt: "2026-03-10T12:00:00.000Z",
  });

  assert.equal(
    key,
    "documents/emp-001/2026-03-10/doc-123-EMP001-promotion-2026-03-10.html",
  );
});
