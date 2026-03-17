import type { CSSProperties } from "react";

import type { DocumentContent } from "@/lib/types";

export function formatDate(value: string) {
  return new Date(value)
    .toLocaleDateString("mn-MN", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    })
    .replace(/\./g, "/");
}

export function buildDataUrl(content: DocumentContent) {
  if (content.contentType === "application/pdf") {
    return `data:${content.contentType};base64,${content.content}`;
  }
  if (content.contentType.startsWith("text/")) {
    return `data:${content.contentType};charset=utf-8,${encodeURIComponent(content.content)}`;
  }
  return `data:${content.contentType};base64,${content.content}`;
}

export const emptyBoxStyle: CSSProperties = {
  borderRadius: 14,
  border: "1px solid rgba(255,255,255,0.08)",
  background: "rgba(255,255,255,0.02)",
  padding: "48px 24px",
  textAlign: "center",
  color: "rgba(148,163,184,0.5)",
  fontSize: 14,
};
