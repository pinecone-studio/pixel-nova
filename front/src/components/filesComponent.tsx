"use client";

import { useApolloClient, useMutation, useQuery } from "@apollo/client/react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import { buildGraphQLHeaders } from "@/lib/apollo-client";
import { UPLOAD_HR_DOCUMENT } from "@/graphql/mutations";
import {
  GET_DOCUMENT_CONTENT,
  GET_DOCUMENTS,
  GET_EMPLOYEES,
} from "@/graphql/queries";
import type { Document, DocumentContent, Employee } from "@/lib/types";
import {
  ActiveIcon,
  CalIcon,
  DownloadIcon,
  EyeIcon,
  OffboardIcon,
  OnboardIcon,
  PlusIcon,
  ReqIcon,
  SearchIcon,
} from "./icons";

// ── Types ──────────────────────────────────────────────
type FileRow = {
  document: Document;
  employee?: Employee;
};

const ALL_RECIPIENTS = ["hr_team", "department_chief", "branch_manager", "CEO"];

// ── Helpers ────────────────────────────────────────────
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
  return new Date(value).toLocaleDateString("mn-MN", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });
}

function stageKeyForEmployee(employee?: Employee) {
  if (!employee) return "active";
  if (employee.status === "Тасалсан") return "offboarding";
  if (employee.status === "Ирсэн") return "active";
  return "onboarding";
}

function statusLabel(document: Document) {
  return document.storageUrl ? "Баталгаажсан" : "Ноорог";
}

function fileToBase64(file: File) {
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const result = typeof reader.result === "string" ? reader.result : "";
      const base64 = result.split(",", 2)[1] ?? "";
      resolve(base64);
    };
    reader.onerror = () =>
      reject(reader.error ?? new Error("Файл уншиж чадсангүй."));
    reader.readAsDataURL(file);
  });
}

