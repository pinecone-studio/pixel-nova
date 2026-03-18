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
    <div className="flex flex-col gap-3 rounded-3xl border border-slate-200 bg-white p-4 shadow-[0_1px_2px_rgba(15,23,42,0.05)] lg:flex-row lg:items-center lg:justify-between">
      <div className="flex h-11 w-full items-center gap-2 rounded-2xl border border-slate-200 bg-slate-50 px-3 lg:max-w-sm">
        <SearchIcon />
        <input
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          className="w-full bg-transparent text-sm text-slate-700 outline-none placeholder:text-slate-400"
          placeholder="Нэр, имэйл, код..."
        />
      </div>
      <div className="flex items-center gap-2">
        <button className="flex h-11 items-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 text-sm text-slate-600 transition-colors hover:bg-slate-50">
          <FilterIcon /> Бүгд
        </button>
        <button className="flex h-11 items-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 text-sm text-slate-600 transition-colors hover:bg-slate-50">
          <LockIcon /> Бүгд
        </button>
      </div>
    </div>
  );
}
