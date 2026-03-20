"use client";

import {
  AnalyticsIcon,
  AuditLog as AuditLogIcon,
  BoxerIcon,
  ClipboardsIcon,
  CubaIcon,
  InsightIcon,
  SettingsIcon,
  SettingsIcon3,
  StatisticIcon,
  UsersIcon,
} from "@/components/icons";
import { BoxesIcon, BoxIcon, ClipboardIcon } from "lucide-react";
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
  {
    key: "dashboard",
    label: "Хянах хэсэг",
    href: "/hr",
    icon: <AnalyticsIcon />,
  },
  {
    key: "employees",
    label: "Ажилтнууд",
    href: "/hr/employees",
    icon: <UsersIcon />,
  },
  {
    key: "requests",
    label: "Гэрээний сан",
    href: "/hr/requests",
    icon: <ClipboardsIcon />,
  },
  {
    key: "documents",
    label: "Нийт баримт бичиг",
    href: "/hr/documents",
    icon: <BoxerIcon />,
  },
  {
    key: "audit-log",
    label: "Үйлдлийн бүртгэл",
    href: "/hr/audit-log",
    icon: <StatisticIcon />,
  },
  {
    key: "settings",
    label: "Тохиргоо",
    href: "/hr/settings",
    icon: <SettingsIcon3 />,
  },
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
