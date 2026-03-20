"use client";

import { useLazyQuery } from "@apollo/client/react";
import { useMemo, useState } from "react";

import { GET_DOCUMENT_CONTENT } from "@/graphql/queries";
import { buildGraphQLHeaders } from "@/lib/apollo-client";
import type { Document, DocumentContent } from "@/lib/types";

import { FilesPreviewModal } from "./FilesPreviewModal";
import { buildDataUrl } from "./filesUtils";
import {
  ReqIcon,
  EyeIcon,
  DownloadIcon,
  CalIcon,
  FilesEyeIcon,
} from "@/components/icons";
import { BiDownload } from "react-icons/bi";

export function FilesDocumentRow({
  document,
  authToken,
  isLast,
}: {
  document: Document;
  authToken: string;
  isLast: boolean;
}) {
  const [hovered, setHovered] = useState(false);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [loadContent, { data, loading }] = useLazyQuery<{
    documentContent: DocumentContent | null;
  }>(GET_DOCUMENT_CONTENT, { fetchPolicy: "network-only" });

  const content = data?.documentContent ?? null;
  const previewUrl = useMemo(
    () => (content ? buildDataUrl(content) : null),
    [content],
  );

  const formatDate = (value: string) => {
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return value;
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}/${month}/${day}`;
  };

  async function ensureContent() {
    if (content) return content;
    const result = await loadContent({
      variables: { documentId: document.id },
      context: { headers: buildGraphQLHeaders({ authToken }) },
    });
    const next = result.data?.documentContent ?? null;
    if (!next) throw new Error("Баримтын агуулга олдсонгүй.");
    return next;
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
      const nextContent = await ensureContent();
      const link = window.document.createElement("a");
      link.href = buildDataUrl(nextContent);
      link.download = nextContent.documentName;
      window.document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Файл татаж чадсангүй.");
    }
  }

  return (
    <>
      <div
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        className={`grid h-[89px] items-center px-5 py-5 transition-colors ${hovered ? "bg-[#fafafa]" : "bg-white"} ${
          isLast ? "" : "border-b border-[#DFDFDF]"
        }`}
        style={{
          gridTemplateColumns: "minmax(220px,1fr) auto",
        }}
      >
        <div className="flex items-center gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-[16px] border-2 border-black/12 bg-white text-[#121316]">
            <ReqIcon className="h-5 w-5 text-[#121316]" />
          </div>
          <div className="flex flex-col gap-1">
            <p className="text-[16px] font-medium tracking-[-0.096px] text-black">
              {document.documentName}
            </p>
            <p className="text-[14px] tracking-[-0.084px] text-[rgba(63,65,69,0.7)]">
              {document.action}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-[30px]">
          <div className="flex items-center gap-2">
            <button
              onClick={() => void handlePreview()}
              className="flex h-10 w-10 items-center justify-center rounded-[10px] text-[#121316] transition-colors hover:bg-[#f5f5f5] cursor-pointer"
              aria-label="Урьдчилж харах"
            >
              <FilesEyeIcon />
            </button>
            <button
              onClick={() => void handleDownload()}
              className="flex h-10 w-10 items-center justify-center rounded-[10px] text-[#121316] transition-colors hover:bg-[#f5f5f5] cursor-pointer"
              aria-label="Татах"
            >
              <BiDownload className="text-[#121316]" />
            </button>
          </div>
          <span className="text-[14px] font-medium leading-5 text-black">
            {formatDate(document.createdAt)}
          </span>
        </div>
      </div>

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
}
