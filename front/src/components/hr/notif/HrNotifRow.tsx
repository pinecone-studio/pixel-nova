import type { HrNotifItem } from "./types";
import { formatHrNotifDate, getHrNotifInitial } from "./hrNotifUtils";

function HrNotifStatusBadge({ status }: { status: HrNotifItem["status"] }) {
  const map: Record<HrNotifItem["status"], string> = {
    pending: "border-[#5A4A19] bg-[#2A220C] text-[#F6D365]",
    approved: "border-[#1E5B35] bg-[#0D2517] text-[#4ADE80]",
    rejected: "border-[#6B2323] bg-[#2A1010] text-[#FB7185]",
  };

  const labels: Record<HrNotifItem["status"], string> = {
    pending: "Хүлээгдэж буй",
    approved: "Баталсан",
    rejected: "Татгалзсан",
  };

  return (
    <span
      className={`inline-flex h-7 items-center rounded-full border px-3 text-[11px] font-medium ${map[status]}`}
    >
      {labels[status]}
    </span>
  );
}

export function HrNotifRow({
  item,
  expanded,
  onSelect,
}: {
  item: HrNotifItem;
  expanded: boolean;
  onSelect: () => void;
}) {
  return (
    <div className="border-b border-[#182433] last:border-b-0">
      <button
        type="button"
        onClick={onSelect}
        className={`flex w-full items-start gap-4 rounded-[20px] px-4 py-4 text-left transition ${
          expanded
            ? "bg-[#101925] shadow-[inset_0_0_0_1px_rgba(41,59,78,0.9)]"
            : "bg-transparent hover:bg-[#0D1520]"
        }`}
      >
        <div className="mt-0.5 flex h-[54px] w-[54px] shrink-0 items-center justify-center rounded-full bg-linear-to-br from-[#A7AFF8] to-[#1B295E] text-base font-semibold text-white shadow-[0_10px_25px_rgba(33,46,103,0.28)]">
          {getHrNotifInitial(item.employeeName)}
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-3">
            <p className="truncate text-[17px] font-semibold text-[#F3F7FB]">
              {item.title}
            </p>
            <span className="shrink-0 text-[11px] uppercase tracking-[0.16em] text-[#708096]">
              {formatHrNotifDate(item.date)}
            </span>
          </div>

          <p
            className={`mt-2 text-[13px] leading-6 text-[#CFD8E3] transition-all duration-300 ${
              expanded
                ? "max-h-[104px] overflow-y-auto pr-2 line-clamp-none scrollbar-slim"
                : "truncate whitespace-nowrap"
            }`}
          >
            {item.body}
          </p>
        </div>

        <div className="shrink-0 self-center">
          <HrNotifStatusBadge status={item.status} />
        </div>
      </button>

      <div
        className={`grid transition-[grid-template-rows,opacity] duration-300 ${
          expanded ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"
        }`}
      >
        <div className="overflow-hidden px-4">
          <div className="pb-4 pt-1">
            <div className="rounded-[18px] border border-[#233244] bg-[#0A121B] px-4 py-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.03)]">
              <div className="flex flex-wrap items-center gap-3">
                <HrNotifStatusBadge status={item.status} />
                <span className="text-xs text-[#708096]">{item.audience}</span>
              </div>
              <div className="scrollbar-slim mt-3 max-h-[190px] overflow-y-auto pr-2">
                <p className="whitespace-pre-line text-[14px] leading-7 text-[#E3EBF4]">
                  {item.body}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
