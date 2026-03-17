import type { EmployeeNotification } from "@/lib/types";

export function EmployeeNotifExpandedContent({
  notification,
}: {
  notification: EmployeeNotification;
}) {
  return (
    <div className="rounded-[18px] border border-[#233244] bg-[#0A121B] px-4 py-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.03)]">
      <p className="text-[12px] font-medium uppercase tracking-[0.18em] text-[#7D8A9D]">
        Дэлгэрэнгүй
      </p>
      <div className="scrollbar-slim mt-3 max-h-[190px] overflow-y-auto pr-2">
        <p className="whitespace-pre-line text-[14px] leading-7 text-[#E3EBF4]">
          {notification.body}
        </p>
      </div>
    </div>
  );
}
