import { BellIcon } from "@/components/icons";

export function HrNotifStats({
  totalCount,
  pendingCount,
  approvedCount,
}: {
  totalCount: number;
  pendingCount: number;
  approvedCount: number;
}) {
  const items = [
    {
      value: totalCount,
      label: "Нийт мэдэгдэл",
      border: "border-slate-200",
      bg: "bg-white",
      iconBg: "bg-emerald-50",
      iconColor: "text-emerald-500",
    },
    {
      value: pendingCount,
      label: "Хүлээгдэж буй",
      border: "border-slate-200",
      bg: "bg-white",
      iconBg: "bg-blue-50",
      iconColor: "text-blue-500",
    },
    {
      value: approvedCount,
      label: "Баталсан",
      border: "border-slate-200",
      bg: "bg-white",
      iconBg: "bg-emerald-50",
      iconColor: "text-emerald-500",
    },
  ];

  return (
    <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
      {items.map((item) => (
        <div
          key={item.label}
          className={`rounded-[24px] border ${item.border} ${item.bg} px-6 py-5 shadow-[0_1px_2px_rgba(15,23,42,0.06)]`}
        >
          <div className="flex items-center gap-4">
            <div
              className={`flex h-[54px] w-[54px] items-center justify-center rounded-[18px] ${item.iconBg} ${item.iconColor}`}
            >
              <BellIcon />
            </div>
            <div>
              <p className="text-[34px] font-semibold leading-none text-slate-900">
                {item.value}
              </p>
              <p className="mt-2 text-sm text-slate-500">{item.label}</p>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
