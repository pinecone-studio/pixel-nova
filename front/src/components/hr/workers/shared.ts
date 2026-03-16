"use client";

import type { Employee } from "@/lib/types";

export type ModalMode = "add" | "edit";

export type EmployeeFormState = {
  id: string;
  employeeCode: string;
  firstName: string;
  lastName: string;
  email: string;
  department: string;
  branch: string;
  jobTitle: string;
  level: string;
  hireDate: string;
  status: string;
};

export const DEPARTMENTS = [
  "Engineering",
  "HR",
  "Sales",
  "Finance",
  "Marketing",
  "Design",
];

export const STATUSES = ["Ирсэн", "Тасалсан", "Чөлөөтэй"];
export const LEVELS = ["Junior", "Mid", "Senior", "Lead"];
export const BRANCHES = ["Ulaanbaatar", "Darkhan", "Erdenet", "Remote"];

export function getInitials(employee: Employee) {
  return `${employee.lastName.charAt(0)}${employee.firstName.charAt(0)}`;
}

export function avatarColor(seed: string) {
  const colors = [
    "bg-cyan-500",
    "bg-purple-500",
    "bg-orange-500",
    "bg-teal-500",
    "bg-blue-600",
    "bg-pink-500",
  ];
  let hash = 0;
  for (let i = 0; i < seed.length; i++) {
    hash = (hash * 31 + seed.charCodeAt(i)) & 0xffffffff;
  }
  return colors[Math.abs(hash) % colors.length];
}

export function statusStyle(status: string) {
  if (status === "Ирсэн") {
    return "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30";
  }
  if (status === "Тасалсан") {
    return "bg-red-500/20 text-red-400 border border-red-500/30";
  }
  return "bg-blue-500/20 text-blue-400 border border-blue-500/30";
}

export function employeeToForm(employee?: Employee | null): EmployeeFormState {
  return {
    id: employee?.id ?? globalThis.crypto.randomUUID(),
    employeeCode: employee?.employeeCode ?? "",
    firstName: employee?.firstName ?? "",
    lastName: employee?.lastName ?? "",
    email: employee?.email ?? "",
    department: employee?.department ?? DEPARTMENTS[0],
    branch: employee?.branch ?? BRANCHES[0],
    jobTitle: employee?.jobTitle ?? "",
    level: employee?.level ?? LEVELS[0],
    hireDate:
      employee?.hireDate?.slice(0, 10) ?? new Date().toISOString().slice(0, 10),
    status: employee?.status ?? STATUSES[0],
  };
}
