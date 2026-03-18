"use client";

import { useLazyQuery } from "@apollo/client/react";
import { useMemo, useState } from "react";
import { VscPreview } from "react-icons/vsc";
import { BiDownload } from "react-icons/bi";

import { buildGraphQLHeaders } from "@/lib/apollo-client";
import { GET_DOCUMENT_CONTENT } from "@/graphql/queries";
import type { Document, DocumentContent } from "@/lib/types";

import { DocumentIcon } from "./icons";
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
      <div className="flex h-[76px] w-full items-center justify-between px-4">
        <div className="flex min-w-0 items-center gap-3">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-[#E5E7EB] bg-[#F8FAFC] text-slate-500">
            <DocumentIcon />
          </div>

          <div className="min-w-0">
            <p className="truncate text-[14px] font-semibold text-[#111827]">
              {document.action}
            </p>
            <p className="truncate text-[12px] text-[#6B7280]">
              {document.documentName}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 text-[12px] text-[#6B7280]">
          <button
            type="button"
            onClick={() => void handlePreview()}
            className="flex h-8 w-8 items-center justify-center rounded-full border border-[#E5E7EB] bg-white text-[#6B7280] transition-colors hover:bg-[#F3F4F6] hover:text-[#111827]"
            aria-label="Preview"
          >
            <VscPreview className="text-sm" />
          </button>

          <button
            type="button"
            onClick={() => void handleDownload()}
            className="flex h-8 w-8 items-center justify-center rounded-full border border-[#E5E7EB] bg-white text-[#6B7280] transition-colors hover:bg-[#F3F4F6] hover:text-[#111827]"
            aria-label="Download"
          >
            <BiDownload className="text-sm" />
          </button>

          <span className="text-[#6B7280]">
            {formatDate(document.createdAt)}
          </span>
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
