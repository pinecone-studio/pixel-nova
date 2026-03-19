"use client";

import type { ActionConfig } from "@/lib/types";
import { FiEdit2 } from "react-icons/fi";
import { GrDocument } from "react-icons/gr";
import { Send } from "lucide-react";

const AVATARS = [
  "/avatars/avatar-1.jpg",
  "/avatars/avatar-2.jpg",
  "/avatars/avatar-3.jpg",
];

export function AuditActionCard({
  action,
  onSendRequest,
  onEdit,
}: {
  action: ActionConfig;
  onSendRequest: (action: ActionConfig) => void;
  onEdit?: (action: ActionConfig) => void;
}) {
  const actionLabelMap: Record<string, string> = {
    add_employee: "Шинэ ажилтан нэмэх",
    change_position: "Албан тушаал өөрчлөх",
    promote_employee: "Тушаал дэвшүүлэх",
    offboard_employee: "Ажлаас гарах тушаал",
  };
  const actionLabel = actionLabelMap[action.name] ?? action.name;

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 flex h-full flex-col gap-4 shadow-[0_1px_2px_rgba(15,23,42,0.06)]">
      {/* Title + edit icon */}
      <div className="flex items-start justify-between">
        <p className="text-[#000000] font-semibold text-[16px]">
          {actionLabel}
        </p>
        {onEdit && (
          <button
            onClick={() => onEdit(action)}
            className="flex h-7 w-7 shrink-0 cursor-pointer items-center justify-center rounded-lg text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-700"
            aria-label="Засах"
          >
            <FiEdit2 className="h-4 w-4 text-black" />
          </button>
        )}
      </div>

      {/* Хянах хүмүүс — avatars */}
      <div className="flex flex-col gap-2">
        <p className="text-[14px]  text-[#3F4145B2] font-medium">
          Хянах хүмүүс
        </p>
        <div className="flex -space-x-2">
          {AVATARS.map((src, i) => (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              key={i}
              src={src}
              alt=""
              className="h-8 w-8 rounded-full border-2 border-white object-cover"
            />
          ))}
        </div>
      </div>

      {/* Шаардлагатай мэдээллүүд */}
      <div className="flex flex-col gap-2">
        <p className="text-[14px]  text-[#3F4145B2] font-medium">
          Шаардлагатай мэдээллүүд
        </p>
        <div className="flex flex-wrap gap-1.5">
          {action.triggerFields.length > 0 ? (
            action.triggerFields.map((field) => (
              <span
                key={field}
                className="px-2.5 py-1 rounded-full border border-slate-200 bg-slate-50 text-slate-600 text-xs"
              >
                {field}
              </span>
            ))
          ) : (
            <span className="text-slate-400 text-xs">—</span>
          )}
        </div>
      </div>

      {/* Шаардлагатай баримт */}
      <div className="flex flex-col gap-2">
        <p className="text-[14px]  text-[#3F4145B2] font-medium">
          Шаардлагатай баримт
        </p>
        <div className="flex flex-col gap-2">
          {action.documents.length > 0 ? (
            [...action.documents]
              .sort((left, right) => left.order - right.order)
              .map((doc) => (
                <div
                  key={doc.id}
                  className="flex items-center gap-2 text-xs text-slate-600"
                >
                  <GrDocument className="h-3 w-3 text-black shrink-0" />
                  <span className="text-[12px] font-normal ">
                    {doc.template.replace(/\.html$/, "")}
                  </span>
                </div>
              ))
          ) : (
            <span className="text-slate-400 text-xs">—</span>
          )}
        </div>
      </div>

      {/* Хүсэлт илгээх button */}
      <button
        onClick={() => onSendRequest(action)}
        className="mt-auto flex w-70.5 h-8 items-center justify-center gap-2 py-2.5 rounded-xl bg-black text-white text-sm font-medium transition-colors hover:bg-slate-800"
      >
        <Send className="w-4 h-4" />
        Хүсэлт илгээх
      </button>
    </div>
  );
}
