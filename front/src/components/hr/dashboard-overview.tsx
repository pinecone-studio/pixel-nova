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
      <div className="rounded-2xl border-t border-[#00C0A833] bg-brand-gradient p-6 relative overflow-hidden">
        <div className="relative flex items-start justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-white font-medium mb-3">
              Нийт ажилчид
            </p>
            <div className="flex items-center gap-3 mb-1">
              <p className="text-5xl font-bold text-[#0ad4b1]">
                {loading ? "..." : stats.totalEmployees}
              </p>
              <span className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-[#0ad4b1]/15 text-[#0ad4b1] text-xs font-semibold">
                <ArrowUpRightIcon className="w-3.5 h-3.5" />{" "}
                {stats.monthlyGrowth >= 0 ? "+" : ""}
                {stats.monthlyGrowth}%
              </span>
            </div>
            <p className="text-white text-sm">
              Аудитын бүртгэл: {loading ? "..." : auditCount}
            </p>
          </div>
          <div className="w-14 h-14 rounded-2xl bg-[#0ad4b1] flex items-center justify-center shadow-[0_8px_24px_rgba(10,212,177,0.4)]">
            <UsersIcon />
          </div>
        </div>
        <div className="mt-6 flex items-end gap-2 h-16">
          {barData.map((height, index) => (
            <div
              key={index}
              className="flex-1 rounded-sm bg-diagonal-gradient transition-colors"
              style={{ height: `${(height / 88) * 100}%` }}
            />
          ))}
        </div>
      </div>

    </>
  );
}
