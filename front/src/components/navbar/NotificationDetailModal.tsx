import { BiX } from "react-icons/bi";

import type { EmployeeNotification } from "./notifications";

export function NotificationDetailModal({
  notification,
  onClose,
}: {
  notification: EmployeeNotification;
  onClose: () => void;
}) {
  return (
    <div
      className="fixed inset-0 z-[70] flex items-center justify-center bg-black/78 p-4"
      onClick={onClose}
    >
      <div
        className="h-[333px] w-[500px] rounded-[28px] border border-[#1A2431] bg-[#09111C] px-[30px] py-[28px] shadow-[0_24px_80px_rgba(0,0,0,0.45)]"
        style={{ width: 500, height: 333 }}
        onClick={(event) => event.stopPropagation()}
      >
        <div className="mb-4 flex items-start justify-between">
          <h2 className="text-[28px] font-semibold leading-none tracking-[-0.02em] text-white">
            Шинэ мэдэгдэл
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="text-white transition hover:opacity-70"
          >
            <BiX className="h-8 w-8" />
          </button>
        </div>

        <div className="space-y-3">
          <div>
            <p className="mb-2 text-[17px] font-semibold text-white">Гарчиг</p>
            <div className="flex h-[48px] items-center rounded-[16px] border border-[#758093] bg-[#09131F] px-5 text-[16px] text-[#F2F7FB]">
              {notification.title}
            </div>
          </div>

          <div>
            <p className="mb-2 text-[17px] font-semibold text-white">Агуулга</p>
            <div className="h-[112px] whitespace-pre-line rounded-[16px] border border-[#758093] bg-[#09131F] px-5 py-4 text-[15px] leading-[1.55] text-[#F2F7FB]">
              {notification.content}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
