export interface UploadEmployeeDocumentInput {
  bucket: R2Bucket;
  employeeId: string;
  documentId: string;
  documentName: string;
  content: string;
  contentType: string;
  createdAt: string;
}

function toDatePrefix(createdAt: string) {
  return createdAt.slice(0, 10);
}

function sanitizeFileName(documentName: string) {
  return documentName.replace(/[^a-zA-Z0-9._-]+/g, "-");
}

export function buildEmployeeDocumentObjectKey(input: {
  employeeId: string;
  documentId: string;
  documentName: string;
  createdAt: string;
}) {
  return `documents/${input.employeeId}/${toDatePrefix(input.createdAt)}/${input.documentId}-${sanitizeFileName(input.documentName)}`;
}

export async function uploadEmployeeDocumentToR2(
  input: UploadEmployeeDocumentInput,
) {
  const key = buildEmployeeDocumentObjectKey({
    employeeId: input.employeeId,
    documentId: input.documentId,
    documentName: input.documentName,
    createdAt: input.createdAt,
  });

  await input.bucket.put(key, input.content, {
    httpMetadata: {
      contentType: input.contentType,
    },
  });

  return key;
}
