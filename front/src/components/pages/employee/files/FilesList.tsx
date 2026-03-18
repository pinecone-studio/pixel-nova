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
        borderRadius: 16,
        overflow: "hidden",
        border: "1px solid #DFDFDF",
        background: "white",
        boxShadow:
          "0px 1px 3px 0px rgba(0,0,0,0.08), 0px 1px 2px -1px rgba(0,0,0,0.08)",
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
