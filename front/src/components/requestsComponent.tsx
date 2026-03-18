"use client";

import { useApolloClient, useMutation, useQuery } from "@apollo/client/react";
import { useMemo, useState } from "react";
import {
  DownIcon,
  DownloadIcon,
  FilterIcon,
  PreviewIcon,
  ReqIcon,
  SearchIcon,
} from "./icons";
import { buildGraphQLHeaders } from "@/lib/apollo-client";
import {
  APPROVE_LEAVE_REQUEST,
  REJECT_LEAVE_REQUEST,
} from "@/graphql/mutations";
import { GET_DOCUMENTS, GET_LEAVE_REQUESTS } from "@/graphql/queries";
import type { Document, LeaveRequest } from "@/lib/types";
import { formatDepartment, formatLeaveRequestStatus } from "@/lib/labels";

const StatusBadge = ({ status }: { status: string }) => {
  const styles: Record<string, string> = {
    pending: "bg-yellow-600/30 text-yellow-400 border border-yellow-600/40",
    approved: "bg-green-600/30 text-green-400 border border-green-600/40",
    rejected: "bg-red-600/30 text-red-400 border border-red-600/40",
  };
  return (
    <span
      className={`text-xs px-3 py-1 rounded-full font-medium whitespace-nowrap ${styles[status] ?? "bg-slate-600/30 text-slate-400"}`}>
      {formatLeaveRequestStatus(status) || status}
    </span>
  );
};

const eyeStyleMap: Record<string, string> = {
  pending: "border-yellow-600/40 text-yellow-500 bg-yellow-500/10",
  approved: "border-green-500/40 text-green-400 bg-green-500/10",
  rejected: "border-red-500/40 text-red-400 bg-red-500/10",
};

function getInitials(firstName: string, lastName: string) {
  return `${lastName.charAt(0)}${firstName.charAt(0)}`;
}

function avatarColor(str: string) {
  void str;
  return "bg-linear-to-br from-[#2d7bff] to-[#00c2ff]";
}

