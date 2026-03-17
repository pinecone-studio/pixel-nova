"use client";

import type { ActionConfig } from "@/lib/types";
import { phaseBadge } from "@/utils/auditlog";

import { DocRowIcon, EditIcon, TrashIcon } from "@/components/icons";

export function AuditActionCard({
  action,
  onSendRequest,
}: {
  action: ActionConfig;
  onSendRequest: (action: ActionConfig) => void;
}) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 flex flex-col gap-4 shadow-[0_1px_2px_rgba(15,23,42,0.06)]">
      <div className="flex items-start justify-between">
        <p className="text-slate-900 font-bold text-base tracking-wide uppercase">
          {action.name}
        </p>
        <span
          className={`text-xs px-2.5 py-1 rounded-full font-medium ${phaseBadge(action.phase)}`}
        >
          {action.phase}
        </span>
      </div>

      <div className="flex flex-col gap-2">
        <p className="text-slate-700 text-sm font-semibold">
          Идэвхлүүлэх нөхцөл
        </p>
        <div className="flex flex-wrap gap-2">
          {action.triggerFields.length > 0 ? (
            action.triggerFields.map((field) => (
              <span
                key={field}
                className="px-2.5 py-1 rounded-lg border border-slate-200 bg-slate-50 text-slate-500 text-xs"
              >
                {field}
              </span>
            ))
          ) : action.triggerCondition ? (
            <span className="px-2.5 py-1 rounded-lg border border-slate-200 bg-slate-50 text-slate-500 text-xs">
              {action.triggerCondition}
            </span>
          ) : (
            <span className="text-slate-500 text-xs">-</span>
          )}
        </div>
      </div>

      <div className="flex flex-col gap-2">
        <p className="text-slate-700 text-sm font-semibold">Хүлээн авагч</p>
        <div className="flex flex-wrap gap-2">
          {action.recipients.length > 0 ? (
            action.recipients.map((recipient) => (
              <span
                key={recipient}
                className="px-2.5 py-1 rounded-lg border border-slate-200 bg-slate-50 text-slate-500 text-xs"
              >
                {recipient}
              </span>
            ))
          ) : (
            <span className="text-slate-500 text-xs">-</span>
          )}
        </div>
      </div>

      <div className="flex flex-col gap-2">
        <p className="text-slate-700 text-sm font-semibold">
          Шаардлагатай баримт
        </p>
        <div className="flex flex-col gap-1">
          {action.documents.length > 0 ? (
            [...action.documents]
              .sort((left, right) => left.order - right.order)
              .map((doc) => (
                <div key={doc.id} className="flex items-center gap-2">
                  <DocRowIcon />
                  <span className="text-slate-500 text-sm">
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
        className="flex items-center justify-center gap-2 py-2.5 rounded-xl border border-slate-200 bg-black text-white text-sm font-medium cursor-pointer transition-colors"
      >
        <EditIcon />
        Хүсэлт илгээх
      </button>
    </div>
  );
}
