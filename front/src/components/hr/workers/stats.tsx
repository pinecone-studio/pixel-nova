"use client";

import { ActiveIconn, HiredIcon } from "@/components/icons";
import { CgPerformance } from "react-icons/cg";

export function WorkersStats({
  totalEmployees,
  totalActive,
  totalNewThisMonth,
}: {
  totalEmployees: number;
  totalActive: number;
  totalNewThisMonth: number;
}) {
  return (
    <div className="grid gap-4 lg:grid-cols-[1.4fr_1fr_1fr]">
      <div className="rounded-[24px] border border-[rgba(0,0,0,0.12)] bg-white px-6 py-8">
        <div className="flex items-start justify-between gap-3">
          <p className="text-[16px] font-bold leading-5 tracking-[-0.096px] text-[#3f4145]">
            Нийт ажилчид
          </p>
          <div className="flex h-13.5 w-13.5 items-center justify-center rounded-[12px] bg-[#121316]">
            <HiredIcon className="h-7 w-7 text-white" />
          </div>
        </div>
        <div className="mt-4 flex flex-wrap items-center gap-3">
          <p className="text-[64px] font-bold leading-17.5 tracking-[-0.04em] text-[#3f4145cc]">
            {totalEmployees}
          </p>
          <span className="mt-4 flex h-7 items-center gap-1 rounded-full border border-[#1aba5280] px-3 text-[14px] font-semibold text-[#1aba52]">
            Бодит өгөгдөл
          </span>
        </div>
        <p className="mt-1 text-[14px] font-medium text-[#3f414599]">
          Backend ажилтны жагсаалт
        </p>
      </div>

      <div className="rounded-[24px] border border-[rgba(0,0,0,0.12)] bg-white px-6 py-8">
        <div className="flex items-start justify-between gap-3">
          <p className="text-[16px] font-bold leading-5 tracking-[-0.096px] text-[#3f4145]">
            Идэвхтэй
          </p>
          <div className="flex h-13.5 w-13.5 items-center justify-center rounded-[12px] bg-[#121316]">
            <ActiveIconn className="h-6 w-6 text-white" />
          </div>
        </div>
        <p className="mt-4 text-[48px] font-bold leading-14 tracking-[-0.04em] text-[#3f4145cc]">
          {totalActive}
        </p>
      </div>

      <div className="rounded-[24px] border border-[rgba(0,0,0,0.12)] bg-white px-6 py-8">
        <div className="flex items-start justify-between gap-3">
          <p className="text-[16px] font-bold leading-5 tracking-[-0.096px] text-[#3f4145]">
            Энэ сар
          </p>
          <div className="flex h-13.5 w-13.5 items-center justify-center rounded-[12px] bg-[#121316]">
            <CgPerformance className="h-7 w-7 text-white" />
          </div>
        </div>
        <p className="mt-4 text-[48px] font-bold leading-14 tracking-[-0.04em] text-[#3f4145cc]">
          {totalNewThisMonth}
        </p>
      </div>
    </div>
  );
}
