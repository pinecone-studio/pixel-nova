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
    <div className="grid gap-4 lg:grid-cols-[1.4fr_1fr_1fr]">
      <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-[0_1px_2px_rgba(15,23,42,0.06)]">
        <div className="flex items-start justify-between gap-3">
          <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">
            Нийт ажилчид
          </p>
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-slate-200 bg-slate-50">
            <HiredIcon className="h-5 w-5 text-black" />
          </div>
        </div>
        <div className="mt-4 flex items-end justify-between gap-3">
          <div>
            <div className="flex items-center gap-3">
              <p className="text-5xl font-semibold tracking-[-0.04em] text-slate-900">
                {totalEmployees}
              </p>
              <span className="rounded-xl border border-emerald-200 bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-600">
                Бодит өгөгдөл
              </span>
            </div>
            <p className="mt-1 text-sm text-slate-500">
              Backend ажилтны жагсаалт
            </p>
          </div>
        </div>
      </div>

      <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-[0_1px_2px_rgba(15,23,42,0.06)]">
        <div className="flex items-start justify-between gap-3">
          <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">
            Идэвхтэй
          </p>
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-slate-200 bg-slate-50">
            <ActiveIconn className="h-5 w-5 text-black" />
          </div>
        </div>
        <p className="mt-4 text-4xl font-semibold tracking-[-0.04em] text-slate-900">
          {totalActive}
        </p>
      </div>

      <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-[0_1px_2px_rgba(15,23,42,0.06)]">
        <div className="flex items-start justify-between gap-3">
          <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">
            Энэ сар
          </p>
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-slate-200 bg-slate-50">
            <CgPerformance className="h-8 w-8 text-black" />
          </div>
        </div>
        <p className="mt-4 text-4xl font-semibold tracking-[-0.04em] text-slate-900">
          {totalNewThisMonth}
        </p>
      </div>
    </div>
  );
}
