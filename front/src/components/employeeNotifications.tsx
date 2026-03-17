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
    <section className="mx-auto flex w-full max-w-[1056px] flex-col gap-4 animate-fade-up">
      <div className="flex items-center gap-3">
        <h2 className="text-[20px] font-semibold tracking-[-0.02em] text-white">
          Мэдэгдэл
        </h2>
        <span className="rounded-full border border-[#233246] bg-[#162130] px-3 py-1 text-[12px] font-medium text-[#94A3B8]">
          {rows.length} мэдэгдэл
        </span>
      </div>

      {error ? (
        <div className="rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-300">
          {error.message}
        </div>
      ) : null}

      <div className="flex flex-col divide-y divide-white/10 rounded-xl border border-white/5 bg-[#0B0E14]/40">
        {loading ? (
          <div className="p-6 flex flex-col gap-3">
            <div className="h-4 w-40 rounded-full skeleton" />
            <div className="h-3 w-64 rounded-full skeleton" />
            <div className="h-3 w-52 rounded-full skeleton" />
          </div>
        ) : rows.length === 0 ? (
          <div className="flex flex-col items-center justify-center gap-2 py-10 text-center text-[#7C8698] text-sm">
            Одоогоор мэдэгдэл алга байна.
          </div>
        ) : (
          rows.map((row) => (
            <div
              key={row.id}
              className="px-4 py-4 flex items-start justify-between gap-4"
            >
              <div className="flex flex-col gap-1">
                <p className="text-sm text-white font-semibold">
                  {row.title}
                </p>
                <p className="text-xs text-slate-400">{row.body}</p>
                <p className="text-[11px] text-slate-500">
                  {new Date(row.createdAt).toLocaleDateString("mn-MN")}
                </p>
              </div>
              {row.status === "unread" ? (
                <button
                  onClick={() => handleMarkRead(row.id)}
                  className="text-xs text-[#9BEBD7] hover:text-white transition-colors"
                >
                  Уншсан
                </button>
              ) : (
                <span className="text-[11px] text-slate-500">Уншсан</span>
              )}
            </div>
          ))
        )}
      </div>
    </section>
  );
};
