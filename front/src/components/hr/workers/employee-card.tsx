"use client";

import type { Employee } from "@/lib/types";
import { formatBranch, formatDepartment, formatLevel } from "@/lib/labels";
import { BuildingIcon, LockIcon, MailIcon } from "@/components/icons";
import { FiGithub, FiGlobe } from "react-icons/fi";

import { avatarColor, getInitials, statusLabel, statusStyle } from "./shared";

export function EmployeeCard({
  employee,
  onEdit,
}: {
  employee: Employee;
  onEdit: (employee: Employee) => void;
}) {
  return (
    <button
      type="button"
      onClick={() => onEdit(employee)}
      className="flex h-[344px] w-full max-w-[326px] flex-col gap-6 rounded-[26px] border border-slate-200 bg-white/90 p-4 text-left shadow-[0_16px_40px_rgba(15,23,42,0.08)] transition-colors hover:border-slate-300"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex min-w-0 items-start gap-6">
          <div
            className={`h-16 w-16 rounded-[18px] ${avatarColor(employee.id)} flex shrink-0 items-center justify-center text-base font-bold text-white`}
          >
            {getInitials(employee)}
          </div>
          <div className="min-w-0 space-y-1">
            <p className="truncate text-[15px] font-semibold leading-5 text-slate-900">
              {employee.lastName} {employee.firstName}
            </p>
            <p className="truncate text-[13px] leading-5 text-slate-500">
              {employee.jobTitle || formatLevel(employee.level)}
            </p>
            <p className="text-xs leading-4 text-slate-400">{employee.employeeCode}</p>
          </div>
        </div>
        <span
          className={`shrink-0 rounded-full px-2.5 py-1 text-[11px] font-medium ${statusStyle(employee.status)}`}
        >
          {statusLabel(employee.status)}
        </span>
      </div>

      <div className="mt-2 flex flex-col gap-4">
        <div className="flex min-w-0 items-center gap-3">
          <MailIcon className="h-5 w-5 shrink-0" />
          <span className="truncate text-[13px] leading-6 text-slate-500">
            {employee.email || "Имэйл байхгүй"}
          </span>
        </div>
        <div className="flex min-w-0 items-center gap-3">
          <FiGlobe className="h-5 w-5 shrink-0 text-slate-400" />
          <span className="truncate text-[13px] leading-6 text-slate-500">
            {employee.entraId || "+976 99008877"}
          </span>
        </div>
        <div className="flex min-w-0 items-center gap-3">
          <BuildingIcon className="h-5 w-5 shrink-0" />
          <span className="truncate text-[13px] leading-6 text-slate-500">
            {formatDepartment(employee.department)}
          </span>
        </div>
        <div className="flex min-w-0 items-center gap-3">
          <LockIcon className="h-5 w-5 shrink-0" />
          <span className="truncate text-[13px] leading-6 text-slate-500">
            {formatBranch(employee.branch)}
          </span>
        </div>
        {employee.github ? (
          <div className="flex min-w-0 items-center gap-3">
            <FiGithub className="h-5 w-5 shrink-0 text-slate-400" />
            <span className="truncate text-[13px] leading-6 text-slate-500">{employee.github}</span>
          </div>
        ) : null}
      </div>
    </button>
  );
}
