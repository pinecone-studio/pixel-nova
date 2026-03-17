"use client";

import { ActiveIconn, HiredIcon } from "@/components/icons";

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
    <div className="grid gap-4" style={{ gridTemplateColumns: "1.4fr 1fr 1fr" }}>
      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-[0_1px_2px_rgba(15,23,42,0.06)]">
        <p className="text-slate-500 text-xs font-semibold uppercase tracking-widest mb-3">
          Нийт ажилчид
        </p>
        <div className="flex items-end justify-between">
          <div>
            <div className="flex items-center gap-3">
              <p className="text-5xl font-semibold text-slate-900">{totalEmployees}</p>
              <span className="px-2 py-1 rounded-lg bg-emerald-50 text-emerald-600 text-xs font-semibold border border-emerald-200">
                Бодит өгөгдөл
              </span>
            </div>
            <p className="text-slate-500 text-sm mt-1">Backend ажилтны жагсаалт</p>
          </div>
          <div className="w-12 h-12 rounded-xl border border-slate-200 bg-white flex items-center justify-center text-slate-600">
            <HiredIcon />
          </div>
        </div>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-[0_1px_2px_rgba(15,23,42,0.06)]">
        <p className="text-slate-500 text-xs font-semibold uppercase tracking-widest mb-3">
          Идэвхтэй
        </p>
        <div className="w-10 h-10 rounded-xl border border-slate-200 bg-white flex items-center justify-center mb-3 text-slate-600">
          <ActiveIconn />
        </div>
        <p className="text-4xl font-semibold text-slate-900">{totalActive}</p>
      </div>

      <div className="flex flex-col gap-4">
        <div className="rounded-2xl border border-slate-200 bg-white p-4 flex-1 shadow-[0_1px_2px_rgba(15,23,42,0.06)]">
          <p className="text-slate-500 text-xs uppercase tracking-widest mb-2">
            Энэ сар
          </p>
          <div className="w-9 h-9 rounded-xl border border-slate-200 bg-white flex items-center justify-center mb-2 text-slate-600">
            <HiredIcon />
          </div>
          <p className="text-3xl font-semibold text-slate-900">{totalNewThisMonth}</p>
        </div>
      </div>
    </div>
  );
}