const PreviewModal = ({
  row,
  onClose,
  onApprove,
  onReject,
}: {
  row: LeaveRequest;
  onClose: () => void;
  onApprove: (id: string, note: string) => Promise<void>;
  onReject: (id: string, note: string) => Promise<void>;
}) => {
  const [note, setNote] = useState(row.note ?? "");
  const [acting, setActing] = useState(false);

  const initials = getInitials(row.employee.firstName, row.employee.lastName);
  const color = avatarColor(row.employeeId);

  async function handleApprove() {
    setActing(true);
    await onApprove(row.id, note);
    setActing(false);
    onClose();
  }

  async function handleReject() {
    setActing(true);
    await onReject(row.id, note);
    setActing(false);
    onClose();
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm"
      onClick={onClose}>
      <div
        className="relative w-[420px] max-w-[95vw] bg-white rounded-3xl border border-slate-200 shadow-[0_28px_60px_rgba(15,23,42,0.12)] p-6 flex flex-col gap-5"
        onClick={(e) => e.stopPropagation()}>
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="w-14 h-14 rounded-full overflow-hidden shrink-0">
              <div
                className={`w-full h-full ${color} flex items-center justify-center text-white font-bold text-lg`}>
                {initials}
              </div>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <p className="text-slate-900 font-bold text-xl">
                  {row.employee.lastName} {row.employee.firstName}
                </p>
                <StatusBadge status={row.status} />
              </div>
              <p className="text-slate-500 text-sm mt-0.5">
                {row.employee.employeeCode} â€¢{" "}
                {formatDepartment(row.employee.department)}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-700 transition-colors text-xl leading-none mt-1">
            âœ•
          </button>
        </div>

        <div className="h-px bg-slate-200" />

        <div className="bg-slate-50 rounded-2xl p-4 flex flex-col gap-4 border border-slate-200">
          <p className="text-slate-900 font-semibold text-base">{row.type}</p>
          <div className="grid grid-cols-2 gap-y-4">
            <div>
              <p className="text-slate-500 text-xs mb-1">Ð­Ñ…Ð»ÑÑ… Ñ†Ð°Ð³</p>
              <p className="text-slate-700 text-sm font-medium">
                {row.startTime}
              </p>
            </div>
            <div>
              <p className="text-slate-500 text-xs mb-1">Ð”ÑƒÑƒÑÐ°Ñ… Ñ†Ð°Ð³</p>
              <p className="text-slate-700 text-sm font-medium">
                {row.endTime}
              </p>
            </div>
            <div>
              <p className="text-slate-500 text-xs mb-1">
                Ð˜Ð»Ð³ÑÑÑÑÐ½ Ð¾Ð³Ð½Ð¾Ð¾
              </p>
              <p className="text-emerald-600 text-sm font-semibold">
                {new Date(row.createdAt).toLocaleDateString("mn-MN")}
              </p>
            </div>
            <div>
              <p className="text-slate-500 text-xs mb-1">
                ÐÐ»Ð±Ð°Ð½ Ñ‚ÑƒÑˆÐ°Ð°Ð»
              </p>
              <p className="text-slate-700 text-sm font-medium">
                {row.employee.jobTitle}
              </p>
            </div>
            {row.reason && (
              <div className="col-span-2">
                <p className="text-slate-500 text-xs mb-1">Ð¨Ð°Ð»Ñ‚Ð³Ð°Ð°Ð½</p>
                <p className="text-slate-700 text-sm font-medium">
                  {row.reason}
                </p>
              </div>
            )}
          </div>
        </div>

        <div className="flex flex-col gap-2">
          <p className="text-slate-900 font-semibold text-base">
            Ð¢Ð°Ð¹Ð»Ð±Ð°Ñ€{" "}
            <span className="text-slate-500 font-normal">
              (Ð—Ð°Ð°Ð²Ð°Ð» Ð±Ð¸Ñˆ)
            </span>
          </p>
          <textarea
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="Ð­Ð½Ð´ Ð±Ð¸Ñ‡Ð½Ñ Ò¯Ò¯..."
            rows={3}
            className="w-full bg-white border border-slate-200 rounded-2xl px-4 py-3 text-slate-700 text-sm placeholder:text-slate-400 outline-none resize-none focus:border-slate-300 transition-colors"
          />
        </div>

        {row.status === "pending" ? (
          <div className="flex items-center justify-end gap-3 mt-1">
            <button
              onClick={handleReject}
              disabled={acting}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl border border-red-200 text-red-500 text-sm font-medium hover:bg-red-50 disabled:opacity-50 transition-colors">
              <span>âœ•</span> Ð¢Ð°Ñ‚Ð³Ð°Ð»Ð·Ð°Ñ…
            </button>
            <button
              onClick={handleApprove}
              disabled={acting}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-slate-900 text-white text-sm font-medium hover:bg-slate-800 disabled:opacity-50 transition-colors">
              <span>âœ“</span>{" "}
              {acting ? "Ð¢Ò¯Ñ€ Ñ…Ò¯Ð»ÑÑÐ½Ñ Ò¯Ò¯..." : "Ð‘Ð°Ñ‚Ð»Ð°Ñ…"}
            </button>
          </div>
        ) : (
          <p className="text-center text-slate-500 text-sm">
            Ð­Ð½Ñ Ñ…Ò¯ÑÑÐ»Ñ‚ Ð°Ð»ÑŒ Ñ…ÑÐ´Ð¸Ð¹Ð½{" "}
            <StatusBadge status={row.status} />
          </p>
        )}
      </div>
    </div>
  );
};

