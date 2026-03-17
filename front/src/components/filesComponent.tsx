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
import { CiWarning } from "react-icons/ci";

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
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/45 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="relative w-190 max-w-[95vw] bg-white rounded-3xl border border-slate-200 shadow-[0_28px_60px_rgba(15,23,42,0.12)] overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200">
          <div>
            <p className="text-slate-900 font-semibold text-base">
              {row.document.documentName}
            </p>
            <p className="text-slate-400 text-xs mt-0.5">
              {row.employee
                ? `${row.employee.lastName} ${row.employee.firstName} • ${row.employee.employeeCode}`
                : row.document.employeeId}
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-700 transition-colors text-lg cursor-pointer"
          >
            ✕
          </button>
        </div>

        <div className="h-[70vh] bg-slate-50 p-6">
          {loading ? (
            <div className="w-full h-full rounded-2xl border border-slate-200 flex items-center justify-center text-slate-400 text-sm">
              Уншиж байна...
            </div>
          ) : error ? (
            <div className="w-full h-full rounded-2xl border border-red-200 bg-red-50 flex items-center justify-center text-red-500 text-sm">
              {error.message}
            </div>
          ) : mode === "download" ? (
            <div className="w-full h-full rounded-2xl border border-slate-200 flex flex-col items-center justify-center gap-4 bg-white">
              <ReqIcon />
              <p className="text-slate-900 text-sm font-medium">
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
              className="w-full h-full rounded-2xl bg-white border border-slate-200"
              srcDoc={content.content}
            />
          ) : content ? (
            <iframe
              title={row.document.documentName}
              className="w-full h-full rounded-2xl bg-white border border-slate-200"
              src={buildDataUrl(content)}
            />
          ) : (
            <div className="w-full h-full rounded-2xl border border-slate-200 flex items-center justify-center text-slate-500 text-sm bg-white">
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
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/45 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="relative bg-white rounded-3xl border border-slate-200 shadow-[0_28px_60px_rgba(15,23,42,0.12)] flex flex-col gap-5 overflow-hidden"
        style={{ width: 520, padding: "28px 28px 24px" }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between">
          <h2 className="text-slate-900 text-lg font-semibold">
            Шинэ баримтын мэдээлэл
          </h2>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-700 transition-colors cursor-pointer"
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
          <label className="text-slate-900 text-sm font-medium">
            Баримтын нэр
          </label>
          <input
            value={documentName}
            onChange={(e) => setDocumentName(e.target.value)}
            placeholder="Баримтын нэр"
            className="w-full bg-white border border-slate-200 rounded-xl px-4 py-2.5 text-slate-700 text-sm placeholder:text-slate-400 outline-none focus:border-slate-300 transition-colors"
          />
        </div>

        {/* Хүлээн авагчид */}
        <div className="flex flex-col gap-2">
          <label className="text-slate-900 text-sm font-medium">
            Хүлээн авагчид
          </label>
          <div className="flex flex-wrap gap-2">
            {recipients.map((r) => (
              <span
                key={r}
                className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full border border-slate-200 text-slate-500 text-xs bg-slate-50"
              >
                {r}
                <button
                  onClick={() => removeRecipient(r)}
                  className="text-slate-400 hover:text-slate-600 transition-colors leading-none ml-0.5 cursor-pointer"
                >
                  ×
                </button>
              </span>
            ))}
          </div>
        </div>

        {/* Файл хавсаргах */}
        <div className="flex flex-col gap-2">
          <label className="text-slate-900 text-sm font-medium">
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
            className={`rounded-2xl border border-dashed p-8 flex flex-col items-center gap-3 cursor-pointer transition-colors ${
              dragging
                ? "border-emerald-400 bg-emerald-50/60"
                : "border-slate-200 hover:border-slate-300"
            }`}
          >
            <UploadCloudIcon />
            {file ? (
              <p className="text-emerald-600 text-sm font-semibold text-center">
                {file.name}
              </p>
            ) : (
              <>
                <p className="text-slate-900 text-sm font-semibold">
                  Файл хавсаргах(Заавал)
                </p>
                <p className="text-slate-400 text-xs">
                  JPEG, PNG, PDG, and MP4 formats, up to 50MB
                </p>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    fileRef.current?.click();
                  }}
                  className="mt-1 px-5 py-2 rounded-full border border-slate-200 text-slate-600 text-xs hover:border-slate-300 transition-colors bg-white cursor-pointer"
                >
                  Оруулах
                </button>
              </>
            )}
          </div>
        </div>

        {error && <p className="text-sm text-red-500">{error}</p>}

        {/* Actions */}
        <div className="flex items-center justify-end gap-3 pt-1">
          <button
            onClick={onClose}
            className="px-6 py-2.5 rounded-2xl border border-slate-200 text-slate-500 text-sm font-medium hover:bg-slate-50 transition-colors cursor-pointer"
          >
            Татгалзах
          </button>
          <button
            onClick={handleSubmit}
            disabled={saving}
            className="flex items-center gap-2 px-6 py-2.5 rounded-2xl bg-[#1F2126] hover:bg-slate-800 disabled:opacity-60 text-white text-sm font-semibold transition-colors shadow-lg cursor-pointer"
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
      bg: "bg-linear-to-br from-emerald-100 to-white",
    },
    {
      label: "Ажиллах үе",
      sub: "Идэвхтэй",
      count: stageCounts.active,
      icon: <ActiveIcon />,
      iconBg: "bg-cyan-500",
      border: "border-cyan-600/40",
      bg: "bg-linear-to-br from-cyan-100 to-white",
    },
    {
      label: "Ажлаас гарах үе",
      sub: "Оффбординг",
      count: stageCounts.offboarding,
      icon: <CiWarning className="w-6 h-6" />,
      iconBg: "bg-red-500",
      border: "border-red-600/40",
      bg: "bg-linear-to-br from-red-100 to-white",
    },
  ];

  const isLoading = loading || loadingRows;

  return (
    <div className="flex gap-5 min-h-screen bg-[#F4F5F7] text-slate-900 font-sans p-0 animate-fade-up">
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
          <p className="text-slate-700 text-sm font-semibold mb-3">
            Нийт баримт бичиг
          </p>
          <div className="rounded-2xl border border-slate-200 bg-white p-5 flex flex-col justify-between h-44 shadow-[0_1px_2px_rgba(15,23,42,0.06)]">
            <div className="w-12 h-12 rounded-2xl border border-[#3F4145CC] bg-white flex items-center justify-center text-slate-600">
              <ReqIcon className="w-7 h-7" />
            </div>
            <div>
              <p className="text-5xl font-semibold text-slate-900">
                {filtered.length}
              </p>
              <div className="flex items-center justify-between mt-1">
                <p className="text-slate-400 text-sm">Нийт баримт</p>
                <p className="text-emerald-500 text-sm font-semibold">
                  100% Баталгаажсан
                </p>
              </div>
            </div>
          </div>
        </div>

        <div>
          <p className="text-slate-700 text-sm font-semibold uppercase tracking-widest mb-3">
            ҮЕ ШАТААР
          </p>
          <div className="flex flex-col gap-4">
            {stages.map((stage) => (
              <div
                key={stage.label}
                className="rounded-2xl border border-slate-200 bg-white p-4 flex items-center justify-between shadow-[0_1px_2px_rgba(15,23,42,0.06)]"
              >
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl border border-slate-200 bg-white flex items-center justify-center shrink-0 text-slate-600">
                    {stage.icon}
                  </div>
                  <div>
                    <p className="text-slate-900 text-sm font-semibold">
                      {stage.label}
                    </p>
                    <p className="text-slate-400 text-xs">{stage.sub}</p>
                  </div>
                </div>
                <span className="text-slate-900 text-xl font-semibold">
                  {stage.count}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right panel */}
      <div className="flex-1 flex flex-col">
        <div className="rounded-2xl border border-slate-200 bg-white overflow-auto flex-1 shadow-[0_1px_2px_rgba(15,23,42,0.06)]">
          <div className="flex items-center gap-3 px-5 py-4 border-b border-slate-200 bg-white">
            <div className="flex items-center gap-2 bg-white border border-slate-200 rounded-full px-3 py-2 min-w-65">
              <SearchIcon />
              <input
                className="bg-transparent text-slate-500 text-sm outline-none placeholder:text-slate-400 w-62.5"
                placeholder="Хайх..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
          </div>

          <div
            className="grid items-center px-5 py-3.5 border-b border-slate-200 bg-white text-slate-500 text-sm"
            style={{ gridTemplateColumns: "2fr 1.3fr 1fr 1fr 0.9fr" }}
          >
            <span className="font-medium">Баримт бичиг</span>
            <span className="font-medium">Үе</span>
            <span className="font-medium">Огноо</span>
            <span className="font-medium">Төлөв</span>
            <span className="font-medium">Үйлдэл</span>
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
            <div className="py-12 text-center text-slate-400 text-sm">
              Баримт олдсонгүй
            </div>
          ) : (
            filtered.map((row) => (
              <div
                key={row.document.id}
                className="grid items-center px-5 py-3.5 border-b border-slate-200 hover:bg-slate-50 transition-colors"
                style={{ gridTemplateColumns: "2fr 1.3fr 1fr 1fr 0.9fr" }}
              >
                <div className="flex items-center gap-2.5">
                  <div className="h-9 w-9 rounded-xl border border-slate-200 bg-white flex items-center justify-center text-slate-600">
                    <ReqIcon />
                  </div>
                  <div>
                    <p className="text-slate-900 text-sm font-medium">
                      {row.document.documentName}
                    </p>
                    <p className="text-slate-400 text-xs">
                      {row.document.action}
                    </p>
                  </div>
                </div>
                <div>
                  <div className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-1 text-xs text-slate-500">
                    {row.employee?.status === "Тасалсан"
                      ? "Ажлаас гарах үе"
                      : row.employee?.status === "Ирсэн"
                        ? "Ажиллах үе"
                        : "Ажилд орох үе"}
                  </div>
                </div>
                <div className="flex items-center gap-1.5">
                  <CalIcon />
                  <span className="text-slate-500 text-sm">
                    {formatDate(row.document.createdAt)}
                  </span>
                </div>
                <div>
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-600 text-xs font-medium">
                    {statusLabel(row.document)}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setPreviewRow(row)}
                    className="w-7 h-7 flex items-center justify-center rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
                  >
                    <EyeIcon />
                  </button>
                  <button
                    onClick={() => setDownloadRow(row)}
                    className="w-7 h-7 flex items-center justify-center rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
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
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-200 hover:bg-emerald-300 text-emerald-800 font-semibold text-sm transition-colors border border-emerald-200"
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
