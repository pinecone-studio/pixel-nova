"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { DocIcon, NotifIcon } from "@/components/icons";

import { getActiveHrNavItem, HR_NAV_ITEMS } from "./navigation";

export function HrShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const activeItem = getActiveHrNavItem(pathname);

  return (
    <div className="min-h-screen bg-[#060d0c]">
      <div className="flex min-h-screen">
        <aside className="group w-16 hover:w-60 transition-[width] duration-300 border-r border-white/8 bg-[#060d0c] flex flex-col py-4 px-2 shrink-0">
          <div className="mb-8 flex justify-center">
            <div className="w-9 h-9 rounded-xl bg-[#0ad4b1]/15 border border-[#0ad4b1]/30 flex items-center justify-center">
              <DocIcon />
            </div>
          </div>

          <div className="flex flex-col gap-1 flex-1">
            {HR_NAV_ITEMS.map((item) => {
              const active = activeItem.key === item.key;

              return (
                <Link
                  key={item.key}
                  href={item.href}
                  className={`relative flex items-center gap-3 rounded-xl px-2 py-2 transition-all duration-200 text-left w-full ${
                    active
                      ? "bg-[#0ad4b1]/10 text-[#0ad4b1] border border-[#0ad4b1]/25 shadow-[0_0_12px_rgba(10,212,177,0.15)]"
                      : "text-slate-500 hover:text-slate-200 hover:bg-white/5 border border-transparent"
                  }`}
                >
                  {active ? (
                    <span className="absolute left-0 top-1/2 -translate-y-1/2 w-0.75 h-5 rounded-r-full bg-[#0ad4b1] shadow-[0_0_8px_rgba(10,212,177,0.8)]" />
                  ) : null}
                  <span
                    className={`flex h-9 w-9 items-center justify-center rounded-lg shrink-0 transition-all ${active ? "bg-[#0ad4b1]/15" : ""}`}
                  >
                    {item.icon}
                  </span>
                  <span className="whitespace-nowrap text-sm font-medium opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                    {item.label}
                  </span>
                </Link>
              );
            })}
          </div>

          <div className="flex items-center gap-3 rounded-xl px-2 py-2">
            <span className="flex h-9 w-9 items-center justify-center rounded-full bg-linear-to-br from-purple-500 to-pink-500 text-white text-xs font-bold shrink-0">
              HR
            </span>
            <span className="whitespace-nowrap text-sm text-slate-400 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
              HR Team
            </span>
          </div>
        </aside>

        <main className="flex-1 overflow-y-auto flex flex-col">
          <header className="h-14 border-b border-white/8 flex items-center justify-between px-6 shrink-0 bg-[#060d0c]">
            <div className="flex items-center gap-2 text-sm">
              <span className="text-slate-500">HR</span>
              <span className="text-slate-600">›</span>
              <span className="text-[#0ad4b1] font-semibold">{activeItem.label}</span>
            </div>

            <div className="flex items-center gap-3">
              <Link
                href="/hr/employees"
                className="flex items-center gap-2 h-9 px-4 rounded-lg border cursor-pointer border-[#0ad4b1]/50 bg-linear-to-br from-[#0a3b33] to-[#0ad4b1]/20 text-white text-sm font-medium hover:border-[#0ad4b1] transition-colors"
              >
                <span>＋</span> Add Employee
              </Link>
              <button className="h-9 w-9 rounded-lg border border-[#0ad4b1] cursor-pointer text-slate-300 flex items-center justify-center hover:border-white/40 transition-colors">
                <NotifIcon />
              </button>
            </div>
          </header>

          <div className="flex-1 px-6 py-6 flex flex-col gap-5">{children}</div>
        </main>
      </div>
    </div>
  );
}
