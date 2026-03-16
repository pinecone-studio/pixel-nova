"use client";

import { useQuery } from "@apollo/client/react";
import { useMemo, useState } from "react";

import { SearchIcon } from "@/components/icons";
import { AuditActionCard } from "@/components/hr/auditlog/action-card";
import { AddEmployeeRequestDialog } from "@/components/hr/auditlog/request-dialog";
import { GET_ACTIONS } from "@/graphql/queries";
import { buildGraphQLHeaders } from "@/lib/apollo-client";
import type { ActionConfig } from "@/lib/types";

export function AuditlogComponent() {
  const [search, setSearch] = useState("");
  const [sendRequestAction, setSendRequestAction] =
    useState<ActionConfig | null>(null);

  const { data, loading, error } = useQuery<{ actions: ActionConfig[] }>(
    GET_ACTIONS,
    {
      context: { headers: buildGraphQLHeaders({ actorRole: "hr" }) },
      fetchPolicy: "network-only",
    },
  );

  const actions = useMemo(() => data?.actions ?? [], [data?.actions]);

  const filtered = useMemo(() => {
    if (!search) return actions;
    const query = search.toLowerCase();
    return actions.filter(
      (action) =>
        action.name.toLowerCase().includes(query) ||
        action.phase.toLowerCase().includes(query) ||
        action.recipients.some((recipient) =>
          recipient.toLowerCase().includes(query),
        ),
    );
  }, [actions, search]);

  return (
    <div className="min-h-screen bg-[#080c12] text-white font-sans flex flex-col gap-4 p-0">
      <AddEmployeeRequestDialog
        key={sendRequestAction?.id ?? "empty"}
        action={sendRequestAction}
        open={!!sendRequestAction}
        onOpenChange={(open) => {
          if (!open) setSendRequestAction(null);
        }}
      />

      <div className="flex items-center justify-between">
        <div>
          <p className="text-white text-2xl font-bold">Үйлдлийн тохиргоо</p>
          <p className="text-slate-500 text-sm mt-0.5">
            HR үйлдлүүдийн тохиргоо ба баримт бичгийн холболт
          </p>
        </div>
        <div className="flex items-center gap-2 bg-[#0d1117] border border-slate-700/50 rounded-xl px-4 py-2.5 min-w-[220px]">
          <SearchIcon />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="bg-transparent text-slate-300 text-sm outline-none placeholder:text-slate-600 w-full"
            placeholder="Хайх..."
          />
        </div>
      </div>

      <p className="text-slate-500 text-sm">Нийт {filtered.length} үйлдэл</p>

      {error && (
        <div className="rounded-2xl border border-red-500/20 bg-red-500/5 px-5 py-4 text-sm text-red-400">
          {error.message}
        </div>
      )}

      {/* Content */}
      {loading ? (
        <div className="py-8 px-4 flex flex-col gap-3">
          <div className="h-4 w-64 rounded-full skeleton" />
          <div className="h-3 w-80 rounded-full skeleton" />
          <div className="h-3 w-72 rounded-full skeleton" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="py-12 text-center text-slate-500 text-sm">
          Үйлдэл олдсонгүй
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-4">
          {filtered.map((action) => (
            <AuditActionCard
              key={action.id}
              action={action}
              onSendRequest={setSendRequestAction}
            />
          ))}
        </div>
      )}
    </div>
  );
}

export default AuditlogComponent;
