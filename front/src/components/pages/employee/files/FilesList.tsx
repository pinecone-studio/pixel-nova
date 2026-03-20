"use client";

import type { Document } from "@/lib/types";

import { emptyBoxStyle } from "./filesUtils";
import { FactIcon } from "@/components/icons";
import { FilesDocumentRow } from "./FilesDocumentRow";

const HIDDEN_ACTIONS = new Set(["offboard_employee"]);

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
    return (
      <div style={{ ...emptyBoxStyle, marginBottom: 24, marginTop: 24 }}>
        Баримтуудыг ачаалж байна...
      </div>
    );
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

  const visible = documents.filter((d) => !HIDDEN_ACTIONS.has(d.action));

  if (visible.length === 0) {
    return (
      <div style={{ ...emptyBoxStyle, marginBottom: 24 }}>Баримт олдсонгүй</div>
    );
  }

  return (
    <div className="mt-4 flex w-[1056px] flex-col overflow-hidden rounded-[24px] bg-white">
      {visible.length > 0 ? (
        visible.map((document, index) => (
          <FilesDocumentRow
            key={document.id}
            document={document}
            authToken={authToken}
            isLast={index === visible.length - 1}
          />
        ))
      ) : (
        <div className="flex flex-col items-center justify-center gap-3 py-10 text-center">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-[18px] border border-[#E5E7EB] bg-[#F8FAFC]">
            <FactIcon />
          </div>
          <div className="flex flex-col items-center gap-1">
            <h3 className="text-[13px] font-semibold text-[#6B7280]">
              Баримт олдсонгүй
            </h3>
          </div>
        </div>
      )}
    </div>
  );
}
