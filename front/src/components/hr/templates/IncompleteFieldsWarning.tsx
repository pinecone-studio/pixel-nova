"use client";

import { useMemo } from "react";
import { FiAlertTriangle } from "react-icons/fi";

import { getMissingFields } from "@/lib/templateConfig";
import type { TemplateToken } from "@/lib/templateConfig";
import type { Employee } from "@/lib/types";

import { getEmployeeDocumentProfile } from "./template-manager-shared";

export function IncompleteFieldsWarning({
  templateId,
  employees,
}: {
  templateId: string;
  employees: Employee[];
}) {
  const warnings = useMemo(() => {
    const result: Array<{ employee: Employee; missing: TemplateToken[] }> = [];

    for (const employee of employees) {
      const missing = getMissingFields(
        templateId,
        getEmployeeDocumentProfile(employee.documentProfile),
      );
      if (missing.length > 0) {
        result.push({ employee, missing });
      }
    }

    return result;
  }, [employees, templateId]);

  if (warnings.length === 0) {
    return (
      <div className="flex items-center gap-2 rounded-[12px] border border-emerald-200 bg-emerald-50 px-3 py-2 text-[13px] text-emerald-700">
        <span className="flex h-5 w-5 items-center justify-center rounded-full bg-emerald-100">
          ✓
        </span>
        Бүх ажилтны мэдээлэл бүрэн
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center gap-2 rounded-[12px] border border-amber-200 bg-amber-50 px-3 py-2 text-[13px] text-amber-700">
        <FiAlertTriangle className="h-4 w-4 shrink-0" />
        <span>
          <strong>{warnings.length}</strong> ажилтны мэдээлэл дутуу байна
        </span>
      </div>

      <div className="max-h-[200px] overflow-y-auto rounded-[12px] border border-black/12 bg-white">
        {warnings.slice(0, 10).map(({ employee, missing }) => (
          <div
            key={employee.id}
            className="flex items-center justify-between border-b border-black/6 px-3 py-2 last:border-0"
          >
            <div className="min-w-0">
              <p className="truncate text-[13px] font-medium text-[#121316]">
                {employee.employeeCode} - {employee.lastName} {employee.firstName}
              </p>
              <p className="text-[11px] text-[#77818c]">{employee.department}</p>
            </div>
            <div className="flex flex-wrap gap-1">
              {missing.map((field) => (
                <span
                  key={field.key}
                  className="rounded-full border border-red-200 bg-red-50 px-2 py-0.5 text-[11px] text-red-600"
                >
                  {field.label}
                </span>
              ))}
            </div>
          </div>
        ))}
        {warnings.length > 10 && (
          <div className="px-3 py-2 text-center text-[12px] text-[#77818c]">
            ... +{warnings.length - 10} бусад
          </div>
        )}
      </div>
    </div>
  );
}
