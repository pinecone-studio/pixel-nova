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
    <div
      className="grid gap-4"
      style={{ gridTemplateColumns: "1.4fr 1fr 1fr" }}
    >
      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-[0_1px_2px_rgba(15,23,42,0.06)]">
        <div className="flex items-start justify-between gap-3">
          <p className="text-slate-500 text-xs font-semibold uppercase tracking-widest">
            Нийт ажилчид
          </p>
          <div className="w-12 h-12 rounded-xl border border-black bg-white flex items-center justify-center">
            <HiredIcon className="h-5 w-5 text-black" />
          </div>
        </div>
        <div className="mt-4 flex items-end justify-between gap-3">
          <div>
            <div className="flex items-center gap-3">
              <p className="text-5xl font-semibold text-slate-900">
                {totalEmployees}
              </p>
              <span className="px-2 py-1 rounded-lg bg-emerald-50 text-emerald-600 text-xs font-semibold border border-emerald-200">
                Бодит өгөгдөл
              </span>
            </div>
            <p className="text-slate-500 text-sm mt-1">
              Backend ажилтны жагсаалт
            </p>
          </div>
        </div>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-[0_1px_2px_rgba(15,23,42,0.06)]">
        <div className="flex items-start justify-between gap-3">
          <p className="text-slate-500 text-xs font-semibold uppercase tracking-widest">
            Идэвхтэй
          </p>
          <div className="w-12 h-12 rounded-xl border border-black bg-white flex items-center justify-center">
            <ActiveIconn className="h-5 w-5 text-black" />
          </div>
        </div>
        <p className="mt-4 text-4xl font-semibold text-slate-900">
          {totalActive}
        </p>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-[0_1px_2px_rgba(15,23,42,0.06)]">
        <div className="flex items-start justify-between gap-3">
          <p className="text-slate-500 text-xs uppercase tracking-widest">
            Энэ сар
          </p>
          <div className="w-12 h-12 rounded-xl border border-black bg-white flex items-center justify-center">
            <CgPerformance className="h-8 w-8 text-black" />
          </div>
        </div>
        <p className="mt-4 text-3xl font-semibold text-slate-900">
          {totalNewThisMonth}
        </p>
      </div>
    </div>
  );
}
