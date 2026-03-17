import type { DocumentContent } from "@/lib/types";

export const TEMPLATE_LABELS: Record<string, string> = {
  employment_contract: "Хөдөлмөрийн гэрээ",
  probation_order: "Туршилтаар авах тушаал",
  job_description: "Албан тушаалын тодорхойлолт",
  nda: "Нууцын гэрээ",
  salary_increase_order: "Цалин нэмэх тушаал",
  position_update_order: "Албан тушаал өөрчлөх тушаал",
  contract_addendum: "Гэрээний нэмэлт",
  termination_order: "Ажил дуусгавар болгох тушаал",
  handover_sheet: "Хүлээлгэн өгөх акт",
};

export function formatTemplateLabel(id: string) {
  return TEMPLATE_LABELS[id] ?? id;
}

export function formatTemplateFilename(id: string, index: number) {
  const prefix = String(index + 1).padStart(2, "0");
  return `${prefix}_${id}.pdf`;
}

export function buildDataUrl(content: DocumentContent) {
  if (content.contentType === "application/pdf") {
    return `data:${content.contentType};base64,${content.content}`;
  }
  if (content.contentType.startsWith("text/")) {
    return `data:${content.contentType};charset=utf-8,${encodeURIComponent(content.content)}`;
  }
  return `data:${content.contentType};base64,${content.content}`;
}
