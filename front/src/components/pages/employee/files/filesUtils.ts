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
  border: "1px solid #E5E7EB",
  background: "white",
  padding: "48px 24px",
  textAlign: "center",
  color: "#6B7280",
  fontSize: 14,
};
