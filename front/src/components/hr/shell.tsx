"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useMemo, useState } from "react";
import { useQuery } from "@apollo/client/react";

import { EmployeeNotifDrawer } from "@/components/employee-notif/EmployeeNotifDrawer";
import { EpasLogo, NotifIcon } from "@/components/icons";
import { GET_CONTRACT_REQUESTS } from "@/graphql/queries";
import { buildGraphQLHeaders } from "@/lib/apollo-client";
import type { ContractRequest } from "@/lib/types";

import { getActiveHrNavItem, HR_NAV_ITEMS } from "./navigation";
import { mapContractRequestToEmployeeNotification } from "./notif/hrNotifUtils";

export function HrShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const activeItem = getActiveHrNavItem(pathname);
  const [notifOpen, setNotifOpen] = useState(false);
  const [selectedNotifId, setSelectedNotifId] = useState<string | null>(null);

  const { data: contractData, loading: notificationsLoading } = useQuery<{
    contractRequests: ContractRequest[];
  }>(GET_CONTRACT_REQUESTS, {
    context: {
      headers: buildGraphQLHeaders({ actorRole: "hr" }),
    },
    fetchPolicy: "network-only",
  });

  const notifications = useMemo(() => {
    return (contractData?.contractRequests ?? [])
      .map(mapContractRequestToEmployeeNotification)
      .sort(
        (a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
      );
  }, [contractData]);

  const unreadCount = notifications.filter((n) => n.status === "unread").length;

  return (
    <div className="h-screen overflow-hidden bg-slate-50">
      <div className="flex h-full overflow-hidden">
        <aside className="scrollbar-hidden group sticky top-0 h-screen overflow-y-auto overflow-x-hidden w-17 hover:w-60 transition-[width] duration-300 border-r border-slate-200 bg-white flex flex-col py-4 px-2 shrink-0">
          <div className="mb-8 flex items-center gap-3 px-2">
            <EpasLogo className="w-9 h-9 rounded-xl shrink-0" />
            <span className="whitespace-nowrap text-sm font-bold text-slate-900 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
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
                      ? "bg-emerald-50 text-emerald-600 border border-emerald-200 shadow-[0_0_12px_rgba(16,185,129,0.12)]"
                      : "text-slate-500 hover:text-slate-700 hover:bg-slate-100 border border-transparent"
                  }`}>
                  {active ? (
                    <span className="absolute left-0 top-1/2 -translate-y-1/2 w-0.75 h-5 rounded-r-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.6)]" />
                  ) : null}
                  <span
                    className={`flex h-9 w-9 items-center justify-center rounded-lg shrink-0 transition-all ${active ? "bg-emerald-100" : ""}`}>
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
            <span className="whitespace-nowrap text-sm text-slate-500 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
              HR баг
            </span>
          </div>
        </aside>

        <main className="scrollbar-hidden flex-1 min-w-0 min-h-0 overflow-y-auto overflow-x-hidden flex flex-col">
          <header className="h-14 border-b border-slate-200 flex items-center justify-between px-6 shrink-0 bg-white">
            <div className="flex items-center gap-2 text-sm">
              <span className="text-slate-500">HR</span>
              <span className="text-slate-400">›</span>
              <span className="text-slate-900 font-semibold">
                {activeItem.label}
              </span>
            </div>

            <div className="flex items-center gap-3">
              <Link
                href="/hr/employees"
                className="flex items-center gap-2 h-9 px-4 rounded-lg border cursor-pointer border-slate-900 bg-slate-900 text-white text-sm font-medium hover:bg-slate-800 transition-colors">
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
                  className="h-9 w-9 rounded-lg border border-slate-200 bg-white cursor-pointer text-slate-600 flex items-center justify-center hover:border-slate-300 hover:bg-slate-50 transition-colors"
                >
                  <NotifIcon />
                </button>
                {unreadCount > 0 ? (
                  <span className="absolute -top-1 -right-1 h-4 min-w-[16px] px-1 rounded-full bg-emerald-500 text-[10px] text-white font-bold flex items-center justify-center">
                    {unreadCount}
                  </span>
                ) : null}

                {notifOpen ? (
                  <div className="absolute right-0 top-[52px] z-50 w-[420px] overflow-hidden rounded-[24px] border border-slate-200 bg-white shadow-[0_24px_70px_rgba(15,23,42,0.18)]">
                    <div className="border-b border-slate-200 px-6 pb-3 pt-2">
                      <div className="flex items-center justify-between gap-3">
                        <p className="text-[27px] font-semibold leading-none tracking-[-0.03em] text-slate-900">
                          Мэдэгдэл
                        </p>
                        <button
                          onClick={() => {
                            setNotifOpen(false);
                            setSelectedNotifId(null);
                          }}
                          className="text-sm text-slate-500 hover:text-slate-700"
                        >
                          Хаах
                        </button>
                      </div>
                    </div>

                    <div className="scrollbar-slim max-h-[406px] overflow-y-auto px-4 pb-4 pt-0">
                      {notifications.length === 0 ? (
                        <div className="flex min-h-[180px] items-center justify-center text-sm text-slate-500">
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

      <EmployeeNotifDrawer
        open={notifOpen}
        loading={notificationsLoading}
        notifications={notifications}
        selectedId={selectedNotifId}
        onOpenChange={(nextOpen) => {
          setNotifOpen(nextOpen);
          if (!nextOpen) {
            setSelectedNotifId(null);
          }
        }}
        onSelect={(notification) => {
          setSelectedNotifId((current) =>
            current === notification.id ? null : notification.id,
          );
        }}
      />
    </div>
  );
}
