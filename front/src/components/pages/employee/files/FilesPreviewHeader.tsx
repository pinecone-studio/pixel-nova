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
        padding: "22px 24px 18px",
        borderBottom: "1px solid #E5E7EB",
        background: "#FFFFFF",
      }}
    >
      <div>
        <p
          style={{
            color: "#111827",
            fontSize: 18,
            fontWeight: 600,
            margin: 0,
          }}
        >
          {document.action}
        </p>
        <p
          style={{
            color: "#64748B",
            fontSize: 14,
            marginTop: 6,
          }}
        >
          {document.documentName}
        </p>
      </div>
      <button
        type="button"
        onClick={onClose}
        style={{
          width: 40,
          height: 40,
          borderRadius: 12,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: "#111827",
          background: "#F8FAFC",
          border: "1px solid #E5E7EB",
          cursor: "pointer",
          fontSize: 22,
        }}
      >
        ✕
      </button>
    </div>
  );
}
