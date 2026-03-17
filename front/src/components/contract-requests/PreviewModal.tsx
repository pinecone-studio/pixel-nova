import type { DocumentContent } from "@/lib/types";
import { buildDataUrl } from "./utils";

export const PreviewModal = ({
  open,
  loading,
  error,
  content,
  onClose,
}: {
  open: boolean;
  loading: boolean;
  error: string | null;
  content: DocumentContent | null;
  onClose: () => void;
}) => {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <button type="button" aria-label="Close preview" className="absolute inset-0" onClick={onClose} />
      <div className="relative w-[920px] max-w-[95vw] h-[82vh] bg-[#0f1520] rounded-2xl border border-white/10 overflow-hidden shadow-2xl">
        <div className="flex items-center justify-between px-5 py-4 border-b border-white/10">
          <p className="text-sm text-white font-semibold">Inline Preview</p>
          <button type="button" onClick={onClose} className="text-slate-400 hover:text-white">
            ✕
          </button>
        </div>
        <div className="h-[calc(100%-56px)] bg-[#0b0f18] p-4">
          {loading ? (
            <div className="h-full flex items-center justify-center text-slate-500">Ачаалж байна...</div>
          ) : error ? (
            <div className="h-full flex items-center justify-center text-red-400">{error}</div>
          ) : content ? (
            content.contentType === "text/html" ? (
              <iframe title={content.documentName} className="w-full h-full rounded-xl bg-white" srcDoc={content.content} />
            ) : (
              <iframe title={content.documentName} className="w-full h-full rounded-xl bg-white" src={buildDataUrl(content)} />
            )
          ) : (
            <div className="h-full flex items-center justify-center text-slate-500">Preview бэлэн биш байна.</div>
          )}
        </div>
      </div>
    </div>
  );
};
