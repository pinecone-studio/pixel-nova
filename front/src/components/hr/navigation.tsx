"use client";

import {
  AuditLog as AuditLogIcon,
  CubaIcon,
  InsightIcon,
  SettingsIcon,
  UsersIcon,
} from "@/components/icons";
import { GrDocument } from "react-icons/gr";

export type HrSectionKey =
  | "dashboard"
  | "employees"
  | "requests"
  | "documents"
  | "audit-log"
  | "settings";

export type HrNavItem = {
  key: HrSectionKey;
  label: string;
  href: string;
  icon: React.ReactNode;
};

export const HR_NAV_ITEMS: HrNavItem[] = [
  { key: "dashboard", label: "Dashboard", href: "/hr", icon: <GrDocument /> },
  { key: "employees", label: "Employees", href: "/hr/employees", icon: <UsersIcon /> },
  { key: "requests", label: "Requests", href: "/hr/requests", icon: <AuditLogIcon /> },
  { key: "documents", label: "Documents", href: "/hr/documents", icon: <CubaIcon /> },
  { key: "audit-log", label: "Audit Log", href: "/hr/audit-log", icon: <InsightIcon /> },
  { key: "settings", label: "Settings", href: "/hr/settings", icon: <SettingsIcon /> },
];

export function getActiveHrNavItem(pathname: string) {
  return (
    HR_NAV_ITEMS.find((item) =>
      item.href === "/hr"
        ? pathname === "/hr"
        : pathname === item.href || pathname.startsWith(`${item.href}/`),
    ) ?? HR_NAV_ITEMS[0]
  );
}
