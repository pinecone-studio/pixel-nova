"use client";

import { useLazyQuery } from "@apollo/client/react";
import { useMemo, useState } from "react";

import { GET_DOCUMENT_CONTENT } from "@/graphql/queries";
import { buildGraphQLHeaders } from "@/lib/apollo-client";
import type { Document, DocumentContent } from "@/lib/types";

import { FilesDocumentActions } from "./FilesDocumentActions";
import { FilesDocumentInfo } from "./FilesDocumentInfo";
import { FilesPreviewModal } from "./FilesPreviewModal";
import { buildDataUrl } from "./filesUtils";

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
        style={{
          display: "flex",
          alignItems: "center",
          gap: 14,
          padding: "14px 18px",
          borderBottom: isLast ? "none" : "1px solid #E5E7EB",
          background: hovered ? "#F8FAFC" : "white",
          transition: "background 0.12s",
          cursor: "default",
        }}
      >
        <FilesDocumentInfo document={document} />
        <FilesDocumentActions
          document={document}
          onPreview={() => void handlePreview()}
          onDownload={() => void handleDownload()}
        />
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
