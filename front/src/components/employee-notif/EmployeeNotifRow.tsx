import type { EmployeeNotification } from "@/lib/types";

import {
  formatNotificationDateWithYear,
  getNotificationInitial,
} from "./employeeNotifUtils";
import { EmployeeNotifExpandedContent } from "./EmployeeNotifExpandedContent";

export function EmployeeNotifRow({
  notification,
  expanded,
  onSelect,
  theme = "dark",
}: {
  notification: EmployeeNotification;
  expanded: boolean;
  onSelect: () => void;
  theme?: "dark" | "light";
}) {
  const isLight = theme === "light";

  return (
    <div className={`border-b last:border-b-0 ${isLight ? "border-[#EAECF0]" : "border-[#182433]"}`}>
      <button
        type="button"
        onClick={onSelect}
        className={`flex w-full items-start gap-4 rounded-[20px] px-4 py-4 text-left transition ${
          expanded
            ? isLight
              ? "bg-[#F0FDF4] shadow-[inset_0_0_0_1px_rgba(134,239,172,1)]"
              : "bg-[#101925] shadow-[inset_0_0_0_1px_rgba(41,59,78,0.9)]"
            : isLight
              ? "bg-transparent hover:bg-[#F9FAFB]"
              : "bg-transparent hover:bg-[#0D1520]"
        }`}
      >
        <div
          className={`mt-0.5 flex h-13.5 w-13.5 shrink-0 items-center justify-center rounded-full text-base font-semibold ${
            isLight
              ? "border border-[#86EFAC] bg-white text-[#16A34A] shadow-sm"
              : "bg-linear-to-br from-[#A7AFF8] to-[#1B295E] text-white shadow-[0_10px_25px_rgba(33,46,103,0.28)]"
          }`}
        >
          {getNotificationInitial(notification)}
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-3">
            <p className={`truncate text-[17px] font-semibold ${isLight ? "text-[#101828]" : "text-[#F3F7FB]"}`}>
              {notification.title}
            </p>
            <span className={`shrink-0 text-[11px] uppercase tracking-[0.16em] ${isLight ? "text-[#98A2B3]" : "text-[#708096]"}`}>
              {formatNotificationDateWithYear(notification.createdAt)}
            </span>
          </div>

          <p
            className={`mt-2 text-[13px] leading-6 transition-all duration-300 ${
              expanded
                ? "max-h-26 overflow-y-auto pr-2 line-clamp-none scrollbar-slim"
                : "truncate whitespace-nowrap"
            } ${isLight ? "text-[#667085]" : "text-[#CFD8E3]"}`}
          >
            {notification.body}
          </p>
        </div>

        {notification.status === "unread" ? (
          <span className={`mt-1 h-2.5 w-2.5 shrink-0 self-center rounded-full ${isLight ? "bg-[#22C55E]" : "bg-[#11D3C5]"}`} />
        ) : null}
      </button>

      <div
        className={`grid transition-[grid-template-rows,opacity] duration-300 ${
          expanded ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"
        }`}
      >
        <div className="overflow-hidden px-4">
          <div className="pb-4 pt-1">
            <EmployeeNotifExpandedContent notification={notification} theme={theme} />
          </div>
        </div>
      </div>
    </div>
  );
}
