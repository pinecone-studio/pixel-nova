export interface RenderPdfInput {
  html: string;
  documentName: string;
  serviceUrl: string;
  secret?: string | null;
}

function normalizeServiceUrl(url: string) {
  return url.replace(/\/+$/, "");
}

export async function renderPdfFromService(input: RenderPdfInput) {
  const headers = new Headers({
    "Content-Type": "application/json",
  });

  if (input.secret) {
    headers.set("x-renderer-secret", input.secret);
  }

  const response = await fetch(`${normalizeServiceUrl(input.serviceUrl)}/render-pdf`, {
    method: "POST",
    headers,
    body: JSON.stringify({
      html: input.html,
      documentName: input.documentName,
    }),
  });

  if (!response.ok) {
    const errorBody = await response.text();
    throw new Error(`PDF render failed: ${response.status} ${errorBody}`);
  }

  return new Uint8Array(await response.arrayBuffer());
}
