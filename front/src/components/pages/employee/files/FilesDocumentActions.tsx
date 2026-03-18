import type { Document } from "@/lib/types";

import { FilesEyeIcon } from "@/components/icons";
import { FilesActionButton } from "./FilesActionButton";
import { formatDate } from "./filesUtils";

export function FilesDocumentActions({
  document,
  onPreview,
  onDownload,
}: {
  document: Document;
  onPreview: () => void;
  onDownload: () => void;
}) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
      <FilesActionButton title="Харах" onClick={onPreview}>
        <FilesEyeIcon />
      </FilesActionButton>
      <FilesActionButton title="Татах" onClick={onDownload}>
        <svg
          width="15"
          height="15"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          viewBox="0 0 24 24"
        >
          <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M7 10l5 5 5-5M12 15V3" />
        </svg>
      </FilesActionButton>
      <span
        style={{
          color: "#111827",
          fontSize: 12,
          minWidth: 80,
          textAlign: "right",
        }}
      >
        {document.createdAt ? formatDate(document.createdAt) : "—"}
      </span>
    </div>
  );
}

