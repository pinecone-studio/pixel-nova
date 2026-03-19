"use client";

import { useApolloClient, useMutation, useQuery } from "@apollo/client/react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";

import { buildGraphQLHeaders } from "@/lib/apollo-client";
import { UPLOAD_HR_DOCUMENT, DELETE_DOCUMENT } from "@/graphql/mutations";
import {
  GET_DOCUMENT_CONTENT,
  GET_DOCUMENTS,
  GET_EMPLOYEES,
} from "@/graphql/queries";
import type { Document, DocumentContent, Employee } from "@/lib/types";
import {
  getUrlTtlStatus,
  getUrlRemainingDays,
  urlTtlLabel,
} from "@/lib/documentTree";
import {
  ActiveIcon,
  CalIcon,
  DownloadIcon,
  OnboardIcon,
  PlusIcon,
  ReqIcon,
} from "./icons";
import { CiWarning } from "react-icons/ci";
import { FiTrash2 } from "react-icons/fi";
import { useHrOverlay } from "./hr/overlay-context";

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
  if (!value) return "—";
  const d = new Date(value);
  if (isNaN(d.getTime())) return "—";
  return d.toLocaleDateString("mn-MN", {
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

function stageLabel(employee?: Employee) {
  const key = stageKeyForEmployee(employee);
  if (key === "offboarding") return "Ажлаас гарах үе";
  if (key === "active") return "Ажиллах үе";
  return "Ажилд орох үе";
}

function statusLabel(document: Document) {
  const ttlStatus = getUrlTtlStatus(document);
  const remainingDays = getUrlRemainingDays(document);
  return urlTtlLabel(ttlStatus, remainingDays);
}

function statusColor(document: Document) {
  const ttlStatus = getUrlTtlStatus(document);
  switch (ttlStatus) {
    case "expired":
      return "border-red-300 text-red-500";
    case "expiring":
      return "border-amber-300 text-amber-500";
    case "valid":
      return "border-[#1aba5280] text-[#1aba52]";
    case "none":
      return "border-black/12 text-[#77818c]";
  }
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
      className="text-slate-400">
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
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/45"
      onClick={onClose}>
      <div
        className="relative w-[920px] max-w-[95vw] h-[82vh] bg-white rounded-3xl border border-slate-200 shadow-[0_28px_60px_rgba(15,23,42,0.12)] overflow-hidden"
        onClick={(e) => e.stopPropagation()}>
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
            className="text-slate-400 hover:text-slate-700 transition-colors text-lg cursor-pointer">
            ✕
          </button>
        </div>

        <div className="h-[calc(82vh-64px)] bg-slate-50 p-6">
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
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black font-semibold text-sm transition-colors">
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
  const [selectedEmployeeId, setSelectedEmployeeId] = useState(
    () => employees[0]?.id ?? "",
  );
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

  useEffect(() => {
    if (!employees.some((employee) => employee.id === selectedEmployeeId)) {
      setSelectedEmployeeId(employees[0]?.id ?? "");
    }
  }, [employees, selectedEmployeeId]);

  async function handleSubmit() {
    if (!selectedEmployeeId) {
      setError("Ажилтан сонгоно уу.");
      return;
    }
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
            employeeId: selectedEmployeeId,
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
      onClick={onClose}>
      <div
        className="relative bg-white rounded-3xl border border-slate-200 shadow-[0_28px_60px_rgba(15,23,42,0.12)] flex flex-col gap-5 overflow-hidden"
        style={{ width: 520, padding: "28px 28px 24px" }}
        onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="flex items-center justify-between">
          <h2 className="text-slate-900 text-lg font-semibold">
            Шинэ баримтын мэдээлэл
          </h2>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-700 transition-colors cursor-pointer">
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
          <label className="text-slate-900 text-sm font-medium">Ажилтан</label>
          <select
            value={selectedEmployeeId}
            onChange={(e) => setSelectedEmployeeId(e.target.value)}
            className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-700 outline-none transition-colors focus:border-slate-300">
            <option value="">Ажилтан сонгох</option>
            {employees.map((employee) => (
              <option key={employee.id} value={employee.id}>
                {employee.employeeCode} - {employee.lastName}{" "}
                {employee.firstName}
              </option>
            ))}
          </select>
        </div>

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
                className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full border border-slate-200 text-slate-500 text-xs bg-slate-50">
                {r}
                <button
                  onClick={() => removeRecipient(r)}
                  className="text-slate-400 hover:text-slate-600 transition-colors leading-none ml-0.5 cursor-pointer">
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
            }`}>
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
                  className="mt-1 px-5 py-2 rounded-full border border-slate-200 text-slate-600 text-xs hover:border-slate-300 transition-colors bg-white cursor-pointer">
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
            className="px-6 py-2.5 rounded-2xl border border-slate-200 text-slate-500 text-sm font-medium hover:bg-slate-50 transition-colors cursor-pointer">
            Татгалзах
          </button>
          <button
            onClick={handleSubmit}
            disabled={saving}
            className="flex items-center gap-2 px-6 py-2.5 rounded-2xl bg-[#1F2126] hover:bg-slate-800 disabled:opacity-60 text-white text-sm font-semibold transition-colors shadow-lg cursor-pointer">
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
  const { setBlurred } = useHrOverlay();

  useEffect(() => {
    setBlurred(Boolean(previewRow || downloadRow || showModal));
    return () => setBlurred(false);
  }, [previewRow, downloadRow, showModal, setBlurred]);
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

  const [deleteDocMutation] = useMutation(DELETE_DOCUMENT, {
    context: queryContext,
  });

  async function handleDelete(docId: string) {
    try {
      await deleteDocMutation({ variables: { id: docId } });
      setRows((prev) => prev.filter((r) => r.document.id !== docId));
    } catch {
      // silent
    }
  }

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

  const verifiedCount = useMemo(
    () => filtered.filter((row) => Boolean(row.document.storageUrl)).length,
    [filtered],
  );

  const verifiedPercent =
    filtered.length === 0
      ? 0
      : Math.round((verifiedCount / filtered.length) * 100);

  const stages = [
    {
      label: "Ажилд орох үе",
      count: stageCounts.onboarding,
      icon: <OnboardIcon className="h-5 w-5 text-[#1ABA52]" />,
      borderColor: "border-[#1ABA52]",
      bgColor: "bg-[#1ABA52]/20",
    },
    {
      label: "Ажиллах үе",
      count: stageCounts.active,
      icon: <ActiveIcon className="h-5 w-5 text-[#178AFC]" />,
      borderColor: "border-[#178AFC]",
      bgColor: "bg-[#178AFC]/20",
    },
    {
      label: "Ажлаас гарах үе",
      count: stageCounts.offboarding,
      icon: <CiWarning className="h-5 w-5 text-[#FC171B]" />,
      borderColor: "border-[#FC171B]",
      bgColor: "bg-[#FC171B]/20",
    },
  ];

  const isLoading = loading || loadingRows;

  return (
    <div className="flex min-h-full flex-col gap-6 text-slate-900 animate-fade-up xl:h-[calc(100vh-7rem)] xl:min-h-0 xl:overflow-hidden xl:flex-row">
      {typeof document !== "undefined" && showModal
        ? createPortal(
            <NewDocModal
              employees={employees}
              onClose={() => setShowModal(false)}
              onUploaded={loadRows}
            />,
            document.body,
          )
        : null}
      {typeof document !== "undefined" && previewRow
        ? createPortal(
            <FilePreviewModal
              row={previewRow}
              mode="preview"
              onClose={() => setPreviewRow(null)}
            />,
            document.body,
          )
        : null}
      {typeof document !== "undefined" && downloadRow
        ? createPortal(
            <FilePreviewModal
              row={downloadRow}
              mode="download"
              onClose={() => setDownloadRow(null)}
            />,
            document.body,
          )
        : null}

      <div className="w-full shrink-0 xl:w-[320px]">
        <div className="flex flex-col gap-4 xl:h-full xl:overflow-y-auto xl:pr-1">
          <div className="rounded-[20px] border border-black/12 bg-white p-5">
            <div className="flex items-center justify-between">
              <p className="text-[48px] font-bold leading-[48px] tracking-[-0.05em] text-[#121316]">
                {filtered.length}
              </p>
              <div className="flex h-12 w-12 items-center border-2 border-[#3F4145CC] justify-center rounded-2xl text-black">
                <ReqIcon className="h-6 w-6" />
              </div>
            </div>
            <div className="mt-3 flex items-center justify-between gap-2">
              <p className="text-[16px] font-medium leading-7 text-[#3F4145CC]">
                Нийт баримт
              </p>
              <div className="flex items-baseline gap-1 text-xl font-semibold text-[#1aba52]">
                <span>{verifiedPercent}%</span>
                <span className="text-sm font-medium leading-5 text-[#1aba52]/80">
                  Баталгаажсан
                </span>
              </div>
            </div>
          </div>

          <section>
            <p className="mb-4 text-[16px] font-semibold leading-5 text-[#3f4145]">
              Үе шатаар
            </p>
            <div className="flex flex-col gap-4">
              {stages.map((stage) => (
                <div
                  key={stage.label}
                  className="rounded-[20px] border flex justify-between items-center border-black/12 bg-white px-5 py-4">
                  <div className="flex items-center gap-3">
                    <div
                      className={`flex h-10 w-10 shrink-0 items-center border justify-center rounded-[14px] ${stage.bgColor} ${stage.borderColor}`}>
                      {stage.icon}
                    </div>
                    <div className="min-w-0">
                      <p className="text-[16px] font-medium leading-10 text-[#121316]">
                        {stage.label}
                      </p>
                    </div>
                  </div>
                  <span className="text-[30px] font-semibold leading-10 text-[#121316]">
                    {stage.count}
                  </span>
                </div>
              ))}
            </div>
          </section>
        </div>
      </div>

      <div className="h-full w-px bg-[#0000001F]" />

      <div className="flex min-w-0 flex-1 flex-col xl:overflow-hidden gap-2">
        <div className="flex min-w-0 flex-col overflow-hidden rounded-[24px] border border-black/12 bg-white xl:min-h-0 xl:flex-1">
          {/* Scrollable table (header + body together so columns align) */}
          <div className="xl:min-h-0 xl:flex-1 xl:overflow-y-auto">
            {/* Table header */}
            <div
              className="sticky top-0 z-10 grid items-center border-b border-black/12 bg-white px-3 py-3 text-[14px] text-[#3f4145b3] md:px-5"
              style={{
                gridTemplateColumns:
                  "minmax(200px,2fr) minmax(120px,1fr) minmax(120px,1fr) minmax(130px,1fr) 60px",
              }}>
              <div className="flex items-center gap-1 px-2 font-medium text-[#121316]">
                <span>Баримт бичиг</span>
                <span className="text-[#77818c]">&#8597;</span>
              </div>
              <span className="px-2 ml-2 font-medium">Үе</span>
              <div className="flex items-center gap-1 px-2 font-medium">
                <span>Огноо</span>
                <span className="text-[#77818c]">&#8597;</span>
              </div>
              <span className="px-2 font-medium">Төлөв</span>
              <span className="px-2 font-medium">Үйлдэл</span>
            </div>

            {/* Table body */}
            {isLoading ? (
              <div className="flex flex-col gap-3 px-5 py-8">
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
                  className="grid items-center border-b border-black/12 px-3 py-3 transition-colors hover:bg-[#fafafa] md:px-5"
                  style={{
                    gridTemplateColumns:
                      "minmax(200px,2fr) minmax(120px,1fr) minmax(120px,1fr) minmax(130px,1fr) 60px",
                  }}>
                  <div className="flex items-center gap-2.5 px-2">
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-[12px] border border-black/12 bg-white text-[#121316]">
                      <ReqIcon className="h-4 w-4 text-[#121316]" />
                    </div>
                    <p className="truncate text-[14px] font-medium text-[#121316]">
                      {row.document.documentName}
                    </p>
                  </div>
                  <div className="px-2">
                    <div className="inline-flex items-center rounded-full border border-black/12 px-3 py-1 text-[12px] text-[#3f4145]">
                      {stageLabel(row.employee)}
                    </div>
                  </div>
                  <div className="flex items-center gap-2 px-2">
                    <CalIcon className="h-4 w-4 shrink-0 text-[#77818c]" />
                    <span className="text-[14px] text-[#3f4145]">
                      {formatDate(row.document.createdAt)}
                    </span>
                  </div>
                  <div className="px-2">
                    <span className="inline-flex items-center gap-1.5 rounded-full border border-[#1aba5280] px-3 py-1 text-[12px] font-medium text-[#1aba52]">
                      <span className="h-2 w-2 rounded-full bg-[#1aba52]" />
                      Баталгаажсан
                    </span>
                  </div>
                  <div className="flex items-center justify-center">
                    <button
                      onClick={() => setDownloadRow(row)}
                      className="flex h-8 w-8 cursor-pointer items-center justify-center rounded-[10px] text-[#77818c] transition-colors hover:bg-[#f5f5f5] hover:text-[#121316]"
                      aria-label="Татах">
                      <DownloadIcon />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Footer */}
          <div className="flex shrink-0 items-center justify-between border-t border-black/12 px-5 py-3">
            <p className="text-[13px] text-[#77818c]">
              Нийт {filtered.length} баримт
            </p>
          </div>
        </div>
        <div className="flex items-center justify-end">
          <button
            onClick={() => setShowModal(true)}
            className="flex cursor-pointer items-center gap-2 rounded-[12px] bg-[#121316] px-4 py-2.5 text-[14px] font-medium text-white transition-colors hover:bg-[#1f2126]">
            <PlusIcon />
            Шинэ Баримт
          </button>
        </div>
      </div>
    </div>
  );
}

export default FilesComponent;
