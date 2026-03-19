"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import type { ActionConfig } from "@/lib/types";
import { useHrOverlay } from "../overlay-context";

export function AuditSummary({ actions }: { actions: ActionConfig[] }) {
  const [open, setOpen] = useState(false);
  const { setBlurred } = useHrOverlay();

  useEffect(() => {
    setBlurred(open);
    return () => setBlurred(false);
  }, [open, setBlurred]);

  const total = actions.length;
  const onboarding = actions.filter((action) => action.phase === "onboarding").length;
  const offboarding = actions.filter((action) => action.phase === "offboarding").length;

  return (
    <div
      className="rounded-2xl border border-slate-200 bg-white mt-2 shadow-[0_1px_2px_rgba(15,23,42,0.06)] cursor-pointer hover:border-slate-300 transition-colors"
      onClick={() => setOpen(true)}
      role="button"
      tabIndex={0}
      onKeyDown={(event) => {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          setOpen(true);
        }
      }}
    >
      <div className="grid grid-cols-3 divide-x divide-slate-200 py-5">
        <div className="flex flex-col items-center gap-1 px-6">
          <span className="text-slate-500 text-sm">Нийт үйлдэл</span>
          <span className="text-slate-900 text-2xl font-bold">{total}</span>
        </div>
        <div className="flex flex-col items-center gap-1 px-6">
          <span className="text-slate-500 text-sm">Onboarding</span>
          <span className="text-emerald-600 text-2xl font-bold">{onboarding}</span>
        </div>
        <div className="flex flex-col items-center gap-1 px-6">
          <span className="text-slate-500 text-sm">Offboarding</span>
          <span className="text-red-500 text-2xl font-bold">{offboarding}</span>
        </div>
      </div>
      {typeof document !== "undefined" && open
        ? createPortal(
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
              <button
                type="button"
                aria-label="Close detail overlay"
                className="absolute inset-0"
                onClick={() => setOpen(false)}
              />
              <div className="relative w-[520px] max-w-[95vw] bg-white rounded-3xl border border-slate-200 shadow-[0_30px_70px_rgba(15,23,42,0.2)] p-6 flex flex-col gap-5">
                <div className="flex items-center justify-between">
                  <p className="text-slate-900 font-semibold text-lg">Дэлгэрэнгүй</p>
                  <button
                    type="button"
                    onClick={() => setOpen(false)}
                    className="text-slate-400 hover:text-slate-700 transition-colors text-xl leading-none"
                  >
                    ✕
                  </button>
                </div>
                <div className="rounded-2xl border border-slate-200 p-4 grid grid-cols-3 gap-3 text-center">
                  <div>
                    <p className="text-xs text-slate-500">Нийт үйлдэл</p>
                    <p className="text-2xl font-bold text-slate-900">{total}</p>
                  </div>
                  <div>
                    <p className="text-xs text-slate-500">Onboarding</p>
                    <p className="text-2xl font-bold text-emerald-600">{onboarding}</p>
                  </div>
                  <div>
                    <p className="text-xs text-slate-500">Offboarding</p>
                    <p className="text-2xl font-bold text-red-500">{offboarding}</p>
                  </div>
                </div>
              </div>
            </div>,
            document.body,
          )
        : null}
    </div>
  );
}
