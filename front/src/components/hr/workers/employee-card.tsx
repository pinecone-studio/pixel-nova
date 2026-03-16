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
    <div className="rounded-2xl border border-slate-700/40 bg-[#0d1117] p-5 flex flex-col gap-3 hover:border-slate-600/60 transition-colors">
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          <div
            className={`w-11 h-11 rounded-xl ${avatarColor(employee.id)} flex items-center justify-center text-white font-bold text-sm shrink-0`}
          >
            {getInitials(employee)}
          </div>
          <div>
            <p className="text-white font-semibold text-sm">
              {employee.lastName} {employee.firstName}
            </p>
            <p className="text-slate-500 text-xs">
              {employee.jobTitle || formatLevel(employee.level)}
            </p>
            <p className="text-slate-600 text-xs">{employee.employeeCode}</p>
          </div>
        </div>
        <span
          className={`text-xs px-2.5 py-1 rounded-full font-medium ${statusStyle(employee.status)}`}
        >
          {employee.status}
        </span>
      </div>

      <div className="flex flex-col gap-1.5">
        <div className="flex items-center gap-2">
          <MailIcon />
          <span className="text-slate-400 text-xs">
            {employee.email || "Имэйл байхгүй"}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <BuildingIcon />
          <span className="px-2 py-0.5 rounded-md bg-slate-700/50 text-slate-300 text-xs">
            {formatDepartment(employee.department)}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <LockIcon />
          <span className="text-slate-400 text-xs">
            {formatBranch(employee.branch)}
          </span>
        </div>
      </div>

      <div className="h-px bg-slate-800/60" />

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          <CalIcon />
          <span className="text-slate-500 text-xs">Орсон: {employee.hireDate}</span>
        </div>
        <button
          onClick={() => onEdit(employee)}
          className="h-7 px-3 rounded-lg border border-slate-700/50 text-slate-400 text-xs hover:text-white hover:border-slate-500 transition-colors"
        >
          Засах
        </button>
      </div>
    </div>
  );
}
