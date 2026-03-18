"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { FiChevronLeft, FiChevronRight } from "react-icons/fi";

type DatePickerFieldProps = {
  value: string;
  onChange: (value: string) => void;
  inputClass: string;
  placeholder?: string;
};

const WEEKDAYS = ["Да", "Мя", "Лх", "Пү", "Ба", "Бя", "Ня"];

function formatDate(value: Date) {
  const year = value.getFullYear();
  const month = String(value.getMonth() + 1).padStart(2, "0");
  const day = String(value.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function parseDate(value: string) {
  if (!value) return null;
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return null;
  return parsed;
}

function buildCalendar(viewDate: Date) {
  const year = viewDate.getFullYear();
  const month = viewDate.getMonth();
  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);
  const daysInMonth = lastDay.getDate();
  const mondayStart = (firstDay.getDay() + 6) % 7;

  const cells: Array<number | null> = [];
  for (let i = 0; i < mondayStart; i += 1) cells.push(null);
  for (let day = 1; day <= daysInMonth; day += 1) cells.push(day);
  while (cells.length % 7 !== 0) cells.push(null);

  return { year, month, cells };
}

export function DatePickerField({
  value,
  onChange,
  inputClass,
  placeholder = "Хугацаа оруулах",
}: DatePickerFieldProps) {
  const selectedDate = useMemo(() => parseDate(value), [value]);
  const [open, setOpen] = useState(false);
  const [viewDate, setViewDate] = useState<Date>(
    selectedDate ?? new Date(),
  );
  const wrapperRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (selectedDate) setViewDate(selectedDate);
  }, [selectedDate]);

  useEffect(() => {
    if (!open) return;
    const handleClick = (event: MouseEvent) => {
      if (!wrapperRef.current) return;
      if (!wrapperRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [open]);

  const { year, month, cells } = useMemo(
    () => buildCalendar(viewDate),
    [viewDate],
  );
  const monthLabel = `${month + 1} сар ${year}`;
  const selectedDay = selectedDate?.getDate();
  const selectedMonth = selectedDate?.getMonth();
  const selectedYear = selectedDate?.getFullYear();

  return (
    <div ref={wrapperRef} className="relative">
      <input
        value={value}
        onChange={(event) => onChange(event.target.value)}
        onFocus={() => setOpen(true)}
        placeholder={placeholder}
        className={inputClass}
      />

      {open ? (
        <div className="mt-3 rounded-[16px] border border-slate-200 bg-white px-4 pb-4 pt-3 shadow-[0_12px_40px_rgba(15,23,42,0.12)]">
          <div className="flex items-center justify-between gap-3">
            <button
              type="button"
              onClick={() =>
                setViewDate(
                  new Date(viewDate.getFullYear(), viewDate.getMonth() - 1, 1),
                )
              }
              className="size-9 rounded-full bg-slate-50 text-slate-600 hover:bg-slate-100 transition-colors"
            >
              <FiChevronLeft className="mx-auto h-4 w-4" />
            </button>
            <div className="text-[15px] font-semibold text-slate-800">
              {monthLabel}
            </div>
            <button
              type="button"
              onClick={() =>
                setViewDate(
                  new Date(viewDate.getFullYear(), viewDate.getMonth() + 1, 1),
                )
              }
              className="size-9 rounded-full bg-slate-50 text-slate-600 hover:bg-slate-100 transition-colors"
            >
              <FiChevronRight className="mx-auto h-4 w-4" />
            </button>
          </div>

          <div className="mt-4 grid grid-cols-7 text-center text-[12px] font-semibold text-slate-500">
            {WEEKDAYS.map((day) => (
              <div key={day} className="py-1">
                {day}
              </div>
            ))}
          </div>

          <div className="mt-2 grid grid-cols-7 gap-y-2 text-center text-[13px] text-slate-600">
            {cells.map((day, index) => {
              if (!day) return <div key={`empty-${index}`} />;
              const isSelected =
                day === selectedDay &&
                month === selectedMonth &&
                year === selectedYear;
              return (
                <button
                  key={`${year}-${month}-${day}`}
                  type="button"
                  onClick={() =>
                    onChange(formatDate(new Date(year, month, day)))
                  }
                  className={`mx-auto flex h-8 w-8 items-center justify-center rounded-full transition-colors ${
                    isSelected
                      ? "bg-black text-white"
                      : "hover:bg-slate-100"
                  }`}
                >
                  {day}
                </button>
              );
            })}
          </div>

          <div className="mt-4 flex justify-end">
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="rounded-[12px] bg-slate-900 px-4 py-2 text-[13px] font-medium text-white hover:bg-slate-800 transition-colors"
            >
              Болсон
            </button>
          </div>
        </div>
      ) : null}
    </div>
  );
}
