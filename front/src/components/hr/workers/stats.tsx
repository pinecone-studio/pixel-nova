"use client";

import { ActiveIconn, HiredIcon } from "@/components/icons";
import { CgPerformance } from "react-icons/cg";

export function WorkersStats({
  totalEmployees,
  totalActive,
  totalNewThisMonth,
}: {
  totalEmployees: number;
  totalActive: number;
  totalNewThisMonth: number;
}) {
  return (
    <div className="grid gap-4 md:grid-cols-[1.4fr_1fr_1fr]">
      <div className="rounded-3xl border border-slate-200 bg-white/85 p-5 shadow-[0_16px_40px_rgba(15,23,42,0.08)]">
        <div className="flex items-start justify-between gap-3">
          <p className="text-slate-500 text-xs font-semibold uppercase tracking-[0.2em]">
            Нийт ажилчид
          </p>
          <div className="w-11 h-11 rounded-2xl border border-slate-200 bg-white flex items-center justify-center text-slate-700">
            <HiredIcon className="h-5 w-5 text-slate-700" />
          </div>
        </div>
        <div className="mt-4 flex items-end justify-between gap-3">
          <div>
            <div className="flex items-center gap-3">
              <p className="text-5xl font-semibold text-slate-900">
                {totalEmployees}
              </p>
              <span className="px-2 py-1 rounded-lg bg-emerald-50 text-emerald-600 text-[11px] font-semibold border border-emerald-200">
                Бодит өгөгдөл
              </span>
            </div>
            <p className="text-slate-500 text-sm mt-1">
              Backend ажилтны жагсаалт
            </p>
          </div>
        </div>
      </div>

      <div className="rounded-3xl border border-slate-200 bg-white/85 p-5 shadow-[0_16px_40px_rgba(15,23,42,0.08)]">
        <div className="flex items-start justify-between gap-3">
          <p className="text-slate-500 text-xs font-semibold uppercase tracking-[0.2em]">
            Идэвхтэй
          </p>
          <div className="w-11 h-11 rounded-2xl border border-slate-200 bg-white flex items-center justify-center text-slate-700">
            <ActiveIconn className="h-5 w-5 text-slate-700" />
          </div>
        </div>
        <p className="mt-4 text-4xl font-semibold text-slate-900">
          {totalActive}
        </p>
      </div>

      <div className="rounded-3xl border border-slate-200 bg-white/85 p-5 shadow-[0_16px_40px_rgba(15,23,42,0.08)]">
        <div className="flex items-start justify-between gap-3">
          <p className="text-slate-500 text-xs uppercase tracking-[0.2em]">
            Энэ сар
          </p>
          <div className="w-11 h-11 rounded-2xl border border-slate-200 bg-white flex items-center justify-center text-slate-700">
            <CgPerformance className="h-7 w-7 text-slate-700" />
          </div>
        </div>
        <p className="mt-4 text-3xl font-semibold text-slate-900">
          {totalNewThisMonth}
        </p>
      </div>
    </div>
  );
}
