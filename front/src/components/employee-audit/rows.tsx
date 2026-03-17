"use client";

import { BiChevronRight, BiDownload } from "react-icons/bi";
import { FiCheckCircle, FiEye, FiFileText } from "react-icons/fi";

import type { DocumentReview, EmployeeRequest, StatusUpdate } from "./types";

export function NewEmployeeRow({
  entry,
  onOpen,
}: {
  entry: EmployeeRequest;
  onOpen: (entry: EmployeeRequest) => void;
}) {
  return (
    <button
      type="button"
      onClick={() => onOpen(entry)}
      className="flex w-full items-center justify-between rounded-[20px] border border-[#122236] bg-[#0B1623] px-5 py-5 text-left transition hover:border-[#1D3654] hover:bg-[#0D1A28]"
    >
      <div className="flex items-center gap-4">
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#0B2E2A] text-[#00D3A7]">
          <FiCheckCircle className="h-5 w-5" />
        </div>
        <div>
          <p className="text-[18px] font-semibold text-[#F2F7FB]">
            {entry.lastName.charAt(0)}. {entry.firstName}
          </p>
          <div className="mt-1 flex items-center gap-2 text-[13px] text-[#7E8A9E]">
            <FiFileText className="h-3.5 w-3.5" />
            <span>{entry.files.length} баримт хавсаргасан</span>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-6">
        <span className="rounded-full border border-[#0B8B7D] bg-[#052D31] px-3 py-1.5 text-[13px] font-medium text-[#06D2C4]">
          Ажилтан нэмэх
        </span>
        <span className="text-[13px] text-[#7E8A9E]">{entry.submittedAt}</span>
        <BiChevronRight className="h-6 w-6 text-[#7E8A9E]" />
      </div>
    </button>
  );
}

export function DocumentRow({
  entry,
  onOpen,
}: {
  entry: DocumentReview;
  onOpen: (entry: DocumentReview) => void;
}) {
  const badgeClasses =
    entry.badgeTone === "gold"
      ? "border-[#735200] bg-[#2A1E00] text-[#F2B94B]"
      : "border-[#214C91] bg-[#0B214A] text-[#3E8CFF]";

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={() => onOpen(entry)}
      onKeyDown={(event) => {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          onOpen(entry);
        }
      }}
      className="flex w-full items-center justify-between border-b border-[#0D2726] py-6 text-left transition hover:bg-white/[0.02] last:border-b-0"
    >
      <div className="flex items-center gap-4">
        <div className="flex h-14 w-14 items-center justify-center rounded-[18px] border border-[#243243] bg-[#111A26] text-[#7E8A9E]">
          <FiFileText className="h-6 w-6" />
        </div>
        <div>
          <p className="text-[16px] font-medium text-[#EDF4FB]">{entry.title}</p>
          <p className="mt-1 text-[14px] text-[#8A97AA]">{entry.fileName}</p>
        </div>
      </div>

      <div className="flex items-center gap-4">
        <span
          className={`rounded-full border px-4 py-1.5 text-[13px] font-medium ${badgeClasses}`}
        >
          {entry.badge}
        </span>
        <div
          className={`flex h-12 w-12 items-center justify-center rounded-full bg-linear-to-br ${entry.avatarColor} text-sm font-semibold text-white`}
        >
          {entry.avatarLabel}
        </div>
        <button
          type="button"
          onClick={(event) => {
            event.stopPropagation();
            onOpen(entry);
          }}
          className="rounded-full p-2 text-[#7E8A9E] transition hover:bg-white/5 hover:text-white"
        >
          <FiEye className="h-4 w-4" />
        </button>
        <button
          type="button"
          onClick={(event) => {
            event.stopPropagation();
          }}
          className="rounded-full p-2 text-[#7E8A9E] transition hover:bg-white/5 hover:text-white"
        >
          <BiDownload className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}

export function StatusRow({ entry }: { entry: StatusUpdate }) {
  const tone =
    entry.tone === "gold"
      ? "border-[#735200] bg-[#2A1E00] text-[#F2B94B]"
      : "border-[#0C8060] bg-[#052C23] text-[#22D39A]";

  return (
    <div className="flex items-center justify-between rounded-[20px] border border-[#122236] bg-[#0B1623] px-5 py-5">
      <div>
        <p className="text-[16px] font-medium text-[#EDF4FB]">{entry.title}</p>
        <p className="mt-1 text-[13px] text-[#7E8A9E]">{entry.subtitle}</p>
      </div>
      <span className={`rounded-full border px-4 py-1.5 text-[13px] font-medium ${tone}`}>
        {entry.status}
      </span>
    </div>
  );
}
