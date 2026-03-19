"use client";

import { useMutation, useQuery } from "@apollo/client/react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { createPortal } from "react-dom";
import { FiUser, FiFilter, FiX, FiRefreshCw } from "react-icons/fi";

import { AuditActionCard } from "@/components/hr/auditlog/action-card";
import { EditActionDialog } from "@/components/hr/auditlog/edit-action-dialog";
import { ProcessedEventsViewer } from "@/components/hr/auditlog/processed-events-viewer";
import { AddEmployeeRequestDialog } from "@/components/hr/auditlog/request-dialog";
import { useHrOverlay } from "@/components/hr/overlay-context";
import { CalIcon, ReqIcon, EyeIcon } from "@/components/icons";
import { GET_ACTIONS, GET_EMPLOYEES } from "@/graphql/queries";
import { GET_AUDIT_LOGS } from "@/graphql/queries/audit-logs";
import { RETRY_NOTIFICATION } from "@/graphql/mutations";
import { buildGraphQLHeaders } from "@/lib/apollo-client";
import { phaseBadge } from "@/utils/auditlog";
import type { ActionConfig, AuditLog, Employee } from "@/lib/types";

// ---------------------------------------------------------------------------
// Action name → Mongolian document label
// ---------------------------------------------------------------------------

const ACTION_DOC_LABELS: Record<string, string> = {
  add_employee: "Шинэ ажилтан авах",
  promote_employee: "Тушаал дэвшүүлэх",
  change_position: "Ажлаас чөлөөлөх тушаал",
  offboard_employee: "Ажлаас чөлөөлөх тушаал",
};

const PHASE_LABELS: Record<string, string> = {
  onboarding: "onboarding",
  working: "working",
  offboarding: "offboarding",
};

// ---------------------------------------------------------------------------
// Sort helpers
// ---------------------------------------------------------------------------

type SortKey = "documentName" | "employee" | "phase" | "date";
type SortDir = "asc" | "desc";

function toggleSort(
  current: { key: SortKey; dir: SortDir },
  clicked: SortKey,
): { key: SortKey; dir: SortDir } {
  if (current.key === clicked) {
    return { key: clicked, dir: current.dir === "asc" ? "desc" : "asc" };
  }
  return { key: clicked, dir: "asc" };
}

function SortArrow({ active, dir }: { active: boolean; dir: SortDir }) {
  return (
    <span
      className={`ml-1 text-[10px] ${active ? "text-[#121316]" : "text-[#3f4145]/40"}`}>
      {dir === "asc" ? "↑↓" : "↓↑"}
    </span>
  );
}

// ---------------------------------------------------------------------------
// Status dots component (зургийн загвар)
// ---------------------------------------------------------------------------

