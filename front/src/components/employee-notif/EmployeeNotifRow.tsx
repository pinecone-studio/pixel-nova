import type { EmployeeNotification } from "@/lib/types";

import {
  formatNotificationDateWithYear,
  getNotificationInitial,
} from "./employeeNotifUtils";

export function EmployeeNotifRow({
  notification,
  expanded,
  onSelect,
  theme = "light",
}: {
  notification: EmployeeNotification;
  expanded: boolean;
  onSelect: () => void;
  theme?: "dark" | "light";
}) {
  void theme;
  const hasBody = notification.body.trim().length > 0;
  return (
    <div className="border-b border-[#EAECF0] last:border-b-0">
      <button
        type="button"
        onClick={onSelect}
        className={`flex w-full items-start gap-4 rounded-[20px] px-4 py-4 text-left transition ${
          expanded
            ? "bg-[#F8FAFC] shadow-[inset_0_0_0_1px_rgba(208,213,221,1)]"
            : "bg-transparent hover:bg-[#F9FAFB]"
        }`}
      >
        <div
          className="mt-0.5 flex h-13.5 w-13.5 shrink-0 items-center justify-center rounded-full border border-[#D0D5DD] bg-white text-base font-semibold text-[#475467] shadow-sm"
        >
          {getNotificationInitial(notification)}
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex flex-col gap-1 sm:flex-row sm:items-start sm:justify-between sm:gap-3">
            <p className="break-words text-[17px] font-semibold text-[#101828]">
              {notification.title}
            </p>
            <span className="text-[11px] uppercase tracking-[0.16em] text-[#98A2B3] sm:shrink-0">
              {formatNotificationDateWithYear(notification.createdAt)}
            </span>
          </div>

          {hasBody ? (
            <p className="mt-2 break-words whitespace-pre-line text-[13px] leading-6 text-[#667085]">
              {notification.body}
            </p>
          ) : null}
        </div>

        {notification.status === "unread" ? (
          <span className="h-2.5 w-2.5 shrink-0 self-center rounded-full bg-[#12B76A]" />
        ) : null}
      </button>
    </div>
  );
}
