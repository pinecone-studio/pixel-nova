"use client";

import type { ReactNode } from "react";

import { ActiveIconn, HiredIcon } from "@/components/icons";

interface WorkersStatsProps {
  totalEmployees: number;
  totalActive: number;
  lastSyncTime?: string | null;
  syncSource?: string | null;
}

interface StatCardProps {
  title: string;
  value: number;
  icon: ReactNode;
  accentClassName: string;
  badgeText?: string | null;
  footerText?: string | null;
}

function relativeTime(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "Дөнгөж сая";
  if (mins < 60) return `${mins} минутын өмнө`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours} цагийн өмнө`;
  const days = Math.floor(hours / 24);
  return `${days} өдрийн өмнө`;
}

function StatCard({
  title,
  value,
  icon,
  accentClassName,
  badgeText,
  footerText,
}: StatCardProps) {
  return (
    <div className="flex min-h-[196px] rounded-[28px] border border-slate-200 bg-white px-6 py-10 shadow-[0_16px_40px_rgba(15,23,42,0.08)]">
      <div className="flex w-full items-center justify-between gap-6">
        <div className="min-w-0">
          <p className="text-[18px] font-semibold leading-7 text-slate-500">
            {title}
          </p>
          <p className="mt-3 text-[72px] font-semibold leading-none tracking-[-0.04em] text-slate-600">
            {value}
          </p>
          {badgeText ? (
            <span className="mt-4 inline-flex rounded-lg border border-emerald-200 bg-emerald-50 px-2 py-1 text-[11px] font-semibold text-emerald-600">
              {badgeText}
            </span>
          ) : null}
          {footerText ? (
            <p className="mt-3 text-sm text-slate-500">{footerText}</p>
          ) : null}
        </div>
        <div
          className={`flex h-20 w-20 shrink-0 items-center justify-center rounded-[24px] border ${accentClassName}`}
        >
          {icon}
        </div>
      </div>
    </div>
  );
}

export function WorkersStats({
  totalEmployees,
  totalActive,
  lastSyncTime,
  syncSource,
}: WorkersStatsProps) {
  return (
    <div className="grid gap-4 md:grid-cols-2 md:gap-x-12 md:gap-y-4">
      <StatCard
        title="Нийт ажилчид"
        value={totalEmployees}
        accentClassName="border-emerald-300 bg-emerald-50 text-emerald-500"
        icon={<HiredIcon className="h-9 w-9 text-emerald-500" />}
        badgeText={lastSyncTime ? `Синк: ${relativeTime(lastSyncTime)}` : null}
        footerText={
          lastSyncTime && syncSource ? `${syncSource} эх үүсвэр` : null
        }
      />
      <StatCard
        title="Идэвхтэй"
        value={totalActive}
        accentClassName="border-blue-300 bg-blue-50 text-blue-500"
        icon={<ActiveIconn className="h-9 w-9 text-blue-500" />}
      />
    </div>
  );
}
