"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useMemo, useState } from "react";
import { useQuery } from "@apollo/client/react";

import { EpasLogo, NotifIcon } from "@/components/icons";
import { GET_CONTRACT_REQUESTS } from "@/graphql/queries";
import { buildGraphQLHeaders } from "@/lib/apollo-client";
import type { ContractRequest } from "@/lib/types";

import { getActiveHrNavItem, HR_NAV_ITEMS } from "./navigation";
import { HrShellNotifRow } from "./notif/HrShellNotifRow";
import { mapContractRequestToNotif } from "./notif/hrNotifUtils";

export function HrShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const activeItem = getActiveHrNavItem(pathname);
  const [notifOpen, setNotifOpen] = useState(false);
  const [selectedNotifId, setSelectedNotifId] = useState<string | null>(null);

  const { data: contractData } = useQuery<{
    contractRequests: ContractRequest[];
  }>(GET_CONTRACT_REQUESTS, {
    context: {
      headers: buildGraphQLHeaders({ actorRole: "hr" }),
    },
    fetchPolicy: "network-only",
  });

  const notifications = useMemo(() => {
    return (contractData?.contractRequests ?? [])
      .map(mapContractRequestToNotif)
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [contractData]);

  const unreadCount = notifications.filter((n) => n.status === "pending").length;

  return (
    <div className="h-screen overflow-hidden bg-[#060d0c]">
      <div className="flex h-full overflow-hidden">
        <aside className="scrollbar-hidden group sticky top-0 h-screen overflow-y-auto overflow-x-hidden w-17 hover:w-60 transition-[width] duration-300 border-r border-white/8 bg-[#060d0c] flex flex-col py-4 px-2 shrink-0">
          <div className="mb-8 flex items-center gap-3 px-2">
            <EpasLogo className="w-9 h-9 rounded-xl shrink-0" />
            <span className="whitespace-nowrap text-sm font-bold text-white opacity-0 group-hover:opacity-100 transition-opacity duration-200">
              EPAS
            </span>
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
                  }`}>
                  {active ? (
                    <span className="absolute left-0 top-1/2 -translate-y-1/2 w-0.75 h-5 rounded-r-full bg-[#0ad4b1] shadow-[0_0_8px_rgba(10,212,177,0.8)]" />
                  ) : null}
                  <span
                    className={`flex h-9 w-9 items-center justify-center rounded-lg shrink-0 transition-all ${active ? "bg-[#0ad4b1]/15" : ""}`}>
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
              HR баг
            </span>
          </div>
        </aside>

        <main className="scrollbar-hidden flex-1 min-w-0 min-h-0 overflow-y-auto overflow-x-hidden flex flex-col">
          <header className="h-14 border-b border-white/8 flex items-center justify-between px-6 shrink-0 bg-[#060d0c]">
            <div className="flex items-center gap-2 text-sm">
              <span className="text-slate-500">HR</span>
              <span className="text-slate-600">›</span>
              <span className="text-[#0ad4b1] font-semibold">
                {activeItem.label}
              </span>
            </div>

            <div className="flex items-center gap-3">
              <Link
                href="/hr/employees"
                className="flex items-center gap-2 h-9 px-4 rounded-lg border cursor-pointer border-[#0ad4b1]/50 bg-linear-to-br from-[#0a3b33] to-[#0ad4b1]/20 text-white text-sm font-medium hover:border-[#0ad4b1] transition-colors">
                <span>＋</span> Ажилтан нэмэх
              </Link>
              <div className="relative">
                <button
                  onClick={() =>
                    setNotifOpen((prev) => {
                      const next = !prev;
                      if (!next) {
                        setSelectedNotifId(null);
                      }
                      return next;
                    })
                  }
                  className="h-9 w-9 rounded-lg border border-[#0ad4b1]/40 bg-[#0b201d] cursor-pointer text-[#d7fff8] flex items-center justify-center hover:border-[#0ad4b1] hover:bg-[#0f2b27] transition-colors"
                >
                  <NotifIcon />
                </button>
                {unreadCount > 0 ? (
                  <span className="absolute -top-1 -right-1 h-4 min-w-[16px] px-1 rounded-full bg-emerald-400 text-[10px] text-black font-bold flex items-center justify-center">
                    {unreadCount}
                  </span>
                ) : null}

                {notifOpen ? (
                  <div className="absolute right-0 top-[52px] z-50 w-[420px] overflow-hidden rounded-[24px] border border-[#223244] bg-[#050A11] shadow-[0_24px_70px_rgba(0,0,0,0.42)]">
                    <div className="border-b border-[#182433] px-6 pb-3 pt-2">
                      <div className="flex items-center justify-between gap-3">
                        <p className="text-[27px] font-semibold leading-none tracking-[-0.03em] text-white">
                          Мэдэгдэл
                        </p>
                        <button
                          onClick={() => {
                            setNotifOpen(false);
                            setSelectedNotifId(null);
                          }}
                          className="text-sm text-[#708096] hover:text-white"
                        >
                          Хаах
                        </button>
                      </div>
                    </div>

                    <div className="scrollbar-slim max-h-[406px] overflow-y-auto px-4 pb-4 pt-0">
                      {notifications.length === 0 ? (
                        <div className="flex min-h-[180px] items-center justify-center text-sm text-[#718099]">
                          Одоогоор мэдэгдэл алга байна.
                        </div>
                      ) : (
                        notifications.slice(0, 6).map((item) => (
                          <HrShellNotifRow
                            key={item.id}
                            item={item}
                            expanded={selectedNotifId === item.id}
                            onSelect={() =>
                              setSelectedNotifId((current) =>
                                current === item.id ? null : item.id,
                              )
                            }
                          />
                        ))
                      )}
                    </div>
                  </div>
                ) : null}
              </div>
            </div>
          </header>

          <div className="flex-1 min-w-0 overflow-x-hidden px-6 py-6 flex flex-col gap-5">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
