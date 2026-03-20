"use client";

import { useQuery } from "@apollo/client/react";
import { useMemo, useState } from "react";

import { AuditActionCard } from "@/components/hr/auditlog/action-card";
import { AuditDocumentsTable } from "@/components/hr/auditlog/AuditDocumentsTable";
import { EditActionDialog } from "@/components/hr/auditlog/edit-action-dialog";
import { AddEmployeeRequestDialog } from "@/components/hr/auditlog/request-dialog";
import { GET_ACTIONS } from "@/graphql/queries";
import { buildGraphQLHeaders } from "@/lib/apollo-client";
import type { ActionConfig } from "@/lib/types";

export function AuditlogComponent() {
  const [search] = useState("");
  const [sendRequestAction, setSendRequestAction] =
    useState<ActionConfig | null>(null);
  const [editAction, setEditAction] = useState<ActionConfig | null>(null);

  const headers = useMemo(
    () => ({ headers: buildGraphQLHeaders({ actorRole: "hr" }) }),
    [],
  );

  // ---- Queries ----
  const {
    data: actionsData,
    loading: actionsLoading,
    error: actionsError,
  } = useQuery<{ actions: ActionConfig[] }>(GET_ACTIONS, {
    context: headers,
    fetchPolicy: "network-only",
  });

  // ---- Actions (bottom cards) ----
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
  const allowedActionNames = useMemo(() => new Set(actionOrder), [actionOrder]);

  const filteredActions = useMemo(() => {
    const visible = (actionsData?.actions ?? []).filter((a) =>
      allowedActionNames.has(a.name),
    );
    const ordered = [...visible].sort((a, b) => {
      const ai = actionOrderMap.get(a.name) ?? Number.MAX_SAFE_INTEGER;
      const bi = actionOrderMap.get(b.name) ?? Number.MAX_SAFE_INTEGER;
      return ai !== bi ? ai - bi : a.name.localeCompare(b.name);
    });
    if (!search) return ordered;
    const q = search.toLowerCase();
    return ordered.filter(
      (a) =>
        a.name.toLowerCase().includes(q) ||
        a.phase.toLowerCase().includes(q) ||
        a.recipients.some((r) => r.toLowerCase().includes(q)),
    );
  }, [actionsData, search, allowedActionNames, actionOrderMap]);

  // ---- Render ----
  return (
    <div className="flex flex-1 flex-col gap-4 bg-[#F4F5F7] p-0 pr-1 font-sans text-slate-900">
      {/* Dialogs */}
      <AddEmployeeRequestDialog
        key={sendRequestAction?.id ?? "empty"}
        action={sendRequestAction}
        open={!!sendRequestAction}
        onOpenChange={(open) => {
          if (!open) setSendRequestAction(null);
        }}
      />
      <EditActionDialog
        action={editAction}
        open={!!editAction}
        onOpenChange={(open) => {
          if (!open) setEditAction(null);
        }}
      />

      {/* ═══════════ ACTION CARDS (TOP) ═══════════ */}
      <div className="shrink-0">
        <p className="text-[#3F4145] text-[14px] font-medium mb-3">
          Нийт {filteredActions.length} үйлдэл
        </p>

        {actionsError && (
          <div className="rounded-2xl border border-red-200 bg-red-50 px-5 py-4 text-sm text-red-500">
            {actionsError.message}
          </div>
        )}

        {actionsLoading ? (
          <div className="py-8 px-4 flex flex-col gap-3">
            <div className="h-4 w-64 rounded-full skeleton" />
            <div className="h-3 w-80 rounded-full skeleton" />
            <div className="h-3 w-72 rounded-full skeleton" />
          </div>
        ) : filteredActions.length === 0 ? (
          <div className="py-12 text-center text-slate-400 text-sm">
            Үйлдэл олдсонгүй
          </div>
        ) : (
          <div className="grid grid-cols-4 gap-4">
            {filteredActions.map((action) => (
              <AuditActionCard
                key={action.id}
                action={action}
                onSendRequest={setSendRequestAction}
                onEdit={setEditAction}
              />
            ))}
          </div>
        )}
      </div>

      {/* ═══════════ AUDIT TABLE ═══════════ */}
      <AuditDocumentsTable />
    </div>
  );
}

export default AuditlogComponent;
