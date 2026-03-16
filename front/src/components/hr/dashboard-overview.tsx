"use client";

import {
  ArrowUpRightIcon,
  BriefcaseIcon,
  CalendarIcon,
  CheckIcon,
  ClockIcon,
  FileIcon,
  TrendIcon,
  UsersIcon,
} from "@/components/icons";
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
      <div className="rounded-2xl border border-white/8 bg-linear-to-br from-[#0e2b26] to-[#092a25] p-6 relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_right,rgba(10,212,177,0.08),transparent_60%)] pointer-events-none" />
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
                <ArrowUpRightIcon className="w-3.5 h-3.5" /> {stats.monthlyGrowth >= 0 ? "+" : ""}
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
              className="flex-1 rounded-sm bg-[#0ad4b1]/30 hover:bg-[#0ad4b1]/60 transition-colors"
              style={{ height: `${(height / 88) * 100}%` }}
            />
          ))}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-5">
        <div className="rounded-2xl border border-white/8 bg-[#130c06] p-6 relative overflow-hidden">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_right,rgba(255,165,0,0.5),black_70%)] pointer-events-none" />
          <div className="relative">
            <div className="flex items-start justify-between mb-4">
              <div className="w-11 h-11 rounded-xl bg-orange-500 flex items-center justify-center shadow-[0_6px_20px_rgba(251,146,60,0.4)]">
                <ClockIcon className="w-5 h-5 text-white" />
              </div>
              <button className="text-slate-600 hover:text-slate-400 text-lg">
                ...
              </button>
            </div>
            <p className="text-slate-400 text-sm mb-3">Хүлээгдэж буй</p>
            <p className="text-4xl font-bold text-white mb-3">
              {loading ? "..." : stats.pendingRequests}
            </p>
            <div className="flex items-center gap-1.5 text-orange-400 text-xs">
              <ClockIcon className="w-3.5 h-3.5" />
              <span>{loading ? "..." : stats.urgentCount} яаралтай</span>
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-white/8 bg-[#071210] p-6 relative overflow-hidden">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_right,rgba(10,212,177,0.07),transparent_60%)] pointer-events-none" />
          <div className="relative">
            <div className="flex items-start justify-between mb-4">
              <div className="w-11 h-11 rounded-xl bg-[#0ad4b1] flex items-center justify-center shadow-[0_6px_20px_rgba(10,212,177,0.4)]">
                <CheckIcon className="w-5 h-5 text-[#060d0c]" />
              </div>
              <button className="text-slate-600 hover:text-slate-400 text-lg">
                ...
              </button>
            </div>
            <p className="text-slate-400 text-sm mb-3">Баталсан</p>
            <p className="text-4xl font-bold text-white mb-3">
              {loading ? "..." : stats.approvedRequests}
            </p>
            <div className="flex items-center gap-1.5 text-[#0ad4b1] text-xs">
              <ArrowUpRightIcon className="w-3.5 h-3.5" />
              <span>Батлах хувь {stats.approvalRate}%</span>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-4 gap-4">
        {[
          {
            icon: <BriefcaseIcon />,
            value: loading ? "..." : String(stats.departmentCount),
            label: "Хэлтэс",
            color: "bg-blue-500/20 text-blue-400",
          },
          {
            icon: <FileIcon />,
            value: loading ? "..." : String(stats.documentCount),
            label: "Баримт",
            color: "bg-purple-500/20 text-purple-400",
          },
          {
            icon: <CalendarIcon />,
            value: loading ? "..." : String(stats.employeesOnLeave),
            label: "Чөлөөтэй",
            color: "bg-pink-500/20 text-pink-400",
          },
          {
            icon: <TrendIcon />,
            value: loading ? "..." : `${stats.approvalRate}%`,
            label: "Үр дүн",
            color: "bg-[#0ad4b1]/20 text-[#0ad4b1]",
          },
        ].map((stat) => (
          <div
            key={stat.label}
            className="rounded-2xl border border-white/8 bg-[#0a0f0e] p-4 flex items-center gap-4"
          >
            <div
              className={`w-10 h-10 rounded-xl flex items-center justify-center ${stat.color}`}
            >
              {stat.icon}
            </div>
            <div>
              <p className="text-white text-xl font-bold leading-tight">
                {stat.value}
              </p>
              <p className="text-slate-500 text-xs mt-0.5">{stat.label}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="rounded-2xl border border-[#0ad4b1]/40 bg-[#0a0f0e] overflow-hidden">
        <div className="flex items-center justify-between px-6 py-5 border-b border-dashed border-[#0ad4b1]/30">
          <div>
            <p className="text-white text-xl font-bold">Хүлээгдэж буй хүсэлтүүд</p>
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
              className="flex items-center gap-2 h-9 px-4 rounded-lg bg-[#085044] text-[#0ad4b1] text-sm font-semibold hover:bg-[#0ad4b1]/20 transition-colors"
            >
              Бүгдийг харах <ArrowUpRightIcon className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
        <div className="flex flex-col">
          {loading ? (
            <div className="px-6 py-8 text-sm text-slate-500">Уншиж байна...</div>
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
                onClick={onOpenRequests}
              >
                <div
                  className={`w-11 h-11 rounded-xl ${request.color} flex items-center justify-center text-white text-base font-bold shrink-0`}
                >
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
                  <p className="text-slate-500 text-xs mt-0.5">{request.type}</p>
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
