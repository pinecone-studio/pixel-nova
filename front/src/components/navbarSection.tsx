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
  {
    icon: <FactIcon className="text-current" />,
    label: "Бичиг баримт",
    href: "/employee/files",
  },
  {
    icon: <AuditLog className="text-current" />,
    label: "Аудит",
    href: "/employee/audit",
  },
  // {
  //   icon: <RxAvatar className="w-4 h-4 text-current" />,
  //   label: "Профайл",
  //   href: "/profile",
  // },
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
    <nav className="flex h-16 w-full items-center border-b border-[#DFDFDF] bg-white px-4">
      <div className="mx-auto flex h-full w-full max-w-[1272px] items-center justify-between gap-6">
        <div className="flex w-[260px] shrink-0 items-center">
          <Link
            href="/employee"
            className="flex items-center gap-3 text-[#111827]"
          >
            <EpasLogo className="h-9 w-9 rounded-xl text-[#111827]" />
            <span className="text-base font-semibold tracking-[-0.4px]">
              EPAS
            </span>
          </Link>
        </div>

        <div className="flex flex-1 items-center justify-center gap-1">
          {navItems.map(({ icon, label, href }) => {
            const active = isActivePath(pathname, href);

            return (
              <Link
                key={label}
                href={href}
                className={`group relative flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-medium transition-colors ${
                  active
                    ? "text-[#111827] after:absolute after:bottom-0 after:left-1/2 after:h-[2px] after:w-8 after:-translate-x-1/2 after:rounded-full after:bg-[#111827]"
                    : "text-[rgba(63,65,69,0.8)] hover:text-[#111827]"
                }`}
              >
                <span
                  className={
                    active
                      ? "text-[#111827]"
                      : "text-[rgba(63,65,69,0.8)] transition-colors group-hover:text-[#111827]"
                  }
                >
                  {icon}
                </span>
                {label}
              </Link>
            );
          })}
        </div>

        <div className="flex w-[260px] items-center justify-end gap-2">
          <EmployeeNotifDropdown />
          <Link href={"/profile"}>
            <button className="group flex h-10 cursor-pointer items-center gap-2 rounded-xl px-3 py-2 text-[#111827] transition-colors hover:bg-[#F7F7F7]">
              <div className="flex h-7 w-7 items-center justify-center rounded-full bg-[#1F2126] text-xs font-bold text-white shadow-[0px_0px_0px_2px_rgba(0,192,168,0.2)]">
                {avatarLetter}
              </div>
              <span className="text-sm font-semibold tracking-[-0.084px]">
                {displayName}
              </span>
              <DownIcon className="text-[#111827]" />
            </button>
          </Link>
        </div>
      </div>
    </nav>
  );
}
