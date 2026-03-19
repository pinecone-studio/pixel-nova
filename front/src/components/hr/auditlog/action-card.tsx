"use client";

import type { ActionConfig } from "@/lib/types";
import { phaseBadge } from "@/utils/auditlog";

import { EditIcon } from "@/components/icons";
import { HiOutlineLightningBolt } from "react-icons/hi";
import { GrDocument } from "react-icons/gr";

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
    <div className="rounded-2xl border border-slate-200 bg-white p-5 flex h-full flex-col gap-4 shadow-[0_1px_2px_rgba(15,23,42,0.06)]">
      <div className="flex items-start justify-between">
        <p className="text-slate-900 font-semibold text-base tracking-wide uppercase">
          {actionLabel}
        </p>
        <p
          className={`text-xs px-2.5 py-1 rounded-full flex items-center gap-1 font-medium ${phaseBadge(action.phase)}`}>
          <HiOutlineLightningBolt />
          {action.phase}
        </p>
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
                className="px-2.5 py-1 rounded-full border border-slate-200 bg-slate-50 text-slate-600 text-xs">
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
                className="px-2.5 py-1 rounded-full border border-slate-200 bg-slate-50 text-slate-600 text-xs">
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
          Баримт бичиг
        </p>
        <div className="flex flex-col gap-1.5">
          {action.documents.length > 0 ? (
            [...action.documents]
              .sort((left, right) => left.order - right.order)
              .map((doc) => (
                <div
                  key={doc.id}
                  className="flex items-center gap-2 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2">
                  <GrDocument className="h-3.5 w-3.5 text-slate-500 shrink-0" />
                  <span className="text-slate-600 text-xs truncate">
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
        className="mt-auto flex items-center justify-center gap-2 py-2.5 rounded-xl bg-slate-900 text-white text-sm font-medium transition-colors hover:bg-slate-800">
        <EditIcon />
        Хүсэлт илгээх
      </button>
    </div>
  );
}
