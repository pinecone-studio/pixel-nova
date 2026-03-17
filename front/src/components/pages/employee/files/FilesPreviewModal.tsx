import type { Document, DocumentContent } from "@/lib/types";

import { FilesPreviewContent } from "./FilesPreviewContent";
import { FilesPreviewHeader } from "./FilesPreviewHeader";

export function FilesPreviewModal({
  document,
  content,
  previewUrl,
  loading,
  error,
  onClose,
}: {
  document: Document;
  content: DocumentContent | null;
  previewUrl: string | null;
  loading: boolean;
  error: string | null;
  onClose: () => void;
}) {
  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 60,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <button
        type="button"
        aria-label="Preview close overlay"
        style={{
          position: "absolute",
          inset: 0,
          background: "rgba(0,0,0,0.70)",
          border: "none",
          cursor: "pointer",
        }}
        onClick={onClose}
      />
      <div
        style={{
          position: "relative",
          width: 900,
          maxWidth: "92vw",
          height: "82vh",
          background: "#111318",
          border: "1px solid rgba(255,255,255,0.10)",
          borderRadius: 16,
          overflow: "hidden",
          boxShadow: "0 25px 60px rgba(0,0,0,0.6)",
        }}
      >
        <FilesPreviewHeader document={document} onClose={onClose} />
        <FilesPreviewContent
          document={document}
          content={content}
          previewUrl={previewUrl}
          loading={loading}
          error={error}
        />
      </div>
    </div>
  );
}
