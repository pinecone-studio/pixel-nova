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
      className={`rounded-[18px] border px-4 py-4 ${
        isLight
          ? "border-[#E6E8EC] bg-[#FAFAFB] shadow-[0_1px_2px_rgba(16,24,40,0.04)]"
          : "border-[#233244] bg-[#0A121B] shadow-[inset_0_1px_0_rgba(255,255,255,0.03)]"
      }`}
    >
      <p className={`text-[12px] font-medium uppercase tracking-[0.18em] ${isLight ? "text-[#98A2B3]" : "text-[#7D8A9D]"}`}>
        Дэлгэрэнгүй
      </p>
      <div className="scrollbar-slim mt-3 max-h-[190px] overflow-y-auto pr-2">
        <p className={`whitespace-pre-line text-[14px] leading-7 ${isLight ? "text-[#344054]" : "text-[#E3EBF4]"}`}>
          {notification.body}
        </p>
      </div>
    </div>
  );
}