const RequestRow = ({
  row,
  expanded,
  onToggle,
  documents,
  documentsLoading,
  divider = true,
}: {
  row: LeaveRequest;
  expanded: boolean;
  onToggle: (row: LeaveRequest) => void;
  documents: Document[];
  documentsLoading: boolean;
  divider?: boolean;
}) => {
  const initials = getInitials(row.employee.firstName, row.employee.lastName);
  const color = avatarColor(row.employeeId);
  const documentCount = documents.length;

  return (
    <>
      <div
        className="flex items-center justify-between h-24 p-5 hover:bg-slate-50 transition-colors cursor-pointer"
        onClick={() => onToggle(row)}>
        <div className="flex items-center gap-3">
          <div
            className={`w-11 h-11 rounded-xl ${color} flex items-center justify-center font-bold text-white text-sm shrink-0`}>
            {initials}
          </div>
          <div className=" flex justify-center flex-col">
            <p className="text-slate-900 font-semibold text-sm h-6">
              {row.employee.lastName} {row.employee.firstName}
            </p>
            <p className="text-slate-500 text-xs">
              {row.employee.employeeCode} •{" "}
              {formatDepartment(row.employee.department)}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-blue-600 text-[11px] px-2.5 py-1 rounded-full bg-blue-50 border border-blue-200 hidden sm:block">
            {documentsLoading ? "..." : documentCount} гэрээ
          </span>
          <DownIcon
            className={
              expanded
                ? "rotate-180 transition-transform"
                : "transition-transform"
            }
          />
        </div>
      </div>
      {expanded ? (
        <div className="px-5 pb-4">
          <div className="rounded-xl border border-slate-200 bg-white overflow-hidden">
            {documentsLoading ? (
              <div className="py-8 flex items-center justify-center gap-3 text-slate-500 text-sm">
                <span className="w-4 h-4 border-2 border-slate-700 border-t-slate-400 rounded-full animate-spin" />
                уншиж байна
              </div>
            ) : documents.length === 0 ? (
              <div className="py-8 text-center text-slate-500 text-sm">
                Мэдээлэл байхгүй байна
              </div>
            ) : (
              documents.map((doc, idx) => (
                <div
                  key={doc.id}
                  className={`flex items-center justify-between px-4 py-3 ${idx > 0 ? "border-t border-slate-200" : ""}`}>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-white border border-slate-200 flex items-center justify-center text-slate-400">
                      <ReqIcon />
                    </div>
                    <div>
                      <p className="text-slate-900 text-sm font-semibold">
                        {doc.documentName}
                      </p>
                      <p className="text-slate-500 text-xs">{doc.action}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4 text-slate-500 text-xs">
                    <PreviewIcon />
                    <DownloadIcon />
                    <span className="min-w-[72px] text-right">
                      {new Date(doc.createdAt).toLocaleDateString("mn-MN")}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      ) : null}
      {divider && <div className="h-px bg-slate-200" />}
    </>
  );
};

export const RequestsComponent = () => {
  // const [activeTab, setActiveTab] = useState("Ð‘Ò¯Ð³Ð´");
  const [search, setSearch] = useState("");
  const [previewRow, setPreviewRow] = useState<LeaveRequest | null>(null);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [documentsByEmployee, setDocumentsByEmployee] = useState<
    Record<string, Document[]>
  >({});
  const [documentsLoading, setDocumentsLoading] = useState<
    Record<string, boolean>
  >({});

  const queryContext = useMemo(
    () => ({
      headers: buildGraphQLHeaders({ actorRole: "hr" }),
    }),
    [],
  );

  const apolloClient = useApolloClient();

  const { data, loading } = useQuery<{ leaveRequests: LeaveRequest[] }>(
    GET_LEAVE_REQUESTS,
    {
      variables: { status: null },
      context: queryContext,
      fetchPolicy: "cache-and-network",
    },
  );

  const [approveMutation] = useMutation<{ approveLeaveRequest: LeaveRequest }>(
    APPROVE_LEAVE_REQUEST,
    {
      context: queryContext,
      refetchQueries: [
        {
          query: GET_LEAVE_REQUESTS,
          variables: { status: null },
          context: queryContext,
        },
      ],
      awaitRefetchQueries: true,
    },
  );

  const [rejectMutation] = useMutation<{ rejectLeaveRequest: LeaveRequest }>(
    REJECT_LEAVE_REQUEST,
    {
      context: queryContext,
      refetchQueries: [
        {
          query: GET_LEAVE_REQUESTS,
          variables: { status: null },
          context: queryContext,
        },
      ],
      awaitRefetchQueries: true,
    },
  );

  const requests = data?.leaveRequests ?? [];

  async function handleApprove(id: string, note: string) {
    try {
      await approveMutation({ variables: { id, note: note || null } });
    } catch (e) {
      console.error(e);
    }
  }

  async function handleReject(id: string, note: string) {
    try {
      await rejectMutation({ variables: { id, note: note || null } });
    } catch (e) {
      console.error(e);
    }
  }

  const filtered = requests.filter((r) => {
    const matchSearch =
      !search ||
      r.employee.firstName.toLowerCase().includes(search.toLowerCase()) ||
      r.employee.lastName.toLowerCase().includes(search.toLowerCase()) ||
      r.employee.employeeCode.toLowerCase().includes(search.toLowerCase());
    return matchSearch;
  });

  function handleToggle(row: LeaveRequest) {
    setExpandedId((prev) => {
      const next = prev === row.id ? null : row.id;
      if (next) {
        void loadDocuments(row.employeeId);
      }
      return next;
    });
  }

  async function loadDocuments(employeeId: string) {
    if (documentsByEmployee[employeeId] || documentsLoading[employeeId]) return;

    setDocumentsLoading((prev) => ({ ...prev, [employeeId]: true }));

    try {
      const result = await apolloClient.query<{ documents: Document[] }>({
        query: GET_DOCUMENTS,
        variables: { employeeId },
        context: queryContext,
        fetchPolicy: "network-only",
      });

      setDocumentsByEmployee((prev) => ({
        ...prev,
        [employeeId]: result.data?.documents ?? [],
      }));
    } catch (error) {
      console.error(error);
      setDocumentsByEmployee((prev) => ({ ...prev, [employeeId]: [] }));
    } finally {
      setDocumentsLoading((prev) => ({ ...prev, [employeeId]: false }));
    }
  }

  return (
    <div className="min-h-screen bg-[#F4F5F7] text-slate-900 font-sans p-6 flex flex-col gap-4 animate-fade-up">
      {previewRow && (
        <PreviewModal
          row={previewRow}
          onClose={() => setPreviewRow(null)}
          onApprove={handleApprove}
          onReject={handleReject}
        />
      )}

      <div className="rounded-2xl border border-slate-200 bg-white overflow-hidden shadow-[0_1px_2px_rgba(15,23,42,0.06)]">
        <div className="flex items-center justify-between gap-4 px-5 py-4 flex-wrap border-b border-slate-200">
          <div className="flex items-center gap-2 bg-white border border-slate-200 rounded-xl px-3 py-2 min-w-[230px]">
            <SearchIcon />
            <input
              className="bg-transparent text-slate-600 text-sm outline-none placeholder:text-slate-400 w-full"
              placeholder="Ажилтны кодоор хайх"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          <div className="flex items-center gap-2 ml-auto">
            <button className="flex items-center gap-2 px-3 py-2 rounded-xl bg-white border border-slate-200 text-slate-600 text-sm hover:bg-slate-50 transition-colors">
              <FilterIcon />
              Шүүлтүүр
            </button>
            <button className="flex items-center gap-2 px-3 py-2 rounded-xl bg-white border border-slate-200 text-slate-600 text-sm hover:bg-slate-50 transition-colors">
              <DownloadIcon />
              Татах
            </button>
          </div>
        </div>

        <div className="h-px bg-slate-200" />

        <div className="flex flex-col">
          {loading ? (
            <div className="py-8 px-5 flex flex-col gap-3">
              <div className="h-4 w-56 rounded-full skeleton" />
              <div className="h-3 w-80 rounded-full skeleton" />
              <div className="h-3 w-72 rounded-full skeleton" />
            </div>
          ) : filtered.length === 0 ? (
            <div className="py-12 text-center text-slate-400 text-sm">
              Мэдээлэл байхгүй байна
            </div>
          ) : (
            filtered.map((row, i) => (
              <RequestRow
                key={row.id}
                row={row}
                expanded={expandedId === row.id}
                onToggle={handleToggle}
                documents={documentsByEmployee[row.employeeId] ?? []}
                documentsLoading={documentsLoading[row.employeeId] ?? false}
                divider={i < filtered.length - 1}
              />
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default RequestsComponent;
