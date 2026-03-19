"use client";

import type { Document } from "@/lib/types";

import { FilesDocumentRow } from "./FilesDocumentRow";
import { emptyBoxStyle, formatMonthLabel } from "./filesUtils";
import { FactIcon } from "@/components/icons";
import { ContractPreview } from "@/components/contractPreview";

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
    return <div style={{ ...emptyBoxStyle, marginBottom: 24 }}>Баримтуудыг ачаалж байна...</div>;
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
    return <div style={{ ...emptyBoxStyle, marginBottom: 24 }}>Ð‘Ð°Ñ€Ð¸Ð¼Ñ‚ Ð¾Ð»Ð´ÑÐ¾Ð½Ð³Ò¯Ð¹.</div>;
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
    <div className="flex flex-col  divide-y divide-[#E5E7EB] w-[1056px] mt-4 rounded-2xl border border-[#E5E7EB] bg-white">
      {documents.length > 0 ? (
        documents.map((document) => (
          <ContractPreview
            key={document.id}
            document={document}
            authToken={authToken}
          />
        ))
      ) : (
        <div className="flex flex-col items-center justify-center gap-3 py-10 text-center">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-[18px] border border-[#E5E7EB] bg-[#F8FAFC]">
            <FactIcon />
          </div>
          <div className="flex flex-col items-center gap-1">
            <h3 className="text-[13px] font-semibold text-[#6B7280]">
              Ð‘Ð°Ñ€Ð¸Ð¼Ñ‚ Ð¾Ð»Ð´ÑÐ¾Ð½Ð³Ò¯Ð¹
            </h3>
          </div>
        </div>
      )}
    </div>
  );
}
