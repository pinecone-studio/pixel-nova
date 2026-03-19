"use client";

import { useLazyQuery } from "@apollo/client/react";
import { useMemo, useState } from "react";
import { createPortal } from "react-dom";

import { buildGraphQLHeaders } from "@/lib/apollo-client";
import { GET_DOCUMENT_CONTENT } from "@/graphql/queries";
import type { Document, DocumentContent } from "@/lib/types";

import { ReqIcon, EyeIcon, DownloadIcon, CalIcon } from "./icons";

type ContractPreviewProps = {
  document: Document;
  authToken: string;
};

function formatDate(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}/${month}/${day}`;
}

function buildDataUrl(content: DocumentContent) {
  if (content.contentType === "application/pdf") {
    return `data:${content.contentType};base64,${content.content}`;
  }

  if (content.contentType.startsWith("text/")) {
    return `data:${content.contentType};charset=utf-8,${encodeURIComponent(content.content)}`;
  }

  return `data:${content.contentType};base64,${content.content}`;
}

export const ContractPreview = ({
  document,
  authToken,
}: ContractPreviewProps) => {
  const [previewOpen, setPreviewOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [loadContent, { data, loading }] = useLazyQuery<{
    documentContent: DocumentContent | null;
  }>(GET_DOCUMENT_CONTENT, {
    fetchPolicy: "network-only",
  });

  const content = data?.documentContent ?? null;
  const previewUrl = useMemo(() => {
    if (!content) return null;
    return buildDataUrl(content);
  }, [content]);

  async function ensureContent() {
    if (content) return content;

    const result = await loadContent({
      variables: { documentId: document.id },
      context: {
        headers: buildGraphQLHeaders({ authToken }),
      },
    });

    const nextContent = result.data?.documentContent ?? null;
    if (!nextContent) {
      throw new Error("???????? ??????? ?????????.");
    }
    return nextContent;
  }

  async function handlePreview() {
    setPreviewOpen(true);
    setError(null);

    try {
      await ensureContent();
    } catch (err) {
      setError(err instanceof Error ? err.message : "???????? ???? ?????????.");
    }
  }

  async function handleDownload() {
    setError(null);

    try {
      const currentContent = await ensureContent();
      const href = buildDataUrl(currentContent);
      const link = window.document.createElement("a");
      link.href = href;
      link.download = currentContent.documentName;
      window.document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (err) {
      setError(err instanceof Error ? err.message : "???? ????? ?????????.");
    }
  }

  return (
    <>
      <div
        className="grid items-center border-b border-[#E5E7EB] px-5 py-3 transition-colors hover:bg-[#fafafa]"
        style={{
          gridTemplateColumns:
            "minmax(220px,2fr) minmax(140px,1fr) 72px",
        }}
      >
        <div className="flex items-center gap-2.5 px-2">
          <div className="flex h-10 w-10 items-center justify-center rounded-[14px] border border-black/12 bg-white text-[#121316]">
            <ReqIcon className="h-4 w-4 text-[#121316]" />
          </div>
          <div>
            <p className="text-[14px] font-medium text-[#121316]">
              {document.documentName}
            </p>
            <p className="text-[12px] text-[#3f4145b3]">
              {document.action}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2 px-2">
          <CalIcon className="h-4 w-4 text-[#77818c]" />
          <span className="text-[14px] text-[#3f4145]">
            {formatDate(document.createdAt)}
          </span>
        </div>
        <div className="flex items-center gap-0">
          <button
            onClick={() => void handlePreview()}
            className="flex h-8 w-8 items-center justify-center rounded-[10px] text-[#77818c] transition-colors hover:bg-[#f5f5f5] hover:text-[#121316] cursor-pointer"
            aria-label="Урьдчилж харах"
          >
            <EyeIcon />
          </button>
          <button
            onClick={() => void handleDownload()}
            className="flex h-8 w-8 items-center justify-center rounded-[10px] text-[#77818c] transition-colors hover:bg-[#f5f5f5] hover:text-[#121316] cursor-pointer"
            aria-label="Татах"
          >
            <DownloadIcon className="text-[#77818c]" />
          </button>
        </div>
      </div>

      {error ? (
        <p className="px-4 pb-3 text-[12px] text-red-400">{error}</p>
      ) : null}

      {previewOpen && typeof document !== "undefined"
        ? createPortal(
            <div
              className="fixed inset-0 z-50 flex items-center justify-center bg-black/45"
              onClick={() => setPreviewOpen(false)}
            >
              <div
                className="relative w-[920px] max-w-[95vw] h-[82vh] bg-white rounded-3xl border border-slate-200 shadow-[0_28px_60px_rgba(15,23,42,0.12)] overflow-hidden"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200">
                  <div>
                    <p className="text-slate-900 font-semibold text-base">
                      {content?.documentName ?? document.documentName}
                    </p>
                    <p className="text-slate-400 text-xs mt-0.5">
                      {document.action}
                    </p>
                  </div>
                  <button
                    onClick={() => setPreviewOpen(false)}
                    className="text-slate-400 hover:text-slate-700 transition-colors text-lg cursor-pointer"
                  >
                    ✕
                  </button>
                </div>

                <div className="h-[calc(82vh-64px)] bg-slate-50 p-6">
                  {loading ? (
                    <div className="w-full h-full rounded-2xl border border-slate-200 flex items-center justify-center text-slate-400 text-sm">
                      Уншиж байна...
                    </div>
                  ) : error ? (
                    <div className="w-full h-full rounded-2xl border border-red-200 bg-red-50 flex items-center justify-center text-red-500 text-sm">
                      {error}
                    </div>
                  ) : content?.contentType === "text/html" ? (
                    <iframe
                      title={content.documentName}
                      className="w-full h-full rounded-2xl bg-white border border-slate-200"
                      srcDoc={content.content}
                    />
                  ) : content && previewUrl ? (
                    <iframe
                      title={content.documentName}
                      className="w-full h-full rounded-2xl bg-white border border-slate-200"
                      src={previewUrl}
                    />
                  ) : (
                    <div className="w-full h-full rounded-2xl border border-slate-200 flex items-center justify-center text-slate-500 text-sm bg-white">
                      Урьдчилан харах боломжгүй байна.
                    </div>
                  )}
                </div>
              </div>
            </div>,
            window.document.body,
          )
        : null}
    </>
  );
};
