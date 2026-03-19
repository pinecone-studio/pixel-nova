"use client";

import {
  AuditLog as AuditLogIcon,
  CubaIcon,
  InsightIcon,
  NotifIcon,
  SettingsIcon,
  UsersIcon,
} from "@/components/icons";
import { GrDocument } from "react-icons/gr";
import { FiFileText } from "react-icons/fi";

export type HrSectionKey =
  | "dashboard"
  | "employees"
  | "requests"
  | "documents"
  | "templates"
  | "audit-log"
  | "notif"
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
    icon: <GrDocument />,
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
    icon: <AuditLogIcon />,
  },
  {
    key: "documents",
    label: "Нийт баримт бичиг",
    href: "/hr/documents",
    icon: <CubaIcon />,
  },
  {
    key: "templates",
    label: "Загварууд",
    href: "/hr/templates",
    icon: <FiFileText />,
  },
  {
    key: "audit-log",
    label: "Үйлдлийн бүртгэл",
    href: "/hr/audit-log",
    icon: <InsightIcon />,
  },
  {
    key: "notif",
    label: "Мэдэгдэл",
    href: "/hr/notif",
    icon: <NotifIcon />,
  },
  {
    key: "settings",
    label: "Тохиргоо",
    href: "/hr/settings",
    icon: <SettingsIcon />,
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
