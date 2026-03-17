import type { Document } from "@/lib/types";

export function FilesDocumentInfo({ document }: { document: Document }) {
  return (
    <>
      <div
        style={{
          width: 36,
          height: 36,
          background: "rgba(255,255,255,0.07)",
          borderRadius: 8,
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
          stroke="rgba(148,163,184,0.6)"
          strokeWidth="1.5"
          viewBox="0 0 24 24"
        >
          <path d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
      </div>

      <div style={{ flex: 1 }}>
        <div style={{ color: "#e2e8f0", fontSize: 14, fontWeight: 500 }}>
          {document.documentName}
        </div>
        <div
          style={{
            color: "rgba(148,163,184,0.45)",
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
