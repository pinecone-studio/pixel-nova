"use client";

import { FiCode } from "react-icons/fi";

import { SOURCE_LABELS } from "@/lib/templateConfig";
import type { TemplateToken } from "@/lib/templateConfig";

const COLOR_MAP: Record<string, string> = {
  employee: "bg-blue-50 text-blue-700 border-blue-200",
  documentProfile: "bg-purple-50 text-purple-700 border-purple-200",
  computed: "bg-slate-50 text-slate-600 border-slate-200",
};

export function TokenBadge({ token }: { token: TemplateToken }) {
  return (
    <div
      className={`group relative inline-flex cursor-default items-center gap-1 rounded-[8px] border px-2 py-1 text-[12px] font-medium transition-colors hover:shadow-sm ${COLOR_MAP[token.source]}`}
    >
      <FiCode className="h-3 w-3 opacity-60" />
      <span>{`{{${token.key}}}`}</span>

      <div className="pointer-events-none absolute bottom-full left-1/2 z-50 mb-2 -translate-x-1/2 whitespace-nowrap rounded-[10px] border border-black/12 bg-white px-3 py-2 text-[12px] text-[#121316] opacity-0 shadow-lg transition-opacity group-hover:opacity-100">
        <p className="font-semibold">{token.label}</p>
        <p className="text-[#3f4145]">Эх: {SOURCE_LABELS[token.source]}</p>
        <p className="text-[#77818c]">Жишээ: {token.example}</p>
      </div>
    </div>
  );
}
