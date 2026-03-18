"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useMemo, useState } from "react";
import { useQuery } from "@apollo/client/react";
import { FiSearch } from "react-icons/fi";

import { EmployeeNotifDrawer } from "@/components/employee-notif/EmployeeNotifDrawer";
import { EpasLogo, NotifIcon } from "@/components/icons";
import { GET_CONTRACT_REQUESTS } from "@/graphql/queries";
import { buildGraphQLHeaders } from "@/lib/apollo-client";
import type { ContractRequest } from "@/lib/types";

import { getActiveHrNavItem, HR_NAV_ITEMS } from "./navigation";
import { mapContractRequestToEmployeeNotification } from "./notif/hrNotifUtils";
import { HrOverlayProvider, useHrOverlay } from "./overlay-context";

function HrShellInner({ children }: { children: React.ReactNode }) {
  const { blurred } = useHrOverlay();
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
    <div className="hr-scope h-screen overflow-hidden bg-[#fafafa]">
      <div
        className={`flex h-full overflow-hidden transition-[filter] duration-200 ${blurred ? "blur-sm pointer-events-none select-none" : ""}`}
      >
        <aside className="scrollbar-hidden group sticky top-0 h-screen overflow-y-auto overflow-x-hidden w-20 hover:w-[232px] transition-[width] duration-300 border-r border-black/12 bg-white flex flex-col py-4 px-2 shrink-0">
          <div className="mb-8 flex min-h-[48px] items-center gap-3 px-2">
            <EpasLogo className="w-9 h-9 rounded-xl shrink-0" />
            <span className="whitespace-nowrap text-sm font-bold text-slate-900 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
              EPAS
            </span>
          </div>

          <div className="flex flex-1 flex-col gap-2">
            {HR_NAV_ITEMS.map((item) => {
              const active = activeItem.key === item.key;

              return (
                <Link
                  key={item.key}
                  href={item.href}
                  className={`relative flex h-14 items-center gap-3 rounded-[14px] px-2 transition-all duration-200 text-left w-full ${
                    active
                      ? "bg-white text-slate-900 border border-[#111827]/20 shadow-[0_8px_20px_rgba(17,24,39,0.12)]"
                      : "text-slate-500 hover:text-slate-700 hover:bg-slate-100 border border-transparent"
                  }`}
                  aria-label={item.label}
                >
                  {active ? (
                    <span className="absolute left-0 top-1/2 h-8 w-1 -translate-y-1/2 rounded-r bg-[rgba(63,65,69,0.9)]" />
                  ) : null}
                  <span
                    className={`flex h-10 w-10 items-center justify-center rounded-[12px] shrink-0 transition-all ${active ? "bg-linear-to-b from-white/25 to-black/60 text-black" : ""}`}
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
          <div className="mt-2 flex min-h-[48px] items-center gap-3 rounded-xl px-2 py-2">
            <span className="flex h-10 w-10 items-center justify-center rounded-full bg-[linear-gradient(135deg,#ad46ff_0%,#f6339a_100%)] text-white text-xs font-bold shrink-0 shadow-[0_10px_15px_rgba(0,0,0,0.1),0_4px_6px_rgba(0,0,0,0.1)]">
              HR
            </span>
            <span className="whitespace-nowrap text-sm text-slate-500 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
              HR баг
            </span>
          </div>
        </aside>

        <main className="scrollbar-hidden flex min-h-0 min-w-0 flex-1 flex-col overflow-x-hidden overflow-y-auto">
          <header className="sticky top-0 z-10 flex h-16 shrink-0 items-center justify-between gap-3 border-b border-black/12 bg-[#fafafa] px-4 sm:px-6">
            <div className="text-[18px] font-semibold tracking-[-0.09px] text-black">
              {activeItem.label}
            </div>

            <div className="flex items-center gap-3">
              <label className="flex h-9 w-40 items-center gap-3 rounded-[10px] border border-black/12 bg-white px-4 text-[14px] text-[#77818c] sm:w-64">
                <FiSearch className="h-4 w-4 text-[#77818c]" />
                <input
                  className="w-full bg-transparent outline-none placeholder:text-[#77818c]"
                  placeholder="Хайх..."
                  type="text"
                />
              </label>
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
                  className="flex h-9 w-9 cursor-pointer items-center justify-center rounded-[10px] text-[#3f4145] transition-colors hover:bg-white"
                  aria-label="Мэдэгдэл"
                >
                  <NotifIcon />
                </button>
                {unreadCount > 0 ? (
                  <span className="absolute -right-1 -top-1 flex h-5 min-w-[20px] items-center justify-center rounded-full border border-transparent bg-[#de3b3d] px-1 text-[12px] font-medium text-[#eaeff5]">
                    {unreadCount}
                  </span>
                ) : null}
              </div>
            </div>
          </header>

          <div className="flex min-w-0 flex-1 flex-col gap-5 overflow-x-hidden px-4 py-4 sm:px-6 sm:py-6">
            <div key={pathname} className="hr-page-transition flex flex-col gap-5">
              {children}
            </div>
          </div>
        </main>
      </div>

      <EmployeeNotifDrawer
        open={notifOpen}
        loading={notificationsLoading}
        notifications={notifications}
        selectedId={selectedNotifId}
        theme="light"
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

export function HrShell({ children }: { children: React.ReactNode }) {
  return (
    <HrOverlayProvider>
      <HrShellInner>{children}</HrShellInner>
    </HrOverlayProvider>
  );
}
