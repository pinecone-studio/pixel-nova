import type { ReactNode } from "react";

import { BiChevronRight } from "react-icons/bi";
import { FiCheckCircle, FiFileText } from "react-icons/fi";

import { summaryCardTone } from "./helpers";
import type { AuditView } from "./types";

function AuditSummaryCard({
  active,
  count,
  label,
  tone,
  icon,
  onClick,
}: {
  active: boolean;
  count: number;
  label: string;
  tone: "blue" | "green";
  icon: ReactNode;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex h-[92px] items-center justify-between rounded-[24px] border px-7 text-left transition-[flex-basis,background-color,border-color] duration-300 lg:basis-[32%] ${active ? "lg:basis-[66%]" : ""} ${summaryCardTone(active, tone)}`}
    >
      <div className="flex min-w-0 items-center gap-5">
        {icon}
        <div className="flex min-w-0 items-end gap-3">
          <span className="text-[46px] font-semibold leading-none text-white">
            {count}
          </span>
          <span className="truncate pb-1 text-[14px] text-[#A4AFC0]">
            {label}
          </span>
        </div>
      </div>
      <BiChevronRight className="h-8 w-8 text-[#7E8A9E]" />
    </button>
  );
}

export function AuditSummaryCards({
  selectedView,
  onSelect,
}: {
  selectedView: AuditView;
  onSelect: (view: AuditView) => void;
}) {
  return (
    <div className="flex w-full flex-col gap-4 lg:flex-row">
      <AuditSummaryCard
        active={selectedView === "newEmployee"}
        count={7}
        label="Шинэ ажилтаны хүсэлт"
        tone="blue"
        onClick={() => onSelect("newEmployee")}
        icon={
          <div className="flex h-14 w-14 items-center justify-center rounded-[18px] bg-[#2F7BFF] text-white shadow-[0_10px_30px_rgba(47,123,255,0.35)]">
            <FiFileText className="h-6 w-6" />
          </div>
        }
      />

      <AuditSummaryCard
        active={selectedView === "documentReview"}
        count={2}
        label="Баримт бичиг баталгаажуулах"
        tone="green"
        onClick={() => onSelect("documentReview")}
        icon={
          <div className="flex h-14 w-14 items-center justify-center rounded-[18px] bg-[#12C95E] text-white shadow-[0_10px_30px_rgba(18,201,94,0.28)]">
            <FiCheckCircle className="h-6 w-6" />
          </div>
        }
      />
    </div>
  );
}
