import type { Employee } from "@/lib/types";

export function formatHireDate(value?: string | null) {
  if (!value) return "Мэдээлэлгүй";

  return new Date(value).toLocaleDateString("mn-MN", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

export function getTenure(hireDate?: string | null) {
  if (!hireDate) return "Мэдээлэлгүй";

  const start = new Date(hireDate);
  const now = new Date();
  const months =
    (now.getFullYear() - start.getFullYear()) * 12 +
    (now.getMonth() - start.getMonth());

  if (months <= 0) return "1 сараас бага";

  const years = Math.floor(months / 12);
  const remainingMonths = months % 12;

  if (years === 0) return `${remainingMonths} сар`;
  if (remainingMonths === 0) return `${years} жил`;
  return `${years} жил ${remainingMonths} сар`;
}

export function getInitials(employee: Employee | null) {
  if (!employee) {
    return "EP";
  }

  return (
    `${employee.lastName?.charAt(0) ?? ""}${employee.firstName?.charAt(0) ?? ""}`.toUpperCase() ||
    "EP"
  );
}
