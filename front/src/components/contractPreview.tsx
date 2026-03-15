"use client";

import { useLazyQuery } from "@apollo/client/react";
import { useMemo, useState } from "react";
import { VscPreview } from "react-icons/vsc";
import { BiDownload, BiX } from "react-icons/bi";

import { buildGraphQLHeaders } from "@/lib/apollo-client";
import { GET_DOCUMENT_CONTENT } from "@/graphql/queries";
import type { Document, DocumentContent } from "@/lib/types";

import { DocumentIcon } from "./icons";

type ContractPreviewProps = {
  document: Document;
  authToken: string;
};


function formatDate(value: string) {
  return new Date(value).toLocaleDateString("mn-MN", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });
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
      throw new Error("Баримтын агуулга олдсонгүй.");
    }
    return nextContent;
  }

  async function handlePreview() {
    setPreviewOpen(true);
    setError(null);

    try {
      await ensureContent();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Баримтыг нээж чадсангүй.");
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
      setError(err instanceof Error ? err.message : "Файл татаж чадсангүй.");
    }
  }

  return (
    <>
      <div className="w-80 bg-[#111318] rounded-xl border border-white/10 p-4 shadow-xl shadow-black/40">
        <div className="flex gap-3 mb-4">
          <div className="shrink-0 w-11 h-11 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center text-slate-400">
            <DocumentIcon />
          </div>

          <div className="flex flex-col justify-center min-w-0">
            <p className="text-white text-sm font-semibold leading-tight truncate">
              {document.action}
            </p>
            <p className="text-slate-500 text-xs mt-0.5 truncate">
              {document.documentName}
            </p>
            <p className="text-slate-600 text-xs mt-0.5">
              {formatDate(document.createdAt)}
            </p>
          </div>
        </div>

        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => void handlePreview()}
            className="flex-1 flex items-center justify-center gap-1.5 h-8 rounded-lg text-xs font-medium text-slate-300 bg-white/5 border border-white/10 hover:bg-white/10 hover:text-white hover:border-white/20 transition-all duration-150 cursor-pointer"
          >
            <VscPreview className="text-sm" />
            Харах
          </button>

          <button
            type="button"
            onClick={() => void handleDownload()}
            className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-300 bg-white/5 border border-white/10 hover:bg-white/10 hover:text-white hover:border-white/20 transition-all duration-150 cursor-pointer"
          >
            <BiDownload className="text-sm" />
          </button>
        </div>

        {error ? <p className="mt-3 text-xs text-red-400">{error}</p> : null}
      </div>

      {previewOpen && (
        <div className="fixed inset-0 z-60 flex items-center justify-center">
          <button
            type="button"
            aria-label="Preview close overlay"
            className="absolute inset-0 bg-black/70"
            onClick={() => setPreviewOpen(false)}
          />
          <div className="relative w-225 max-w-[92vw] h-[82vh] bg-[#111318] border border-white/10 rounded-2xl shadow-2xl shadow-black/60 overflow-hidden">
            <div className="flex items-center justify-between px-5 py-4 border-b border-white/10">
              <div className="flex flex-col">
                <p className="text-white text-sm font-semibold">
                  {document.action}
                </p>
                <p className="text-slate-500 text-xs mt-0.5">
                  {document.documentName}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setPreviewOpen(false)}
                className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
              >
                <BiX className="text-lg" />
              </button>
            </div>
            <div className="h-full bg-[#0a0b0f] p-6">
              {loading ? (
                <div className="w-full h-full rounded-xl border border-white/10 flex items-center justify-center text-sm text-slate-400">
                  Баримт ачаалж байна...
                </div>
              ) : error ? (
                <div className="w-full h-full rounded-xl border border-red-500/20 bg-red-500/5 flex items-center justify-center text-sm text-red-400">
                  {error}
                </div>
              ) : content?.contentType === "text/html" ? (
                <iframe
                  title={document.documentName}
                  className="w-full h-full rounded-xl border border-white/10 bg-white"
                  srcDoc={content.content}
                />
              ) : previewUrl ? (
                <iframe
                  title={document.documentName}
                  className="w-full h-full rounded-xl border border-white/10 bg-white"
                  src={previewUrl}
                />
              ) : (
                <div className="w-full h-full rounded-xl border border-white/10 flex items-center justify-center text-sm text-slate-400">
                  Preview бэлэн биш байна.
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
};
