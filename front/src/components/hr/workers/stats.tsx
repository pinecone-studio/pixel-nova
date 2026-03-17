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
      <div className="rounded-2xl border border-slate-700/40 bg-linear-to-br from-green-700/30 to-black p-5">
        <p className="text-slate-500 text-xs font-semibold uppercase tracking-widest mb-3">
          Нийт ажилчид
        </p>
        <div className="flex items-end justify-between">
          <div>
            <div className="flex items-center gap-3">
              <p className="text-6xl font-bold text-white">{totalEmployees}</p>
              <span className="px-2 py-1 rounded-lg bg-emerald-500/15 text-emerald-400 text-xs font-semibold">
                Бодит өгөгдөл
              </span>
            </div>
            <p className="text-slate-500 text-sm mt-1">Backend ажилтны жагсаалт</p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-emerald-500/20 flex items-center justify-center">
            <HiredIcon />
          </div>
        </div>
      </div>

      <div className="rounded-2xl border border-cyan-600/30 bg-linear-to-br from-cyan-600/15 to-transparent p-5">
        <p className="text-slate-500 text-xs font-semibold uppercase tracking-widest mb-3">
          Идэвхтэй
        </p>
        <div className="w-10 h-10 rounded-xl bg-cyan-500/20 flex items-center justify-center mb-3">
          <ActiveIconn />
        </div>
        <p className="text-5xl font-bold text-white">{totalActive}</p>
      </div>

      <div className="flex flex-col gap-4">
        <div className="rounded-2xl border border-emerald-600/30 bg-linear-to-br from-emerald-600/15 to-transparent p-4 flex-1">
          <p className="text-slate-500 text-xs uppercase tracking-widest mb-2">
            Энэ сар
          </p>
          <div className="w-9 h-9 rounded-xl bg-emerald-500/20 flex items-center justify-center mb-2">
            <HiredIcon />
          </div>
          <p className="text-4xl font-bold text-white">{totalNewThisMonth}</p>
        </div>
      </div>
    </div>
  );
}
