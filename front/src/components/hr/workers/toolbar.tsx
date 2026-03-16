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
      <div className="flex items-center gap-2 bg-[#0d1117] border border-slate-700/50 rounded-xl px-3 py-2.5 flex-1 max-w-xs">
        <SearchIcon />
        <input
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          className="bg-transparent text-slate-300 text-sm outline-none placeholder:text-slate-600 w-full"
          placeholder="Нэр, имэйл, код..."
        />
      </div>
      <div className="flex items-center gap-2 ml-auto">
        <button className="flex items-center gap-2 px-3 py-2 rounded-xl bg-[#0d1117] border border-slate-700/50 text-slate-300 text-sm hover:bg-slate-800 transition-colors">
          <FilterIcon /> Бүгд
        </button>
        <button className="flex items-center gap-2 px-3 py-2 rounded-xl bg-[#0d1117] border border-slate-700/50 text-slate-300 text-sm hover:bg-slate-800 transition-colors">
          <LockIcon /> Бүгд
        </button>
      </div>
    </div>
  );
}
