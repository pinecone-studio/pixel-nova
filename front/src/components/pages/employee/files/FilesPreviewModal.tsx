import { createPortal } from "react-dom";

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
  if (typeof window === "undefined") {
    return null;
  }

  return createPortal(
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 9999,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "24px 16px",
      }}
    >
      <button
        type="button"
        aria-label="Preview close overlay"
        style={{
          position: "absolute",
          inset: 0,
          background:
            "linear-gradient(180deg, rgba(255,255,255,0.96) 0%, rgba(255,255,255,0.98) 100%)",
          border: "none",
          cursor: "pointer",
          backdropFilter: "blur(12px)",
        }}
        onClick={onClose}
      />
      <div
        style={{
          position: "relative",
          width: 1080,
          maxWidth: "min(1080px, 92vw)",
          height: "min(860px, calc(100vh - 48px))",
          background: "#FFFFFF",
          border: "1px solid #E5E7EB",
          borderRadius: 28,
          overflow: "hidden",
          boxShadow: "0 24px 80px rgba(15, 23, 42, 0.12)",
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
    </div>,
    window.document.body,
  );
}
