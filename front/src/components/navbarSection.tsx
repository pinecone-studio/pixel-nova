"use client";

import { useQuery } from "@apollo/client/react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { BiHome } from "react-icons/bi";
import { RxAvatar } from "react-icons/rx";

import { buildGraphQLHeaders } from "@/lib/apollo-client";
import { GET_ME } from "@/graphql/queries";
import type { Employee } from "@/lib/types";

import { EmployeeNotifDropdown } from "@/components/employeeNotifDropdown";
import { AuditLog, DownIcon, EpasLogo, FactIcon } from "./icons";

const TOKEN_STORAGE_KEY = "epas_auth_token";

const navItems = [
  { icon: <BiHome className="w-4 h-4" />, label: "Нүүр", href: "/employee" },
  { icon: <FactIcon className="text-current" />, label: "Баримтууд", href: "/employee/files" },
  { icon: <AuditLog className="text-current" />, label: "Аудит", href: "/employee/audit" },
  {
    icon: <RxAvatar className="w-4 h-4" />,
    label: "Профайл",
    href: "/profile",
  },
];

function isActivePath(pathname: string, href: string) {
  if (href === "/employee") {
    return pathname === "/employee";
  }

  return pathname === href || pathname.startsWith(`${href}/`);
}

export function Navbar() {
  const pathname = usePathname();
  const authToken =
    typeof window === "undefined"
      ? ""
      : (window.localStorage.getItem(TOKEN_STORAGE_KEY) ?? "");

  const { data } = useQuery<{ me: Employee | null }>(GET_ME, {
    skip:
      !authToken ||
      pathname === "/" ||
      pathname.startsWith("/auth") ||
      pathname.startsWith("/hr"),
    context: {
      headers: buildGraphQLHeaders({ authToken }),
    },
    fetchPolicy: "cache-first",
  });

  if (
    pathname === "/" ||
    pathname.startsWith("/auth") ||
    pathname.startsWith("/hr")
  ) {
    return null;
  }

  const employee = data?.me ?? null;
  const displayName = employee
    ? `${employee.lastName} ${employee.firstName}`
    : "Ажилтан";
  const avatarLetter =
    employee?.firstName?.trim().charAt(0).toUpperCase() ||
    employee?.lastName?.trim().charAt(0).toUpperCase() ||
    "E";

  return (
    <nav className="flex h-16 w-full items-center border border-[#dfdfdf] bg-[#FFFFFF] px-16 py-0 shadow-lg shadow-black/40">
      <Link
        href="/employee"
        className="flex w-[260px] shrink-0 items-center gap-3 text-[#111827]"
      >
        <EpasLogo className="h-9 w-9 rounded-xl text-[#111827]" />
        <div className="flex items-baseline gap-1.5">
          <span className="text-lg font-bold tracking-wide">EPAS</span>
          {/* <span className="text-sm font-medium text-[#4A4A6A]">
            Ажилтны портал
          </span> */}
        </div>
      </Link>

      <div className="flex flex-1 items-center justify-center gap-1">
        {navItems.map(({ icon, label, href }) => {
          const active = isActivePath(pathname, href);

          return (
            <Link
              key={label}
              href={href}
              className={`group relative flex items-center gap-1.5 px-4 py-2 text-sm font-medium transition-all duration-200 ${
                active
                  ? "text-[#111827] after:absolute after:left-1/2 after:bottom-0 after:h-[2px] after:w-[50%] after:-translate-x-1/2 after:rounded-full after:bg-[#111827]"
                  : "text-[#6B6B8A] hover:text-[#111827]"
              }`}
            >
              <span
                className={
                  active
                    ? "text-[#111827]"
                    : "text-slate-500 transition-colors group-hover:text-[#111827]"
                }
              >
                {icon}
              </span>
              {label}
            </Link>
          );
        })}
      </div>

      <div className="flex w-[260px] items-center justify-end gap-3">
        <EmployeeNotifDropdown />

        <button className="group flex cursor-pointer items-center gap-2 px-3 py-1.5 transition-all duration-200 hover:border-[#00CC99]/30">
          <div className="flex h-7 w-7 items-center justify-center bg-linear-to-br from-[#00CC99] to-[#007A5E] text-xs font-bold text-white shadow-sm rounded-full">
            {avatarLetter}
          </div>
          <span className="text-sm font-medium">{displayName}</span>
          <DownIcon />
        </button>
      </div>
    </nav>
  );
}



