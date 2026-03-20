import type { AuditView } from "./types";

export function summaryCardTone(active: boolean, color: "blue" | "green") {
  if (color === "blue") {
    return active
      ? "border-[#0B74FF] bg-[radial-gradient(circle_at_top_left,rgba(14,95,255,0.22),transparent_42%),#060B14]"
      : "border-[#10223D] bg-[#070B12]";
  }

  return active
    ? "border-[#0C9E4F] bg-[radial-gradient(circle_at_top_left,rgba(15,162,71,0.18),transparent_42%),#050B08]"
    : "border-[#133223] bg-[#070B0A]";
}

export function sectionLabel(type: AuditView) {
  if (type === "newEmployee") return "Шинэ ажилтан";
  if (type === "documentReview") return "Баримт бичиг баталгаажуулалт";
  return "Статус шинэчлэлт";
}

export function SectionPill({ count }: { count: number }) {
  return (
    <span className="rounded-full border border-[#243243] bg-[#131C28] px-3 py-1 text-xs text-[#7E8A9E]">
      {count} хүсэлт
    </span>
  );
}
