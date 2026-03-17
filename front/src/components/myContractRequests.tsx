"use client";

import { useQuery } from "@apollo/client/react";
import { useMemo, useState } from "react";
import { BiChevronDown, BiChevronUp, BiGridAlt, BiListUl } from "react-icons/bi";

import { GET_MY_CONTRACT_REQUESTS } from "@/graphql/queries";
import { buildGraphQLHeaders } from "@/lib/apollo-client";
import type { ContractRequest } from "@/lib/types";

const TOKEN_KEY = "epas_auth_token";

const TEMPLATE_LABELS: Record<string, string> = {
  employment_contract: "Хөдөлмөрийн гэрээ",
  probation_order: "Туршилтаар авах тушаал",
  job_description: "Албан тушаалын тодорхойлолт",
  nda: "Нууцын гэрээ",
  salary_increase_order: "Цалин нэмэх тушаал",
  position_update_order: "Албан тушаал өөрчлөх тушаал",
  contract_addendum: "Гэрээний нэмэлт",
  termination_order: "Ажил дуусгавар болгох тушаал",
  handover_sheet: "Хүлээлгэн өгөх акт",
};

function formatTemplateLabel(id: string) {
  return TEMPLATE_LABELS[id] ?? id;
}

const StatusBadge = ({ status }: { status: string }) => {
  const styles: Record<string, string> = {
    pending: "bg-yellow-600/30 text-yellow-400 border border-yellow-600/40",
    approved: "bg-green-600/30 text-green-400 border border-green-600/40",
    rejected: "bg-red-600/30 text-red-400 border border-red-600/40",
  };
  const label: Record<string, string> = {
    pending: "Хүлээгдэж буй",
    approved: "Баталсан",
    rejected: "Татгалзсан",
  };
  return (
    <span
      className={`text-xs px-3 py-1 rounded-full font-medium whitespace-nowrap ${styles[status] ?? "bg-slate-600/30 text-slate-400"}`}
    >
      {label[status] ?? status}
    </span>
  );
};

export const MyContractRequests = () => {
  const token =
    typeof window === "undefined"
      ? ""
      : window.localStorage.getItem(TOKEN_KEY) ?? "";

  const { data, loading, error } = useQuery<{
    myContractRequests: ContractRequest[];
  }>(GET_MY_CONTRACT_REQUESTS, {
    skip: !token,
    context: {
      headers: buildGraphQLHeaders({ authToken: token }),
    },
    fetchPolicy: "network-only",
  });

  const rows = useMemo(() => data?.myContractRequests ?? [], [data]);
  const [expanded, setExpanded] = useState(false);
  const [viewMode, setViewMode] = useState<"list" | "grid">("list");
  const visibleRows = expanded ? rows : rows.slice(0, 5);

  return (
    <section className="mx-auto flex w-full max-w-[1056px] flex-col gap-4 animate-fade-up">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <h2 className="text-[20px] font-semibold tracking-[-0.02em] text-white">
            Миний гэрээний хүсэлтүүд
          </h2>
          <span className="rounded-full border border-[#233246] bg-[#162130] px-3 py-1 text-[12px] font-medium text-[#94A3B8]">
            {rows.length} хүсэлт
          </span>
        </div>
        <div className="flex items-center gap-2 rounded-full border border-white/10 bg-white/5 p-1">
          <button
            type="button"
            onClick={() => setViewMode("list")}
            className={`flex items-center gap-1 rounded-full px-3 py-1 text-xs font-medium transition ${
              viewMode === "list"
                ? "bg-white text-[#0B0E14]"
                : "text-slate-300 hover:text-white"
            }`}
          >
            <BiListUl className="text-sm" />
            Жагсаалт
          </button>
          <button
            type="button"
            onClick={() => setViewMode("grid")}
            className={`flex items-center gap-1 rounded-full px-3 py-1 text-xs font-medium transition ${
              viewMode === "grid"
                ? "bg-white text-[#0B0E14]"
                : "text-slate-300 hover:text-white"
            }`}
          >
            <BiGridAlt className="text-sm" />
            Grid
          </button>
        </div>
      </div>

      {error ? (
        <div className="rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-300">
          {error.message}
        </div>
      ) : null}

      <div className="rounded-xl border border-white/5 bg-[#0B0E14]/40">
        {loading ? (
          <div className="p-6 flex flex-col gap-3">
            <div className="h-4 w-40 rounded-full skeleton" />
            <div className="h-3 w-64 rounded-full skeleton" />
            <div className="h-3 w-52 rounded-full skeleton" />
          </div>
        ) : rows.length === 0 ? (
          <div className="flex flex-col items-center justify-center gap-2 py-10 text-center text-[#7C8698] text-sm">
            Одоогоор гэрээний хүсэлт байхгүй.
          </div>
        ) : viewMode === "grid" ? (
          <div className="grid grid-cols-1 gap-3 p-4 sm:grid-cols-2 lg:grid-cols-3">
            {visibleRows.map((row) => (
              <div
                key={row.id}
                className="rounded-xl border border-white/10 bg-white/5 px-4 py-4 flex flex-col gap-3"
              >
                <div className="flex items-center justify-between">
                  <p className="text-xs text-slate-500">
                    {new Date(row.createdAt).toLocaleDateString("mn-MN")}
                  </p>
                  <StatusBadge status={row.status} />
                </div>
                <div className="flex flex-wrap gap-2">
                  {row.templateIds.map((id) => (
                    <span
                      key={id}
                      className="rounded-full border border-white/10 bg-white/5 px-2 py-0.5 text-[11px] text-slate-300"
                    >
                      {formatTemplateLabel(id)}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="flex flex-col divide-y divide-white/10">
            {visibleRows.map((row) => (
              <div key={row.id} className="px-4 py-4 flex flex-col gap-2">
                <div className="flex items-center justify-between">
                  <div className="flex flex-wrap gap-2">
                    {row.templateIds.map((id) => (
                      <span
                        key={id}
                        className="rounded-full border border-white/10 bg-white/5 px-2 py-0.5 text-[11px] text-slate-300"
                      >
                        {formatTemplateLabel(id)}
                      </span>
                    ))}
                  </div>
                  <StatusBadge status={row.status} />
                </div>
                <p className="text-xs text-slate-500">
                  Илгээсэн огноо:{" "}
                  {new Date(row.createdAt).toLocaleDateString("mn-MN")}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>

      {rows.length > 5 ? (
        <div className="flex justify-center">
          <button
            type="button"
            onClick={() => setExpanded((prev) => !prev)}
            className="flex items-center gap-1 text-xs text-[#9BEBD7] hover:text-white transition-colors"
          >
            {expanded ? "Хаах" : "Бүгдийг харах"}
            {expanded ? (
              <BiChevronUp className="text-base" />
            ) : (
              <BiChevronDown className="text-base" />
            )}
          </button>
        </div>
      ) : null}
    </section>
  );
};
