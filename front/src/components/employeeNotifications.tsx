"use client";

import { useMutation, useQuery } from "@apollo/client/react";
import { useMemo, useState } from "react";

import { MARK_NOTIFICATION_READ } from "@/graphql/mutations";
import { GET_MY_NOTIFICATIONS } from "@/graphql/queries";
import { buildGraphQLHeaders } from "@/lib/apollo-client";
import type { EmployeeNotification } from "@/lib/types";

import {
  formatNotificationDateWithYear,
  getNotificationInitial,
} from "./employee-notif/employeeNotifUtils";

const TOKEN_KEY = "epas_auth_token";

function EmployeeNotifRow({
  row,
  expanded,
  onSelect,
  onMarkRead,
}: {
  row: EmployeeNotification;
  expanded: boolean;
  onSelect: () => void;
  onMarkRead: (id: string) => void;
}) {
  return (
    <div className="border-b border-slate-200 last:border-b-0">
      <button
        type="button"
        onClick={onSelect}
        className={`flex w-full items-start gap-4 rounded-[20px] px-4 py-4 text-left transition ${
          expanded
            ? "bg-slate-50 shadow-[inset_0_0_0_1px_rgba(148,163,184,0.6)]"
            : "bg-transparent hover:bg-slate-50"
        }`}
      >
        <div className="mt-0.5 flex h-13 w-13 shrink-0 items-center justify-center rounded-full bg-linear-to-br from-[#9FB5FF] to-[#4F6FE7] text-base font-semibold text-white shadow-[0_10px_25px_rgba(79,111,231,0.18)]">
          {getNotificationInitial(row)}
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-3">
            <p className="truncate text-[16px] font-semibold text-slate-900">
              {row.title}
            </p>
            <span className="shrink-0 text-[11px] uppercase tracking-[0.16em] text-slate-400">
              {formatNotificationDateWithYear(row.createdAt)}
            </span>
          </div>

          <p
            className={`mt-2 text-[13px] leading-6 text-slate-500 transition-all duration-300 ${
              expanded
                ? "max-h-24 overflow-y-auto pr-2 line-clamp-none scrollbar-slim"
                : "truncate whitespace-nowrap"
            }`}
          >
            {row.body}
          </p>
        </div>

        {row.status === "unread" && (
          <span className="mt-1 h-2.5 w-2.5 shrink-0 self-center rounded-full bg-[#4F6FE7]" />
        )}
      </button>

      <div
        className={`grid transition-[grid-template-rows,opacity] duration-300 ${
          expanded ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"
        }`}
      >
        <div className="overflow-hidden px-4">
          <div className="pb-4 pt-1">
            <div className="rounded-[18px] border border-slate-200 bg-white px-4 py-4 shadow-[0_1px_2px_rgba(15,23,42,0.06)]">
              <div className="scrollbar-slim max-h-42.5 overflow-y-auto pr-2">
                <p className="whitespace-pre-line text-[14px] leading-7 text-slate-600">
                  {row.body}
                </p>
              </div>
              {row.status === "unread" && (
                <div className="mt-3 flex justify-end">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onMarkRead(row.id);
                    }}
                    className="text-xs text-[#4F6FE7] transition-colors hover:text-slate-900"
                  >
                    Уншсан гэж тэмдэглэх
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export const EmployeeNotifications = () => {
  const token =
    typeof window === "undefined"
      ? ""
      : window.localStorage.getItem(TOKEN_KEY) ?? "";

  const [selectedId, setSelectedId] = useState<string | null>(null);

  const { data, loading, error, refetch } = useQuery<{
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

  const rows = useMemo(() => data?.myNotifications ?? [], [data]);

  async function handleMarkRead(id: string) {
    await markRead({ variables: { id } });
    await refetch();
  }

  return (
    <div className="min-h-screen bg-white px-6 pb-16 pt-8 text-[#101828]">
      <div className="mx-auto flex w-full max-w-280 flex-col gap-6">
        <div>
          <h1 className="text-[34px] font-semibold tracking-[-0.03em] text-[#101828]">
            Мэдэгдэл
          </h1>
          <p className="mt-2 text-[16px] text-[#667085]">
            Таны хувийн мэдэгдлүүд.
          </p>
        </div>

        <section className="overflow-hidden rounded-[28px] border border-[#EAECF0] bg-white shadow-[0_1px_2px_rgba(16,24,40,0.04)]">
          <div className="border-b border-[#EAECF0] px-7 pb-3 pt-2">
            <div className="flex items-center justify-between gap-3">
              <h2 className="text-[27px] font-semibold leading-none tracking-[-0.03em] text-[#101828]">
                Шинэ мэдэгдлүүд
              </h2>
              <span className="text-sm text-[#667085]">
                {loading ? "Ачаалж байна..." : `${rows.length} мэдэгдэл`}
              </span>
            </div>
          </div>

          {error ? (
            <div className="m-4 rounded-xl border border-red-300 bg-red-50 px-4 py-3 text-sm text-red-500">
              {error.message}
            </div>
          ) : null}

          <div className="scrollbar-slim max-h-[calc(100vh-320px)] overflow-y-auto px-4 pb-5 pt-0">
            {loading ? (
              <div className="space-y-4 py-4">
                {Array.from({ length: 3 }).map((_, index) => (
                  <div
                    key={index}
                    className="rounded-[20px] border border-[#EAECF0] bg-white px-4 py-4"
                  >
                    <div className="h-4 w-48 rounded-full skeleton" />
                    <div className="mt-3 h-3 w-full rounded-full skeleton" />
                    <div className="mt-2 h-3 w-2/3 rounded-full skeleton" />
                  </div>
                ))}
              </div>
            ) : rows.length === 0 ? (
              <div className="flex flex-col items-center justify-center gap-2 py-10 text-center text-sm text-[#98A2B3]">
                Одоогоор мэдэгдэл алга байна.
              </div>
            ) : (
              <div className="flex flex-col">
                {rows.map((row) => (
                  <EmployeeNotifRow
                    key={row.id}
                    row={row}
                    expanded={selectedId === row.id}
                    onSelect={() =>
                      setSelectedId((current) =>
                        current === row.id ? null : row.id,
                      )
                    }
                    onMarkRead={handleMarkRead}
                  />
                ))}
              </div>
            )}
          </div>
        </section>
      </div>
    </div>
  );
};
