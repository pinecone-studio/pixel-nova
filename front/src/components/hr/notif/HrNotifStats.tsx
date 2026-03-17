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
      border: "border-[#164C46]",
      bg: "bg-[radial-gradient(circle_at_top_left,rgba(0,204,153,0.2),transparent_45%),#09111B]",
      iconBg: "bg-[#0B302C]",
      iconColor: "text-[#00CC99]",
    },
    {
      value: pendingCount,
      label: "Хүлээгдэж буй",
      border: "border-[#193C63]",
      bg: "bg-[radial-gradient(circle_at_top_left,rgba(59,130,246,0.18),transparent_45%),#09111B]",
      iconBg: "bg-[#11273E]",
      iconColor: "text-[#60A5FA]",
    },
    {
      value: approvedCount,
      label: "Баталсан",
      border: "border-[#1D5A34]",
      bg: "bg-[radial-gradient(circle_at_top_left,rgba(34,197,94,0.18),transparent_45%),#09111B]",
      iconBg: "bg-[#133021]",
      iconColor: "text-[#4ADE80]",
    },
  ];

  return (
    <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
      {items.map((item) => (
        <div
          key={item.label}
          className={`rounded-[24px] border ${item.border} ${item.bg} px-6 py-5 shadow-[0_20px_48px_rgba(0,0,0,0.28)]`}
        >
          <div className="flex items-center gap-4">
            <div
              className={`flex h-[54px] w-[54px] items-center justify-center rounded-[18px] ${item.iconBg} ${item.iconColor}`}
            >
              <BellIcon />
            </div>
            <div>
              <p className="text-[34px] font-semibold leading-none text-white">
                {item.value}
              </p>
              <p className="mt-2 text-sm text-[#7D8A9D]">{item.label}</p>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
