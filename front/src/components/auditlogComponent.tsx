"use client";

import { useQuery } from "@apollo/client/react";
import { useCallback, useMemo, useState } from "react";
import { FiUser, FiTrash2 } from "react-icons/fi";

import { AuditActionCard } from "@/components/hr/auditlog/action-card";
import { AddEmployeeRequestDialog } from "@/components/hr/auditlog/request-dialog";
import { DownloadIcon, CalIcon, ReqIcon } from "@/components/icons";
import { GET_ACTIONS, GET_EMPLOYEES } from "@/graphql/queries";
import { GET_AUDIT_LOGS } from "@/graphql/queries/audit-logs";
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

  // Render colored dots
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
        <span className="text-[12px] text-[#3f4145]">{missing} missing</span>
      ) : (
        <span className="text-[12px] text-[#1aba52] font-medium">
          All signed
        </span>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Main Component
// ---------------------------------------------------------------------------

export function AuditlogComponent() {
  const [search, setSearch] = useState("");
  const [sendRequestAction, setSendRequestAction] =
    useState<ActionConfig | null>(null);
  const [sort, setSort] = useState<{ key: SortKey; dir: SortDir }>({
    key: "date",
    dir: "desc",
  });

  const headers = useMemo(
    () => ({ headers: buildGraphQLHeaders({ actorRole: "hr" }) }),
    [],
  );

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
    const logs = auditData?.auditLogs ?? [];

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
  }, [auditData, sort, employeeMap]);

  const handleSort = useCallback(
    (key: SortKey) => setSort((prev) => toggleSort(prev, key)),
    [],
  );

  // ---- Render ----
  return (
    <div className="min-h-screen bg-[#F4F5F7] text-slate-900 font-sans flex flex-col gap-6 p-0">
      <AddEmployeeRequestDialog
        key={sendRequestAction?.id ?? "empty"}
        action={sendRequestAction}
        open={!!sendRequestAction}
        onOpenChange={(open) => {
          if (!open) setSendRequestAction(null);
        }}
      />

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
            />
          ))}
        </div>
      )}

      {/* ── Audit Trail Table ── */}
      <div className="overflow-hidden rounded-[24px] border border-black/12 bg-white">
        {/* Header */}
        <div
          className="grid items-center border-b border-dashed border-black/12 px-3 py-3 text-[13px] text-[#3f4145] md:px-5"
          style={{
            gridTemplateColumns:
              "minmax(180px,2fr) minmax(160px,1.5fr) minmax(110px,1fr) minmax(120px,1fr) minmax(160px,1.5fr) 72px",
          }}>
          <button
            onClick={() => handleSort("documentName")}
            className="flex items-center gap-1 px-2 font-medium hover:text-[#121316] transition-colors text-left">
            Баримт бичиг
            <SortArrow active={sort.key === "documentName"} dir={sort.dir} />
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
          <span className="px-2 font-medium">Төлөв</span>
          <span className="px-2 font-medium">Үйлдэл</span>
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
                    "minmax(180px,2fr) minmax(160px,1.5fr) minmax(110px,1fr) minmax(120px,1fr) minmax(160px,1.5fr) 72px",
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
                  <span className="truncate text-[14px] text-[#121316]">
                    {empName}
                  </span>
                </div>

                {/* Үе (Phase badge) */}
                <div className="px-2">
                  <span
                    className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[11px] font-medium ${phaseBadge(log.phase)}`}>
                    <span className="text-[10px]">◆</span>
                    {phaseKey}
                  </span>
                </div>

                {/* Огноо */}
                <div className="flex items-center gap-1.5 px-2">
                  <CalIcon className="h-3.5 w-3.5 text-[#77818c]" />
                  <span className="text-[13px] text-[#3f4145]">{dateStr}</span>
                </div>

                {/* Төлөв (signing dots) */}
                <div className="px-2">
                  <SigningStatus log={log} />
                </div>

                {/* Үйлдэл */}
                <div className="flex items-center gap-0 px-2">
                  <button
                    className="flex h-8 w-8 items-center justify-center rounded-[10px] text-[#77818c] transition-colors hover:bg-[#f5f5f5] hover:text-[#121316]"
                    aria-label="Татах">
                    <DownloadIcon />
                  </button>
                  <button
                    className="flex h-8 w-8 items-center justify-center rounded-[10px] text-[#77818c] transition-colors hover:bg-[#f5f5f5] hover:text-red-500"
                    aria-label="Устгах">
                    <FiTrash2 className="h-4 w-4" />
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
    </div>
  );
}

export default AuditlogComponent;
