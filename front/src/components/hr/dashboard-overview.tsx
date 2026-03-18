"use client";

import { useState } from "react";
import { FiArrowRight, FiBriefcase, FiPaperclip, FiSliders } from "react-icons/fi";

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
  const overviewCards = [
    {
      title: "PROMOTE EMPLOYEE",
      status: "working",
      description: "Шаардлагатай баримт",
      items: ["Үндсэн цалин нэмэх тушаал"],
    },
    {
      title: "CHANGE POSITION",
      status: "working",
      description: "Шаардлагатай баримт",
      items: ["Ажлын байрны тодорхойлолт", "Ажлын байр шинэчлэх тушаал"],
    },
  ];

  function formatRelativeTime(value: string) {
    const diff = Math.max(0, renderedAt - new Date(value).getTime());
    const mins = Math.floor(diff / 60000);
    if (mins < 60) return `${mins} минут өмнө`;
    const hours = Math.floor(mins / 60);
    if (hours < 24) return `${hours} цаг өмнө`;
    const days = Math.floor(hours / 24);
    return `${days} өдөр өмнө`;
  }

  function getEmployeeInitial(request: LeaveRequest) {
    return request.employee.firstName?.[0] ?? request.employee.lastName?.[0] ?? "А";
  }

  return (
    <div className="grid grid-cols-1 gap-6 xl:grid-cols-[minmax(0,1fr)_680px]">
      <div className="flex min-w-0 flex-col gap-3">
        <div className="rounded-[24px] border border-black/12 bg-white px-6 py-8">
          <div className="flex items-start justify-between gap-4">
            <div className="min-w-0">
              <p className="text-[16px] font-bold leading-5 tracking-[-0.096px] text-[#121316]">
                Нийт ажилчид
              </p>
              <div className="mt-2 flex flex-wrap items-center gap-3">
                <p className="text-[64px] font-bold leading-[70px] tracking-[-0.04em] text-[#3f4145cc]">
                  {loading ? "..." : stats.totalEmployees}
                </p>
                <span className="mt-5 flex h-7 items-center gap-1 rounded-full border border-[#1aba5280] px-3 text-[14px] font-semibold text-[#1aba52]">
                  <ArrowUpRightIcon className="h-3.5 w-3.5" />
                  {stats.monthlyGrowth >= 0 ? "+" : ""}
                  {stats.monthlyGrowth}%
                </span>
              </div>
              <p className="text-[14px] font-medium text-[#3f414599]">
                Өмнө сар: {loading ? "..." : stats.totalEmployees - 6}
              </p>
            </div>
            <div className="flex h-[54px] w-[54px] items-center justify-center rounded-2xl bg-[#121316]">
              <UsersIcon className="h-8 w-8 text-white" />
            </div>
          </div>
          <div className="mt-6 flex h-[36px] items-end gap-1">
            {barData.slice(-7).map((height, index) => (
              <div
                key={index}
                className="min-w-0 flex-1 rounded-t-[4px] bg-[#3f4145]"
                style={{ height: `${Math.max(20, Math.round((height / 88) * 36))}px` }}
              />
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
          {overviewCards.map((card) => (
            <button
              key={card.title}
              className="flex min-h-[136px] flex-col items-start rounded-[16px] border border-black/12 bg-white p-[25px] text-left"
              type="button"
            >
              <div className="flex w-full items-start justify-between gap-3">
                <p className="text-[16px] font-bold leading-5 tracking-[-0.096px] text-[#3f4145]">
                  {card.title}
                </p>
                <span className="flex items-center gap-1 rounded-[10px] border border-[#121316] px-[9px] py-[3px] text-[12px] leading-5 text-[#121316]">
                  <FiBriefcase className="h-3 w-3" />
                  {card.status}
                </span>
              </div>

              <div className="mt-3 flex flex-col gap-2">
                <p className="text-[14px] font-semibold leading-5 tracking-[-0.084px] text-[#77818c]">
                  {card.description}
                </p>
                {card.items.map((item) => (
                  <div key={item} className="flex items-center gap-2 text-[14px] leading-4 text-[#3f414599]">
                    <FiPaperclip className="h-[14px] w-[14px] shrink-0" />
                    <span>{item}</span>
                  </div>
                ))}
              </div>

              <div className="mt-auto flex w-full justify-center pt-4">
                <span className="flex h-8 w-full items-center justify-center gap-2 rounded-[10px] bg-[#121316] px-3 text-[14px] leading-4 text-white">
                  <FiPaperclip className="h-4 w-4" />
                  Хүсэлт илгээх
                </span>
              </div>
            </button>
          ))}
        </div>
      </div>

      <div className="overflow-hidden rounded-[24px] border border-[#dfdfdf] bg-white">
        <span className="sr-only">{auditCount}</span>
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-black/12 px-6 py-4">
          <div>
            <p className="text-[20px] font-semibold leading-7 text-black">
              Хүлээгдэж буй хүсэлтүүд
            </p>
            <p className="text-[14px] text-[#3f4145b3]">
              Шинээр ирсэн хүсэлтүүдийг хянах
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button className="flex h-10 items-center gap-2 rounded-[10px] border border-black/12 px-4 text-[14px] text-black">
              <FiSliders className="h-4 w-4" />
              Шүүх
            </button>
            <button className="flex h-10 items-center gap-2 rounded-[10px] bg-[#1f2126] px-4 text-[14px] text-white">
              Бүгдийг харах
              <FiArrowRight className="h-4 w-4" />
            </button>
          </div>
        </div>
        <div className="divide-y divide-black/12">
          {(pendingRequests.length > 0 ? pendingRequests.slice(0, 5) : []).map(
            (req) => (
              <div key={req.id} className="flex items-center gap-4 px-5 py-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-[14px] bg-[linear-gradient(135deg,#2b7fff_0%,#00b8db_100%)] text-[18px] font-bold text-white shadow-[0_10px_15px_rgba(0,0,0,0.1),0_4px_6px_rgba(0,0,0,0.1)]">
                  {getEmployeeInitial(req)}
                </div>
                <div className="flex-1">
                  <p className="text-[16px] font-bold tracking-[-0.096px] text-black">
                    {req.employee.lastName} {req.employee.firstName}
                  </p>
                  <p className="text-[14px] tracking-[-0.14px] text-[#3f4145b3]">
                    {req.type ?? "Хүсэлт"}
                  </p>
                </div>
                <p className="text-[14px] font-medium text-[#3f4145b3]">
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
