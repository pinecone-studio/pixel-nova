"use client";

import type { Document } from "@/lib/types";

import { FilesDocumentRow } from "./FilesDocumentRow";
import { emptyBoxStyle } from "./filesUtils";

export function FilesList({
  loading,
  error,
  documents,
  authToken,
}: {
  loading: boolean;
  error: string | null;
  documents: Document[];
  authToken: string;
}) {
  if (loading) {
    return <div style={emptyBoxStyle}>Баримтуудыг ачаалж байна...</div>;
  }

  if (error) {
    return (
      <div
        style={{
          ...emptyBoxStyle,
          border: "1px solid rgba(239,68,68,0.2)",
          background: "rgba(239,68,68,0.05)",
          color: "#f87171",
        }}
      >
        {error}
      </div>
    );
  }

  if (documents.length === 0) {
    return <div style={emptyBoxStyle}>Баримт олдсонгүй.</div>;
  }

  return (
    <div
      style={{
        borderRadius: 14,
        overflow: "hidden",
        border: "1px solid rgba(255,255,255,0.08)",
        background: "rgba(255,255,255,0.02)",
      }}
    >
      {documents.map((document, index) => (
        <FilesDocumentRow
          key={document.id}
          document={document}
          authToken={authToken}
          isLast={index === documents.length - 1}
        />
      ))}
    </div>
  );
}
