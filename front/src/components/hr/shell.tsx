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
                      ? "text-slate-900 border border-transparent"
                      : "text-slate-500 hover:text-slate-700 hover:bg-slate-100 border border-transparent"
                  }`}
                >
                  {active ? (
                    <span className="absolute left-1 top-1/2 -translate-y-1/2 w-16 h-14">
                      <svg
                        width="64"
                        height="56"
                        viewBox="0 0 64 56"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                        className="w-16 h-14"
                      >
                        <mask id="path-1-inside-1_1161_1455" fill="white">
                          <path d="M0 14C0 6.26801 6.26801 0 14 0H50C57.732 0 64 6.26801 64 14V42C64 49.732 57.732 56 50 56H14C6.26801 56 0 49.732 0 42V14Z" />
                        </mask>
                        <path
                          d="M0 14C0 6.26801 6.26801 0 14 0H50C57.732 0 64 6.26801 64 14V42C64 49.732 57.732 56 50 56H14C6.26801 56 0 49.732 0 42V14Z"
                          fill="url(#paint0_linear_1161_1455)"
                        />
                        <path
                          d="M14 0V1H50V0V-1H14V0ZM64 14H63V42H64H65V14H64ZM50 56V55H14V56V57H50V56ZM0 42H1V14H0H-1V42H0ZM14 56V55C6.8203 55 1 49.1797 1 42H0H-1C-1 50.2843 5.71573 57 14 57V56ZM64 42H63C63 49.1797 57.1797 55 50 55V56V57C58.2843 57 65 50.2843 65 42H64ZM50 0V1C57.1797 1 63 6.8203 63 14H64H65C65 5.71573 58.2843 -1 50 -1V0ZM14 0V-1C5.71573 -1 -1 5.71573 -1 14H0H1C1 6.8203 6.8203 1 14 1V0Z"
                          fill="#121316"
                          mask="url(#path-1-inside-1_1161_1455)"
                        />
                        <path
                          d="M1 12C3.20914 12 5 13.7909 5 16V40C5 42.2091 3.20914 44 1 44V12Z"
                          fill="#121316"
                        />
                        <path
                          d="M33.4998 19.6667H28.4998C28.0396 19.6667 27.6665 20.0398 27.6665 20.5V22.1667C27.6665 22.6269 28.0396 23 28.4998 23H33.4998C33.9601 23 34.3332 22.6269 34.3332 22.1667V20.5C34.3332 20.0398 33.9601 19.6667 33.4998 19.6667Z"
                          stroke="#121316"
                          strokeWidth="1.66667"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                        <path
                          d="M34.3335 21.3333H36.0002C36.4422 21.3333 36.8661 21.5089 37.1787 21.8215C37.4912 22.134 37.6668 22.558 37.6668 23V34.6666C37.6668 35.1087 37.4912 35.5326 37.1787 35.8452C36.8661 36.1577 36.4422 36.3333 36.0002 36.3333H26.0002C25.5581 36.3333 25.1342 36.1577 24.8217 35.8452C24.5091 35.5326 24.3335 35.1087 24.3335 34.6666V23C24.3335 22.558 24.5091 22.134 24.8217 21.8215C25.1342 21.5089 25.5581 21.3333 26.0002 21.3333H27.6668"
                          stroke="#121316"
                          strokeWidth="1.66667"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                        <path
                          d="M31 27.1667H34.3333"
                          stroke="#121316"
                          strokeWidth="1.66667"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                        <path
                          d="M31 31.3333H34.3333"
                          stroke="#121316"
                          strokeWidth="1.66667"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                        <path
                          d="M27.6665 27.1667H27.6748"
                          stroke="#121316"
                          strokeWidth="1.66667"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                        <path
                          d="M27.6665 31.3333H27.6748"
                          stroke="#121316"
                          strokeWidth="1.66667"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                        <defs>
                          <linearGradient
                            id="paint0_linear_1161_1455"
                            x1="32"
                            y1="0"
                            x2="32"
                            y2="56"
                            gradientUnits="userSpaceOnUse"
                          >
                            <stop stopColor="white" />
                            <stop offset="0.158654" stopColor="#F1F1F1" />
                            <stop offset="0.298077" stopColor="#E9E9E9" />
                            <stop offset="0.451923" stopColor="#D3D3D3" />
                            <stop offset="0.629808" stopColor="#AFAFAF" />
                            <stop offset="0.8125" stopColor="#898989" />
                            <stop offset="0.899038" stopColor="#7E7E7E" />
                            <stop offset="1" />
                          </linearGradient>
                        </defs>
                      </svg>
                    </span>
                  ) : null}
                  {!active ? (
                    <span className="relative z-10 flex h-9 w-9 items-center justify-center rounded-lg shrink-0 transition-all">
                      {item.icon}
                    </span>
                  ) : null}
                  {!active ? (
                    <span className="relative z-10 whitespace-nowrap text-sm font-medium opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                      {item.label}
                    </span>
                  ) : null}
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
                className="flex items-center gap-2 h-9 px-4 rounded-lg border cursor-pointer border-slate-900 bg-slate-900 text-white text-sm font-medium hover:bg-slate-800 transition-colors"
              >
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
