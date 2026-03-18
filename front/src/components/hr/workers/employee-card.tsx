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
    <div className="flex flex-col gap-4 rounded-3xl border border-slate-200 bg-white p-5 shadow-[0_1px_2px_rgba(15,23,42,0.06)] transition-colors hover:border-slate-300">
      <div className="flex items-start justify-between gap-4">
        <div className="flex min-w-0 items-center gap-3">
          <div
            className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl text-sm font-bold text-white ${avatarColor(employee.id)}`}
          >
            {getInitials(employee)}
          </div>
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold text-slate-900">
              {employee.lastName} {employee.firstName}
            </p>
            <p className="truncate text-xs text-slate-500">
              {employee.jobTitle || formatLevel(employee.level)}
            </p>
            <p className="text-xs text-slate-400">{employee.employeeCode}</p>
          </div>
        </div>
        <span
          className={`rounded-full px-2.5 py-1 text-xs font-medium ${statusStyle(employee.status)}`}
        >
          {employee.status}
        </span>
      </div>

      <div className="flex flex-col gap-2">
        <div className="flex items-center gap-2 text-xs text-slate-500">
          <MailIcon />
          <span className="truncate">{employee.email || "Имэйл байхгүй"}</span>
        </div>
        <div className="flex items-center gap-2">
          <BuildingIcon />
          <span className="rounded-lg bg-slate-100 px-2 py-1 text-xs text-slate-600">
            {formatDepartment(employee.department)}
          </span>
        </div>
        <div className="flex items-center gap-2 text-xs text-slate-500">
          <LockIcon />
          <span>{formatBranch(employee.branch)}</span>
        </div>
      </div>

      <div className="h-px bg-slate-200" />

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1.5 text-xs text-slate-500">
          <CalIcon />
          <span>Орсон: {employee.hireDate}</span>
        </div>
        <button
          onClick={() => onEdit(employee)}
          className="h-8 rounded-xl border border-slate-200 px-3 text-xs font-medium text-slate-600 transition-colors hover:border-slate-300 hover:text-slate-900"
        >
          Засах
        </button>
      </div>
    </div>
  );
}
