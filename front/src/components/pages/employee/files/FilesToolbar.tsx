"use client";

import { useMemo, useState } from "react";

export function FilesToolbar({
  search,
  filter,
  onSearchChange,
  onFilterChange,
}: {
  search: string;
  filter: string;
  onSearchChange: (value: string) => void;
  onFilterChange: (value: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const options = useMemo(
    () => [
      { value: "all", label: "Сонгоно уу" },
      { value: "pdf", label: "Тодорхойлолт" },
      { value: "html", label: "Гэрээ" },
      { value: "txt", label: "Тушаал" },
    ],
    [],
  );
  const activeLabel =
    options.find((opt) => opt.value === filter)?.label ?? "Сонгоно уу";

  return (
    <div className="mt-10 flex">
      <div style={{ position: "relative", flex: 1 }}>
        <span
          style={{
            position: "absolute",
            left: 12,
            top: "50%",
            transform: "translateY(-50%)",
            color: "#9CA3AF",
            pointerEvents: "none",
            display: "flex",
          }}
        >
          <svg
            width="16"
            height="16"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            viewBox="0 0 24 24"
          >
            <circle cx="11" cy="11" r="8" />
            <path d="m21 21-4.35-4.35" />
          </svg>
        </span>
        <input
          type="search"
          value={search}
          onChange={(event) => onSearchChange(event.target.value)}
          placeholder="Баримт хайх..."
          style={{
            width: "854px",
            height: 47,
            padding: "0 12px 0 36px",
            background: "white",
            border: "1px solid #E5E7EB",
            borderRadius: 12,
            color: "#121316",
            fontSize: 14,
            outline: "none",
          }}
        />
      </div>
      <div
        className="relative ml-4"
        tabIndex={0}
        onBlur={() => setOpen(false)}
      >
        <button
          type="button"
          onClick={() => setOpen((prev) => !prev)}
          className="flex h-[47px] w-[186px] items-center justify-between rounded-lg border border-solid border-[#e5e7eb] bg-white pl-3 pr-2 text-[14px] text-[#6b7280] outline-none"
        >
          <span>{activeLabel}</span>
          <span className="text-[#6b7280]">
            <svg width="12" height="12" viewBox="0 0 20 20" fill="none">
              <path
                d="M6 8l4 4 4-4"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </span>
        </button>
        {open ? (
          <div className="absolute right-0 mt-2 w-[186px] rounded-sm border border-[#e5e7eb] bg-white shadow-md">
            {options.map((opt) => {
              const active = opt.value === filter;
              return (
                <button
                  key={opt.value}
                  type="button"
                  onMouseDown={(event) => event.preventDefault()}
                  onClick={() => {
                    onFilterChange(opt.value);
                    setOpen(false);
                  }}
                  className={`flex w-full px-3 py-2 text-left text-[14px] transition-colors ${
                    active
                      ? "bg-[#E6F0FF] text-[#1D4ED8]"
                      : "text-[#4B5563] hover:bg-[#F3F4F6] hover:text-[#111827]"
                  }`}
                >
                  {opt.label}
                </button>
              );
            })}
          </div>
        ) : null}
      </div>
    </div>
  );
}
