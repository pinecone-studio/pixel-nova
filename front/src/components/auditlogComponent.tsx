"use client";

import { useApolloClient, useLazyQuery, useQuery } from "@apollo/client/react";
import { useEffect, useMemo, useState } from "react";
import { FiDownload, FiEye, FiFileText, FiX } from "react-icons/fi";

import { buildGraphQLHeaders } from "@/lib/apollo-client";
import {
  GET_AUDIT_LOGS,
  GET_DOCUMENT_CONTENT,
  GET_DOCUMENTS,
} from "@/graphql/queries";
import type { AuditLog, Document, DocumentContent } from "@/lib/types";
import {
  CheckCircle,
  ChevronDown,
  DocRowIcon,
  PaperclipIcon,
  SearchIcon,
} from "./icons";

type LogDocument = {
  id: string;
  name: string;
  createdAt?: string;
};

type LogEntry = {
  audit: AuditLog;
  docs: LogDocument[];
};


function buildDataUrl(content: DocumentContent) {
  if (content.contentType === "application/pdf") {
    return `data:${content.contentType};base64,${content.content}`;
  }

  if (content.contentType.startsWith("text/")) {
    return `data:${content.contentType};charset=utf-8,${encodeURIComponent(content.content)}`;
  }

  return `data:${content.contentType};base64,${content.content}`;
}

