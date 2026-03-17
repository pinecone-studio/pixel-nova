import { BiHome } from "react-icons/bi";
import { RxAvatar } from "react-icons/rx";

import { AuditLog, FactIcon } from "@/components/icons";

export const employeeNavItems = [
  { icon: <BiHome className="h-4 w-4" />, label: "Нүүр", href: "/employee" },
  { icon: <FactIcon />, label: "Баримтууд", href: "/employee/files" },
  { icon: <AuditLog />, label: "Аудит", href: "/employee/audit" },
  { icon: <RxAvatar className="h-4 w-4" />, label: "Профайл", href: "/profile" },
];

export function isActivePath(pathname: string, href: string) {
  if (href === "/employee") {
    return pathname === "/employee";
  }

  return pathname === href || pathname.startsWith(`${href}/`);
}
