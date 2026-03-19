import type { Document } from "@/lib/types";
import { FiX } from "react-icons/fi";

export function FilesPreviewHeader({
  document,
  onClose,
}: {
  document: Document;
  onClose: () => void;
}) {
  return (
    <div className="flex items-center justify-between border-b border-black/12 px-6 py-4">
      <div>
        <h3 className="text-[16px] font-semibold text-[#121316]">
          {document.action}
        </h3>
        <p className="text-[13px] text-[#3f4145]">{document.documentName}</p>
      </div>
      <button
        onClick={onClose}
        className="flex h-8 w-8 items-center justify-center rounded-[10px] text-[#77818c] transition-colors hover:bg-[#f5f5f5] hover:text-[#121316]"
      >
        <FiX className="h-5 w-5" />
      </button>
    </div>
  );
}
