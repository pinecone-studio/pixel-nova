"use client";

import { useLazyQuery } from "@apollo/client/react";
import { useMemo, useState } from "react";

import { buildGraphQLHeaders } from "@/lib/apollo-client";
import { GET_DOCUMENT_CONTENT } from "@/graphql/queries";
import type { Document, DocumentContent } from "@/lib/types";

// ─── helpers ────────────────────────────────────────────────────────────────

function formatDate(value: string) {
  return new Date(value)
    .toLocaleDateString("mn-MN", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    })
    .replace(/\./g, "/");
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

// ─── ActionBtn ───────────────────────────────────────────────────────────────

function ActionBtn({
  children,
  title,
  onClick,
}: {
  children: React.ReactNode;
  title?: string;
  onClick?: () => void;
}) {
  const [hovered, setHovered] = useState(false);
  return (
    <span
      title={title}
      onClick={onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        color: hovered ? "rgba(148,163,184,0.85)" : "rgba(148,163,184,0.4)",
        cursor: "pointer",
        transition: "color 0.12s",
        display: "flex",
      }}
    >
      {children}
    </span>
  );
}

// ─── ContractPreview ─────────────────────────────────────────────────────────

type ContractPreviewProps = {
  document: Document;
  authToken: string;
};

export const ContractPreview = ({
  document,
  authToken,
}: ContractPreviewProps) => {
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
      const c = await ensureContent();
      const link = window.document.createElement("a");
      link.href = buildDataUrl(c);
      link.download = c.documentName;
      window.document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Файл татаж чадсангүй.");
    }
  }

  return (
    <>
      {/* Inline actions: eye + download + date */}
      <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
        <ActionBtn title="Харах" onClick={() => void handlePreview()}>
          <svg
            width="15"
            height="15"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            viewBox="0 0 24 24"
          >
            <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
            <circle cx="12" cy="12" r="3" />
          </svg>
        </ActionBtn>
        <ActionBtn title="Татах" onClick={() => void handleDownload()}>
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
        </ActionBtn>
        <span
          style={{
            color: "rgba(148,163,184,0.35)",
            fontSize: 12,
            minWidth: 80,
            textAlign: "right",
          }}
        >
          {document.createdAt ? formatDate(document.createdAt) : "—"}
        </span>
      </div>

      {/* Preview modal */}
      {previewOpen && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 60,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <button
            type="button"
            aria-label="Preview close overlay"
            style={{
              position: "absolute",
              inset: 0,
              background: "rgba(0,0,0,0.70)",
              border: "none",
              cursor: "pointer",
            }}
            onClick={() => setPreviewOpen(false)}
          />
          <div
            style={{
              position: "relative",
              width: 900,
              maxWidth: "92vw",
              height: "82vh",
              background: "#111318",
              border: "1px solid rgba(255,255,255,0.10)",
              borderRadius: 16,
              overflow: "hidden",
              boxShadow: "0 25px 60px rgba(0,0,0,0.6)",
            }}
          >
            {/* Modal header */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                padding: "16px 20px",
                borderBottom: "1px solid rgba(255,255,255,0.10)",
              }}
            >
              <div>
                <p
                  style={{
                    color: "#fff",
                    fontSize: 14,
                    fontWeight: 600,
                    margin: 0,
                  }}
                >
                  {document.action}
                </p>
                <p
                  style={{
                    color: "rgba(148,163,184,0.5)",
                    fontSize: 12,
                    margin: "2px 0 0",
                  }}
                >
                  {document.documentName}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setPreviewOpen(false)}
                style={{
                  width: 32,
                  height: 32,
                  borderRadius: 8,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "rgba(148,163,184,0.6)",
                  background: "transparent",
                  border: "none",
                  cursor: "pointer",
                  fontSize: 18,
                }}
              >
                ✕
              </button>
            </div>

            {/* Modal body */}
            <div
              style={{
                height: "calc(100% - 65px)",
                background: "#0a0b0f",
                padding: 24,
              }}
            >
              {loading ? (
                <div style={iframeWrapStyle}>Баримт ачаалж байна...</div>
              ) : error ? (
                <div
                  style={{
                    ...iframeWrapStyle,
                    border: "1px solid rgba(239,68,68,0.2)",
                    background: "rgba(239,68,68,0.05)",
                    color: "#f87171",
                  }}
                >
                  {error}
                </div>
              ) : content?.contentType === "text/html" ? (
                <iframe
                  title={document.documentName}
                  style={iframeStyle}
                  srcDoc={content.content}
                />
              ) : previewUrl ? (
                <iframe
                  title={document.documentName}
                  style={iframeStyle}
                  src={previewUrl}
                />
              ) : (
                <div style={iframeWrapStyle}>Preview бэлэн биш байна.</div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
};

const iframeStyle: React.CSSProperties = {
  width: "100%",
  height: "100%",
  borderRadius: 10,
  border: "1px solid rgba(255,255,255,0.10)",
  background: "#fff",
};

const iframeWrapStyle: React.CSSProperties = {
  width: "100%",
  height: "100%",
  borderRadius: 10,
  border: "1px solid rgba(255,255,255,0.10)",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  color: "rgba(148,163,184,0.5)",
  fontSize: 14,
};
