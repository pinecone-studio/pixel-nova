"use client";

import { useState } from "react";

import { ArrowUpRightIcon, UsersIcon } from "@/components/icons";
import type { LeaveRequest } from "@/lib/types";

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
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex items-start justify-between">
            <div>
              <div className="flex items-center gap-3">
                <p className="text-5xl font-bold text-[#3F4145CC]">
                  {loading ? "..." : stats.totalEmployees}
                </p>
                <span className="flex items-center gap-1 rounded-full border border-emerald-500 px-2.5 py-1 text-xs font-semibold text-emerald-600">
                  <ArrowUpRightIcon className="h-3.5 w-3.5" />
                  {stats.monthlyGrowth >= 0 ? "+" : ""}
                  {stats.monthlyGrowth}%
                </span>
              </div>
              <p className="mt-2 text-xs text-slate-500">
                Өмнө сар: {loading ? "..." : stats.totalEmployees - 6}
              </p>
            </div>
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#121316]">
              <UsersIcon className="text-white" />
            </div>
          </div>
          <div className="mt-6 flex items-end gap-2 h-12">
            {barData.slice(0, 8).map((height, index) => (
              <div
                key={index}
                className="flex-1 rounded-sm bg-[#3F4145]"
                style={{ height: `${(height / 88) * 200}%` }}
              />
            ))}
          </div>
        </div>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white shadow-sm">
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
            <button className="rounded-xl border border-slate-200 px-3 py-2 text-xs text-slate-600">
              Шүүх
            </button>
            <button className="rounded-xl bg-slate-900 px-3 py-2 text-xs text-white">
              Бүгдийг харах ↗
            </button>
          </div>
        </div>
        <div className="divide-y divide-slate-200">
          {(pendingRequests.length > 0 ? pendingRequests.slice(0, 5) : []).map(
            (req) => (
              <div key={req.id} className="flex items-center gap-3 px-6 py-4">
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
              </div>
            ),
          )}
          {pendingRequests.length === 0 ? (
            <div className="px-6 py-6 text-sm text-slate-500">
              Одоогоор хүлээгдэж буй хүсэлт алга байна.
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}
