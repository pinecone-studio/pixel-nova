"use client";

import { useQuery } from "@apollo/client/react";
import { useMemo, useState, useCallback } from "react";
import { FiUser, FiChevronDown, FiChevronUp, FiFilter } from "react-icons/fi";

import { CalIcon } from "@/components/icons";
import { GET_PROCESSED_EVENTS, GET_EMPLOYEES } from "@/graphql/queries";
import { buildGraphQLHeaders } from "@/lib/apollo-client";
import type { ProcessedEvent, Employee } from "@/lib/types";

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const ACTION_LABELS: Record<string, string> = {
  add_employee: "Шинэ ажилтан авах",
  promote_employee: "Тушаал дэвшүүлэх",
  change_position: "Албан тушаал солих",
  offboard_employee: "Ажлаас чөлөөлөх",
};

const STATUS_CONFIG: Record<
  string,
  { label: string; dot: string; badge: string }
> = {
  completed: {
    label: "Амжилттай",
    dot: "bg-emerald-500",
    badge:
      "border-emerald-200 bg-emerald-50 text-emerald-700",
  },
  processing: {
    label: "Боловсруулж байна",
    dot: "bg-blue-500",
    badge: "border-blue-200 bg-blue-50 text-blue-700",
  },
  ignored: {
    label: "Алгассан",
    dot: "bg-slate-400",
    badge: "border-slate-200 bg-slate-50 text-slate-500",
  },
  failed: {
    label: "Алдаа",
    dot: "bg-red-500",
    badge: "border-red-200 bg-red-50 text-red-600",
  },
};

// ---------------------------------------------------------------------------
// Event status badge
// ---------------------------------------------------------------------------

