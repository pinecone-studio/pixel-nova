const DOCUMENT_URL_TTL_SECONDS = 7 * 24 * 60 * 60;

export interface DocumentLinkInput {
  documentId: string;
  storageUrl: string;
  publicOrigin?: string | null;
  signingSecret?: string | null;
  now?: number;
}

export interface ValidateDocumentAccessInput {
  documentId: string;
  expires: string | null;
  signature: string | null;
  signingSecret?: string | null;
  now?: number;
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

function buildSignaturePayload(documentId: string, expiresAt: number) {
  return `${documentId}:${expiresAt}`;
}

function encodeBase64Url(bytes: Uint8Array) {
  return Buffer.from(bytes)
    .toString("base64")
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/g, "");
}

function timingSafeEqual(left: string, right: string) {
  if (left.length !== right.length) {
    return false;
  }

  let diff = 0;
  for (let index = 0; index < left.length; index += 1) {
    diff |= left.charCodeAt(index) ^ right.charCodeAt(index);
  }

  return diff === 0;
}

async function createSignature(secret: string, payload: string) {
  const key = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );
  const signature = await crypto.subtle.sign(
    "HMAC",
    key,
    new TextEncoder().encode(payload),
  );

  return encodeBase64Url(new Uint8Array(signature));
}

export async function buildDocumentDeliveryUrl(input: DocumentLinkInput) {
  const origin = normalizeOrigin(input.publicOrigin);

  if (origin && input.signingSecret) {
    const now = input.now ?? Date.now();
    const expiresAt = Math.floor(now / 1000) + DOCUMENT_URL_TTL_SECONDS;
    const signature = await createSignature(
      input.signingSecret,
      buildSignaturePayload(input.documentId, expiresAt),
    );

    return `${origin}/documents/${input.documentId}?expires=${expiresAt}&signature=${signature}`;
  }

  if (origin && !input.signingSecret) {
    return `${origin}/documents/${input.documentId}`;
  }

  if (isHttpUrl(input.storageUrl)) {
    return input.storageUrl;
  }

  return null;
}

export async function validateDocumentAccess(input: ValidateDocumentAccessInput) {
  if (!input.signingSecret) {
    return true;
  }

  if (!input.expires || !input.signature) {
    return false;
  }

  const expiresAt = Number(input.expires);
  if (!Number.isInteger(expiresAt) || expiresAt <= 0) {
    return false;
  }

  const nowSeconds = Math.floor((input.now ?? Date.now()) / 1000);
  if (expiresAt < nowSeconds) {
    return false;
  }

  const expectedSignature = await createSignature(
    input.signingSecret,
    buildSignaturePayload(input.documentId, expiresAt),
  );

  return timingSafeEqual(expectedSignature, input.signature);
}
