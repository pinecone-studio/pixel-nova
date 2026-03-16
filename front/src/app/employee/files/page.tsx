"use client";

import { useLazyQuery, useQuery } from "@apollo/client/react";
import { useEffect, useMemo, useRef, useState, useSyncExternalStore } from "react";
import { useRouter } from "next/navigation";

import { buildGraphQLHeaders } from "@/lib/apollo-client";
import { GET_DOCUMENTS, GET_ME, GET_DOCUMENT_CONTENT } from "@/graphql/queries";
import type { Document, DocumentContent, Employee } from "@/lib/types";

const TOKEN_STORAGE_KEY = "epas_auth_token";

const FILTER_OPTIONS = [
  { value: "all", label: "Бүгд" },
  { value: "Баримт бичиг", label: "Баримт бичиг" },
  { value: "Тодорхойлолт", label: "Тодорхойлолт" },
  { value: "Бүх үе шат", label: "Бүх үе шат" },
] as const;

type FilterValue = (typeof FILTER_OPTIONS)[number]["value"];

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

// ─── CustomDropdown ──────────────────────────────────────────────────────────

function CustomDropdown({
  filter,
  setFilter,
}: {
  filter: string;
  setFilter: (v: FilterValue) => void;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  const selectedLabel =
    FILTER_OPTIONS.find((o) => o.value === filter)?.label ?? "Бүгд";

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  return (
    <div ref={ref} style={{ position: "relative" }}>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        style={{
          height: 38,
          padding: "0 14px",
          background: "rgba(255,255,255,0.05)",
          border: "1px solid rgba(255,255,255,0.1)",
          borderRadius: 10,
          color: "rgba(148,163,184,0.7)",
          fontSize: 13,
          cursor: "pointer",
          fontFamily: "inherit",
          display: "flex",
          alignItems: "center",
          gap: 8,
          whiteSpace: "nowrap",
        }}
      >
        {selectedLabel}
        <svg
          width="12"
          height="12"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          viewBox="0 0 24 24"
          style={{
            transform: open ? "rotate(180deg)" : "rotate(0deg)",
            transition: "transform 0.15s",
          }}
        >
          <path d="M6 9l6 6 6-6" />
        </svg>
      </button>

      {open && (
        <div
          style={{
            position: "absolute",
            top: "calc(100% + 6px)",
            right: 0,
            minWidth: 160,
            background: "#1a1d24",
            border: "1px solid rgba(255,255,255,0.1)",
            borderRadius: 10,
            overflow: "hidden",
            zIndex: 50,
          }}
        >
          {FILTER_OPTIONS.map(({ value, label }) => (
            <button
              key={value}
              type="button"
              onClick={() => {
                setFilter(value);
                setOpen(false);
              }}
              style={{
                width: "100%",
                padding: "10px 14px",
                background:
                  filter === value ? "rgba(255,255,255,0.07)" : "transparent",
                border: "none",
                borderBottom: "1px solid rgba(255,255,255,0.05)",
                color: filter === value ? "#e2e8f0" : "rgba(148,163,184,0.7)",
                fontSize: 13,
                textAlign: "left",
                cursor: "pointer",
                fontFamily: "inherit",
              }}
            >
              {label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── ActionBtn (hover color only) ───────────────────────────────────────────

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

// ─── DocRow ──────────────────────────────────────────────────────────────────

function DocRow({
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
      <div
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        style={{
          display: "flex",
          alignItems: "center",
          gap: 14,
          padding: "14px 18px",
          borderBottom: isLast ? "none" : "1px solid rgba(255,255,255,0.06)",
          background: hovered ? "rgba(255,255,255,0.04)" : "transparent",
          transition: "background 0.12s",
          cursor: "default",
        }}
      >
        <div
          style={{
            width: 36,
            height: 36,
            background: "rgba(255,255,255,0.07)",
            borderRadius: 8,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flexShrink: 0,
          }}
        >
          <svg
            width="16"
            height="16"
            fill="none"
            stroke="rgba(148,163,184,0.6)"
            strokeWidth="1.5"
            viewBox="0 0 24 24"
          >
            <path d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
        </div>

        <div style={{ flex: 1 }}>
          <div style={{ color: "#e2e8f0", fontSize: 14, fontWeight: 500 }}>
            {document.documentName}
          </div>
          <div
            style={{
              color: "rgba(148,163,184,0.45)",
              fontSize: 12,
              marginTop: 2,
            }}
          >
            {document.action}
          </div>
        </div>

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
      </div>

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
                    marginTop: 2,
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

            <div
              style={{
                height: "calc(100% - 65px)",
                background: "#0a0b0f",
                padding: 24,
              }}
            >
              {loading ? (
                <div
                  style={{
                    width: "100%",
                    height: "100%",
                    borderRadius: 10,
                    border: "1px solid rgba(255,255,255,0.10)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: "rgba(148,163,184,0.5)",
                    fontSize: 14,
                  }}
                >
                  Баримт ачаалж байна...
                </div>
              ) : error ? (
                <div
                  style={{
                    width: "100%",
                    height: "100%",
                    borderRadius: 10,
                    border: "1px solid rgba(239,68,68,0.2)",
                    background: "rgba(239,68,68,0.05)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: "#f87171",
                    fontSize: 14,
                  }}
                >
                  {error}
                </div>
              ) : content?.contentType === "text/html" ? (
                <iframe
                  title={document.documentName}
                  style={{
                    width: "100%",
                    height: "100%",
                    borderRadius: 10,
                    border: "1px solid rgba(255,255,255,0.10)",
                    background: "#fff",
                  }}
                  srcDoc={content.content}
                />
              ) : previewUrl ? (
                <iframe
                  title={document.documentName}
                  style={{
                    width: "100%",
                    height: "100%",
                    borderRadius: 10,
                    border: "1px solid rgba(255,255,255,0.10)",
                    background: "#fff",
                  }}
                  src={previewUrl}
                />
              ) : (
                <div
                  style={{
                    width: "100%",
                    height: "100%",
                    borderRadius: 10,
                    border: "1px solid rgba(255,255,255,0.10)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: "rgba(148,163,184,0.5)",
                    fontSize: 14,
                  }}
                >
                  Preview бэлэн биш байна.
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}

// ─── emptyBoxStyle ───────────────────────────────────────────────────────────

const emptyBoxStyle: React.CSSProperties = {
  borderRadius: 14,
  border: "1px solid rgba(255,255,255,0.08)",
  background: "rgba(255,255,255,0.02)",
  padding: "48px 24px",
  textAlign: "center",
  color: "rgba(148,163,184,0.5)",
  fontSize: 14,
};

// ─── FilesPage ───────────────────────────────────────────────────────────────

export default function FilesPage() {
  const router = useRouter();
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<FilterValue>("all");
  const authToken = useSyncExternalStore(
    () => () => {},
    () => window.localStorage.getItem(TOKEN_STORAGE_KEY) ?? "",
    () => "",
  );

  const {
    data: meData,
    loading: meLoading,
    error: meError,
  } = useQuery<{ me: Employee | null }>(GET_ME, {
    skip: !authToken,
    context: { headers: buildGraphQLHeaders({ authToken }) },
    fetchPolicy: "network-only",
  });

  const employee = meData?.me ?? null;

  const {
    data: documentsData,
    loading: documentsLoading,
    error: documentsError,
  } = useQuery<{ documents: Document[] }>(GET_DOCUMENTS, {
    skip: !authToken || !employee?.id,
    variables: { employeeId: employee?.id ?? "" },
    context: { headers: buildGraphQLHeaders({ authToken }) },
    fetchPolicy: "network-only",
  });

  useEffect(() => {
    if (!authToken) {
      router.replace("/auth/employee");
      return;
    }
    if (!meLoading && !employee) {
      window.localStorage.removeItem(TOKEN_STORAGE_KEY);
      router.replace("/auth/employee");
    }
  }, [authToken, employee, meLoading, router]);

  const documents = useMemo(
    () => documentsData?.documents ?? [],
    [documentsData],
  );
  const loading = meLoading || Boolean(employee?.id && documentsLoading);
  const error = meError?.message ?? documentsError?.message ?? null;

  const filteredDocuments = useMemo(() => {
    const normalizedSearch = search.trim().toLowerCase();
    return documents.filter((document) => {
      const matchesSearch =
        !normalizedSearch ||
        document.documentName.toLowerCase().includes(normalizedSearch) ||
        document.action.toLowerCase().includes(normalizedSearch);
      const matchesFilter =
        filter === "all" ||
        document.documentName
          .toLowerCase()
          .endsWith(`.${filter.toLowerCase()}`);
      return matchesSearch && matchesFilter;
    });
  }, [documents, filter, search]);

  if (!authToken) return null;

  return (
    <div
      style={{
        width: 1056,
        height: 724,
        background: "#0a0b0f",
        padding: "32px 40px",
        fontFamily: "inherit",
        boxSizing: "border-box",
        overflow: "hidden",
        margin: "0 auto",
      }}
    >
      {/* Page Header */}
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: 4,
          marginBottom: 28,
        }}
      >
        <p
          style={{
            color: "#fff",
            fontSize: 22,
            fontWeight: 600,
            letterSpacing: "-0.3px",
            margin: 0,
          }}
        >
          Миний баримтууд
        </p>
        <p style={{ color: "rgba(148,163,184,0.6)", fontSize: 13, margin: 0 }}>
          {employee
            ? `${employee.lastName} ${employee.firstName} ажилтны баримтууд.`
            : "Таны бүх хөдөлмөрийн баримт бичгийг эндээс харах болон татах боломжтой."}
        </p>
      </div>

      {/* Toolbar */}
      <div style={{ display: "flex", gap: 10, marginBottom: 28 }}>
        <div style={{ position: "relative", flex: 1 }}>
          <span
            style={{
              position: "absolute",
              left: 11,
              top: "50%",
              transform: "translateY(-50%)",
              color: "rgba(148,163,184,0.45)",
              pointerEvents: "none",
              display: "flex",
            }}
          >
            <svg
              width="13"
              height="13"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              viewBox="0 0 24 24"
            >
              <circle cx="11" cy="11" r="8" />
              <path d="m21 21-4.35-4.35" />
            </svg>
          </span>
          <input
            type="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Баримт хайх..."
            style={{
              width: "100%",
              height: 38,
              padding: "0 12px 0 34px",
              background: "rgba(255,255,255,0.05)",
              border: "1px solid rgba(255,255,255,0.1)",
              borderRadius: 10,
              color: "#cbd5e1",
              fontSize: 13,
              outline: "none",
            }}
          />
        </div>
        <CustomDropdown filter={filter} setFilter={setFilter} />
      </div>

      {/* Section Label */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 8,
          marginBottom: 10,
        }}
      >
        <p
          style={{ color: "#cbd5e1", fontSize: 13, fontWeight: 500, margin: 0 }}
        >
          Бичиг Баримтууд
        </p>
        <span
          style={{
            padding: "2px 8px",
            background: "rgba(255,255,255,0.05)",
            border: "1px solid rgba(255,255,255,0.1)",
            borderRadius: 5,
            fontSize: 11,
            color: "rgba(148,163,184,0.5)",
          }}
        >
          {filteredDocuments.length} баримт
        </span>
      </div>

      {/* Document List */}
      {loading ? (
        <div style={emptyBoxStyle}>Баримтуудыг ачаалж байна...</div>
      ) : error ? (
        <div
          style={{
            ...emptyBoxStyle,
            border: "1px solid rgba(239,68,68,0.2)",
            background: "rgba(239,68,68,0.05)",
            color: "#f87171",
          }}
        >
          {error}
        </div>
      ) : filteredDocuments.length === 0 ? (
        <div style={emptyBoxStyle}>Баримт олдсонгүй.</div>
      ) : (
        <div
          style={{
            borderRadius: 14,
            overflow: "hidden",
            border: "1px solid rgba(255,255,255,0.08)",
            background: "rgba(255,255,255,0.02)",
          }}
        >
          {filteredDocuments.map((document, index) => (
            <DocRow
              key={document.id}
              document={document}
              authToken={authToken}
              isLast={index === filteredDocuments.length - 1}
            />
          ))}
        </div>
      )}
    </div>
  );
}
