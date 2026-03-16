import type { AuditLog, DocumentContent } from "@/lib/types";

export function buildDataUrl(content: DocumentContent) {
  if (content.contentType === "application/pdf")
    return `data:${content.contentType};base64,${content.content}`;
  if (content.contentType.startsWith("text/"))
    return `data:${content.contentType};charset=utf-8,${encodeURIComponent(content.content)}`;
  return `data:${content.contentType};base64,${content.content}`;
}

export function formatDate(value: string) {
  return new Date(value).toLocaleString("mn-MN", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function statusTone(entry: AuditLog) {
  if (entry.notificationError)
    return "bg-red-500/20 text-red-400 border border-red-500/30";
  if (entry.documentsGenerated && entry.recipientsNotified)
    return "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30";
  return "bg-yellow-500/20 text-yellow-400 border border-yellow-500/30";
}

export function statusLabel(entry: AuditLog) {
  if (entry.notificationError) return "Алдаатай";
  if (entry.documentsGenerated && entry.recipientsNotified) return "Амжилттай";
  return "Хэсэгчлэн";
}

export function phaseBadge(phase: string) {
  if (phase === "onboarding")
    return "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30";
  if (phase === "offboarding")
    return "bg-red-500/20 text-red-400 border border-red-500/30";
  return "bg-blue-500/20 text-blue-400 border border-blue-500/30";
}
