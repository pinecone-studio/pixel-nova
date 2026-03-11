export interface DocumentLinkInput {
  documentId: string;
  storageUrl: string;
  publicOrigin?: string | null;
}

function normalizeOrigin(origin?: string | null) {
  if (!origin) {
    return null;
  }

  const trimmed = origin.trim().replace(/\/+$/, "");
  return trimmed.length > 0 ? trimmed : null;
}

function isHttpUrl(value: string) {
  return value.startsWith("http://") || value.startsWith("https://");
}

export function buildDocumentDeliveryUrl(input: DocumentLinkInput) {
  const origin = normalizeOrigin(input.publicOrigin);

  if (origin) {
    return `${origin}/documents/${input.documentId}`;
  }

  if (isHttpUrl(input.storageUrl)) {
    return input.storageUrl;
  }

  return null;
}
