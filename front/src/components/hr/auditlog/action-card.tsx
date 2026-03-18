"use client";

import type { ActionConfig } from "@/lib/types";
import { phaseBadge } from "@/utils/auditlog";

import { DocRowIcon, EditIcon } from "@/components/icons";

export function AuditActionCard({
  action,
  onSendRequest,
}: {
  action: ActionConfig;
  onSendRequest: (action: ActionConfig) => void;
}) {
  const actionLabelMap: Record<string, string> = {
    add_employee: "Шинэ ажилтан",
    change_position: "Албан тушаал өөрчлөх",
    promote_employee: "Ажилтан дэвшүүлэх",
    offboard_employee: "Ажлаас чөлөөлөх",
  };
  const actionLabel = actionLabelMap[action.name] ?? action.name;

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-6 flex h-full flex-col gap-5 shadow-[0_8px_22px_rgba(15,23,42,0.06)]">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-slate-900 text-base font-semibold tracking-tight">
            {actionLabel}
          </p>
          <p className="text-xs text-slate-500 mt-1">
            {action.name.replace(/_/g, " ")}
          </p>
        </div>
        <span
          className={`text-xs px-3 py-1 rounded-full font-medium ${phaseBadge(action.phase)}`}
        >
          {action.phase}
        </span>
      </div>

      <div className="flex flex-col gap-3">
        <p className="text-[11px] uppercase tracking-[0.2em] text-slate-400">
          Идэвхлүүлэх нөхцөл
        </p>
        <div className="flex flex-wrap gap-2">
          {action.triggerFields.length > 0 ? (
            action.triggerFields.map((field) => (
              <span
                key={field}
                className="px-2.5 py-1 rounded-full border border-slate-200 bg-slate-50 text-slate-600 text-xs"
              >
                {field}
              </span>
            ))
          ) : action.triggerCondition ? (
            <span className="px-2.5 py-1 rounded-full border border-slate-200 bg-slate-50 text-slate-600 text-xs">
              {action.triggerCondition}
            </span>
          ) : (
            <span className="text-slate-500 text-xs">-</span>
          )}
        </div>
      </div>

      <div className="flex flex-col gap-3">
        <p className="text-[11px] uppercase tracking-[0.2em] text-slate-400">
          Хүлээн авагч
        </p>
        <div className="flex flex-wrap gap-2">
          {action.recipients.length > 0 ? (
            action.recipients.map((recipient) => (
              <span
                key={recipient}
                className="px-2.5 py-1 rounded-full border border-slate-200 bg-slate-50 text-slate-600 text-xs"
              >
                {recipient}
              </span>
            ))
          ) : (
            <span className="text-slate-500 text-xs">-</span>
          )}
        </div>
      </div>

      <div className="flex flex-col gap-3">
        <p className="text-[11px] uppercase tracking-[0.2em] text-slate-400">
          Шаардлагатай баримт
        </p>
        <div className="flex flex-col gap-2">
          {action.documents.length > 0 ? (
            [...action.documents]
              .sort((left, right) => left.order - right.order)
              .map((doc) => (
                <div
                  key={doc.id}
                  className="flex items-center gap-2 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2"
                >
                  <DocRowIcon />
                  <span className="text-slate-600 text-xs">
                    {doc.template.replace(/\.html$/, ".pdf")}
                  </span>
                </div>
              ))
          ) : (
            <span className="text-slate-500 text-xs">-</span>
          )}
        </div>
      </div>

      <button
        onClick={() => onSendRequest(action)}
        className="mt-auto flex items-center justify-center gap-2 py-2.5 rounded-xl bg-slate-900 text-white text-sm font-medium transition-colors hover:bg-slate-800"
      >
        <EditIcon />
        Хүсэлт илгээх
      </button>
    </div>
  );
}
