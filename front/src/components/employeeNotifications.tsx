"use client";

import { useMutation, useQuery } from "@apollo/client/react";
import { useMemo } from "react";

import { MARK_NOTIFICATION_READ } from "@/graphql/mutations";
import { GET_MY_NOTIFICATIONS } from "@/graphql/queries";
import { buildGraphQLHeaders } from "@/lib/apollo-client";
import type { EmployeeNotification } from "@/lib/types";

const TOKEN_KEY = "epas_auth_token";

export const EmployeeNotifications = () => {
  const token =
    typeof window === "undefined"
      ? ""
      : window.localStorage.getItem(TOKEN_KEY) ?? "";

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
    <section className="mx-auto flex w-full max-w-264 flex-col gap-4 animate-fade-up">
      <div className="flex items-center gap-3">
        <h2 className="text-[20px] font-semibold tracking-[-0.02em] text-[#101828]">
          Мэдэгдэл
        </h2>
        <span className="rounded-full border border-[#D0D5DD] bg-[#F9FAFB] px-3 py-1 text-[12px] font-medium text-[#98A2B3]">
          {rows.length} мэдэгдэл
        </span>
      </div>

      {error ? (
        <div className="rounded-xl border border-red-300 bg-red-50 px-4 py-3 text-sm text-red-500">
          {error.message}
        </div>
      ) : null}

      <div className="flex flex-col divide-y divide-[#EAECF0] rounded-xl border border-[#EAECF0] bg-white shadow-[0_1px_2px_rgba(16,24,40,0.04)]">
        {loading ? (
          <div className="p-6 flex flex-col gap-3">
            <div className="h-4 w-40 rounded-full skeleton" />
            <div className="h-3 w-64 rounded-full skeleton" />
            <div className="h-3 w-52 rounded-full skeleton" />
          </div>
        ) : rows.length === 0 ? (
          <div className="flex flex-col items-center justify-center gap-2 py-10 text-center text-[#98A2B3] text-sm">
            Одоогоор мэдэгдэл алга байна.
          </div>
        ) : (
          rows.map((row) => (
            <div
              key={row.id}
              className="px-4 py-4 flex items-start justify-between gap-4"
            >
              <div className="flex flex-col gap-1">
                <p className="text-sm text-[#101828] font-semibold">
                  {row.title}
                </p>
                <p className="text-xs text-[#667085] whitespace-pre-line">{row.body}</p>
                <p className="text-[11px] text-[#98A2B3]">
                  {new Date(row.createdAt).toLocaleDateString("mn-MN")}
                </p>
              </div>
              {row.status === "unread" ? (
                <button
                  onClick={() => handleMarkRead(row.id)}
                  className="text-xs text-[#101828] hover:text-[#344054] transition-colors"
                >
                  Уншсан
                </button>
              ) : (
                <span className="text-[11px] text-[#98A2B3]">Уншсан</span>
              )}
            </div>
          ))
        )}
      </div>
    </section>
  );
};
