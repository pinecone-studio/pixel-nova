import type { HrNotifItem } from "./types";
import { formatHrNotifDate, getHrNotifInitial } from "./hrNotifUtils";

function HrNotifStatusBadge({ status }: { status: HrNotifItem["status"] }) {
  const map: Record<HrNotifItem["status"], string> = {
    pending: "border-amber-200 bg-amber-50 text-amber-600",
    approved: "border-emerald-200 bg-emerald-50 text-emerald-600",
    rejected: "border-red-200 bg-red-50 text-red-500",
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
    <div className="border-b border-slate-200 last:border-b-0">
      <button
        type="button"
        onClick={onSelect}
        className={`flex w-full items-start gap-4 rounded-[20px] px-4 py-4 text-left transition ${
          expanded
            ? "bg-slate-50 shadow-[inset_0_0_0_1px_rgba(148,163,184,0.6)]"
            : "bg-transparent hover:bg-slate-50"
        }`}
      >
        <div className="mt-0.5 flex h-[54px] w-[54px] shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-[#9FB5FF] to-[#4F6FE7] text-base font-semibold text-white shadow-[0_10px_25px_rgba(79,111,231,0.18)]">
          {getHrNotifInitial(item.employeeName)}
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-3">
            <p className="truncate text-[17px] font-semibold text-slate-900">
              {item.title}
            </p>
            <span className="shrink-0 text-[11px] uppercase tracking-[0.16em] text-slate-400">
              {formatHrNotifDate(item.date)}
            </span>
          </div>

          <p
            className={`mt-2 text-[13px] leading-6 text-slate-500 transition-all duration-300 ${
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
          <div className="rounded-[18px] border border-slate-200 bg-white px-4 py-4 shadow-[0_1px_2px_rgba(15,23,42,0.06)]">
            <div className="flex flex-wrap items-center gap-3">
              <HrNotifStatusBadge status={item.status} />
              <span className="text-xs text-slate-400">{item.audience}</span>
            </div>
            <div className="scrollbar-slim mt-3 max-h-[190px] overflow-y-auto pr-2">
              <p className="whitespace-pre-line text-[14px] leading-7 text-slate-600">
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
