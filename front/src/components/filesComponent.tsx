"use client";

import { useApolloClient, useMutation, useQuery } from "@apollo/client/react";
import { useCallback, useEffect, useMemo, useState } from "react";

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

type FileRow = {
  document: Document;
  employee?: Employee;
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
  return new Date(value).toLocaleDateString("mn-MN", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });
}

function stageKeyForEmployee(employee?: Employee) {
  if (!employee) return "active";
  if (employee.status === "Ð¢Ð°ÑÐ°Ð»ÑÐ°Ð½") return "offboarding";
  if (employee.status === "Ð˜Ñ€ÑÑÐ½") return "active";
  return "onboarding";
}

function statusLabel(document: Document) {
  return document.storageUrl ? "Ð‘Ð°Ñ‚Ð°Ð»Ð³Ð°Ð°Ð¶ÑÐ°Ð½" : "Draft";
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
      reject(
        reader.error ?? new Error("Ð¤Ð°Ð¹Ð» ÑƒÐ½ÑˆÐ¸Ð¶ Ñ‡Ð°Ð´ÑÐ°Ð½Ð³Ò¯Ð¹."),
      );
    reader.readAsDataURL(file);
  });
}

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
    () => ({
      headers: buildGraphQLHeaders({ actorRole: "hr" }),
    }),
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
      onClick={onClose}>
      <div
        className="relative w-[760px] max-w-[95vw] bg-[#0f1520] rounded-3xl border border-slate-700/50 shadow-2xl overflow-hidden"
        onClick={(event) => event.stopPropagation()}>
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-700/40">
          <div>
            <p className="text-white font-semibold text-base">
              {row.document.documentName}
            </p>
            <p className="text-slate-500 text-xs mt-0.5">
              {row.employee
                ? `${row.employee.lastName} ${row.employee.firstName} â€¢ ${row.employee.employeeCode}`
                : row.document.employeeId}
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white transition-colors text-lg">
            âœ•
          </button>
        </div>

        <div className="h-[70vh] bg-[#080c12] p-6">
          {loading ? (
            <div className="w-full h-full rounded-2xl border border-slate-700/40 flex items-center justify-center text-slate-400 text-sm">
              Ð£Ð½ÑˆÐ¸Ð¶ Ð±Ð°Ð¹Ð½Ð°...
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
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black font-semibold text-sm transition-colors">
                <DownloadIcon />
                Ð¢Ð°Ñ‚Ð°Ñ…
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
              Preview Ð±ÑÐ»ÑÐ½ Ð±Ð¸Ñˆ Ð±Ð°Ð¹Ð½Ð°.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function NewDocModal({
  employees,
  onClose,
  onUploaded,
}: {
  employees: Employee[];
  onClose: () => void;
  onUploaded: () => Promise<void>;
}) {
  const [employeeId, setEmployeeId] = useState(employees[0]?.id ?? "");
  const [action, setAction] = useState("hr-upload");
  const [documentName, setDocumentName] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const queryContext = useMemo(
    () => ({
      headers: buildGraphQLHeaders({ actorRole: "hr" }),
    }),
    [],
  );

  const [uploadDocument] = useMutation(UPLOAD_HR_DOCUMENT, {
    context: queryContext,
  });

  async function handleSubmit() {
    if (!employeeId) {
      setError("ÐÐ¶Ð¸Ð»Ñ‚Ð°Ð½ ÑÐ¾Ð½Ð³Ð¾Ð½Ð¾ ÑƒÑƒ.");
      return;
    }
    if (!documentName.trim()) {
      setError("Ð‘Ð°Ñ€Ð¸Ð¼Ñ‚Ñ‹Ð½ Ð½ÑÑ€ Ð¾Ñ€ÑƒÑƒÐ»Ð½Ð° ÑƒÑƒ.");
      return;
    }
    if (!file) {
      setError("Ð¤Ð°Ð¹Ð» ÑÐ¾Ð½Ð³Ð¾Ð½Ð¾ ÑƒÑƒ.");
      return;
    }

    setSaving(true);
    setError(null);

    try {
      const contentBase64 = await fileToBase64(file);
      await uploadDocument({
        variables: {
          input: {
            employeeId,
            action: action.trim() || "hr-upload",
            documentName: documentName.trim(),
            contentType: file.type || "application/octet-stream",
            contentBase64,
          },
        },
      });
      await onUploaded();
      onClose();
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Ð‘Ð°Ñ€Ð¸Ð¼Ñ‚ upload Ñ…Ð¸Ð¹Ð¶ Ñ‡Ð°Ð´ÑÐ°Ð½Ð³Ò¯Ð¹.",
      );
    } finally {
      setSaving(false);
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/65 backdrop-blur-sm"
      onClick={onClose}>
      <div
        className="relative w-[520px] max-w-[95vw] bg-[#0f1520] rounded-3xl border border-slate-700/50 shadow-2xl p-7 flex flex-col gap-4"
        onClick={(event) => event.stopPropagation()}>
        <div className="flex items-center justify-between">
          <h2 className="text-white text-xl font-bold">Ð¨Ð¸Ð½Ñ Ð±Ð°Ñ€Ð¸Ð¼Ñ‚</h2>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white transition-colors text-lg">
            âœ•
          </button>
        </div>

        <label className="flex flex-col gap-2">
          <span className="text-sm text-slate-300">ÐÐ¶Ð¸Ð»Ñ‚Ð°Ð½</span>
          <select
            value={employeeId}
            onChange={(event) => setEmployeeId(event.target.value)}
            className="h-11 rounded-xl border border-slate-700/50 bg-[#0d1117] px-3 text-sm text-white outline-none">
            {employees.map((employee) => (
              <option key={employee.id} value={employee.id}>
                {employee.lastName} {employee.firstName} (
                {employee.employeeCode})
              </option>
            ))}
          </select>
        </label>

        <label className="flex flex-col gap-2">
          <span className="text-sm text-slate-300">Action</span>
          <input
            value={action}
            onChange={(event) => setAction(event.target.value)}
            className="h-11 rounded-xl border border-slate-700/50 bg-[#0d1117] px-3 text-sm text-white outline-none"
            placeholder="hr-upload"
          />
        </label>

        <label className="flex flex-col gap-2">
          <span className="text-sm text-slate-300">Ð‘Ð°Ñ€Ð¸Ð¼Ñ‚Ñ‹Ð½ Ð½ÑÑ€</span>
          <input
            value={documentName}
            onChange={(event) => setDocumentName(event.target.value)}
            className="h-11 rounded-xl border border-slate-700/50 bg-[#0d1117] px-3 text-sm text-white outline-none"
            placeholder="Ð–Ð¸ÑˆÑÑ: ÐÑÐ¼ÑÐ»Ñ‚ Ð³ÑÑ€ÑÑ"
          />
        </label>

        <label className="flex flex-col gap-2">
          <span className="text-sm text-slate-300">Ð¤Ð°Ð¹Ð»</span>
          <input
            type="file"
            onChange={(event) => setFile(event.target.files?.[0] ?? null)}
            className="rounded-xl border border-slate-700/50 bg-[#0d1117] px-3 py-3 text-sm text-slate-300 outline-none file:mr-3 file:rounded-lg file:border-0 file:bg-emerald-500 file:px-3 file:py-1.5 file:text-sm file:font-semibold file:text-black"
          />
        </label>

        {error ? <p className="text-sm text-red-400">{error}</p> : null}

        <div className="flex justify-end gap-3 pt-2">
          <button
            onClick={onClose}
            className="px-5 py-2.5 rounded-xl border border-slate-700/50 text-slate-300 text-sm">
            Ð‘Ð¾Ð»Ð¸Ñ…
          </button>
          <button
            onClick={handleSubmit}
            disabled={saving}
            className="px-5 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 disabled:opacity-60 text-black text-sm font-semibold transition-colors">
            {saving ? "Ð˜Ð»Ð³ÑÑÐ¶ Ð±Ð°Ð¹Ð½Ð°..." : "Ð¥Ð°Ð´Ð³Ð°Ð»Ð°Ñ…"}
          </button>
        </div>
      </div>
    </div>
  );
}

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
    () => ({
      headers: buildGraphQLHeaders({ actorRole: "hr" }),
    }),
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

          return {
            employee,
            docs: result.data?.documents ?? [],
          };
        }),
      );

      const nextRows = documentLists
        .flatMap(({ employee, docs }) =>
          docs.map((document) => ({
            document,
            employee,
          })),
        )
        .sort(
          (left, right) =>
            new Date(right.document.createdAt).getTime() -
            new Date(left.document.createdAt).getTime(),
        );

      setRows(nextRows);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Ð‘Ð°Ñ€Ð¸Ð¼Ñ‚ÑƒÑƒÐ´Ñ‹Ð³ Ð°Ñ‡Ð°Ð°Ð»Ð¶ Ñ‡Ð°Ð´ÑÐ°Ð½Ð³Ò¯Ð¹.",
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
        ].some((value) => value.toLowerCase().includes(search.toLowerCase())),
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
      label: "ÐÐ¶Ð¸Ð»Ð´ Ð¾Ñ€Ð¾Ñ… Ò¯Ðµ",
      sub: "Onboarding",
      count: stageCounts.onboarding,
      icon: <OnboardIcon />,
      iconBg: "bg-emerald-500",
      border: "border-emerald-600/40",
      bg: "bg-linear-to-br from-green-600/40 to-black",
    },
    {
      label: "ÐÐ¶Ð¸Ð»Ð»Ð°Ñ… Ò¯Ðµ",
      sub: "Active Employment",
      count: stageCounts.active,
      icon: <ActiveIcon />,
      iconBg: "bg-cyan-500",
      border: "border-cyan-600/40",
      bg: "bg-linear-to-br from-[#06B6D4]/40 to-black",
    },
    {
      label: "ÐÐ¶Ð»Ð°Ð°Ñ Ð³Ð°Ñ€Ð°Ñ… Ò¯Ðµ",
      sub: "Offboarding",
      count: stageCounts.offboarding,
      icon: <OffboardIcon />,
      iconBg: "bg-red-500",
      border: "border-red-600/40",
      bg: "bg-linear-to-br from-red-600/40 to-black",
    },
  ];

  const isLoading = loading || loadingRows;

  return (
    <div className="flex gap-5 min-h-screen bg-[#080c12] text-white font-sans p-0">
      {showModal ? (
        <NewDocModal
          employees={employees}
          onClose={() => setShowModal(false)}
          onUploaded={loadRows}
        />
      ) : null}
      {previewRow ? (
        <FilePreviewModal
          row={previewRow}
          mode="preview"
          onClose={() => setPreviewRow(null)}
        />
      ) : null}
      {downloadRow ? (
        <FilePreviewModal
          row={downloadRow}
          mode="download"
          onClose={() => setDownloadRow(null)}
        />
      ) : null}

      <div className="w-[500px] shrink-0 flex flex-col gap-5">
        <div>
          <p className="text-slate-400 text-lg font-semibold uppercase tracking-widest mb-3">
            ÐÐ¸Ð¹Ñ‚ Ð±Ð°Ñ€Ð¸Ð¼Ñ‚
          </p>
          <div className="rounded-2xl border border-slate-700/40 bg-linear-to-br from-blue-600/40 to-black p-5 flex flex-col justify-between h-44">
            <div className="w-12 h-12 rounded-xl bg-blue-500/20 flex items-center justify-center">
              <ReqIcon />
            </div>
            <div>
              <p className="text-6xl font-bold text-white">{filtered.length}</p>
              <div className="flex items-center justify-between mt-1">
                <p className="text-slate-400 text-sm">ÐÐ¸Ð¹Ñ‚ Ð±Ð°Ñ€Ð¸Ð¼Ñ‚</p>
                <p className="text-emerald-400 text-sm font-semibold">
                  Live data
                </p>
              </div>
            </div>
          </div>
        </div>

        <div>
          <p className="text-slate-400 text-lg font-semibold uppercase tracking-widest mb-3">
            Ò®Ðµ ÑˆÐ°Ñ‚Ð°Ð°Ñ€
          </p>
          <div className="flex flex-col gap-8">
            {stages.map((stage) => (
              <div
                key={stage.label}
                className={`rounded-2xl border w-[415px] h-[88px] ${stage.border} ${stage.bg} p-4 flex items-center justify-between`}>
                <div className="flex items-center gap-3">
                  <div
                    className={`w-9 h-9 rounded-xl ${stage.iconBg} flex items-center justify-center shrink-0`}>
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

      <div className="flex-1 flex flex-col">
        <div className="rounded-2xl border border-slate-700/40 bg-[#0a0f18] overflow-hidden flex-1">
          <div className="flex items-center gap-3 px-5 py-4 border-b border-slate-700/40 bg-slate-800/20">
            <div className="flex items-center gap-2 bg-[#0d1117] border border-slate-700/50 rounded-xl px-3 py-2 min-w-[260px]">
              <SearchIcon />
              <input
                className="bg-transparent text-slate-400 text-sm outline-none placeholder:text-slate-600 w-full"
                placeholder="Ð‘Ð°Ñ€Ð¸Ð¼Ñ‚, action, employee-Ð¾Ð¾Ñ€ Ñ…Ð°Ð¹Ñ…"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
              />
            </div>
          </div>

          <div
            className="grid items-center px-5 py-3.5 border-b border-slate-700/40 bg-slate-800/20"
            style={{ gridTemplateColumns: "2fr 1.3fr 1fr 1fr 0.9fr" }}>
            <span className="text-slate-400 font-medium">
              Ð‘Ð°Ñ€Ð¸Ð¼Ñ‚ Ð±Ð¸Ñ‡Ð¸Ð³
            </span>
            <span className="text-slate-400 font-medium">ÐÐ¶Ð¸Ð»Ñ‚Ð°Ð½</span>
            <span className="text-slate-400 font-medium">ÐžÐ³Ð½Ð¾Ð¾</span>
            <span className="text-slate-400 font-medium">Ð¢Ó©Ð»Ó©Ð²</span>
            <span className="text-slate-400 font-medium">Ò®Ð¹Ð»Ð´ÑÐ»</span>
          </div>

          {isLoading ? (
            <div className="py-12 flex items-center justify-center gap-3 text-slate-500 text-sm">
              <span className="w-4 h-4 border-2 border-slate-700 border-t-slate-400 rounded-full animate-spin" />
              Ð£Ð½ÑˆÐ¸Ð¶ Ð±Ð°Ð¹Ð½Ð°...
            </div>
          ) : error ? (
            <div className="py-12 text-center text-red-400 text-sm">
              {error}
            </div>
          ) : filtered.length === 0 ? (
            <div className="py-12 text-center text-slate-500 text-sm">
              Ð‘Ð°Ñ€Ð¸Ð¼Ñ‚ Ð¾Ð»Ð´ÑÐ¾Ð½Ð³Ò¯Ð¹
            </div>
          ) : (
            filtered.map((row) => (
              <div
                key={row.document.id}
                className="grid items-center px-5 py-3.5 border-b border-slate-800/50 hover:bg-slate-800/20 transition-colors"
                style={{ gridTemplateColumns: "2fr 1.3fr 1fr 1fr 0.9fr" }}>
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
                    className="w-7 h-7 flex items-center justify-center rounded-lg text-slate-400 hover:text-white hover:bg-slate-700/50 transition-colors">
                    <EyeIcon />
                  </button>
                  <button
                    onClick={() => setDownloadRow(row)}
                    className="w-7 h-7 flex items-center justify-center rounded-lg text-slate-400 hover:text-white hover:bg-slate-700/50 transition-colors">
                    <DownloadIcon />
                  </button>
                </div>
              </div>
            ))
          )}

          <div className="px-5 py-3.5">
            <span className="text-slate-500 text-sm">
              ÐÐ¸Ð¹Ñ‚ {filtered.length} Ð±Ð°Ñ€Ð¸Ð¼Ñ‚
            </span>
          </div>
        </div>

        <div className="flex justify-end mt-4">
          <button
            onClick={() => setShowModal(true)}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black font-semibold text-sm transition-colors shadow-lg shadow-emerald-500/20">
            <PlusIcon />
            Ð¨Ð¸Ð½Ñ Ð±Ð°Ñ€Ð¸Ð¼Ñ‚
          </button>
        </div>
      </div>
    </div>
  );
}

export default FilesComponent;
