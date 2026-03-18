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
    <div className="flex flex-col gap-3 rounded-[24px] border border-[rgba(0,0,0,0.12)] bg-white px-6 py-4 lg:flex-row lg:items-center lg:justify-between">
      <div className="flex h-10 w-full items-center gap-3 rounded-[10px] border border-[rgba(0,0,0,0.12)] bg-white px-4.25 lg:max-w-sm">
        <SearchIcon />
        <input
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          className="w-full bg-transparent text-[14px] font-medium text-[#3f4145] outline-none placeholder:text-[#77818c]"
          placeholder="Нэр, имэйл, код..."
        />
      </div>
      <div className="flex items-center gap-2">
        <button className="flex h-10 items-center gap-2 rounded-[10px] border border-[rgba(0,0,0,0.12)] bg-white px-4 text-[14px] font-medium text-[#3f4145] transition-colors hover:bg-[#fafafa]">
          <FilterIcon /> Бүгд
        </button>
        <button className="flex h-10 items-center gap-2 rounded-[10px] border border-[rgba(0,0,0,0.12)] bg-white px-4 text-[14px] font-medium text-[#3f4145] transition-colors hover:bg-[#fafafa]">
          <LockIcon /> Бүгд
        </button>
      </div>
    </div>
  );
}
