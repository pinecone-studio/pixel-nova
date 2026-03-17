import type { ContractRequest } from "@/lib/types";
import { formatDepartment } from "@/lib/labels";

import type { HrNotifItem } from "./types";

const TEMPLATE_LABELS: Record<string, string> = {
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

function formatTemplateLabel(id: string) {
  return TEMPLATE_LABELS[id] ?? id;
}

export function buildHrNotifBody(row: ContractRequest) {
  const labels = row.templateIds.map(formatTemplateLabel).join(", ");
  return `${row.employee.lastName} ${row.employee.firstName} • ${formatDepartment(
    row.employee.department,
  )} • ${labels}`;
}

export function mapContractRequestToNotif(row: ContractRequest): HrNotifItem {
  return {
    id: `contract-${row.id}`,
    title: "Гэрээний хүсэлт",
    body: buildHrNotifBody(row),
    status: row.status,
    date: row.createdAt,
    audience: "HR",
    employeeName: `${row.employee.lastName} ${row.employee.firstName}`,
  };
}

export function formatHrNotifDate(value: string) {
  return new Date(value).toLocaleDateString("mn-MN", {
    year: "2-digit",
    month: "2-digit",
    day: "2-digit",
  });
}

export function getHrNotifInitial(name: string) {
  return name.trim().charAt(0).toUpperCase() || "H";
}
