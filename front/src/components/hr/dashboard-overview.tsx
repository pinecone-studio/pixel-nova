"use client";

import { ArrowUpRightIcon, UsersIcon } from "@/components/icons";
import { FiFilter } from "react-icons/fi";

import type { DashboardRequest, DashboardStats } from "./dashboard-data";

export function HrDashboardOverview({
  auditCount,
  barData,
  dashboardRequests,
  loading,
  onOpenRequests,
  stats,
}: {
  auditCount: number;
  barData: number[];
  dashboardRequests: DashboardRequest[];
  loading: boolean;
  onOpenRequests: () => void;
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

      <div className="rounded-2xl border border-[#0ad4b1]/40 bg-[#0a0f0e] overflow-hidden">
        <div className="flex items-center justify-between px-6 py-5 border-b border-dashed border-[#0ad4b1]/30">
          <div>
            <p className="text-white text-xl font-bold">
              Хүлээгдэж буй хүсэлтүүд
            </p>
            <p className="text-slate-500 text-sm mt-0.5">
              Сүүлийн хүлээгдэж буй чөлөөний хүсэлтүүд
            </p>
          </div>
          <div className="flex items-center gap-3">
            <button className="flex items-center gap-2 h-9 px-4 rounded-lg border border-white/10 text-slate-300 text-sm hover:border-white/20 transition-colors">
              <FiFilter /> Шүүх
            </button>
            <button
              onClick={onOpenRequests}
              className="flex items-center gap-2 h-9 px-4 rounded-lg bg-[#085044] text-[#0ad4b1] text-sm font-semibold hover:bg-[#0ad4b1]/20 transition-colors">
              Бүгдийг харах <ArrowUpRightIcon className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
        <div className="flex flex-col">
          {loading ? (
            <div className="px-6 py-8 text-sm text-slate-500">
              Уншиж байна...
            </div>
          ) : dashboardRequests.length === 0 ? (
            <div className="px-6 py-8 text-sm text-slate-500">
              Хүлээгдэж буй хүсэлт олдсонгүй
            </div>
          ) : (
            dashboardRequests.map((request) => (
              <button
                key={request.id}
                type="button"
                className="flex items-center gap-4 px-6 py-4 border-b border-white/5 hover:bg-white/2 transition-colors text-left"
                onClick={onOpenRequests}>
                <div
                  className={`w-11 h-11 rounded-xl ${request.color} flex items-center justify-center text-white text-base font-bold shrink-0`}>
                  {request.employee.firstName.charAt(0)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="text-white text-sm font-semibold">
                      {request.employee.lastName} {request.employee.firstName}
                    </p>
                    {request.urgent ? (
                      <span className="px-2 py-0.5 rounded-full bg-red-500/20 text-red-400 text-xs font-medium border border-red-500/20">
                        Яаралтай
                      </span>
                    ) : null}
                  </div>
                  <p className="text-slate-500 text-xs mt-0.5">
                    {request.type}
                  </p>
                </div>
                <span className="text-slate-600 text-sm shrink-0">
                  {request.elapsedLabel}
                </span>
              </button>
            ))
          )}
        </div>
      </div>
    </>
  );
}
