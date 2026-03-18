"use client";

import type { Employee } from "@/lib/types";
import { formatBranch, formatDepartment, formatLevel } from "@/lib/labels";
import { BuildingIcon, CalIcon, LockIcon, MailIcon } from "@/components/icons";

import { avatarColor, getInitials, statusStyle } from "./shared";

export function EmployeeCard({
  employee,
  onEdit,
}: {
  employee: Employee;
  onEdit: (employee: Employee) => void;
}) {
  return (
    <div className="flex flex-col gap-4 rounded-[24px] border border-[rgba(0,0,0,0.12)] bg-white p-6 transition-colors hover:border-[rgba(0,0,0,0.2)]">
      <div className="flex items-start justify-between gap-4">
        <div className="flex min-w-0 items-center gap-4">
          <div
            className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-[14px] text-[18px] font-bold text-white shadow-[0_10px_15px_rgba(0,0,0,0.1),0_4px_6px_rgba(0,0,0,0.1)] ${avatarColor(employee.id)}`}
          >
            {getInitials(employee)}
          </div>
          <div className="min-w-0">
            <p className="truncate text-[16px] font-bold leading-5 tracking-[-0.096px] text-black">
              {employee.lastName} {employee.firstName}
            </p>
            <p className="truncate text-[14px] leading-4 tracking-[-0.14px] text-[#3f4145b3]">
              {employee.jobTitle || formatLevel(employee.level)}
            </p>
            <p className="text-[12px] text-[#3f414599]">{employee.employeeCode}</p>
          </div>
        </div>
        <span
          className={`rounded-full px-3 py-1 text-[12px] font-medium ${statusStyle(employee.status)}`}
        >
          {employee.status}
        </span>
      </div>

      <div className="flex flex-col gap-2">
        <div className="flex items-center gap-2 text-[14px] text-[#3f4145b3]">
          <MailIcon />
          <span className="truncate">{employee.email || "Имэйл байхгүй"}</span>
        </div>
        <div className="flex items-center gap-2">
          <BuildingIcon />
          <span className="rounded-[8px] bg-[#f5f5f5] px-2 py-1 text-[12px] text-[#3f4145]">
            {formatDepartment(employee.department)}
          </span>
        </div>
        <div className="flex items-center gap-2 text-[14px] text-[#3f4145b3]">
          <LockIcon />
          <span>{formatBranch(employee.branch)}</span>
        </div>
      </div>

      <div className="h-px bg-[rgba(0,0,0,0.12)]" />

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1.5 text-[14px] text-[#3f4145b3]">
          <CalIcon />
          <span>Орсон: {employee.hireDate}</span>
        </div>
        <button
          onClick={() => onEdit(employee)}
          className="h-8 rounded-[10px] border border-[rgba(0,0,0,0.12)] px-3 text-[12px] font-medium text-[#3f4145] transition-colors hover:border-[rgba(0,0,0,0.2)] hover:text-black"
        >
          Засах
        </button>
      </div>
    </div>
  );
}
