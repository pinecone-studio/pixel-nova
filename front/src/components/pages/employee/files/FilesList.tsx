"use client";

import type { Document } from "@/lib/types";

import { FilesDocumentRow } from "./FilesDocumentRow";
import { emptyBoxStyle, formatMonthLabel } from "./filesUtils";

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

  const sorted = [...documents].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
  );
  const grouped = sorted.reduce<Map<string, Document[]>>((acc, doc) => {
    const key = formatMonthLabel(doc.createdAt);
    if (!acc.has(key)) acc.set(key, []);
    acc.get(key)?.push(doc);
    return acc;
  }, new Map());

  return (
    <div className="flex flex-col gap-4">
      {[...grouped.entries()].map(([month, docs]) => (
        <div key={month} className="flex flex-col gap-2">
          <div className="text-xs font-semibold text-slate-500 uppercase tracking-[0.18em]">
            {month}
          </div>
          <div
            style={{
              borderRadius: 14,
              overflow: "hidden",
              border: "1px solid #E5E7EB",
              background: "white",
            }}
          >
            {docs.map((document, index) => (
              <FilesDocumentRow
                key={document.id}
                document={document}
                authToken={authToken}
                isLast={index === docs.length - 1}
              />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
