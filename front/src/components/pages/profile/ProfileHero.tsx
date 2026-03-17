"use client";

import Image from "next/image";

import { Engineering, Idevhtei, Senior } from "@/components/icons";
import { formatDepartment, formatLevel } from "@/lib/labels";
import type { Employee } from "@/lib/types";

import { getInitials } from "./profileUtils";

export function ProfileHero({
  employee,
  errorMessage,
}: {
  employee: Employee | null;
  errorMessage?: string | null;
}) {
  const displayName = employee
    ? `${employee.lastName} ${employee.firstName}`
    : "Профайл";
  const displayNameEng =
    employee?.lastNameEng || employee?.firstNameEng
      ? `${employee.lastNameEng ?? ""} ${employee.firstNameEng ?? ""}`.trim()
      : "Ажилтан";

  return (
    <div className="mb-8 rounded-2xl border border-gray-800 bg-linear-to-r from-gray-900 to-teal-950 p-6">
      <div className="flex items-center gap-5">
        {employee?.imageUrl ? (
          <Image
            src={employee.imageUrl}
            alt="Профайл"
            width={112}
            height={112}
            className="h-20 w-20 rounded-full border-2 border-teal-500 object-cover"
            unoptimized
          />
        ) : (
          <div className="flex h-20 w-20 items-center justify-center rounded-full border-2 border-teal-500 bg-teal-950 text-xl font-semibold text-teal-200">
            {getInitials(employee)}
          </div>
        )}
        <div>
          <h2 className="text-2xl font-bold text-white">{displayName}</h2>
          <p className="mb-3 text-sm text-gray-400">{displayNameEng}</p>
          <div className="flex flex-wrap gap-2">
            <span className="flex items-center gap-1 rounded-full border border-teal-600 px-3 py-1 text-xs text-teal-400">
              <Senior />
              {employee?.level ? formatLevel(employee.level) : "Мэдээлэлгүй"}
            </span>
            <span className="flex items-center gap-1 rounded-full border border-gray-700 px-3 py-1 text-xs text-white">
              <Engineering />
              {employee?.department
                ? formatDepartment(employee.department)
                : "Мэдээлэлгүй"}
            </span>
            <span className="flex items-center gap-1 rounded-full border border-teal-600 px-3 py-1 text-xs text-teal-400">
              <Idevhtei />
              {employee?.status ?? "Мэдээлэлгүй"}
            </span>
          </div>
          {errorMessage ? (
            <p className="mt-3 text-sm text-red-400">{errorMessage}</p>
          ) : null}
        </div>
      </div>
    </div>
  );
}
