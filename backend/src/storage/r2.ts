// R2Bucket is provided by Cloudflare Workers runtime types; declare a minimal
// fallback so the file compiles in test builds that only include @types/node.
declare global {
  interface R2Bucket {
    put(key: string, value: unknown, options?: unknown): Promise<unknown>;
  }
}

export interface UploadEmployeeDocumentInput {
  bucket: R2Bucket;
  employeeId: string;
  employeeCode: string;
  lastName: string;
  firstName: string;
  phase: string;
  action: string;
  order: string;
  templateId: string;
  documentId: string;
  documentName: string;
  content: string;
  contentType: string;
  createdAt: string;
}

function toDatePrefix(createdAt: string) {
  return createdAt.slice(0, 10);
}

function sanitizePart(value: string) {
  return value.replace(/[^a-zA-Z0-9._\u0400-\u04FF-]+/g, "-").replace(/-+/g, "-").replace(/^-|-$/g, "");
}

/**
 * TDD-д нийцсэн R2 object key бүтэц:
 * documents/{employeeCode}_{lastName}{firstName}/{phase}/{YYYY-MM-DD}_{action}/{order}_{templateId}.html
 */
export function buildEmployeeDocumentObjectKey(input: {
  employeeCode: string;
  lastName: string;
  firstName: string;
  phase: string;
  action: string;
  order: string;
  templateId: string;
  createdAt: string;
}) {
  const employeeFolder = `${sanitizePart(input.employeeCode)}_${sanitizePart(input.lastName)}${sanitizePart(input.firstName)}`;
  const dateAction = `${toDatePrefix(input.createdAt)}_${sanitizePart(input.action)}`;
  const fileName = `${input.order}_${sanitizePart(input.templateId)}.html`;

  return `documents/${employeeFolder}/${sanitizePart(input.phase)}/${dateAction}/${fileName}`;
}

export async function uploadEmployeeDocumentToR2(
  input: UploadEmployeeDocumentInput,
) {
  const key = buildEmployeeDocumentObjectKey({
    employeeCode: input.employeeCode,
    lastName: input.lastName,
    firstName: input.firstName,
    phase: input.phase,
    action: input.action,
    order: input.order,
    templateId: input.templateId,
    createdAt: input.createdAt,
  });

  await input.bucket.put(key, input.content, {
    httpMetadata: {
      contentType: input.contentType,
    },
  });

  return key;
}
