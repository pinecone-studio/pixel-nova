"use client";

import { useEffect, useMemo, useState } from "react";
import { useMutation } from "@apollo/client/react";
import { createPortal } from "react-dom";

import { ArrowUpRightIcon, UsersIcon } from "@/components/icons";
import type { LeaveRequest } from "@/lib/types";
import { APPROVE_LEAVE_REQUEST, REJECT_LEAVE_REQUEST } from "@/graphql/mutations";
import { buildGraphQLHeaders } from "@/lib/apollo-client";
import { useHrOverlay } from "./overlay-context";

import type { DashboardStats } from "./dashboard-data";

export function HrDashboardOverview({
  auditCount,
  barData,
  loading,
  stats,
  pendingRequests,
}: {
  auditCount: number;
  barData: number[];
  loading: boolean;
  stats: DashboardStats;
  pendingRequests: LeaveRequest[];
}) {
  const [renderedAt] = useState(() => Date.now());
  const [selected, setSelected] = useState<LeaveRequest | null>(null);
  const [note, setNote] = useState("");
  const [acting, setActing] = useState(false);
  const [localRequests, setLocalRequests] = useState<LeaveRequest[]>(
    pendingRequests,
  );
  const { setBlurred } = useHrOverlay();

  useEffect(() => {
    setLocalRequests(pendingRequests);
  }, [pendingRequests]);

  useEffect(() => {
    setBlurred(Boolean(selected));
    return () => setBlurred(false);
  }, [selected, setBlurred]);

  const [approveLeaveRequest] = useMutation(APPROVE_LEAVE_REQUEST, {
    context: { headers: buildGraphQLHeaders({ actorRole: "hr" }) },
  });
  const [rejectLeaveRequest] = useMutation(REJECT_LEAVE_REQUEST, {
    context: { headers: buildGraphQLHeaders({ actorRole: "hr" }) },
  });

  const selectedMeta = useMemo(() => {
    if (!selected) return null;
    const start = new Date(selected.startTime);
    const end = new Date(selected.endTime);
    const diffMs = end.getTime() - start.getTime();
    const days = Math.max(1, Math.ceil(diffMs / 86400000) + 0);
    return {
      startLabel: start.toLocaleDateString("mn-MN"),
      endLabel: end.toLocaleDateString("mn-MN"),
      totalDays: days,
    };
  }, [selected]);

  async function handleApprove() {
    if (!selected) return;
    setActing(true);
    try {
      await approveLeaveRequest({ variables: { id: selected.id, note } });
      setLocalRequests((prev) => prev.filter((req) => req.id !== selected.id));
      setSelected(null);
      setNote("");
    } finally {
      setActing(false);
    }
  }

  async function handleReject() {
    if (!selected) return;
    setActing(true);
    try {
      await rejectLeaveRequest({ variables: { id: selected.id, note } });
      setLocalRequests((prev) => prev.filter((req) => req.id !== selected.id));
      setSelected(null);
      setNote("");
    } finally {
      setActing(false);
    }
  }

  function formatRelativeTime(value: string) {
    const diff = Math.max(0, renderedAt - new Date(value).getTime());
    const mins = Math.floor(diff / 60000);
    if (mins < 60) return `${mins} минут өмнө`;
    const hours = Math.floor(mins / 60);
    if (hours < 24) return `${hours} цаг өмнө`;
    const days = Math.floor(hours / 24);
    return `${days} өдөр өмнө`;
  }

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-[680px_1fr]">
      <div className="flex flex-col gap-6">
        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-[0_10px_30px_rgba(15,23,42,0.06)]">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-xs uppercase tracking-[0.2em] text-slate-400">
                Нийт ажилтан
              </p>
              <div className="mt-3 flex items-center gap-3">
                <p className="text-4xl font-semibold text-slate-900">
                  {loading ? "..." : stats.totalEmployees}
                </p>
                <span className="flex items-center gap-1 rounded-full border border-emerald-200 bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-600">
                  <ArrowUpRightIcon className="h-3.5 w-3.5" />
                  {stats.monthlyGrowth >= 0 ? "+" : ""}
                  {stats.monthlyGrowth}%
                </span>
              </div>
              <p className="mt-2 text-xs text-slate-500">
                Өмнө сар: {loading ? "..." : stats.totalEmployees - 6}
              </p>
            </div>
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-900">
              <UsersIcon className="text-white" />
            </div>
          </div>
          <div className="mt-6 flex items-end gap-2 h-12">
            {barData.slice(0, 8).map((height, index) => (
              <div
                key={index}
                className="flex-1 rounded-lg bg-slate-900/80"
                style={{ height: `${(height / 88) * 200}%` }}
              />
            ))}
          </div>
        </div>
      </div>

      <div className="rounded-3xl border border-slate-200 bg-white shadow-[0_10px_30px_rgba(15,23,42,0.06)]">
        <span className="sr-only">{auditCount}</span>
        <div className="flex items-center justify-between border-b border-slate-200 px-6 py-4">
          <div>
            <p className="text-base font-semibold text-slate-900">
              Хүлээгдэж буй хүсэлтүүд
            </p>
            <p className="text-xs text-slate-500">
              Шинээр ирсэн хүсэлтүүдийг хянах
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button className="rounded-xl border border-slate-200 px-3 py-2 text-xs text-slate-600 hover:bg-slate-50">
              Шүүх
            </button>
            <button className="rounded-xl bg-slate-900 px-3 py-2 text-xs text-white hover:bg-slate-800">
              Бүгдийг харах ↗
            </button>
          </div>
        </div>
        <div className="divide-y divide-slate-200">
          {(localRequests.length > 0 ? localRequests.slice(0, 5) : []).map(
            (req) => (
              <button
                type="button"
                key={req.id}
                onClick={() => {
                  setSelected(req);
                  setNote(req.note ?? "");
                }}
                className="w-full text-left flex items-center gap-3 px-6 py-4 hover:bg-slate-50 transition-colors cursor-pointer"
              >
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-600 text-white text-sm font-semibold">
                  {req.employee.firstName?.[0] ?? "А"}
                </div>
                <div className="flex-1">
                  <p className="text-sm font-semibold text-slate-900">
                    {req.employee.lastName} {req.employee.firstName}
                  </p>
                  <p className="text-xs text-slate-500">
                    {req.type ?? "Хүсэлт"}
                  </p>
                </div>
                <p className="text-xs text-slate-400">
                  {formatRelativeTime(req.createdAt)}
                </p>
              </button>
            ),
          )}
          {localRequests.length === 0 ? (
            <div className="px-6 py-6 text-sm text-slate-500">
              Одоогоор хүлээгдэж буй хүсэлт алга байна.
            </div>
          ) : null}
        </div>
      </div>

      {selected
        ? createPortal(
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
              <div
                className="absolute inset-0"
                onClick={() => setSelected(null)}
              />
              <div className="relative w-[520px] max-w-[95vw] bg-white rounded-3xl border border-slate-200 shadow-[0_30px_70px_rgba(15,23,42,0.2)] p-6 flex flex-col gap-5">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="w-14 h-14 rounded-full overflow-hidden border border-slate-200">
                      <div className="w-full h-full bg-slate-200 flex items-center justify-center text-slate-600 font-semibold">
                        {selected.employee.firstName?.[0] ?? "А"}
                      </div>
                    </div>
                    <div>
                      <p className="text-slate-900 font-bold text-xl leading-6">
                        {selected.employee.lastName} {selected.employee.firstName}
                      </p>
                      <p className="text-slate-500 text-sm mt-1">
                        {selected.employee.employeeCode} •{" "}
                        {selected.employee.department}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="rounded-full border border-red-200 bg-red-50 px-3 py-1 text-xs font-semibold text-red-500">
                      Яаралтай
                    </span>
                    <button
                      type="button"
                      onClick={() => setSelected(null)}
                      className="text-slate-400 hover:text-slate-700 transition-colors text-xl leading-none"
                    >
                      ✕
                    </button>
                  </div>
                </div>

                <div className="h-px bg-slate-200" />

                <div className="rounded-2xl border border-slate-200 p-4">
                  <p className="text-slate-900 font-semibold text-base">
                    {selected.type ?? "Хүсэлт"}
                  </p>
                  <div className="mt-3 grid grid-cols-2 gap-4 text-sm text-slate-600">
                    <div>
                      <p className="text-xs text-slate-500">Эхлэх өдөр</p>
                      <p className="font-medium">{selectedMeta?.startLabel}</p>
                    </div>
                    <div>
                      <p className="text-xs text-slate-500">Дуусах өдөр</p>
                      <p className="font-medium">{selectedMeta?.endLabel}</p>
                    </div>
                    <div>
                      <p className="text-xs text-slate-500">Нийт өдөр</p>
                      <p className="font-medium text-emerald-600">
                        {selectedMeta?.totalDays ?? 0} хоног
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-slate-500">Шалтгаан</p>
                      <p className="font-medium">{selected.reason}</p>
                    </div>
                  </div>
                </div>

                <div className="flex flex-col gap-2">
                  <p className="text-slate-900 font-semibold text-base">
                    Тайлбар{" "}
                    <span className="text-slate-500 font-normal">(Заавал биш)</span>
                  </p>
                  <textarea
                    value={note}
                    onChange={(event) => setNote(event.target.value)}
                    placeholder="Энд бичнэ үү..."
                    rows={3}
                    className="w-full bg-white border border-slate-200 rounded-2xl px-4 py-3 text-slate-700 text-sm placeholder:text-slate-400 outline-none resize-none focus:border-slate-300 transition-colors"
                  />
                </div>

                <div className="flex items-center justify-end gap-3">
                  <button
                    type="button"
                    onClick={handleReject}
                    disabled={acting}
                    className="flex items-center gap-2 px-5 py-2.5 rounded-xl border border-red-200 text-red-500 text-sm font-medium hover:bg-red-50 disabled:opacity-50 transition-colors"
                  >
                    <span>✕</span> Татгалзах
                  </button>
                  <button
                    type="button"
                    onClick={handleApprove}
                    disabled={acting}
                    className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-slate-900 text-white text-sm font-medium hover:bg-slate-800 disabled:opacity-50 transition-colors"
                  >
                    <span>✓</span> {acting ? "Түр хүлээнэ үү..." : "Батлах"}
                  </button>
                </div>
              </div>
            </div>,
            document.body,
          )
        : null}
    </div>
  );
}
