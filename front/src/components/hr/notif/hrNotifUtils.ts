import type { ContractRequest, EmployeeNotification } from "@/lib/types";
import { formatDepartment } from "@/lib/labels";

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

const STATUS_LABELS: Record<ContractRequest["status"], string> = {
  pending: "Хүлээгдэж буй",
  approved: "Батлагдсан",
  rejected: "Татгалзсан",
};

function formatTemplateLabel(id: string) {
  return TEMPLATE_LABELS[id] ?? id;
}

export function buildHrNotifBody(row: ContractRequest) {
  const labels = row.templateIds.map(formatTemplateLabel).join(", ");
  const parts = [
    `${row.employee.lastName} ${row.employee.firstName}`,
    formatDepartment(row.employee.department),
    labels,
    `Төлөв: ${STATUS_LABELS[row.status]}`,
  ];

  if (row.note?.trim()) {
    parts.push(`Тайлбар: ${row.note.trim()}`);
  }

  return parts.join("\n");
}

export function mapContractRequestToEmployeeNotification(
  row: ContractRequest,
): EmployeeNotification {
  return {
    id: row.id,
    employeeId: row.employeeId,
    title: "Гэрээний хүсэлт",
    body: buildHrNotifBody(row),
    status: row.status === "pending" ? "unread" : "read",
    createdAt: row.createdAt,
    readAt: row.decidedAt ?? null,
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
