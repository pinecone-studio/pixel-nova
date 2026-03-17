import type { Document } from "@/lib/types";

export function FilesPreviewHeader({
  document,
  onClose,
}: {
  document: Document;
  onClose: () => void;
}) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "16px 20px",
        borderBottom: "1px solid rgba(255,255,255,0.10)",
      }}
    >
      <div>
        <p
          style={{
            color: "#fff",
            fontSize: 14,
            fontWeight: 600,
            margin: 0,
          }}
        >
          {document.action}
        </p>
        <p
          style={{
            color: "rgba(148,163,184,0.5)",
            fontSize: 12,
            marginTop: 2,
          }}
        >
          {document.documentName}
        </p>
      </div>
      <button
        type="button"
        onClick={onClose}
        style={{
          width: 32,
          height: 32,
          borderRadius: 8,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: "rgba(148,163,184,0.6)",
          background: "transparent",
          border: "none",
          cursor: "pointer",
          fontSize: 18,
        }}
      >
        ✕
      </button>
    </div>
  );
}
