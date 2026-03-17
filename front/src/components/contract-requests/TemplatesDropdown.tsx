import { FiDownload, FiEye, FiFileText } from "react-icons/fi";
import type { ContractRequest } from "@/lib/types";
import { formatTemplateFilename, formatTemplateLabel } from "./utils";

export const TemplatesDropdown = ({
  row,
  onPreview,
  onDownload,
}: {
  row: ContractRequest;
  onPreview: (row: ContractRequest, templateId: string, index: number) => void;
  onDownload: (row: ContractRequest, templateId: string, index: number) => void;
}) => {
  return (
    <div className="rounded-xl border border-white/10 bg-[#0c111b] overflow-hidden">
      {row.templateIds.map((id, index) => (
        <div
          key={id}
          className={`flex items-center justify-between px-4 py-3 ${index < row.templateIds.length - 1 ? "border-b border-white/5" : ""}`}
        >
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-lg border border-white/10 bg-white/5 flex items-center justify-center text-slate-300">
              <FiFileText className="text-base" />
            </div>
            <div>
              <p className="text-sm text-white font-medium">
                {formatTemplateLabel(id)}
              </p>
              <p className="text-xs text-slate-500">
                {formatTemplateFilename(id, index)}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3 text-slate-400">
            <button
              type="button"
              onClick={(event) => {
                event.stopPropagation();
                onPreview(row, id, index);
              }}
              className="hover:text-white transition-colors"
            >
              <FiEye className="text-sm" />
            </button>
            <button
              type="button"
              onClick={(event) => {
                event.stopPropagation();
                onDownload(row, id, index);
              }}
              className="hover:text-white transition-colors"
            >
              <FiDownload className="text-sm" />
            </button>
            <span className="text-[11px] text-slate-500">
              {new Date(row.createdAt).toLocaleDateString("mn-MN")}
            </span>
          </div>
        </div>
      ))}
    </div>
  );
};
