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
    <div className="flex flex-wrap items-center gap-3">
      <div className="relative flex-1 max-w-sm">
        <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
        <input
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          className="w-full bg-white border border-slate-200 rounded-xl pl-10 pr-3 py-2.5 text-slate-600 text-sm outline-none placeholder:text-slate-400 focus:border-slate-300"
          placeholder="Нэр, имэйл, код..."
        />
      </div>
      <div className="flex items-center gap-2 ml-auto">
        <button className="flex items-center gap-2 px-3 py-2 rounded-xl bg-white border border-slate-200 text-slate-600 text-sm hover:bg-slate-50 transition-colors cursor-pointer">
          <FilterIcon /> Бүгд
        </button>
        <button className="flex items-center gap-2 px-3 py-2 rounded-xl bg-white border border-slate-200 text-slate-600 text-sm hover:bg-slate-50 transition-colors cursor-pointer">
          <LockIcon /> Бүгд
        </button>
      </div>
    </div>
  );
}
