"use client";

import { ArrowUpRightIcon, UsersIcon } from "@/components/icons";

import type { DashboardStats } from "./dashboard-data";

export function HrDashboardOverview({
  auditCount,
  barData,
  loading,
  stats,
}: {
  auditCount: number;
  barData: number[];
  loading: boolean;
  stats: DashboardStats;
}) {
  return (
    <>
      <div className="rounded-2xl border border-slate-200 bg-white p-6 relative overflow-hidden shadow-sm">
        <div className="relative flex items-start justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-slate-500 font-medium mb-3">
              Нийт ажилчид
            </p>
            <div className="flex items-center gap-3 mb-1">
              <p className="text-5xl font-bold text-[#3F4145CC]">
                {loading ? "..." : stats.totalEmployees}
              </p>
              <span className="flex items-center gap-1 px-2.5 py-1 rounded-full border border-emerald-500 text-emerald-600 text-xs font-semibold">
                <ArrowUpRightIcon className="w-3.5 h-3.5" />{" "}
                {stats.monthlyGrowth >= 0 ? "+" : ""}
                {stats.monthlyGrowth}%
              </span>
            </div>
            <p className="text-slate-600 text-sm">
              Аудитын бүртгэл: {loading ? "..." : auditCount}
            </p>
          </div>
          <div className="w-14 h-14 rounded-2xl bg-[#121316] flex items-center justify-center shadow-[0_8px_24px_rgba(16,185,129,0.35)]">
            <UsersIcon className="text-white" />
          </div>
        </div>
        <div className="mt-6 flex items-end gap-2 h-16">
          {barData.map((height, index) => (
            <div
              key={index}
              className="flex-1 rounded-sm bg-[#3F4145] transition-colors"
              style={{ height: `${(height / 88) * 100}%` }}
            />
          ))}
        </div>
      </div>
    </>
  );
}
