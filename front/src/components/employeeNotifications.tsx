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
}: {
  row: EmployeeNotification;
  expanded: boolean;
  onSelect: () => void;
}) {
  const hasBody = row.body.trim().length > 0;
  return (
    <div className="border-b border-slate-200 last:border-b-0">
      <button
        type="button"
        onClick={onSelect}
        className={`flex w-full items-start gap-4 rounded-[20px] px-4 py-4 text-left transition ${
          expanded
            ? "bg-slate-50 shadow-[inset_0_0_0_1px_rgba(208,213,221,1)]"
            : "bg-transparent hover:bg-slate-50"
        }`}
      >
        <div className="mt-0.5 flex h-13 w-13 shrink-0 items-center justify-center rounded-full border border-[#D0D5DD] bg-white text-base font-semibold text-[#475467] shadow-sm">
          {getNotificationInitial(row)}
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex flex-col gap-1 sm:flex-row sm:items-start sm:justify-between sm:gap-3">
            <p className="break-words text-[16px] font-semibold text-slate-900">
              {row.title}
            </p>
            <span className="text-[11px] uppercase tracking-[0.16em] text-slate-400 sm:shrink-0">
              {formatNotificationDateWithYear(row.createdAt)}
            </span>
          </div>

          {hasBody ? (
            <p className="mt-2 break-words whitespace-pre-line text-[13px] leading-6 text-slate-500">
              {row.body}
            </p>
          ) : null}
        </div>

        {row.status === "unread" && (
          <span className="h-2.5 w-2.5 shrink-0 self-center rounded-full bg-[#12B76A]" />
        )}
      </button>
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
                    onSelect={() => {
                      if (row.status === "unread") {
                        void handleMarkRead(row.id);
                      }
                      setSelectedId((current) =>
                        current === row.id ? null : row.id,
                      );
                    }}
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
