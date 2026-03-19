"use client";

import { useLazyQuery } from "@apollo/client/react";
import { useMemo, useState } from "react";
import { BiDownload } from "react-icons/bi";

import { buildGraphQLHeaders } from "@/lib/apollo-client";
import { GET_DOCUMENT_CONTENT } from "@/graphql/queries";
import type { Document, DocumentContent } from "@/lib/types";

import { DocumentIcon, FilesEyeIcon } from "./icons";
import { FilesPreviewModal } from "./pages/employee/files/FilesPreviewModal";

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
      <div className="flex h-[88px] w-full items-center justify-between w-[1054px] px-4 py-[20px]">
        <div className="flex min-w-0 items-center justify-between w-[990px] gap-4 h-[48px]">
          <div className="flex gap-4">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg border border-[#E5E7EB] bg-[#F8FAFC] text-slate-500">
              <DocumentIcon />
            </div>

            <div className="min-w-0">
              <p className="truncate text-[16px] font-semibold text-[#111827]">
                {document.action}
              </p>
              <p className="truncate text-[14px] text-[#6B7280]">
                {document.documentName}
              </p>
            </div>
          </div>

          <div className="flex items-center justify-between gap-3 text-[12px] w-[191.8px] h-10 text-[#6B7280]">
            <div className="w-[88px] h-10 flex justify-between">
              {" "}
              <button
                type="button"
                onClick={() => void handlePreview()}
                className="flex h-10 w-10 items-center justify-center rounded-full bg-white text-[#111827] transition-colors cursor-pointer hover:bg-[#F3F4F6]"
                aria-label="Preview"
              >
                <FilesEyeIcon />
              </button>
              <button
                type="button"
                onClick={() => void handleDownload()}
                className="flex h-10 w-10 items-center justify-center rounded-full bg-white text-[#111827] cursor-pointer transition-colors hover:bg-[#F3F4F6]"
                aria-label="Download"
              >
                <BiDownload className="text-sm text-[#000000] w-[20px] h-[20px]" />
              </button>
            </div>

            <span className="text-[#111827] text-[14px] w-[73.8] h-5">
              {formatDate(document.createdAt)}
            </span>
          </div>
        </div>
      </div>

      {error ? (
        <p className="px-4 pb-3 text-[12px] text-red-400">{error}</p>
      ) : null}

      {previewOpen ? (
        <FilesPreviewModal
          document={document}
          content={content}
          previewUrl={previewUrl}
          loading={loading}
          error={error}
          onClose={() => setPreviewOpen(false)}
        />
      ) : null}
    </>
  );
};
