import Image from "next/image";

import type { Employee } from "@/lib/types";

import { EMPLOYEE_NOTIFICATIONS, type EmployeeNotification } from "./notifications";
import { getEmployeeAvatarLetter } from "./navbarUtils";

export function NotificationPanel({
  employee,
  onSelect,
}: {
  employee: Employee | null;
  onSelect: (notification: EmployeeNotification) => void;
}) {
  const avatarLetter = getEmployeeAvatarLetter(employee);

  return (
    <div className="absolute right-0 top-[46px] z-[60] h-[406px] w-[402px] overflow-hidden rounded-[22px] border border-[#16202B] bg-[#08111B] shadow-[0_20px_60px_rgba(0,0,0,0.45)]">
      <div className="absolute right-[16px] top-[-7px] h-4 w-4 rotate-45 border-l border-t border-[#16202B] bg-[#08111B]" />
      <div className="h-[30px] bg-[#050C15]" />

      <div className="h-[376px] overflow-hidden">
        {EMPLOYEE_NOTIFICATIONS.map((notification, index) => (
          <button
            key={notification.id}
            type="button"
            onClick={() => onSelect(notification)}
            className={`flex h-[75.2px] w-full items-center gap-4 border-t border-[#18222D] bg-[#08111B] px-4 text-left transition hover:bg-[#2A3037] ${
              index === 0 ? "border-t-0" : ""
            }`}
          >
            {employee?.imageUrl ? (
              <Image
                src={employee.imageUrl}
                alt="Profile"
                width={52}
                height={52}
                className="h-[52px] w-[52px] rounded-full object-cover"
                unoptimized
              />
            ) : (
              <div className="flex h-[52px] w-[52px] shrink-0 items-center justify-center rounded-full bg-linear-to-br from-[#949DF3] to-[#1A295B] text-sm font-semibold text-white">
                {avatarLetter}
              </div>
            )}

            <div className="min-w-0 flex-1">
              <div className="flex items-center justify-between gap-3">
                <p className="truncate text-[17px] font-semibold text-[#F3F7FB]">
                  {notification.title}
                </p>
                {notification.unread ? (
                  <span className="h-3.5 w-3.5 rounded-full bg-[#11D3C5]" />
                ) : null}
              </div>
              <p className="mt-1 line-clamp-1 text-[12px] leading-5 text-[#E7EDF5]">
                {notification.summary}
              </p>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
