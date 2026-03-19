"use client";

import { useEffect, useMemo, useState } from "react";
import { useMutation, useQuery } from "@apollo/client/react";
import { createPortal } from "react-dom";

import {
  ArrowUpRightIcon,
  FilterIcon,
  Note,
  Pen,
  Sth,
  UsersIcon,
} from "@/components/icons";
import type { ContractRequest, LeaveRequest } from "@/lib/types";
import {
  APPROVE_LEAVE_REQUEST,
  REJECT_LEAVE_REQUEST,
} from "@/graphql/mutations";
import { GET_CONTRACT_REQUESTS } from "@/graphql/queries/contract-requests";
import { buildGraphQLHeaders } from "@/lib/apollo-client";
import { useHrOverlay } from "./overlay-context";

import type { DashboardStats } from "./dashboard-data";
import { FiPaperclip } from "react-icons/fi";
import { HiOutlineLightningBolt } from "react-icons/hi";
import { Filter } from "lucide-react";

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
  const [localRequests, setLocalRequests] =
    useState<LeaveRequest[]>(pendingRequests);
  const { setBlurred } = useHrOverlay();

  const { data: contractData } = useQuery<{
    contractRequests: ContractRequest[];
  }>(GET_CONTRACT_REQUESTS, {
    context: { headers: buildGraphQLHeaders({ actorRole: "hr" }) },
  });

  const contractCounts = useMemo(() => {
    const rows = contractData?.contractRequests ?? [];
    let urgent = 0;
    let success = 0;
    for (const row of rows) {
      if (row.status === "pending") urgent += 1;
      if (row.status === "approved") success += 1;
    }
    return { urgent, success };
  }, [contractData]);
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
              <div className="mt-3 flex items-center gap-3">
                <p className="text-[64px] font-bold text-[#3F4145CC]">
                  {loading ? "..." : stats.totalEmployees}
                </p>
                <span className="flex items-center justify-center gap-1 rounded-full border border-emerald-200 bg-white w-24 h-7 text-[14px] font-semibold text-[#1ABA52]">
                  <ArrowUpRightIcon className="h-4 w-4" />
                  {stats.monthlyGrowth >= 0 ? "+" : ""}
                  {stats.monthlyGrowth}%
                </span>
              </div>
              <p className="mt-2 text-[14px] font-medium text-[#3F414599]">
                Өмнө сар: {loading ? "..." : stats.totalEmployees - 6}
              </p>
            </div>
            <div className="flex h-13.5 w-13.5 items-center justify-center rounded-2xl bg-slate-900">
              <UsersIcon className="text-white w-8 h-8" />
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

        <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
          {overviewCards.map((card) => (
            <div
              key={card.title}
              className="flex min-h-[136px] flex-col items-start rounded-[16px] border border-black/12 bg-white p-[25px] text-left"
            >
              <div className="flex w-full items-start justify-between gap-3">
                <p className="text-[16px] font-semibold leading-5 tracking-[-0.096px] text-[#3F4145]">
                  {card.title}
                </p>
                <span className="flex items-center gap-1 rounded-[10px] border border-[#121316] px-[9px] py-[3px] text-[12px] leading-5 text-[#121316]">
                  <HiOutlineLightningBolt className="h-3 w-3" />
                  {card.status}
                </span>
              </div>

              <div className="mt-3 flex flex-col gap-2">
                <p className="text-[14px] font-medium leading-5 tracking-[-0.084px] text-[#77818c]">
                  {card.description}
                </p>
                {card.items.map((item) => (
                  <div
                    key={item}
                    className="flex items-center gap-2 text-[14px] leading-4 text-[#3f414599]"
                  >
                    <Note />
                    <span>{item}</span>
                  </div>
                ))}
              </div>

              <div className="mt-auto flex w-full justify-center pt-4">
                <button className="flex h-8 w-full items-center justify-center gap-2 rounded-[10px] bg-[#121316] px-3 text-[14px] leading-4 text-white">
                  <Pen />
                  Хүсэлт илгээх
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="rounded-3xl border border-slate-200 bg-white shadow-[0_10px_30px_rgba(15,23,42,0.06)]">
        <span className="sr-only">{auditCount}</span>
        <div className="flex items-center justify-between border-b border-slate-200 px-6 py-4">
          <div>
            <p className="text-[20px] font-semibold text-[#000000]">
              Хүлээгдэж буй хүсэлтүүд
            </p>
            <p className="text-[14px] font-normal text-[#3F4145B2]">
              Шинээр ирсэн хүсэлтүүдийг хянах
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button className="rounded-xl flex items-center justify-center gap-2 border border-slate-200 w-23.5 font-medium h-10 text-xs text-slate-600 hover:bg-slate-50">
              <Filter className="w-4 h-4 text-black" /> Шүүх
            </button>
            <button className="rounded-xl bg-[#1F2126] w-38.25 h-10 flex items-center gap-2 justify-center text-[14px] font-medium text-white hover:bg-slate-800">
              Бүгдийг харах <Sth />
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
                className="w-full h-23 text-left flex items-center gap-3 px-6 py-4 hover:bg-slate-50 transition-colors cursor-pointer"
              >
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-black text-white text-sm font-semibold">
                  {req.employee.firstName?.[0] ?? "А"}
                </div>
                <div className="flex-1">
                  <p className="text-[16px] font-semibold text-[#000000]">
                    {req.employee.lastName} {req.employee.firstName}
                  </p>
                  <p className="text-[14px] text-[#3F4145B2] font-normal">
                    {req.type ?? "Хүсэлт"}
                  </p>
                </div>
                <div className="ml-6 flex items-center gap-3">
                  <span className="rounded-full border border-red-200 bg-red-50 w-18.75 flex justify-center items-center h-5.5 text-xs font-semibold text-red-500">
                    Яаралтай
                  </span>

                  <p className="text-[14px] font-medium text-[#3F4145B2]">
                    {formatRelativeTime(req.createdAt)}
                  </p>
                </div>
              </button>
            ),
          )}
          {localRequests.length === 0 ? (
            <div className="px-6 py-6 text-[14px] font-normal text-slate-500">
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
              <div className="relative w-119 h-153.5 bg-white rounded-3xl border border-slate-200 shadow-[0_30px_70px_rgba(15,23,42,0.2)] p-6 flex flex-col gap-5">
                <div className="flex items-start justify-between gap-3 mt-5">
                  <div className="flex items-center gap-3">
                    <button className="w-16 h-16 rounded-full bg-black flex items-center justify-center text-white font-semibold text-[20px]">
                      {selected.employee.firstName?.[0] ?? "А"}
                    </button>

                    <div>
                      <p className="text-[#000000] font-semibold text-[22px] leading-6">
                        {selected.employee.lastName}{" "}
                        {selected.employee.firstName}
                      </p>
                      <div className="flex items-center gap-2 mt-2">
                        <p className="text-[#3F414599] text-[14px] font-normal ">
                          {selected.employee.employeeCode}
                        </p>
                        <p className="text-[#3F414599]">• </p>
                        <p className="text-[14px] font-normal text-[#3F414599]">
                          {" "}
                          {selected.employee.department}
                        </p>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="rounded-full border border-red-200 bg-red-50 w-19 h-5.5 flex justify-center items-center text-xs font-semibold text-red-500">
                      Яаралтай
                    </span>
                    <button
                      type="button"
                      onClick={() => setSelected(null)}
                      className="text-black hover:text-slate-700 transition-colors text-xl leading-none w-6 h-6 cursor-pointer "
                    >
                      ✕
                    </button>
                  </div>
                </div>

                <div className="h-px bg-slate-200" />

                <div className="rounded-2xl border border-slate-200 p-4">
                  <p className="text-[#000000] font-semibold text-[18px]">
                    {selected.type ?? "Хүсэлт"}
                  </p>
                  <div className="mt-3 grid grid-cols-2 gap-4 text-sm text-slate-600">
                    <div>
                      <p className="text-[14px] font-normal text-[#3F4145]">
                        Эхлэх өдөр
                      </p>
                      <p className="text-[14px] font-normal text-[#3F4145] mt-2">
                        {selectedMeta?.startLabel}
                      </p>
                    </div>
                    <div>
                      <p className="text-[14px] font-normal text-[#3F4145]">
                        Дуусах өдөр
                      </p>
                      <p className="text-[14px] font-normal text-[#3F4145] mt-2">
                        {selectedMeta?.endLabel}
                      </p>
                    </div>
                    <div>
                      <p className="text-[14px] font-normal text-[#3F4145]">
                        Нийт өдөр
                      </p>
                      <p className="font-normal text-[14px] text-[#1ABA52] mt-2">
                        {selectedMeta?.totalDays ?? 0} хоног
                      </p>
                    </div>
                  </div>
                  <div className="mt-3 flex flex-col gap-1 ">
                    <p className="text-[14px] font-normal text-[#3F4145]">
                      Шалтгаан
                    </p>
                    <p className="text-[14px] font-normal text-[#3F4145]">
                      {selected.reason}
                    </p>
                  </div>
                </div>

                <div className="flex flex-col gap-2">
                  <p className="text-[#000000] font-medium text-[18px]">
                    Тайлбар{" "}
                    <span className="text-[#000000] font-normal">
                      (Заавал биш)
                    </span>
                  </p>
                  <textarea
                    value={note}
                    onChange={(event) => setNote(event.target.value)}
                    placeholder="Энд бичнэ үү..."
                    rows={3}
                    className="w-full h-[70px] bg-white border border-slate-200 rounded-2xl px-4 py-3 text-[#3F414599] text-[14px] font-normal placeholder:text-slate-400 outline-none resize-none focus:border-slate-300 transition-colors"
                  />
                </div>

                <div className="flex items-center justify-end gap-3">
                  <button
                    type="button"
                    onClick={handleReject}
                    disabled={acting}
                    className="flex cursor-pointer items-center gap-2 px-5 py-2.5 rounded-xl border border-red-200 text-red-500 text-sm font-medium hover:bg-red-50 disabled:opacity-50 transition-colors"
                  >
                    <span>✕</span> Татгалзах
                  </button>
                  <button
                    type="button"
                    onClick={handleApprove}
                    disabled={acting}
                    className="flex cursor-pointer items-center gap-2 px-5 py-2.5 rounded-xl bg-slate-900 text-white text-sm font-medium hover:bg-slate-800 disabled:opacity-50 transition-colors"
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
