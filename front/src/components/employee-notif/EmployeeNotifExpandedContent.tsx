import type { EmployeeNotification } from "@/lib/types";

export function EmployeeNotifExpandedContent({
  notification,
  theme = "dark",
}: {
  notification: EmployeeNotification;
  theme?: "dark" | "light";
}) {
  const isLight = theme === "light";

  return (
    <div
      className={`rounded-[18px] border px-5 py-5 ${
        isLight
          ? "border-[#E6E8EC] bg-[#FAFAFB] shadow-[0_1px_2px_rgba(16,24,40,0.04)]"
          : "border-[#233244] bg-[#0A121B] shadow-[inset_0_1px_0_rgba(255,255,255,0.03)]"
      }`}
    >
      <p
        className={`text-[13px] font-semibold uppercase tracking-[0.16em] ${
          isLight ? "text-[#98A2B3]" : "text-[#7D8A9D]"
        }`}
      >
        Дэлгэрэнгүй
      </p>
      <div className="scrollbar-slim mt-4 max-h-[280px] overflow-y-auto pr-2">
        <p
          className={`whitespace-pre-line text-[16px] leading-8 tracking-[0.01em] ${
            isLight ? "text-[#344054]" : "text-[#E3EBF4]"
          }`}
        >
          {notification.body}
        </p>
      </div>
    </div>
  );
}
