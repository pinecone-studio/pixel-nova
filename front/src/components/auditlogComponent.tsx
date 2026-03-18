"use client";

import { useQuery } from "@apollo/client/react";
import { useMemo, useState } from "react";

import { AuditActionCard } from "@/components/hr/auditlog/action-card";
import { SearchIcon } from "@/components/icons";
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
  const actionOrder = useMemo(
    () => [
      "add_employee",
      "promote_employee",
      "change_position",
      "offboard_employee",
    ],
    [],
  );
  const actionOrderMap = useMemo(
    () => new Map(actionOrder.map((name, index) => [name, index])),
    [actionOrder],
  );
  const allowedActionNames = useMemo(
    () =>
      new Set([
        "add_employee",
        "promote_employee",
        "change_position",
        "offboard_employee",
      ]),
    [],
  );
  const visibleActions = useMemo(
    () => actions.filter((action) => allowedActionNames.has(action.name)),
    [actions, allowedActionNames],
  );

  const filtered = useMemo(() => {
    const ordered = [...visibleActions].sort((left, right) => {
      const leftIndex =
        actionOrderMap.get(left.name) ?? Number.MAX_SAFE_INTEGER;
      const rightIndex =
        actionOrderMap.get(right.name) ?? Number.MAX_SAFE_INTEGER;
      if (leftIndex !== rightIndex) return leftIndex - rightIndex;
      return left.name.localeCompare(right.name);
    });
    if (!search) return ordered;
    const query = search.toLowerCase();
    return ordered.filter(
      (action) =>
        action.name.toLowerCase().includes(query) ||
        action.phase.toLowerCase().includes(query) ||
        action.recipients.some((recipient) =>
          recipient.toLowerCase().includes(query),
        ),
    );
  }, [visibleActions, search, actionOrderMap]);

  return (
    <div className="flex flex-col gap-6">
      <AddEmployeeRequestDialog
        key={sendRequestAction?.id ?? "empty"}
        action={sendRequestAction}
        open={!!sendRequestAction}
        onOpenChange={(open) => {
          if (!open) setSendRequestAction(null);
        }}
      />

      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <h1 className="text-xl font-semibold tracking-tight text-slate-900">
            Аудитын бүртгэл
          </h1>
          <span className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-medium text-slate-500">
            Нийт {filtered.length} үйлдэл
          </span>
        </div>
        <div className="relative w-full max-w-xs">
          <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Хайх..."
            className="w-full rounded-xl border border-slate-200 bg-white py-2.5 pl-9 pr-3 text-sm text-slate-700 outline-none focus:border-slate-300"
          />
        </div>
      </div>

      {error && (
        <div className="rounded-2xl border border-red-200 bg-red-50 px-5 py-4 text-sm text-red-500">
          {error.message}
        </div>
      )}

      {/* Content */}
      <div className="rounded-3xl border border-slate-200 bg-white/80 p-6 shadow-[0_10px_30px_rgba(15,23,42,0.06)]">
        {loading ? (
          <div className="py-8 flex flex-col gap-3">
            <div className="h-4 w-64 rounded-full skeleton" />
            <div className="h-3 w-80 rounded-full skeleton" />
            <div className="h-3 w-72 rounded-full skeleton" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="py-12 text-center text-slate-400 text-sm">
            Үйлдэл олдсонгүй
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
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
    </div>
  );
}

export default AuditlogComponent;
