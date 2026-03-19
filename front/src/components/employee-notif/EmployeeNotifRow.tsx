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
          <div className="flex items-start justify-between gap-3">
            <p className="text-[17px] font-semibold text-[#101828]">
              {notification.title}
            </p>
            <span className="shrink-0 text-[11px] uppercase tracking-[0.16em] text-[#98A2B3]">
              {formatNotificationDateWithYear(notification.createdAt)}
            </span>
          </div>

          <p className="mt-2 whitespace-pre-line text-[13px] leading-6 text-[#667085]">
            {notification.body}
          </p>
        </div>

        {notification.status === "unread" ? (
          <span className="mt-1 h-2.5 w-2.5 shrink-0 self-center rounded-full bg-[#98A2B3]" />
        ) : null}
      </button>
    </div>
  );
}
