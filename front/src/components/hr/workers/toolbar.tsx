"use client";

import { useState, useRef, useEffect } from "react";
import { FilterIcon, BuildingIcon, SearchIcon } from "@/components/icons";
import { DEPARTMENTS, STATUSES, statusLabel as formatStatusLabel } from "./shared";

interface WorkersToolbarProps {
  search: string;
  onSearchChange: (value: string) => void;
  statusFilter: string | null;
  onStatusFilterChange: (value: string | null) => void;
  departmentFilter: string | null;
  onDepartmentFilterChange: (value: string | null) => void;
}

export function WorkersToolbar({
  search,
  onSearchChange,
  statusFilter,
  onStatusFilterChange,
  departmentFilter,
  onDepartmentFilterChange,
}: WorkersToolbarProps) {
  const [statusOpen, setStatusOpen] = useState(false);
  const [deptOpen, setDeptOpen] = useState(false);
  const statusRef = useRef<HTMLDivElement>(null);
  const deptRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (statusRef.current && !statusRef.current.contains(e.target as Node)) {
        setStatusOpen(false);
      }
      if (deptRef.current && !deptRef.current.contains(e.target as Node)) {
        setDeptOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const statusLabel = statusFilter
    ? statusLabelText(statusFilter)
    : "Бүгд";

  function statusLabelText(status: string) {
    return formatStatusLabel(STATUSES.find((s) => s === status) ?? status);
  }

  const deptLabel = departmentFilter
    ? DEPARTMENTS.find((d) => d === departmentFilter) ?? departmentFilter
    : "Бүгд";

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
        {/* Status filter */}
        <div className="relative" ref={statusRef}>
          <button
            onClick={() => {
              setStatusOpen((prev) => !prev);
              setDeptOpen(false);
            }}
            className="flex items-center gap-2 px-3 py-2 rounded-xl bg-white border border-slate-200 text-slate-600 text-sm hover:bg-slate-50 transition-colors cursor-pointer"
          >
            <FilterIcon /> Төлөв: {statusLabel}
          </button>
          {statusOpen && (
            <div className="absolute right-0 top-full mt-1 min-w-[160px] bg-white rounded-xl border border-slate-200 shadow-lg z-50 py-1">
              <button
                onClick={() => {
                  onStatusFilterChange(null);
                  setStatusOpen(false);
                }}
                className={`w-full text-left px-3 py-2 text-sm transition-colors cursor-pointer ${
                  statusFilter === null
                    ? "bg-slate-100 font-medium text-slate-900"
                    : "text-slate-700 hover:bg-slate-50"
                }`}
              >
                Бүгд
              </button>
              {STATUSES.map((status) => (
                <button
                  key={status}
                  onClick={() => {
                    onStatusFilterChange(status);
                    setStatusOpen(false);
                  }}
                  className={`w-full text-left px-3 py-2 text-sm transition-colors cursor-pointer ${
                    statusFilter === status
                      ? "bg-slate-100 font-medium text-slate-900"
                      : "text-slate-700 hover:bg-slate-50"
                  }`}
                >
                  {statusLabelText(status)}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Department filter */}
        <div className="relative" ref={deptRef}>
          <button
            onClick={() => {
              setDeptOpen((prev) => !prev);
              setStatusOpen(false);
            }}
            className="flex items-center gap-2 px-3 py-2 rounded-xl bg-white border border-slate-200 text-slate-600 text-sm hover:bg-slate-50 transition-colors cursor-pointer"
          >
            <BuildingIcon /> Хэлтэс: {deptLabel}
          </button>
          {deptOpen && (
            <div className="absolute right-0 top-full mt-1 min-w-[180px] bg-white rounded-xl border border-slate-200 shadow-lg z-50 py-1">
              <button
                onClick={() => {
                  onDepartmentFilterChange(null);
                  setDeptOpen(false);
                }}
                className={`w-full text-left px-3 py-2 text-sm transition-colors cursor-pointer ${
                  departmentFilter === null
                    ? "bg-slate-100 font-medium text-slate-900"
                    : "text-slate-700 hover:bg-slate-50"
                }`}
              >
                Бүгд
              </button>
              {DEPARTMENTS.map((dept) => (
                <button
                  key={dept}
                  onClick={() => {
                    onDepartmentFilterChange(dept);
                    setDeptOpen(false);
                  }}
                  className={`w-full text-left px-3 py-2 text-sm transition-colors cursor-pointer ${
                    departmentFilter === dept
                      ? "bg-slate-100 font-medium text-slate-900"
                      : "text-slate-700 hover:bg-slate-50"
                  }`}
                >
                  {dept}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
