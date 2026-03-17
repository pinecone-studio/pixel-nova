"use client";

import { CompanyTsalin, EntraID, KPI } from "@/components/icons";
import type { Employee } from "@/lib/types";

export function ProfileAdditionalInfo({
  employee,
}: {
  employee: Employee | null;
}) {
  return (
    <div className="overflow-hidden rounded-2xl border border-gray-800 bg-gray-900">
      <div className="flex h-[83px] flex-col px-[25px] pt-[17px]">
        <h3 className="h-[28px] text-lg font-semibold text-white">
          Нэмэлт мэдээлэл
        </h3>
        <p className="flex h-[28px] items-center text-sm text-gray-500">
          Таны гэрээний болон бусад мэдээлэл
        </p>
      </div>
      <div className="border-t border-gray-800" />
      <div className="px-[25px] pb-[23px] pt-[25px]">
        <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
          <div className="flex h-[107px] flex-col rounded-xl border border-gray-700 bg-gray-800 p-4">
            <div className="flex h-[36px] items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-teal-900/50 text-sm">
                <KPI />
              </div>
              <span className="text-xs font-semibold uppercase tracking-wider text-gray-300">
                KPI тооцоо
              </span>
            </div>
            <span className="mt-auto w-fit rounded-full bg-teal-900 px-2 py-0.5 text-xs text-teal-400">
              {employee?.isKpi ? "Тийм" : "Үгүй"}
            </span>
          </div>

          <div className="flex h-[107px] flex-col rounded-xl border border-gray-700 bg-gray-800 p-4">
            <div className="flex h-[36px] items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-teal-900/50 text-sm">
                <CompanyTsalin />
              </div>
              <span className="text-xs font-semibold uppercase tracking-wider text-gray-300">
                Компанийн цалин
              </span>
            </div>
            <span className="mt-auto w-fit rounded-full bg-teal-900 px-2 py-0.5 text-xs text-teal-400">
              {employee?.isSalaryCompany ? "Тийм" : "Үгүй"}
            </span>
          </div>

          <div className="flex h-[107px] flex-col rounded-xl border border-gray-700 bg-gray-800 p-4">
            <div className="flex h-[36px] items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-teal-900/50 text-sm">
                <EntraID />
              </div>
              <span className="text-xs font-semibold uppercase tracking-wider text-gray-300">
                Entra ID
              </span>
            </div>
            <span className="mt-4 text-xs text-gray-500">
              {employee?.entraId ?? "Мэдээлэлгүй"}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
