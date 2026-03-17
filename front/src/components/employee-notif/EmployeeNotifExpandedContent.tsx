import type { EmployeeNotification } from "@/lib/types";

export function EmployeeNotifExpandedContent({
  notification,
  theme = "light",
}: {
  notification: EmployeeNotification;
  theme?: "dark" | "light";
}) {
  void theme;
  return (
    <div className="rounded-[18px] border border-[#E6E8EC] bg-[#FAFAFB] px-4 py-4 shadow-[0_1px_2px_rgba(16,24,40,0.04)]">
      <p className="text-[12px] font-medium uppercase tracking-[0.18em] text-[#98A2B3]">
        Дэлгэрэнгүй
      </p>
      <div className="scrollbar-slim mt-3 max-h-[190px] overflow-y-auto pr-2">
        <p className="whitespace-pre-line text-[14px] leading-7 text-[#344054]">
          {notification.body}
        </p>
      </div>
    </div>
  );
}
