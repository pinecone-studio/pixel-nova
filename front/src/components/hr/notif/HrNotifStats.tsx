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
      border: "border-[#EAECF0]",
      bg: "bg-white",
      iconBg: "bg-[#F2F4F7]",
      iconColor: "text-[#101828]",
    },
    {
      value: pendingCount,
      label: "Хүлээгдэж буй",
      border: "border-[#EAECF0]",
      bg: "bg-white",
      iconBg: "bg-[#F2F4F7]",
      iconColor: "text-[#101828]",
    },
    {
      value: approvedCount,
      label: "Баталсан",
      border: "border-[#EAECF0]",
      bg: "bg-white",
      iconBg: "bg-[#F2F4F7]",
      iconColor: "text-[#101828]",
    },
  ];

  return (
    <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
      {items.map((item) => (
        <div
          key={item.label}
          className={`rounded-[24px] border ${item.border} ${item.bg} px-6 py-5 shadow-[0_1px_2px_rgba(16,24,40,0.04)]`}
        >
          <div className="flex items-center gap-4">
            <div
              className={`flex h-[54px] w-[54px] items-center justify-center rounded-[18px] ${item.iconBg} ${item.iconColor}`}
            >
              <BellIcon />
            </div>
            <div>
              <p className="text-[34px] font-semibold leading-none text-[#101828]">
                {item.value}
              </p>
              <p className="mt-2 text-sm text-[#667085]">{item.label}</p>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