function EventStatusBadge({ status }: { status: string }) {
  const cfg = STATUS_CONFIG[status] ?? STATUS_CONFIG.ignored;
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[11px] font-medium ${cfg.badge}`}>
      <span className={`h-1.5 w-1.5 rounded-full ${cfg.dot}`} />
      {cfg.label}
    </span>
  );
}

// ---------------------------------------------------------------------------
// Payload detail modal
// ---------------------------------------------------------------------------

function PayloadModal({
  event,
  employee,
  onClose,
}: {
  event: ProcessedEvent;
  employee?: Employee;
  onClose: () => void;
}) {
  const empName = employee
    ? `${employee.lastName} ${employee.firstName}`
    : event.employeeId;

  let parsedPayload: unknown = null;
  try {
    parsedPayload = JSON.parse(event.payload);
  } catch {
    // keep null
  }

  const dateStr = new Date(event.processedAt).toLocaleDateString("mn-MN", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });

  return (
    <div className="fixed inset-0 z-100 flex items-center justify-center bg-black/50 p-4">
      <div className="w-full max-w-lg rounded-[24px] border border-black/12 bg-white shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-black/12 px-6 py-4">
          <div>
            <h3 className="text-[16px] font-semibold text-[#121316]">
              Эвент дэлгэрэнгүй
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

        <div className="flex flex-col gap-4 px-6 py-5 max-h-[60vh] overflow-y-auto">
          {/* Meta */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <p className="mb-1 text-[11px] font-semibold uppercase tracking-wider text-[#77818c]">
                Event ID
              </p>
              <p className="text-[13px] text-[#121316] font-mono break-all">
                {event.eventId}
              </p>
            </div>
            <div>
              <p className="mb-1 text-[11px] font-semibold uppercase tracking-wider text-[#77818c]">
                Төрөл
              </p>
              <p className="text-[13px] text-[#121316]">{event.eventType}</p>
            </div>
            <div>
              <p className="mb-1 text-[11px] font-semibold uppercase tracking-wider text-[#77818c]">
                Үйлдэл
              </p>
              <p className="text-[13px] text-[#121316]">
                {event.action
                  ? ACTION_LABELS[event.action] ?? event.action
                  : "—"}
              </p>
            </div>
            <div>
              <p className="mb-1 text-[11px] font-semibold uppercase tracking-wider text-[#77818c]">
                Статус
              </p>
              <EventStatusBadge status={event.status} />
            </div>
          </div>

          {/* Error */}
          {event.lastError && (
            <div className="rounded-[12px] border border-red-200 bg-red-50 px-4 py-3">
              <p className="mb-1 text-[11px] font-semibold uppercase tracking-wider text-red-500">
                Алдааны мэдээлэл
              </p>
              <p className="text-[13px] text-red-700 whitespace-pre-wrap break-all">
                {event.lastError}
              </p>
            </div>
          )}

          {/* Payload */}
          <div>
            <p className="mb-1.5 text-[11px] font-semibold uppercase tracking-wider text-[#77818c]">
              Payload (Queue мессеж)
            </p>
            <div className="rounded-[12px] border border-black/6 bg-[#fafafa] px-4 py-3 overflow-x-auto">
              <pre className="text-[12px] text-[#3f4145] whitespace-pre-wrap break-all font-mono leading-relaxed">
                {parsedPayload
                  ? JSON.stringify(parsedPayload, null, 2)
                  : event.payload}
              </pre>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Summary cards
// ---------------------------------------------------------------------------

function StatusSummary({ events }: { events: ProcessedEvent[] }) {
  const counts = useMemo(() => {
    const map = { completed: 0, processing: 0, ignored: 0, failed: 0 };
    for (const e of events) {
      if (e.status in map) map[e.status as keyof typeof map]++;
    }
    return map;
  }, [events]);

  return (
    <div className="grid grid-cols-4 gap-3">
      {(
        [
          {
            key: "completed" as const,
            label: "Амжилттай",
            color: "text-emerald-600",
            bg: "bg-emerald-50 border-emerald-200",
          },
          {
            key: "processing" as const,
            label: "Боловсруулж буй",
            color: "text-blue-600",
            bg: "bg-blue-50 border-blue-200",
          },
          {
            key: "ignored" as const,
            label: "Алгассан",
            color: "text-slate-500",
            bg: "bg-slate-50 border-slate-200",
          },
          {
            key: "failed" as const,
            label: "Алдаатай",
            color: "text-red-600",
            bg: "bg-red-50 border-red-200",
          },
        ] as const
      ).map(({ key, label, color, bg }) => (
        <div
          key={key}
          className={`rounded-[16px] border px-4 py-3 ${bg}`}>
          <p className={`text-[22px] font-bold ${color}`}>{counts[key]}</p>
          <p className="text-[12px] text-[#3f4145]">{label}</p>
        </div>
      ))}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Main component
// ---------------------------------------------------------------------------

type SortDir = "asc" | "desc";

export function ProcessedEventsViewer() {
  const [statusFilter, setStatusFilter] = useState<string>("");
  const [expandedRow, setExpandedRow] = useState<string | null>(null);
  const [detailEvent, setDetailEvent] = useState<ProcessedEvent | null>(null);
  const [sortDir, setSortDir] = useState<SortDir>("desc");

  const headers = useMemo(
    () => ({ headers: buildGraphQLHeaders({ actorRole: "hr" }) }),
    [],
  );

  const { data, loading, error } = useQuery<{
    processedEvents: ProcessedEvent[];
  }>(GET_PROCESSED_EVENTS, {
    context: headers,
    fetchPolicy: "network-only",
  });

  const { data: empData } = useQuery<{ employees: Employee[] }>(
    GET_EMPLOYEES,
    { context: headers, fetchPolicy: "cache-first" },
  );

  const employeeMap = useMemo(() => {
    const map = new Map<string, Employee>();
    for (const emp of empData?.employees ?? []) {
      map.set(emp.id, emp);
    }
    return map;
  }, [empData]);

  const allEvents = data?.processedEvents ?? [];

  const filteredEvents = useMemo(() => {
    let events = allEvents;
    if (statusFilter) {
      events = events.filter((e) => e.status === statusFilter);
    }
    const dir = sortDir === "asc" ? 1 : -1;
    return [...events].sort(
      (a, b) => dir * a.processedAt.localeCompare(b.processedAt),
    );
  }, [allEvents, statusFilter, sortDir]);

  const toggleExpand = useCallback(
    (eventId: string) =>
      setExpandedRow((prev) => (prev === eventId ? null : eventId)),
    [],
  );

  return (
    <div className="flex flex-col gap-4">
      {/* Summary cards */}
      <StatusSummary events={allEvents} />

      {/* Toolbar */}
      <div className="flex items-center justify-between">
        <p className="text-[13px] text-[#3f4145] font-medium">
          Нийт {filteredEvents.length} эвент
        </p>
        <div className="flex items-center gap-2">
          <FiFilter className="h-3.5 w-3.5 text-[#77818c]" />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="rounded-[10px] border border-black/12 bg-white px-3 py-1.5 text-[13px] text-[#121316] outline-none focus:border-blue-400">
            <option value="">Бүгд</option>
            <option value="completed">Амжилттай</option>
            <option value="processing">Боловсруулж буй</option>
            <option value="ignored">Алгассан</option>
            <option value="failed">Алдаатай</option>
          </select>
        </div>
      </div>

      {error && (
        <div className="rounded-2xl border border-red-200 bg-red-50 px-5 py-4 text-sm text-red-500">
          {error.message}
        </div>
      )}

      {/* Detail modal */}
      {detailEvent && (
        <PayloadModal
          event={detailEvent}
          employee={employeeMap.get(detailEvent.employeeId)}
          onClose={() => setDetailEvent(null)}
        />
      )}

      {/* Table */}
      <div className="overflow-hidden rounded-[24px] border border-black/12 bg-white">
        {/* Header */}
        <div
          className="grid items-center border-b border-dashed border-black/12 px-3 py-3 text-[13px] text-[#3f4145] md:px-5"
          style={{
            gridTemplateColumns:
              "minmax(90px,0.8fr) minmax(140px,1.5fr) minmax(120px,1fr) minmax(100px,0.8fr) minmax(100px,0.9fr) 48px",
          }}>
          <span className="px-2 font-medium">Төрөл</span>
          <span className="px-2 font-medium">Ажилтан</span>
          <span className="px-2 font-medium">Үйлдэл</span>
          <span className="px-2 font-medium">Статус</span>
          <button
            onClick={() =>
              setSortDir((d) => (d === "asc" ? "desc" : "asc"))
            }
            className="flex items-center gap-1 px-2 font-medium hover:text-[#121316] transition-colors text-left">
            Огноо
            <span className="text-[10px]">
              {sortDir === "desc" ? "↓" : "↑"}
            </span>
          </button>
          <span />
        </div>

        {/* Body */}
        {loading ? (
          <div className="flex flex-col gap-3 px-5 py-8">
            <div className="h-4 w-56 rounded-full skeleton" />
            <div className="h-3 w-80 rounded-full skeleton" />
            <div className="h-3 w-72 rounded-full skeleton" />
          </div>
        ) : filteredEvents.length === 0 ? (
          <div className="py-12 text-center text-[#3f4145] text-sm">
            Эвент олдсонгүй
          </div>
        ) : (
          filteredEvents.map((evt) => {
            const emp = employeeMap.get(evt.employeeId);
            const empName = emp
              ? `${emp.lastName} ${emp.firstName}`
              : evt.employeeId;
            const actionLabel = evt.action
              ? ACTION_LABELS[evt.action] ?? evt.action
              : "—";
            const dateStr = new Date(evt.processedAt).toLocaleDateString(
              "mn-MN",
              { year: "numeric", month: "2-digit", day: "2-digit" },
            );
            const isExpanded = expandedRow === evt.eventId;

            return (
              <div key={evt.eventId}>
                <div
                  className="grid items-center border-b border-black/12 px-3 py-3.5 transition-colors hover:bg-[#fafafa] md:px-5 cursor-pointer"
                  style={{
                    gridTemplateColumns:
                      "minmax(90px,0.8fr) minmax(140px,1.5fr) minmax(120px,1fr) minmax(100px,0.8fr) minmax(100px,0.9fr) 48px",
                  }}
                  onClick={() => toggleExpand(evt.eventId)}>
                  {/* Төрөл */}
                  <div className="px-2">
                    <span className="text-[12px] font-mono text-[#3f4145] bg-[#f0f0f0] rounded px-1.5 py-0.5">
                      {evt.eventType}
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

                  {/* Үйлдэл */}
                  <div className="px-2">
                    <span className="truncate text-[13px] text-[#121316]">
                      {actionLabel}
                    </span>
                  </div>

                  {/* Статус */}
                  <div className="px-2">
                    <EventStatusBadge status={evt.status} />
                  </div>

                  {/* Огноо */}
                  <div className="flex items-center gap-1.5 px-2">
                    <CalIcon className="h-3.5 w-3.5 text-[#77818c]" />
                    <span className="text-[13px] text-[#3f4145]">
                      {dateStr}
                    </span>
                  </div>

                  {/* Expand icon */}
                  <div className="flex items-center justify-center px-2">
                    {isExpanded ? (
                      <FiChevronUp className="h-4 w-4 text-[#77818c]" />
                    ) : (
                      <FiChevronDown className="h-4 w-4 text-[#77818c]" />
                    )}
                  </div>
                </div>

                {/* Expanded row */}
                {isExpanded && (
                  <div className="border-b border-black/12 bg-[#fafafa] px-5 py-4">
                    <div className="flex items-start gap-6">
                      <div className="flex-1 min-w-0">
                        <div className="grid grid-cols-2 gap-3 text-[13px]">
                          <div>
                            <span className="text-[#77818c]">Event ID:</span>{" "}
                            <span className="font-mono text-[12px] text-[#121316] break-all">
                              {evt.eventId}
                            </span>
                          </div>
                          <div>
                            <span className="text-[#77818c]">Цаг:</span>{" "}
                            <span className="text-[#121316]">
                              {new Date(evt.processedAt).toLocaleString(
                                "mn-MN",
                              )}
                            </span>
                          </div>
                        </div>

                        {evt.lastError && (
                          <div className="mt-3 rounded-[10px] border border-red-200 bg-red-50 px-3 py-2 text-[12px] text-red-600">
                            <span className="font-medium">Алдаа: </span>
                            {evt.lastError}
                          </div>
                        )}
                      </div>

                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setDetailEvent(evt);
                        }}
                        className="shrink-0 rounded-[10px] border border-black/12 bg-white px-3 py-1.5 text-[12px] text-[#3f4145] transition-colors hover:bg-[#f5f5f5] hover:text-[#121316]">
                        Payload харах
                      </button>
                    </div>
                  </div>
                )}
              </div>
            );
          })
        )}

        {/* Footer */}
        {!loading && filteredEvents.length > 0 && (
          <div className="border-t border-dashed border-black/12 px-5 py-3 text-[13px] text-[#3f4145]">
            Нийт {filteredEvents.length} эвент
          </div>
        )}
      </div>
    </div>
  );
}

export default ProcessedEventsViewer;
