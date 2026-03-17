import { BiX } from "react-icons/bi";

import type { EmployeeNotification } from "@/lib/types";

import { formatNotificationDate } from "./employeeNotifUtils";

export function EmployeeNotifDetailCard({
  notification,
  open,
  top,
  onClose,
}: {
  notification: EmployeeNotification;
  open: boolean;
  top: number;
  onClose: () => void;
}) {
  return (
    <div
      className={`absolute right-[calc(100%+18px)] z-50 w-[360px] rounded-[24px] border border-[#223244] bg-[#0C1420] px-6 py-5 shadow-[0_24px_70px_rgba(0,0,0,0.45)] transition-all duration-300 ${
        open
          ? "translate-x-0 opacity-100"
          : "pointer-events-none translate-x-6 opacity-0"
      }`}
      style={{ top }}
    >
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-[20px] font-semibold tracking-[-0.02em] text-white">
            {notification.title}
          </p>
          <p className="mt-1 text-[12px] text-[#708096]">
            {formatNotificationDate(notification.createdAt)}
          </p>
        </div>

        <button
          type="button"
          onClick={onClose}
          className="rounded-full p-1 text-[#8B98AA] transition hover:bg-white/5 hover:text-white"
        >
          <BiX className="h-5 w-5" />
        </button>
      </div>

      <div className="mt-4 rounded-[18px] border border-[#26374A] bg-[#0A111B] px-4 py-4 text-[14px] leading-6 text-[#DDE5EF]">
        {notification.body}
      </div>
    </div>
  );
}