// ── Upload icon ────────────────────────────────────────
function UploadCloudIcon() {
  return (
    <svg
      width="36"
      height="36"
      fill="none"
      viewBox="0 0 24 24"
      className="text-slate-400"
    >
      <path
        d="M12 16V8M12 8l-3 3M12 8l3 3"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M20.39 18.39A5 5 0 0018 9h-1.26A8 8 0 103 16.3"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

// ── FilePreviewModal ───────────────────────────────────
function FilePreviewModal({
  row,
  mode,
  onClose,
}: {
  row: FileRow;
  mode: "preview" | "download";
  onClose: () => void;
}) {
  const queryContext = useMemo(
    () => ({ headers: buildGraphQLHeaders({ actorRole: "hr" }) }),
    [],
  );

  const { data, loading, error } = useQuery<{
    documentContent: DocumentContent | null;
  }>(GET_DOCUMENT_CONTENT, {
    variables: { documentId: row.document.id },
    context: queryContext,
    fetchPolicy: "network-only",
  });

  const content = data?.documentContent ?? null;

  function handleDownload() {
    if (!content) return;
    const href = buildDataUrl(content);
    const link = window.document.createElement("a");
    link.href = href;
    link.download = content.documentName;
    window.document.body.appendChild(link);
    link.click();
    link.remove();
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/65 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="relative w-190 max-w-[95vw] bg-[#0f1520] rounded-3xl border border-slate-700/50 shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-700/40">
          <div>
            <p className="text-white font-semibold text-base">
              {row.document.documentName}
            </p>
            <p className="text-slate-500 text-xs mt-0.5">
              {row.employee
                ? `${row.employee.lastName} ${row.employee.firstName} • ${row.employee.employeeCode}`
                : row.document.employeeId}
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white transition-colors text-lg cursor-pointer"
          >
            ✕
          </button>
        </div>

        <div className="h-[70vh] bg-[#080c12] p-6">
          {loading ? (
            <div className="w-full h-full rounded-2xl border border-slate-700/40 flex items-center justify-center text-slate-400 text-sm">
              Уншиж байна...
            </div>
          ) : error ? (
            <div className="w-full h-full rounded-2xl border border-red-500/20 bg-red-500/5 flex items-center justify-center text-red-400 text-sm">
              {error.message}
            </div>
          ) : mode === "download" ? (
            <div className="w-full h-full rounded-2xl border border-slate-700/40 flex flex-col items-center justify-center gap-4">
              <ReqIcon />
              <p className="text-white text-sm font-medium">
                {row.document.documentName}
              </p>
              <button
                onClick={handleDownload}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black font-semibold text-sm transition-colors"
              >
                <DownloadIcon />
                Татах
              </button>
            </div>
          ) : content?.contentType === "text/html" ? (
            <iframe
              title={row.document.documentName}
              className="w-full h-full rounded-2xl bg-white"
              srcDoc={content.content}
            />
          ) : content ? (
            <iframe
              title={row.document.documentName}
              className="w-full h-full rounded-2xl bg-white"
              src={buildDataUrl(content)}
            />
          ) : (
            <div className="w-full h-full rounded-2xl border border-slate-700/40 flex items-center justify-center text-slate-500 text-sm">
              Урьдчилан харах боломжгүй байна.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ── NewDocModal ────────────────────────────────────────
function NewDocModal({
  employees,
  onClose,
  onUploaded,
}: {
  employees: Employee[];
  onClose: () => void;
  onUploaded: () => Promise<void>;
}) {
  const fileRef = useRef<HTMLInputElement>(null);
  const [documentName, setDocumentName] = useState("");
  const [recipients, setRecipients] = useState<string[]>([...ALL_RECIPIENTS]);
  const [file, setFile] = useState<File | null>(null);
  const [dragging, setDragging] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const queryContext = useMemo(
    () => ({ headers: buildGraphQLHeaders({ actorRole: "hr" }) }),
    [],
  );

  const [uploadDocument] = useMutation(UPLOAD_HR_DOCUMENT, {
    context: queryContext,
  });

  const removeRecipient = (r: string) =>
    setRecipients((prev) => prev.filter((x) => x !== r));

  async function handleSubmit() {
    if (!documentName.trim()) {
      setError("Баримтын нэр оруулна уу.");
      return;
    }
    if (!file) {
      setError("Файл сонгоно уу.");
      return;
    }

    setSaving(true);
    setError(null);

    try {
      const contentBase64 = await fileToBase64(file);
      await uploadDocument({
        variables: {
          input: {
            employeeId: employees[0]?.id ?? "",
            action: "hr-upload",
            documentName: documentName.trim(),
            contentType: file.type || "application/octet-stream",
            contentBase64,
          },
        },
      });
      await onUploaded();
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Баримт оруулж чадсангүй.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/65 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="relative bg-[#0d1117] rounded-3xl border border-slate-700/50 shadow-2xl flex flex-col gap-5 overflow-hidden"
        style={{ width: 560, padding: "36px 36px 32px" }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between">
          <h2 className="text-white text-2xl font-bold">
            Шинэ баримтын мэдээлэл
          </h2>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white transition-colors cursor-pointer"
          >
            <svg width="22" height="22" fill="none" viewBox="0 0 24 24">
              <path
                d="M18 6L6 18M6 6l12 12"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
              />
            </svg>
          </button>
        </div>

        {/* Баримтын нэр */}
        <div className="flex flex-col gap-2">
          <label className="text-white text-sm font-medium">Баримтын нэр</label>
          <input
            value={documentName}
            onChange={(e) => setDocumentName(e.target.value)}
            placeholder="Баримтын нэр"
            className="w-full bg-transparent border border-slate-700/60 rounded-2xl px-4 py-3.5 text-slate-300 text-base placeholder:text-slate-600 outline-none focus:border-slate-500 transition-colors"
          />
        </div>

        {/* Хүлээн авагчид */}
        <div className="flex flex-col gap-2">
          <label className="text-white text-sm font-medium">
            Хүлээн авагчид
          </label>
          <div className="flex flex-wrap gap-2">
            {recipients.map((r) => (
              <span
                key={r}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-600/50 text-slate-300 text-sm"
              >
                {r}
                <button
                  onClick={() => removeRecipient(r)}
                  className="text-slate-500 hover:text-white transition-colors leading-none ml-0.5 cursor-poinetr"
                >
                  ×
                </button>
              </span>
            ))}
          </div>
        </div>

        {/* Файл хавсаргах */}
        <div className="flex flex-col gap-2">
          <label className="text-white text-sm font-medium">
            Файл хавсаргах
          </label>
          <input
            ref={fileRef}
            type="file"
            className="hidden"
            onChange={(e) => setFile(e.target.files?.[0] ?? null)}
          />
          <div
            onDragOver={(e) => {
              e.preventDefault();
              setDragging(true);
            }}
            onDragLeave={() => setDragging(false)}
            onDrop={(e) => {
              e.preventDefault();
              setDragging(false);
              const f = e.dataTransfer.files?.[0];
              if (f) setFile(f);
            }}
            onClick={() => fileRef.current?.click()}
            className={`rounded-2xl border-2 border-dashed p-8 flex flex-col items-center gap-3 cursor-pointer transition-colors ${
              dragging
                ? "border-emerald-500/60 bg-emerald-500/5"
                : "border-slate-700/50 hover:border-slate-600/60"
            }`}
          >
            <UploadCloudIcon />
            {file ? (
              <p className="text-emerald-400 text-sm font-semibold text-center">
                {file.name}
              </p>
            ) : (
              <>
                <p className="text-white text-base font-bold">
                  Файл хавсаргах(Заавал)
                </p>
                <p className="text-slate-500 text-xs">
                  JPEG, PNG, PDG, and MP4 formats, up to 50MB
                </p>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    fileRef.current?.click();
                  }}
                  className="mt-1 px-6 py-2 rounded-xl border border-slate-600/60 text-slate-300 text-sm hover:border-slate-400 transition-colors bg-transparent cursor-pointer"
                >
                  Оруулах
                </button>
              </>
            )}
          </div>
        </div>

        {error && <p className="text-sm text-red-400">{error}</p>}

        {/* Actions */}
        <div className="flex items-center justify-end gap-3 pt-1">
          <button
            onClick={onClose}
            className="px-6 py-3 rounded-2xl border border-slate-600/50 text-slate-300 text-sm font-medium hover:bg-slate-800/40 transition-colors cursor-pointer"
          >
            Татгалзах
          </button>
          <button
            onClick={handleSubmit}
            disabled={saving}
            className="flex items-center gap-2 px-7 py-3 rounded-2xl bg-emerald-500 hover:bg-emerald-400 disabled:opacity-60 text-black text-sm font-bold transition-colors shadow-lg cursor-pointer shadow-emerald-500/20"
          >
            <svg width="16" height="16" fill="none" viewBox="0 0 24 24">
              <path
                d="M12 5v14M5 12h14"
                stroke="currentColor"
                strokeWidth="2.4"
                strokeLinecap="round"
              />
            </svg>
            {saving ? "Илгээж байна..." : "Нэмэх"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Main Component ─────────────────────────────────────
export function FilesComponent() {
  const apolloClient = useApolloClient();
  const [search, setSearch] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [previewRow, setPreviewRow] = useState<FileRow | null>(null);
  const [downloadRow, setDownloadRow] = useState<FileRow | null>(null);
  const [rows, setRows] = useState<FileRow[]>([]);
  const [loadingRows, setLoadingRows] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const queryContext = useMemo(
    () => ({ headers: buildGraphQLHeaders({ actorRole: "hr" }) }),
    [],
  );

  const { data, loading } = useQuery<{ employees: Employee[] }>(GET_EMPLOYEES, {
    variables: { search: null, status: null, department: null },
    context: queryContext,
    fetchPolicy: "cache-and-network",
  });

  const employees = useMemo(() => data?.employees ?? [], [data]);

  const loadRows = useCallback(async () => {
    setLoadingRows(true);
    setError(null);
    try {
      const documentLists = await Promise.all(
        employees.map(async (employee) => {
          const result = await apolloClient.query<{ documents: Document[] }>({
            query: GET_DOCUMENTS,
            variables: { employeeId: employee.id },
            context: queryContext,
            fetchPolicy: "network-only",
          });
          return { employee, docs: result.data?.documents ?? [] };
        }),
      );

      const nextRows = documentLists
        .flatMap(({ employee, docs }) =>
          docs.map((document) => ({ document, employee })),
        )
        .sort(
          (l, r) =>
            new Date(r.document.createdAt).getTime() -
            new Date(l.document.createdAt).getTime(),
        );

      setRows(nextRows);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Баримтуудыг ачаалж чадсангүй.",
      );
    } finally {
      setLoadingRows(false);
    }
  }, [apolloClient, employees, queryContext]);

  useEffect(() => {
    if (employees.length === 0) {
      setRows([]);
      setLoadingRows(false);
      return;
    }
    void loadRows();
  }, [employees, loadRows]);

  const filtered = useMemo(
    () =>
      rows.filter((row) =>
        [
          row.document.documentName,
          row.document.action,
          row.employee?.firstName ?? "",
          row.employee?.lastName ?? "",
          row.employee?.employeeCode ?? "",
        ].some((v) => v.toLowerCase().includes(search.toLowerCase())),
      ),
    [rows, search],
  );

  const stageCounts = useMemo(() => {
    return filtered.reduce(
      (acc, row) => {
        const key = stageKeyForEmployee(row.employee);
        acc[key] += 1;
        return acc;
      },
      { onboarding: 0, active: 0, offboarding: 0 },
    );
  }, [filtered]);

  const stages = [
    {
      label: "Ажилд орох үе",
      sub: "Онбординг",
      count: stageCounts.onboarding,
      icon: <OnboardIcon />,
      iconBg: "bg-emerald-500",
      border: "border-emerald-600/40",
      bg: "bg-linear-to-br from-green-600/40 to-black",
    },
    {
      label: "Ажиллах үе",
      sub: "Идэвхтэй",
      count: stageCounts.active,
      icon: <ActiveIcon />,
      iconBg: "bg-cyan-500",
      border: "border-cyan-600/40",
      bg: "bg-linear-to-br from-[#06B6D4]/40 to-black",
    },
    {
      label: "Ажлаас гарах үе",
      sub: "Оффбординг",
      count: stageCounts.offboarding,
      icon: <OffboardIcon />,
      iconBg: "bg-red-500",
      border: "border-red-600/40",
      bg: "bg-linear-to-br from-red-600/40 to-black",
    },
  ];

  const isLoading = loading || loadingRows;

  return (
    <div className="flex gap-5 min-h-screen bg-[#080c12] text-white font-sans p-0 animate-fade-up">
      {showModal && (
        <NewDocModal
          employees={employees}
          onClose={() => setShowModal(false)}
          onUploaded={loadRows}
        />
      )}
      {previewRow && (
        <FilePreviewModal
          row={previewRow}
          mode="preview"
          onClose={() => setPreviewRow(null)}
        />
      )}
      {downloadRow && (
        <FilePreviewModal
          row={downloadRow}
          mode="download"
          onClose={() => setDownloadRow(null)}
        />
      )}

      {/* Left panel */}
      <div className="w-125 shrink-0 flex flex-col gap-5">
        <div>
          <p className="text-slate-400 text-lg font-semibold uppercase tracking-widest mb-3">
            Нийт баримт
          </p>
          <div className="rounded-2xl border border-slate-700/40 bg-linear-to-br from-blue-600/40 to-black p-5 flex flex-col justify-between h-44">
            <div className="w-12 h-12 rounded-xl bg-blue-500/20 flex items-center justify-center">
              <ReqIcon />
            </div>
            <div>
              <p className="text-6xl font-bold text-white">{filtered.length}</p>
              <div className="flex items-center justify-between mt-1">
                <p className="text-slate-400 text-sm">Нийт баримт</p>
                <p className="text-emerald-400 text-sm font-semibold">
                  Бодит өгөгдөл
                </p>
              </div>
            </div>
          </div>
        </div>

        <div>
          <p className="text-slate-400 text-lg font-semibold uppercase tracking-widest mb-3">
            Үе шатaap
          </p>
          <div className="flex flex-col gap-8">
            {stages.map((stage) => (
              <div
                key={stage.label}
                className={`rounded-2xl border w-103.75 h-22 ${stage.border} ${stage.bg} p-4 flex items-center justify-between`}
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`w-9 h-9 rounded-xl ${stage.iconBg} flex items-center justify-center shrink-0`}
                  >
                    {stage.icon}
                  </div>
                  <div>
                    <p className="text-white text-sm font-semibold">
                      {stage.label}
                    </p>
                    <p className="text-slate-500 text-xs">{stage.sub}</p>
                  </div>
                </div>
                <span className="text-white text-2xl font-bold">
                  {stage.count}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right panel */}
      <div className="flex-1 flex flex-col">
        <div className="rounded-2xl border border-slate-700/40 bg-[#0a0f18] overflow-auto flex-1">
          <div className="flex items-center gap-3 px-5 py-4 border-b border-slate-700/40 bg-slate-800/20">
            <div className="flex items-center gap-2 bg-[#0d1117] border border-slate-700/50 rounded-xl px-3 py-2 min-w-65">
              <SearchIcon />
              <input
                className="bg-transparent text-slate-400 text-sm outline-none placeholder:text-slate-600 w-62.5"
                placeholder="Баримт, үйлдэл, ажилтнаар хайх"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
          </div>

          <div
            className="grid items-center px-5 py-3.5 border-b border-slate-700/40 bg-slate-800/20"
            style={{ gridTemplateColumns: "2fr 1.3fr 1fr 1fr 0.9fr" }}
          >
            <span className="text-slate-400 font-medium">Баримт бичиг</span>
            <span className="text-slate-400 font-medium">Ажилтан</span>
            <span className="text-slate-400 font-medium">Огноо</span>
            <span className="text-slate-400 font-medium">Төлөв</span>
            <span className="text-slate-400 font-medium">Үйлдэл</span>
          </div>

          {isLoading ? (
            <div className="py-8 px-5 flex flex-col gap-3">
              <div className="h-4 w-56 rounded-full skeleton" />
              <div className="h-3 w-80 rounded-full skeleton" />
              <div className="h-3 w-72 rounded-full skeleton" />
            </div>
          ) : error ? (
            <div className="py-12 text-center text-red-400 text-sm">
              {error}
            </div>
          ) : filtered.length === 0 ? (
            <div className="py-12 text-center text-slate-500 text-sm">
              Баримт олдсонгүй
            </div>
          ) : (
            filtered.map((row) => (
              <div
                key={row.document.id}
                className="grid items-center px-5 py-3.5 border-b border-slate-800/50 hover:bg-slate-800/20 transition-colors"
                style={{ gridTemplateColumns: "2fr 1.3fr 1fr 1fr 0.9fr" }}
              >
                <div className="flex items-center gap-2.5">
                  <ReqIcon />
                  <div>
                    <p className="text-slate-200 text-sm">
                      {row.document.documentName}
                    </p>
                    <p className="text-slate-500 text-xs">
                      {row.document.action}
                    </p>
                  </div>
                </div>
                <div>
                  <p className="text-slate-300 text-sm">
                    {row.employee
                      ? `${row.employee.lastName} ${row.employee.firstName}`
                      : row.document.employeeId}
                  </p>
                  <p className="text-slate-500 text-xs">
                    {row.employee?.employeeCode ?? ""}
                  </p>
                </div>
                <div className="flex items-center gap-1.5">
                  <CalIcon />
                  <span className="text-slate-400 text-sm">
                    {formatDate(row.document.createdAt)}
                  </span>
                </div>
                <div>
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/15 border border-emerald-500/25 text-emerald-400 text-xs font-medium">
                    {statusLabel(row.document)}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setPreviewRow(row)}
                    className="w-7 h-7 flex items-center justify-center rounded-lg text-slate-400 hover:text-white hover:bg-slate-700/50 transition-colors"
                  >
                    <EyeIcon />
                  </button>
                  <button
                    onClick={() => setDownloadRow(row)}
                    className="w-7 h-7 flex items-center justify-center rounded-lg text-slate-400 hover:text-white hover:bg-slate-700/50 transition-colors"
                  >
                    <DownloadIcon />
                  </button>
                </div>
              </div>
            ))
          )}

          <div className="px-5 py-3.5">
            <span className="text-slate-500 text-sm">
              Нийт {filtered.length} баримт
            </span>
          </div>
        </div>

        <div className="flex justify-end mt-4">
          <button
            onClick={() => setShowModal(true)}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black font-semibold text-sm transition-colors shadow-lg shadow-emerald-500/20"
          >
            <PlusIcon />
            Шинэ баримт
          </button>
        </div>
      </div>
    </div>
  );
}

export default FilesComponent;
