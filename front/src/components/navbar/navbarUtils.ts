import type { Employee } from "@/lib/types";

export function shouldHideNavbar(pathname: string) {
  return (
    pathname === "/" ||
    pathname.startsWith("/auth") ||
    pathname.startsWith("/hr")
  );
}

export function getEmployeeAvatarLetter(employee: Employee | null) {
  return (
    employee?.firstName?.trim().charAt(0).toUpperCase() ||
    employee?.lastName?.trim().charAt(0).toUpperCase() ||
    "E"
  );
}

export function getEmployeeDisplayName(employee: Employee | null) {
  return employee
    ? `${employee.lastName} ${employee.firstName}`
    : "Ажилтан";
}
