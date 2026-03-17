"use client";

import { useMutation, useQuery } from "@apollo/client/react";
import { useEffect, useMemo, useRef, useState } from "react";

import { GrNotification } from "react-icons/gr";
import { MARK_NOTIFICATION_READ } from "@/graphql/mutations";
import { GET_MY_NOTIFICATIONS } from "@/graphql/queries";
import { buildGraphQLHeaders } from "@/lib/apollo-client";
import type { EmployeeNotification } from "@/lib/types";

const TOKEN_KEY = "epas_auth_token";

export const EmployeeNotifDropdown = () => {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement | null>(null);
  const token =
    typeof window === "undefined"
      ? ""
      : window.localStorage.getItem(TOKEN_KEY) ?? "";

  const { data, loading, refetch } = useQuery<{
    myNotifications: EmployeeNotification[];
  }>(GET_MY_NOTIFICATIONS, {
    skip: !token,
    context: {
      headers: buildGraphQLHeaders({ authToken: token }),
    },
    fetchPolicy: "network-only",
  });

  const [markRead] = useMutation(MARK_NOTIFICATION_READ, {
    context: {
      headers: buildGraphQLHeaders({ authToken: token }),
    },
  });

  const notifications = useMemo(
    () => data?.myNotifications ?? [],
    [data],
  );

  const unreadCount = notifications.filter((n) => n.status === "unread").length;

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  async function handleMarkRead(id: string) {
    await markRead({ variables: { id } });
    await refetch();
  }

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen((prev) => !prev)}
        className="relative flex h-9 w-9 cursor-pointer items-center justify-center text-[#6B6B8A] transition-all duration-200 hover:text-[#00CC99]"
        aria-label="Мэдэгдэл"
      >
        <GrNotification className="h-4 w-4" />
        {unreadCount > 0 ? (
          <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full border-2 border-[#0A0A0F] bg-[#00CC99]" />
        ) : null}
      </button>

      {open ? (
        <div className="absolute right-0 mt-3 w-[320px] rounded-2xl border border-white/10 bg-[#0b111a] shadow-2xl p-3 z-50">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm font-semibold text-white">Мэдэгдэл</p>
            <button
              onClick={() => setOpen(false)}
              className="text-xs text-slate-400 hover:text-white"
            >
              Хаах
            </button>
          </div>
          <div className="max-h-[320px] overflow-y-auto flex flex-col gap-2">
            {loading ? (
              <div className="text-xs text-slate-500 py-3 text-center">
                Уншиж байна...
              </div>
            ) : notifications.length === 0 ? (
              <div className="text-xs text-slate-500 py-3 text-center">
                Одоогоор мэдэгдэл алга байна.
              </div>
            ) : (
              notifications.slice(0, 6).map((item) => (
                <div
                  key={item.id}
                  className="rounded-xl border border-white/5 bg-white/5 px-3 py-2 flex items-start justify-between gap-2"
                >
                  <div>
                    <p className="text-xs font-semibold text-white">
                      {item.title}
                    </p>
                    <p className="text-[11px] text-slate-400">{item.body}</p>
                    <p className="text-[10px] text-slate-500">
                      {new Date(item.createdAt).toLocaleDateString("mn-MN")}
                    </p>
                  </div>
                  {item.status === "unread" ? (
                    <button
                      onClick={() => handleMarkRead(item.id)}
                      className="text-[10px] text-emerald-300 hover:text-white"
                    >
                      Уншсан
                    </button>
                  ) : null}
                </div>
              ))
            )}
          </div>
        </div>
      ) : null}
    </div>
  );
};
