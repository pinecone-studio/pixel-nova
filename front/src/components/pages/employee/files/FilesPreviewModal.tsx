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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/45">
      <button
        type="button"
        aria-label="Preview close overlay"
        className="absolute inset-0"
        onClick={onClose}
      />
      <div className="relative w-[920px] max-w-[95vw] h-[82vh] bg-white rounded-3xl border border-slate-200 shadow-[0_28px_60px_rgba(15,23,42,0.12)] overflow-hidden">
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
