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
          border: "1px solid #FECACA",
          background: "#FEF2F2",
          color: "#DC2626",
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
        border: "1px solid #E5E7EB",
        background: "white",
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
