import { BiChevronDown, BiSearch } from "react-icons/bi";

import type { FilterOption, ListFilter } from "./types";

export function AuditToolbar({
  search,
  listFilter,
  visibleFilterOptions,
  onSearchChange,
  onFilterChange,
}: {
  search: string;
  listFilter: ListFilter;
  visibleFilterOptions: FilterOption[];
  onSearchChange: (value: string) => void;
  onFilterChange: (value: ListFilter) => void;
}) {
  return (
    <div className="flex w-full items-center gap-3">
      <div className="flex h-[44px] flex-1 items-center gap-3 rounded-[12px] border border-[#1B2431] bg-[#161E2A] px-4">
        <BiSearch className="h-5 w-5 text-[#7E8A9E]" />
        <input
          value={search}
          onChange={(event) => onSearchChange(event.target.value)}
          className="w-full bg-transparent text-[15px] text-white outline-none placeholder:text-[#6D7685]"
          placeholder="Хайх..."
        />
      </div>

      <div className="relative">
        <select
          value={listFilter}
          onChange={(event) => onFilterChange(event.target.value as ListFilter)}
          className="h-[44px] w-[186px] appearance-none rounded-[12px] border border-[#1B2431] bg-[#161E2A] px-4 pr-11 text-[15px] text-[#E6EDF5] outline-none"
        >
          {visibleFilterOptions.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        <BiChevronDown className="pointer-events-none absolute right-4 top-1/2 h-5 w-5 -translate-y-1/2 text-[#7E8A9E]" />
      </div>
    </div>
  );
}
