"use client";

import type { Employee } from "@/lib/types";
import { formatBranch, formatDepartment, formatLevel } from "@/lib/labels";
import { BuildingIcon, CalIcon, LockIcon, MailIcon } from "@/components/icons";
import { FiGithub, FiGlobe, FiHash } from "react-icons/fi";

import type { EmployeeDocumentProfile } from "@/lib/types";
import { avatarColor, getInitials, statusStyle } from "./shared";

function DocumentProfileBadge({
  profile,
}: {
  profile?: EmployeeDocumentProfile | null;
}) {
  const filledCount = profile
    ? Object.values(profile).filter(
        (v) => v !== null && v !== undefined && v !== "",
      ).length
    : 0;
  const totalFields = 30; // total fields in EmployeeDocumentProfile

  if (filledCount === 0) {
    return (
      <div className="flex items-center gap-2">
        <FiHash className="h-3.5 w-3.5 text-slate-400" />
        <span className="px-2 py-0.5 rounded-md bg-amber-50 text-amber-600 text-xs border border-amber-100">
          Профайл хоосон
        </span>
      </div>
    );
  }

  const percent = Math.round((filledCount / totalFields) * 100);
  const isFull = percent >= 80;

  return (
    <div className="flex items-center gap-2">
      <FiHash className="h-3.5 w-3.5 text-slate-400" />
      <span
        className={`px-2 py-0.5 rounded-md text-xs border ${
          isFull
            ? "bg-emerald-50 text-emerald-600 border-emerald-100"
            : "bg-blue-50 text-blue-600 border-blue-100"
        }`}
      >
        Профайл {percent}%
      </span>
    </div>
  );
}

export function EmployeeCard({
  employee,
  onEdit,
}: {
  employee: Employee;
  onEdit: (employee: Employee) => void;
}) {
  return (
    <div className="rounded-3xl border border-slate-200 bg-white/90 p-5 flex flex-col gap-4 hover:border-slate-300 transition-colors shadow-[0_16px_40px_rgba(15,23,42,0.08)]">
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          <div
            className={`w-11 h-11 rounded-2xl ${avatarColor(employee.id)} flex items-center justify-center text-white font-bold text-sm shrink-0`}
          >
            {getInitials(employee)}
          </div>
          <div>
            <p className="text-slate-900 font-semibold text-sm">
              {employee.lastName} {employee.firstName}
            </p>
            <p className="text-slate-500 text-xs">
              {employee.jobTitle || formatLevel(employee.level)}
            </p>
            <p className="text-slate-400 text-xs">{employee.employeeCode}</p>
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
          <span className="text-slate-500 text-xs">
            {employee.email || "Имэйл байхгүй"}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <BuildingIcon />
          <span className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-600 text-xs">
            {formatDepartment(employee.department)}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <LockIcon />
          <span className="text-slate-500 text-xs">
            {formatBranch(employee.branch)}
          </span>
        </div>
        {employee.entraId ? (
          <div className="flex items-center gap-2">
            <FiGlobe className="h-3.5 w-3.5 text-slate-400" />
            <span className="px-2 py-0.5 rounded-md bg-blue-50 text-blue-600 text-xs border border-blue-100">
              Entra ID
            </span>
          </div>
        ) : null}
        {employee.github ? (
          <div className="flex items-center gap-2">
            <FiGithub className="h-3.5 w-3.5 text-slate-400" />
            <span className="text-slate-500 text-xs">{employee.github}</span>
          </div>
        ) : null}
      </div>

      {/* Document profile status */}
      <DocumentProfileBadge profile={employee.documentProfile} />

      <div className="h-px bg-slate-200" />

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          <CalIcon />
          <span className="text-slate-500 text-xs">
            Орсон: {employee.hireDate}
          </span>
        </div>
        <button
          onClick={() => onEdit(employee)}
          className="h-7 px-3 rounded-lg border border-slate-200 text-slate-500 text-xs hover:text-slate-900 hover:border-slate-300 transition-colors cursor-pointer"
        >
          Засах
        </button>
      </div>
    </div>
  );
}
