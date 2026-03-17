"use client";

import type { ActionConfig } from "@/lib/types";

export function AuditSummary({ actions }: { actions: ActionConfig[] }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white mt-2 shadow-[0_1px_2px_rgba(15,23,42,0.06)]">
      <div className="grid grid-cols-3 divide-x divide-slate-200 py-5">
        <div className="flex flex-col items-center gap-1 px-6">
          <span className="text-slate-500 text-sm">Нийт үйлдэл</span>
          <span className="text-slate-900 text-2xl font-bold">
            {actions.length}
          </span>
        </div>
        <div className="flex flex-col items-center gap-1 px-6">
          <span className="text-slate-500 text-sm">Onboarding</span>
          <span className="text-emerald-600 text-2xl font-bold">
            {actions.filter((action) => action.phase === "onboarding").length}
          </span>
        </div>
        <div className="flex flex-col items-center gap-1 px-6">
          <span className="text-slate-500 text-sm">Offboarding</span>
          <span className="text-red-500 text-2xl font-bold">
            {actions.filter((action) => action.phase === "offboarding").length}
          </span>
        </div>
      </div>
    </div>
  );
}
