import type { Document } from "@/lib/types";

export function FilesDocumentInfo({ document }: { document: Document }) {
  return (
    <>
      <div
        style={{
          width: 36,
          height: 36,
          background: "#F8FAFC",
          border: "1px solid #E5E7EB",
          borderRadius: 999,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          flexShrink: 0,
        }}
      >
        <svg
          width="16"
          height="16"
          fill="none"
          stroke="#14B8A6"
          strokeWidth="1.5"
          viewBox="0 0 24 24"
        >
          <path d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
      </div>

      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ color: "#111827", fontSize: 14, fontWeight: 600 }}>
          {document.documentName}
        </div>
        <div
          style={{
            color: "#6B7280",
            fontSize: 12,
            marginTop: 2,
          }}
        >
          {document.action}
        </div>
      </div>
    </>
  );
}
