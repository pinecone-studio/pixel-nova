"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { BiChevronDown } from "react-icons/bi";

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
  const dropdownRef = useRef<HTMLDivElement | null>(null);
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

  useEffect(() => {
    function handlePointerDown(event: MouseEvent) {
      if (!dropdownRef.current?.contains(event.target as Node)) {
        setOpen(false);
      }
    }

    document.addEventListener("mousedown", handlePointerDown);
    return () => document.removeEventListener("mousedown", handlePointerDown);
  }, []);

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
            height: 44,
            padding: "13.5px 13px 13.5px 41px",
            background: "white",
            border: "1px solid rgba(0,0,0,0.12)",
            borderRadius: 10,
            color: "#121316",
            fontSize: 14,
            lineHeight: "20px",
            fontWeight: 500,
            outline: "none",
          }}
        />
      </div>
      <div ref={dropdownRef} className="relative ml-4">
        <button
          type="button"
          onClick={() => setOpen((prev) => !prev)}
          className="flex h-[44px] w-[186px] items-center justify-between rounded-[8px] border border-black/12 bg-white px-4 py-2 text-[16px] text-black outline-none"
        >
          <span>{activeLabel}</span>
          <BiChevronDown
            className={`h-4 w-4 text-[#6b7280] transition-transform ${
              open ? "rotate-180" : ""
            }`}
          />
        </button>
        {open ? (
          <div className="absolute right-0 z-10 mt-2 w-[186px] rounded-[10px] border border-black/12 bg-white p-1 shadow-[0_12px_32px_rgba(15,23,42,0.12)]">
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
                  className={`flex w-full rounded-[8px] bg-white px-3 py-2 text-left text-[14px] leading-5 transition-colors ${
                    active
                      ? "bg-[#F3F4F6] text-[#111827]"
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
