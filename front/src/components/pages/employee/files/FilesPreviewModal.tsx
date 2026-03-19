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
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 p-4">
      <button
        type="button"
        aria-label="Preview close overlay"
        className="absolute inset-0"
        onClick={onClose}
      />
      <div className="relative flex h-[82vh] w-[920px] max-w-[95vw] flex-col overflow-hidden rounded-[24px] border border-black/12 bg-white shadow-2xl">
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
