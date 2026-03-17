"use client";

import type { ProfileInfoItem } from "./profileTypes";

export function ProfileInfoCard({
  title,
  items,
}: {
  title: string;
  items: ProfileInfoItem[];
}) {
  return (
    <div className="h-full rounded-2xl border border-gray-800 bg-gray-900 p-6">
      <h3 className="mb-5 text-lg font-semibold text-white">{title}</h3>
      <div className="border border-gray-800" />
      <div className="mt-5">
        {items.map((item) => (
          <div key={item.label} className="flex h-[68px] items-center gap-3">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-teal-900/50 text-sm">
              {item.icon}
            </div>
            <div>
              <p className="text-xs text-gray-500">{item.label}</p>
              <p className="text-sm font-medium text-white">{item.value}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
