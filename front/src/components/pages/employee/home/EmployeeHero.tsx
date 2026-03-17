"use client";

import type { Employee } from "@/lib/types";

export function EmployeeHero({
  employee,
  error,
}: {
  employee: Employee | null;
  error: string | null;
}) {
  const displayName = employee
    ? `${employee.lastName} ${employee.firstName}`
    : "???????";

  return (
    <div className="mx-auto flex h-[264px] w-full max-w-[1056px] items-center rounded-2xl bg-[linear-gradient(135deg,#0a0f15_0%,#0b1018_45%,#0a0d12_100%)] p-10 shadow-[0_0_0_1px_rgba(0,153,255,0.2),0_20px_60px_rgba(0,0,0,0.45)]">
      <div className="flex max-w-[640px] flex-col gap-3">
        <p className="text-sm font-medium uppercase tracking-widest text-[#00CC99]">
          Сайн байна уу?
        </p>
        <h1 className="text-[36px] font-semibold leading-[1.1] tracking-[-0.02em] text-white">
          {displayName}
        </h1>
        <p className="max-w-lg text-sm leading-relaxed text-[#4A4A6A]">
          Та хөдөлмөрийн баримт бичиг болон ажлын түүхээ нэг дороос харах
          боломжтой. Бүх мэдээлэл backend-аас бодитоор ачааллагдана.
        </p>
        <div className="mt-1 flex flex-wrap gap-2">
          {employee?.department ? (
            <span className="flex items-center gap-1.5 rounded-lg border border-[#00CC99]/30 bg-[#00CC99]/15 px-3 py-1.5 text-[13px] font-semibold text-[#00CC99]">
              {employee.department}
            </span>
          ) : null}
          {employee?.jobTitle ? (
            <span className="flex items-center gap-1.5 rounded-lg border border-white/10 bg-white/5 px-3 py-1.5 text-[13px] font-semibold text-[#94A3B8]">
              {employee.jobTitle}
            </span>
          ) : null}
          {employee?.employeeCode ? (
            <span className="flex items-center gap-1.5 rounded-lg border border-white/10 bg-white/5 px-3 py-1.5 text-[13px] font-semibold text-[#94A3B8]">
              {employee.employeeCode}
            </span>
          ) : null}
          {error ? (
            <span className="rounded-lg border border-red-500/20 bg-red-500/10 px-3 py-1.5 text-[13px] font-semibold text-red-400">
              {error}
            </span>
          ) : null}
        </div>
      </div>
    </div>
  );
}