function formatDate(value: string) {
  return new Date(value).toLocaleString("mn-MN", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function statusTone(entry: AuditLog) {
  if (entry.notificationError) {
    return "bg-red-500/20 text-red-400 border border-red-500/30";
  }

  if (entry.documentsGenerated && entry.recipientsNotified) {
    return "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30";
  }

  return "bg-yellow-500/20 text-yellow-400 border border-yellow-500/30";
}

function statusLabel(entry: AuditLog) {
  if (entry.notificationError) return "Алдаатай";
  if (entry.documentsGenerated && entry.recipientsNotified) return "Амжилттай";
  return "Хэсэгчлэн";
}

const EyeIcon = () => <FiEye className="h-3.5 w-3.5" />;

const DownloadIcon = () => <FiDownload className="h-3.5 w-3.5" />;

const CloseIcon = () => <FiX className="h-[18px] w-[18px]" />;

const DocBigIcon = () => <FiFileText className="h-12 w-12 text-blue-400" />;

function DocumentModal({
  doc,
  mode,
  onClose,
}: {
  doc: LogDocument;
  mode: "preview" | "download";
  onClose: () => void;
}) {
  const [error, setError] = useState<string | null>(null);
  const [loadContent, { data, loading }] = useLazyQuery<{
    documentContent: DocumentContent | null;
  }>(GET_DOCUMENT_CONTENT, {
    fetchPolicy: "network-only",
  });

  const content = data?.documentContent ?? null;

  useEffect(() => {
    if (mode !== "preview") {
      return;
    }

    void loadContent({
      variables: {
        documentId: doc.id,
      },
      context: {
        headers: buildGraphQLHeaders({ actorRole: "hr" }),
      },
    }).catch((err) => {
      setError(err instanceof Error ? err.message : "Баримт нээж чадсангүй.");
    });
  }, [doc.id, loadContent, mode]);

  async function ensureContent() {
    if (content) {
      return content;
    }

    const result = await loadContent({
      variables: {
        documentId: doc.id,
      },
      context: {
        headers: buildGraphQLHeaders({ actorRole: "hr" }),
      },
    });

    const nextContent = result.data?.documentContent ?? null;
    if (!nextContent) {
      throw new Error("Баримтын агуулга олдсонгүй.");
    }

    return nextContent;
  }

  async function handleDownload() {
    try {
      const nextContent = await ensureContent();
      const href = buildDataUrl(nextContent);
      const link = window.document.createElement("a");
      link.href = href;
      link.download = nextContent.documentName;
      window.document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Баримтыг татаж чадсангүй.");
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/65 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="w-[520px] max-w-[95vw] bg-[#0f1520] rounded-3xl border border-slate-700/50 shadow-2xl overflow-hidden"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-700/40">
          <div className="flex items-center gap-3">
            <DocBigIcon />
            <div>
              <p className="text-white font-semibold text-base">{doc.name}</p>
              <p className="text-slate-500 text-xs mt-0.5">
                {doc.createdAt ? formatDate(doc.createdAt) : "Огноо байхгүй"}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white transition-colors"
          >
            <CloseIcon />
          </button>
        </div>

        <div className="bg-[#080c12] mx-6 my-5 rounded-2xl border border-slate-700/30 h-72 flex flex-col items-center justify-center gap-3 overflow-hidden">
          {loading ? (
            <div className="text-slate-400 text-sm">Уншиж байна...</div>
          ) : error ? (
            <div className="text-red-400 text-sm">{error}</div>
          ) : mode === "download" ? (
            <div className="flex flex-col items-center gap-3">
              <DocBigIcon />
              <p className="text-white text-sm font-medium">{doc.name}</p>
              <button
                onClick={() => void handleDownload()}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black text-sm font-semibold transition-colors"
              >
                <DownloadIcon /> Татах
              </button>
            </div>
          ) : content?.contentType === "text/html" ? (
            <iframe
              title={doc.name}
              className="w-full h-full bg-white"
              srcDoc={content.content}
            />
          ) : content ? (
            <iframe
              title={doc.name}
              className="w-full h-full bg-white"
              src={buildDataUrl(content)}
            />
          ) : (
            <div className="text-slate-500 text-sm">
              Урьдчилан харах боломжгүй байна.
            </div>
          )}
        </div>

        <div className="px-6 pb-5">
          <button
            onClick={onClose}
            className="w-full py-2.5 rounded-xl border border-slate-600/50 text-slate-300 text-sm hover:bg-slate-800/50 transition-colors"
          >
            Хаах
          </button>
        </div>
      </div>
    </div>
  );
}

function LogRow({ entry }: { entry: LogEntry }) {
  const [open, setOpen] = useState(false);
  const [previewDoc, setPreviewDoc] = useState<LogDocument | null>(null);
  const [downloadDoc, setDownloadDoc] = useState<LogDocument | null>(null);

  const { audit, docs } = entry;

  return (
    <>
      {previewDoc ? (
        <DocumentModal
          doc={previewDoc}
          mode="preview"
          onClose={() => setPreviewDoc(null)}
        />
      ) : null}
      {downloadDoc ? (
        <DocumentModal
          doc={downloadDoc}
          mode="download"
          onClose={() => setDownloadDoc(null)}
        />
      ) : null}

      <div className="rounded-2xl border border-slate-700/40 bg-[#0d1117] overflow-hidden">
        <button
          onClick={() => setOpen((value) => !value)}
          className="w-full flex items-center justify-between px-5 py-4 hover:bg-slate-800/30 transition-colors"
        >
          <div className="flex items-center gap-4">
            <CheckCircle />
            <div className="text-left">
              <div className="flex items-center gap-2.5 flex-wrap">
                <span className="text-white font-semibold text-sm">
                  {audit.employeeId}
                </span>
                <span
                  className={`text-xs px-2.5 py-0.5 rounded-full font-medium ${statusTone(audit)}`}
                >
                  {statusLabel(audit)}
                </span>
                <span className="text-slate-500 text-xs">
                  {formatDate(audit.timestamp)}
                </span>
              </div>
              <div className="flex items-center gap-1.5 mt-1 flex-wrap">
                <PaperclipIcon />
                <span className="text-slate-400 text-xs">{audit.action}</span>
                <span className="text-slate-600 text-xs">•</span>
                <span className="text-slate-500 text-xs">{docs.length} баримт</span>
                <span className="text-slate-600 text-xs">•</span>
                <span className="text-slate-500 text-xs">{audit.actorRole}</span>
              </div>
            </div>
          </div>
          <ChevronDown open={open} />
        </button>

        {open ? (
          <div className="border-t border-slate-700/40 px-5 py-2 flex flex-col bg-[#0a0f18]">
            <div className="grid grid-cols-2 gap-3 px-1 py-3">
              <div className="rounded-xl bg-slate-800/30 px-3 py-2">
                <p className="text-slate-500 text-[10px] mb-1">Үе шат</p>
                <p className="text-slate-200 text-sm">{audit.phase}</p>
              </div>
              <div className="rounded-xl bg-slate-800/30 px-3 py-2">
                <p className="text-slate-500 text-[10px] mb-1">Мэдэгдэл</p>
                <p className="text-slate-200 text-sm">
                  {audit.recipientsNotified ? "Амжилттай" : "Хүлээгдэж буй"}
                </p>
              </div>
            </div>

            {docs.length === 0 ? (
              <div className="px-1 pb-3 text-slate-500 text-sm">
                Энэ аудит бичлэг дээр баримтын мэдээлэл олдсонгүй.
              </div>
            ) : (
              docs.map((doc, index) => (
                <div
                  key={doc.id}
                  className={`flex items-center justify-between py-2.5 ${index < docs.length - 1 ? "border-b border-slate-800/50" : ""}`}
                >
                  <div className="flex items-center gap-2.5">
                    <DocRowIcon />
                    <div>
                      <span className="text-slate-300 text-sm">{doc.name}</span>
                      {doc.createdAt ? (
                        <span className="ml-2 text-slate-600 text-xs">
                          {formatDate(doc.createdAt)}
                        </span>
                      ) : null}
                    </div>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => setPreviewDoc(doc)}
                      className="w-7 h-7 flex items-center justify-center rounded-lg border border-slate-700/50 text-slate-400 hover:text-blue-400 hover:border-blue-500/40 hover:bg-blue-500/10 transition-colors"
                      title="Харах"
                    >
                      <EyeIcon />
                    </button>
                    <button
                      onClick={() => setDownloadDoc(doc)}
                      className="w-7 h-7 flex items-center justify-center rounded-lg border border-slate-700/50 text-slate-400 hover:text-emerald-400 hover:border-emerald-500/40 hover:bg-emerald-500/10 transition-colors"
                      title="Татах"
                    >
                      <DownloadIcon />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        ) : null}
      </div>
    </>
  );
}

export function AuditlogComponent() {
  const [activeTab, setActiveTab] = useState("Бүгд");
  const [search, setSearch] = useState("");
  const [hydratedEntries, setHydratedEntries] = useState<LogEntry[]>([]);
  const [documentsLoading, setDocumentsLoading] = useState(false);
  const [documentsError, setDocumentsError] = useState<string | null>(null);
  const apolloClient = useApolloClient();

  const { data, loading, error } = useQuery<{ auditLogs: AuditLog[] }>(
    GET_AUDIT_LOGS,
    {
      context: {
        headers: buildGraphQLHeaders({ actorRole: "hr" }),
      },
      fetchPolicy: "network-only",
    },
  );

  useEffect(() => {
    let cancelled = false;

    async function hydrateDocuments() {
      const audits = data?.auditLogs ?? [];
      if (audits.length === 0) {
        setHydratedEntries([]);
        return;
      }

      setDocumentsLoading(true);
      setDocumentsError(null);

      try {
        const uniqueEmployeeIds = Array.from(
          new Set(audits.map((audit) => audit.employeeId)),
        );

        const documentLists = await Promise.all(
          uniqueEmployeeIds.map(async (employeeId) => {
            const result = await apolloClient.query<{ documents: Document[] }>({
              query: GET_DOCUMENTS,
              variables: { employeeId },
              context: {
                headers: buildGraphQLHeaders({ actorRole: "hr" }),
              },
              fetchPolicy: "network-only",
            });

            return {
              employeeId,
              docs: result.data?.documents ?? [],
            };
          }),
        );

        if (cancelled) {
          return;
        }

        const documentsByEmployee = new Map<string, Document[]>(
          documentLists.map((item) => [item.employeeId, item.docs]),
        );

        setHydratedEntries(
          audits.map((audit) => {
            const employeeDocs = documentsByEmployee.get(audit.employeeId) ?? [];
            const docs = employeeDocs
              .filter((doc) => audit.documentIds.includes(doc.id))
              .map((doc) => ({
                id: doc.id,
                name: doc.documentName,
                createdAt: doc.createdAt,
              }));

            return { audit, docs };
          }),
        );
      } catch (err) {
        if (!cancelled) {
          setDocumentsError(
            err instanceof Error
              ? err.message
              : "Аудитын баримтуудыг ачаалж чадсангүй.",
          );
        }
      } finally {
        if (!cancelled) {
          setDocumentsLoading(false);
        }
      }
    }

    void hydrateDocuments();

    return () => {
      cancelled = true;
    };
  }, [apolloClient, data?.auditLogs]);

  const entries = useMemo<LogEntry[]>(() => {
    const audits = data?.auditLogs ?? [];
    if (hydratedEntries.length > 0) {
      return hydratedEntries;
    }

    return audits.map((audit) => ({ audit, docs: [] }));
  }, [data?.auditLogs, hydratedEntries]);

  const tabs = ["Бүгд", "Амжилттай", "Алдаатай"];

  const filtered = useMemo(() => {
    return entries.filter(({ audit }) => {
      const matchesTab =
        activeTab === "Бүгд"
          ? true
          : activeTab === "Амжилттай"
            ? !audit.notificationError &&
              audit.documentsGenerated &&
              audit.recipientsNotified
            : Boolean(audit.notificationError);

      const matchesSearch =
        !search ||
        audit.employeeId.toLowerCase().includes(search.toLowerCase()) ||
        audit.action.toLowerCase().includes(search.toLowerCase()) ||
        audit.phase.toLowerCase().includes(search.toLowerCase());

      return matchesTab && matchesSearch;
    });
  }, [activeTab, entries, search]);

  const successCount = entries.filter(
    ({ audit }) =>
      !audit.notificationError &&
      audit.documentsGenerated &&
      audit.recipientsNotified,
  ).length;
  const errorCount = entries.filter(({ audit }) => audit.notificationError).length;

  return (
    <div className="min-h-screen bg-[#080c12] text-white font-sans flex flex-col gap-4 p-0">
      <div className="flex items-center gap-2 bg-[#0d1117] border border-slate-700/50 rounded-xl px-4 py-2.5">
        <SearchIcon />
        <input
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          className="bg-transparent text-slate-300 text-sm outline-none placeholder:text-slate-600 w-full"
          placeholder="employeeId, action эсвэл phase-ээр хайх..."
        />
      </div>

      <div className="flex items-center gap-2">
        {tabs.map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium border cursor-pointer transition-all ${
              activeTab === tab
                ? "bg-[#0ad4b1] text-black border-[#0ad4b1]"
                : "text-slate-400 border-slate-700/50 hover:text-slate-200"
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {error || documentsError ? (
        <div className="rounded-2xl border border-red-500/20 bg-red-500/5 px-5 py-4 text-sm text-red-400">
          {error?.message ?? documentsError}
        </div>
      ) : null}

      <div className="flex flex-col gap-3">
        {loading || documentsLoading ? (
          <div className="py-12 flex items-center justify-center gap-3 text-slate-500 text-sm">
            <span className="w-4 h-4 border-2 border-slate-700 border-t-slate-400 rounded-full animate-spin" />
            Уншиж байна...
          </div>
        ) : filtered.length === 0 ? (
          <div className="py-12 text-center text-slate-500 text-sm">
            Аудитын бүртгэл олдсонгүй
          </div>
        ) : (
          filtered.map((entry) => (
            <LogRow key={entry.audit.id} entry={entry} />
          ))
        )}
      </div>

      <div className="rounded-2xl border border-slate-700/40 bg-[#0d1117] mt-2">
        <div className="grid grid-cols-3 divide-x divide-slate-700/40 py-5">
          <div className="flex flex-col items-center gap-1 px-6">
            <span className="text-slate-500 text-sm">Нийт үйлдэл</span>
            <span className="text-white text-2xl font-bold">{entries.length}</span>
          </div>
          <div className="flex flex-col items-center gap-1 px-6">
            <span className="text-slate-500 text-sm">Амжилттай</span>
            <span className="text-emerald-400 text-2xl font-bold">
              {successCount}
            </span>
          </div>
          <div className="flex flex-col items-center gap-1 px-6">
            <span className="text-slate-500 text-sm">Алдаатай</span>
            <span className="text-red-400 text-2xl font-bold">{errorCount}</span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AuditlogComponent;