function SigningStatus({ log }: { log: AuditLog }) {
  const total = log.documentIds.length || 1;
  const signed = log.documentsGenerated ? total : 0;
  const missing = total - signed;

  const dots: React.ReactNode[] = [];
  for (let i = 0; i < Math.min(total, 4); i++) {
    const isSigned = i < signed;
    dots.push(
      <span
        key={i}
        className={`inline-block h-2.5 w-5 rounded-full ${
          isSigned ? "bg-[#1aba52]" : "bg-[#ef4444]"
        }`}
      />,
    );
  }

  return (
    <div className="flex items-center gap-1.5">
      <div className="flex items-center gap-0.5">{dots}</div>
      {missing > 0 ? (
        <span className="text-[12px] text-[#3f4145]">{missing} дутуу</span>
      ) : (
        <span className="text-[12px] text-[#1aba52] font-medium">
          Бүгд бэлэн
        </span>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Email dispatch status
// ---------------------------------------------------------------------------

function EmailStatus({ log }: { log: AuditLog }) {
  if (!log.notificationAttempted) {
    return (
      <span className="inline-flex items-center gap-1 rounded-full border border-slate-200 bg-slate-50 px-2 py-0.5 text-[11px] text-slate-500">
        <span className="h-1.5 w-1.5 rounded-full bg-slate-400" />
        Илгээгээгүй
      </span>
    );
  }

  if (log.notificationError) {
    return (
      <div className="flex flex-col gap-0.5">
        <span className="inline-flex items-center gap-1 rounded-full border border-red-200 bg-red-50 px-2 py-0.5 text-[11px] text-red-600">
          <span className="h-1.5 w-1.5 rounded-full bg-red-500" />
          Алдаа
        </span>
        <span
          className="truncate text-[10px] text-red-400 max-w-[140px]"
          title={log.notificationError}>
          {log.notificationError}
        </span>
      </div>
    );
  }

  if (log.recipientsNotified) {
    return (
      <span className="inline-flex items-center gap-1 rounded-full border border-emerald-200 bg-emerald-50 px-2 py-0.5 text-[11px] text-emerald-700">
        <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
        Илгээсэн ({log.recipientEmails.length})
      </span>
    );
  }

  return (
    <span className="inline-flex items-center gap-1 rounded-full border border-amber-200 bg-amber-50 px-2 py-0.5 text-[11px] text-amber-600">
      <span className="h-1.5 w-1.5 rounded-full bg-amber-500" />
      Хүлээгдэж байна
    </span>
  );
}

// ---------------------------------------------------------------------------
// Detail modal
// ---------------------------------------------------------------------------

function AuditDetailModal({
  log,
  employee,
  onClose,
  onRetry,
  retrying,
}: {
  log: AuditLog;
  employee?: Employee;
  onClose: () => void;
  onRetry?: () => void;
  retrying?: boolean;
}) {
  const empName = employee
    ? `${employee.lastName} ${employee.firstName}`
    : log.employeeId;
  const dateStr = new Date(log.timestamp).toLocaleDateString("mn-MN", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });

  const modal = (
    <div className="fixed inset-0 z-100 flex items-center justify-center bg-black/50 p-4">
      <button
        type="button"
        aria-label="Close detail overlay"
        className="absolute inset-0"
        onClick={onClose}
      />
      <div className="relative z-10 w-full max-w-lg rounded-[24px] border border-black/12 bg-white shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-black/12 px-6 py-4">
          <div>
            <h3 className="text-[16px] font-semibold text-[#121316]">
              {ACTION_DOC_LABELS[log.action] ?? log.action}
            </h3>
            <p className="text-[13px] text-[#3f4145]">
              {empName} · {dateStr}
            </p>
          </div>
          <button
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-[10px] text-[#77818c] transition-colors hover:bg-[#f5f5f5] hover:text-[#121316]">
            ✕
          </button>
        </div>

        <div className="flex flex-col gap-4 px-6 py-5">
          {/* Documents */}
          <div>
            <p className="mb-1.5 text-[12px] font-semibold uppercase tracking-wider text-[#3f4145]">
              Баримтууд ({log.documentIds.length})
            </p>
            {log.documentIds.length > 0 ? (
              <div className="flex flex-col gap-1">
                {log.documentIds.map((docId) => (
                  <div
                    key={docId}
                    className="flex items-center gap-2 rounded-[10px] border border-black/6 bg-[#fafafa] px-3 py-2 text-[13px]">
                    <ReqIcon className="h-3.5 w-3.5 text-[#77818c]" />
                    <span className="text-[#121316] truncate">{docId}</span>
                  </div>
                ))}
              </div>
            ) : (
              <span className="text-[13px] text-[#77818c]">
                Баримт үүсээгүй
              </span>
            )}
          </div>

          {/* Email dispatch */}
          <div>
            <p className="mb-1.5 text-[12px] font-semibold uppercase tracking-wider text-[#3f4145]">
              Имэйл мэдэгдэл
            </p>
            <div className="rounded-[12px] border border-black/6 bg-[#fafafa] px-4 py-3">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[13px] text-[#3f4145]">Статус</span>
                <EmailStatus log={log} />
              </div>

              {log.recipientEmails.length > 0 && (
                <div className="mt-2 border-t border-black/6 pt-2">
                  <p className="mb-1 text-[11px] text-[#77818c]">
                    Хүлээн авагчид:
                  </p>
                  <div className="flex flex-wrap gap-1">
                    {log.recipientEmails.map((email) => (
                      <span
                        key={email}
                        className="rounded-full border border-black/12 bg-white px-2 py-0.5 text-[11px] text-[#3f4145]">
                        {email}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {log.notificationError && (
                <div className="mt-2 rounded-[8px] border border-red-200 bg-red-50 px-3 py-2 text-[12px] text-red-600">
                  <div className="flex items-center justify-between gap-2">
                    <div>
                      <span className="font-medium">Алдаа: </span>
                      {log.notificationError}
                    </div>
                    {onRetry && (
                      <button
                        onClick={onRetry}
                        disabled={retrying}
                        className="shrink-0 flex items-center gap-1 rounded-[8px] border border-red-300 bg-white px-2.5 py-1 text-[11px] font-medium text-red-600 transition-colors hover:bg-red-50 disabled:opacity-50">
                        <FiRefreshCw
                          className={`h-3 w-3 ${retrying ? "animate-spin" : ""}`}
                        />
                        {retrying ? "Илгээж байна..." : "Дахин илгээх"}
                      </button>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Incomplete fields */}
          {log.incompleteFields.length > 0 && (
            <div>
              <p className="mb-1.5 text-[12px] font-semibold uppercase tracking-wider text-[#3f4145]">
                Дутуу талбарууд
              </p>
              <div className="flex flex-wrap gap-1">
                {log.incompleteFields.map((field) => (
                  <span
                    key={field}
                    className="rounded-full border border-amber-200 bg-amber-50 px-2 py-0.5 text-[11px] text-amber-700">
                    {field}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Meta */}
          <div className="flex items-center gap-4 text-[12px] text-[#77818c] border-t border-black/6 pt-3">
            <span>Actor: {log.actorId ?? "system"}</span>
            <span>Role: {log.actorRole}</span>
            <span>Phase: {log.phase}</span>
          </div>
        </div>
      </div>
    </div>
  );

  return typeof document !== "undefined"
    ? createPortal(modal, document.body)
    : modal;
}

// ---------------------------------------------------------------------------
// Main Component
// ---------------------------------------------------------------------------

type TabKey = "actions" | "events";

export function AuditlogComponent() {
  const [activeTab, setActiveTab] = useState<TabKey>("actions");
  const [search, setSearch] = useState("");
  const [sendRequestAction, setSendRequestAction] =
    useState<ActionConfig | null>(null);
  const [editAction, setEditAction] = useState<ActionConfig | null>(null);
  const [detailLog, setDetailLog] = useState<AuditLog | null>(null);
  const { setBlurred } = useHrOverlay();
  const [sort, setSort] = useState<{ key: SortKey; dir: SortDir }>({
    key: "date",
    dir: "desc",
  });

  // ---- Audit trail filters ----
  const [filterAction, setFilterAction] = useState("");
  const [filterFromDate, setFilterFromDate] = useState("");
  const [filterToDate, setFilterToDate] = useState("");
  const [filterEmployee, setFilterEmployee] = useState("");

  const hasActiveFilters = !!(
    filterAction ||
    filterFromDate ||
    filterToDate ||
    filterEmployee
  );

  const clearFilters = useCallback(() => {
    setFilterAction("");
    setFilterFromDate("");
    setFilterToDate("");
    setFilterEmployee("");
  }, []);

  const headers = useMemo(
    () => ({ headers: buildGraphQLHeaders({ actorRole: "hr" }) }),
    [],
  );

  // ---- Retry mutation ----
  const [retryNotification, { loading: retrying }] = useMutation<{
    retryNotification: AuditLog;
  }>(RETRY_NOTIFICATION, {
    context: headers,
    refetchQueries: [
      {
        query: GET_AUDIT_LOGS,
        variables: {
          action: filterAction || undefined,
          fromDate: filterFromDate || undefined,
          toDate: filterToDate || undefined,
        },
      },
    ],
    onCompleted: (result) => {
      setDetailLog(result.retryNotification);
    },
  });

  const handleRetry = useCallback(() => {
    if (!detailLog) return;
    retryNotification({ variables: { auditLogId: detailLog.id } });
  }, [detailLog, retryNotification]);

  // ---- Queries ----
  const {
    data: actionsData,
    loading: actionsLoading,
    error: actionsError,
  } = useQuery<{ actions: ActionConfig[] }>(GET_ACTIONS, {
    context: headers,
    fetchPolicy: "network-only",
  });

  const { data: auditData, loading: auditLoading } = useQuery<{
    auditLogs: AuditLog[];
  }>(GET_AUDIT_LOGS, {
    context: headers,
    fetchPolicy: "network-only",
    variables: {
      action: filterAction || undefined,
      fromDate: filterFromDate || undefined,
      toDate: filterToDate || undefined,
    },
  });

  const { data: empData } = useQuery<{ employees: Employee[] }>(GET_EMPLOYEES, {
    context: headers,
    fetchPolicy: "cache-first",
  });

  // ---- Employee lookup map ----
  const employeeMap = useMemo(() => {
    const map = new Map<string, Employee>();
    for (const emp of empData?.employees ?? []) {
      map.set(emp.id, emp);
    }
    return map;
  }, [empData]);

  // ---- Actions (top cards) ----
  const actionOrder = useMemo(
    () => [
      "add_employee",
      "promote_employee",
      "change_position",
      "offboard_employee",
    ],
    [],
  );
  const actionOrderMap = useMemo(
    () => new Map(actionOrder.map((name, index) => [name, index])),
    [actionOrder],
  );
  const allowedActionNames = useMemo(() => new Set(actionOrder), [actionOrder]);

  const filteredActions = useMemo(() => {
    const visible = (actionsData?.actions ?? []).filter((a) =>
      allowedActionNames.has(a.name),
    );
    const ordered = [...visible].sort((a, b) => {
      const ai = actionOrderMap.get(a.name) ?? Number.MAX_SAFE_INTEGER;
      const bi = actionOrderMap.get(b.name) ?? Number.MAX_SAFE_INTEGER;
      return ai !== bi ? ai - bi : a.name.localeCompare(b.name);
    });
    if (!search) return ordered;
    const q = search.toLowerCase();
    return ordered.filter(
      (a) =>
        a.name.toLowerCase().includes(q) ||
        a.phase.toLowerCase().includes(q) ||
        a.recipients.some((r) => r.toLowerCase().includes(q)),
    );
  }, [actionsData, search, allowedActionNames, actionOrderMap]);

  // ---- Audit logs (bottom table) ----
  const auditLogs = useMemo(() => {
    let logs = auditData?.auditLogs ?? [];

    // Client-side employee name filter
    if (filterEmployee) {
      const q = filterEmployee.toLowerCase();
      logs = logs.filter((log) => {
        const emp = employeeMap.get(log.employeeId);
        if (!emp) return log.employeeId.toLowerCase().includes(q);
        const fullName = `${emp.lastName} ${emp.firstName}`.toLowerCase();
        return (
          fullName.includes(q) || emp.employeeCode.toLowerCase().includes(q)
        );
      });
    }

    // Sort
    const sorted = [...logs].sort((a, b) => {
      const dir = sort.dir === "asc" ? 1 : -1;
      switch (sort.key) {
        case "documentName": {
          const aLabel = ACTION_DOC_LABELS[a.action] ?? a.action;
          const bLabel = ACTION_DOC_LABELS[b.action] ?? b.action;
          return dir * aLabel.localeCompare(bLabel);
        }
        case "employee": {
          const aEmp = employeeMap.get(a.employeeId);
          const bEmp = employeeMap.get(b.employeeId);
          const aName = aEmp
            ? `${aEmp.lastName} ${aEmp.firstName}`
            : a.employeeId;
          const bName = bEmp
            ? `${bEmp.lastName} ${bEmp.firstName}`
            : b.employeeId;
          return dir * aName.localeCompare(bName);
        }
        case "phase":
          return dir * a.phase.localeCompare(b.phase);
        case "date":
          return dir * a.timestamp.localeCompare(b.timestamp);
        default:
          return 0;
      }
    });

    return sorted;
  }, [auditData, sort, employeeMap, filterEmployee]);

  const handleSort = useCallback(
    (key: SortKey) => setSort((prev) => toggleSort(prev, key)),
    [],
  );

  useEffect(() => {
    setBlurred(!!detailLog);
  }, [detailLog, setBlurred]);

  // ---- Render ----
  return (
    <div className="min-h-screen bg-[#F4F5F7] text-slate-900 font-sans flex flex-col gap-6 p-0">
      {/* ── Tab Toggle ── */}
      <div className="flex items-center gap-1 rounded-[14px] border border-black/12 bg-white p-1 self-start">
        <button
          onClick={() => setActiveTab("actions")}
          className={`rounded-[10px] px-4 py-2 text-[13px] font-medium transition-colors ${
            activeTab === "actions"
              ? "bg-[#121316] text-white"
              : "text-[#3f4145] hover:bg-[#f5f5f5]"
          }`}>
          Үйлдлүүд & Аудит
        </button>
        <button
          onClick={() => setActiveTab("events")}
          className={`rounded-[10px] px-4 py-2 text-[13px] font-medium transition-colors ${
            activeTab === "events"
              ? "bg-[#121316] text-white"
              : "text-[#3f4145] hover:bg-[#f5f5f5]"
          }`}>
          Эвент боловсруулалт
        </button>
      </div>

      {activeTab === "events" ? (
        <ProcessedEventsViewer />
      ) : (
        <>
          <AddEmployeeRequestDialog
            key={sendRequestAction?.id ?? "empty"}
            action={sendRequestAction}
            open={!!sendRequestAction}
            onOpenChange={(open) => {
              if (!open) setSendRequestAction(null);
            }}
          />

          <EditActionDialog
            action={editAction}
            open={!!editAction}
            onOpenChange={(open) => {
              if (!open) setEditAction(null);
            }}
          />

          {detailLog && (
            <AuditDetailModal
              log={detailLog}
              employee={employeeMap.get(detailLog.employeeId)}
              onClose={() => setDetailLog(null)}
              onRetry={detailLog.notificationError ? handleRetry : undefined}
              retrying={retrying}
            />
          )}

          {/* ── Action Cards ── */}
          <p className="text-[#3F4145] text-sm font-medium">
            Нийт {filteredActions.length} үйлдэл
          </p>

          {actionsError && (
            <div className="rounded-2xl border border-red-200 bg-red-50 px-5 py-4 text-sm text-red-500">
              {actionsError.message}
            </div>
          )}

          {actionsLoading ? (
            <div className="py-8 px-4 flex flex-col gap-3">
              <div className="h-4 w-64 rounded-full skeleton" />
              <div className="h-3 w-80 rounded-full skeleton" />
              <div className="h-3 w-72 rounded-full skeleton" />
            </div>
          ) : filteredActions.length === 0 ? (
            <div className="py-12 text-center text-slate-400 text-sm">
              Үйлдэл олдсонгүй
            </div>
          ) : (
            <div className="grid grid-cols-4 gap-4">
              {filteredActions.map((action) => (
                <AuditActionCard
                  key={action.id}
                  action={action}
                  onSendRequest={setSendRequestAction}
                  onEdit={setEditAction}
                />
              ))}
            </div>
          )}

          {/* ── Audit Trail Filters ── */}
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-1.5 text-[13px] text-[#3f4145]">
              <FiFilter className="h-3.5 w-3.5" />
              <span className="font-medium">Шүүлтүүр:</span>
            </div>

            {/* Employee search */}
            <input
              type="text"
              value={filterEmployee}
              onChange={(e) => setFilterEmployee(e.target.value)}
              placeholder="Ажилтан хайх..."
              className="rounded-[10px] border border-black/12 bg-white px-3 py-1.5 text-[13px] text-[#121316] outline-none focus:border-blue-400 w-44"
            />

            {/* Action filter */}
            <select
              value={filterAction}
              onChange={(e) => setFilterAction(e.target.value)}
              className="rounded-[10px] border border-black/12 bg-white px-3 py-1.5 text-[13px] text-[#121316] outline-none focus:border-blue-400">
              <option value="">Бүх үйлдэл</option>
              <option value="add_employee">Шинэ ажилтан авах</option>
              <option value="promote_employee">Тушаал дэвшүүлэх</option>
              <option value="change_position">Албан тушаал солих</option>
              <option value="offboard_employee">Ажлаас чөлөөлөх</option>
            </select>

            {/* Date from */}
            <div className="flex items-center gap-1">
              <span className="text-[12px] text-[#77818c]">Эхлэх:</span>
              <input
                type="date"
                value={filterFromDate}
                onChange={(e) => setFilterFromDate(e.target.value)}
                className="rounded-[10px] border border-black/12 bg-white px-2 py-1.5 text-[13px] text-[#121316] outline-none focus:border-blue-400"
              />
            </div>

            {/* Date to */}
            <div className="flex items-center gap-1">
              <span className="text-[12px] text-[#77818c]">Дуусах:</span>
              <input
                type="date"
                value={filterToDate}
                onChange={(e) => setFilterToDate(e.target.value)}
                className="rounded-[10px] border border-black/12 bg-white px-2 py-1.5 text-[13px] text-[#121316] outline-none focus:border-blue-400"
              />
            </div>

            {/* Clear filters */}
            {hasActiveFilters && (
              <button
                onClick={clearFilters}
                className="flex items-center gap-1 rounded-[10px] border border-black/12 bg-white px-3 py-1.5 text-[12px] text-[#3f4145] transition-colors hover:bg-[#f5f5f5]">
                <FiX className="h-3 w-3" />
                Цэвэрлэх
              </button>
            )}
          </div>

          {/* ── Audit Trail Table ── */}
          <div className="overflow-hidden rounded-[24px] border border-black/12 bg-white">
            {/* Header */}
            <div
              className="grid items-center border-b border-dashed border-black/12 px-3 py-3 text-[13px] text-[#3f4145] md:px-5"
              style={{
                gridTemplateColumns:
                  "minmax(160px,2fr) minmax(140px,1.25fr) minmax(90px,0.8fr) minmax(100px,0.9fr) minmax(120px,1fr) minmax(120px,1fr) 72px",
              }}>
              <button
                onClick={() => handleSort("documentName")}
                className="flex items-center gap-1 px-2 font-medium hover:text-[#121316] transition-colors text-left">
                Баримт бичиг
                <SortArrow
                  active={sort.key === "documentName"}
                  dir={sort.dir}
                />
              </button>
              <button
                onClick={() => handleSort("employee")}
                className="flex items-center gap-1 px-2 font-medium hover:text-[#121316] transition-colors text-left">
                Ажилтан
                <SortArrow active={sort.key === "employee"} dir={sort.dir} />
              </button>
              <span className="px-2 font-medium">Үе</span>
              <button
                onClick={() => handleSort("date")}
                className="flex items-center gap-1 px-2 font-medium hover:text-[#121316] transition-colors text-left">
                Огноо
                <SortArrow active={sort.key === "date"} dir={sort.dir} />
              </button>
              <span className="px-2 font-medium">Баримт</span>
              <span className="px-2 font-medium">Имэйл</span>
              <span className="px-2 font-medium">Дэлгэр.</span>
            </div>

            {/* Body */}
            {auditLoading ? (
              <div className="flex flex-col gap-3 px-5 py-8">
                <div className="h-4 w-56 rounded-full skeleton" />
                <div className="h-3 w-80 rounded-full skeleton" />
                <div className="h-3 w-72 rounded-full skeleton" />
              </div>
            ) : auditLogs.length === 0 ? (
              <div className="py-12 text-center text-[#3f4145] text-sm">
                Бүртгэл олдсонгүй
              </div>
            ) : (
              auditLogs.map((log) => {
                const emp = employeeMap.get(log.employeeId);
                const empName = emp
                  ? `${emp.lastName} ${emp.firstName}`
                  : log.employeeId;
                const docLabel = ACTION_DOC_LABELS[log.action] ?? log.action;
                const phaseKey = PHASE_LABELS[log.phase] ?? log.phase;
                const dateStr = new Date(log.timestamp).toLocaleDateString(
                  "mn-MN",
                  { year: "numeric", month: "2-digit", day: "2-digit" },
                );

                return (
                  <div
                    key={log.id}
                    className="grid items-center border-b border-black/12 px-3 py-3.5 transition-colors hover:bg-[#fafafa] md:px-5"
                    style={{
                      gridTemplateColumns:
                        "minmax(160px,2fr) minmax(140px,1.25fr) minmax(90px,0.8fr) minmax(100px,0.9fr) minmax(120px,1fr) minmax(120px,1fr) 72px",
                    }}>
                    {/* Баримт бичиг */}
                    <div className="flex items-center gap-2.5 px-2">
                      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-[12px] border border-black/12 bg-white">
                        <ReqIcon className="h-4 w-4 text-[#121316]" />
                      </div>
                      <span className="truncate text-[14px] font-medium text-[#121316]">
                        {docLabel}
                      </span>
                    </div>

                    {/* Ажилтан */}
                    <div className="flex items-center gap-2 px-2">
                      <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[#f0f0f0]">
                        {emp?.imageUrl ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            src={emp.imageUrl}
                            alt={empName}
                            className="h-7 w-7 rounded-full object-cover"
                          />
                        ) : (
                          <FiUser className="h-3.5 w-3.5 text-[#77818c]" />
                        )}
                      </div>
                      <span className="truncate text-[13px] text-[#121316]">
                        {empName}
                      </span>
                    </div>

                    {/* Үе (Phase badge) */}
                    <div className="px-2">
                      <span
                        className={`inline-flex items-center gap-1 rounded-full px-2 py-1 text-[11px] font-medium ${phaseBadge(log.phase)}`}>
                        <span className="text-[10px]">◆</span>
                        {phaseKey}
                      </span>
                    </div>

                    {/* Огноо */}
                    <div className="flex items-center gap-1.5 px-2">
                      <CalIcon className="h-3.5 w-3.5 text-[#77818c]" />
                      <span className="text-[13px] text-[#3f4145]">
                        {dateStr}
                      </span>
                    </div>

                    {/* Баримт (signing dots) */}
                    <div className="px-2">
                      <SigningStatus log={log} />
                    </div>

                    {/* Имэйл статус */}
                    <div className="px-2">
                      <EmailStatus log={log} />
                    </div>

                    {/* Дэлгэрэнгүй */}
                    <div className="flex items-center justify-center px-2">
                      <button
                        onClick={() => setDetailLog(log)}
                        className="flex h-8 w-8 items-center justify-center rounded-[10px] text-[#77818c] transition-colors hover:bg-[#f5f5f5] hover:text-[#121316]"
                        aria-label="Дэлгэрэнгүй">
                        <EyeIcon />
                      </button>
                    </div>
                  </div>
                );
              })
            )}

            {/* Footer */}
            {!auditLoading && auditLogs.length > 0 && (
              <div className="border-t border-dashed border-black/12 px-5 py-3 text-[13px] text-[#3f4145]">
                Нийт {auditLogs.length} баримт
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}

export default AuditlogComponent;
