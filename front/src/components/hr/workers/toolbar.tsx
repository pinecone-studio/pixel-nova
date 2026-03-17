"use client";

import { FilterIcon, LockIcon, SearchIcon } from "@/components/icons";

export function WorkersToolbar({
  search,
  onSearchChange,
}: {
  search: string;
  onSearchChange: (value: string) => void;
}) {
  return (
    <div className="flex items-center gap-3">
      <div className="flex items-center gap-2 bg-white border border-slate-200 rounded-xl px-3 py-2.5 flex-1 max-w-xs">
        <SearchIcon />
        <input
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          className="bg-transparent text-slate-600 text-sm outline-none placeholder:text-slate-400 w-full"
          placeholder="Нэр, имэйл, код..."
        />
      </div>
      <div className="flex items-center gap-2 ml-auto">
        <button className="flex items-center gap-2 px-3 py-2 rounded-xl bg-white border border-slate-200 text-slate-600 text-sm hover:bg-slate-50 transition-colors">
          <FilterIcon /> Бүгд
        </button>
        <button className="flex items-center gap-2 px-3 py-2 rounded-xl bg-white border border-slate-200 text-slate-600 text-sm hover:bg-slate-50 transition-colors">
          <LockIcon /> Бүгд
        </button>
      </div>
    </div>
  );
}
