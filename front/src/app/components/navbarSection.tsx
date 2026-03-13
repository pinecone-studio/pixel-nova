"use client";

import { useEffect, useEffectEvent, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { BiHome } from "react-icons/bi";
import { GrNotification } from "react-icons/gr";
import { RxAvatar } from "react-icons/rx";
import { fetchMe } from "@/lib/api";
import type { Employee } from "@/lib/types";

const TOKEN_STORAGE_KEY = "epas_auth_token";

import { DocumentIcon, DownIcon, FactIcon } from "./icons";

const navItems = [
  { icon: <BiHome className="w-4 h-4" />, label: "Нүүр", href: "/employee" },
  { icon: <FactIcon />, label: "Баримтууд", href: "/employee/files" },
  { icon: <RxAvatar className="w-4 h-4" />, label: "Профайл", href: "/profile" },
];

function isActivePath(pathname: string, href: string) {
  if (href === "/employee") {
    return pathname === "/employee";
  }

  return pathname === href || pathname.startsWith(`${href}/`);
}

export function Navbar() {
  const pathname = usePathname();
  const [employee, setEmployee] = useState<Employee | null>(null);

  const hydrateNavbar = useEffectEvent(async (token: string) => {
    try {
      const me = await fetchMe(token);
      setEmployee(me);
    } catch {
      setEmployee(null);
    }
  });

  useEffect(() => {
    if (pathname === "/" || pathname.startsWith("/auth")) {
      return;
    }

    const storedToken = window.localStorage.getItem(TOKEN_STORAGE_KEY);
    if (!storedToken) {
      return;
    }

    void hydrateNavbar(storedToken);
  }, [pathname]);

  if (pathname === "/" || pathname.startsWith("/auth")) return null;

  const displayName = employee
    ? `${employee.lastName} ${employee.firstName}`
    : "Employee";
  const avatarLetter =
    employee?.firstName?.trim().charAt(0).toUpperCase() ||
    employee?.lastName?.trim().charAt(0).toUpperCase() ||
    "E";

  return (
    <nav className="flex h-16 w-full items-center justify-between border-b border-[#1A1A2E] bg-[#0A0A0F] px-6 py-0 shadow-lg shadow-black/40">
      <Link href="/employee" className="flex shrink-0 items-center gap-3">
        <div className="flex h-9 w-9 items-center justify-center rounded-full border border-[#00CC99] shadow-md shadow-[#00CC99]/20">
          <DocumentIcon />
        </div>
        <div className="flex items-baseline gap-1.5">
          <span className="text-lg font-bold tracking-wide text-white">EPAS</span>
          <span className="text-sm font-medium text-[#4A4A6A]">
            Employee Portal
          </span>
        </div>
      </Link>

      <div className="flex items-center gap-1">
        {navItems.map(({ icon, label, href }) => {
          const active = isActivePath(pathname, href);

          return (
            <Link
              key={label}
              href={href}
              className={`flex items-center gap-1.5 rounded-lg px-4 py-2 text-sm font-medium transition-all duration-200 ${
                active
                  ? "bg-[#00CC99]/10 text-[#00CC99]"
                  : "text-[#6B6B8A] hover:bg-[#00CC99]/5 hover:text-[#00CC99]"
              }`}
            >
              <span className={active ? "text-[#00CC99]" : ""}>{icon}</span>
              {label}
            </Link>
          );
        })}
      </div>

      <div className="flex items-center gap-3">
        <button className="relative flex h-9 w-9 cursor-pointer items-center justify-center text-[#6B6B8A] transition-all duration-200 hover:text-[#00CC99]">
          <GrNotification className="h-4 w-4" />
          <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full border-2 border-[#0A0A0F] bg-[#00CC99]" />
        </button>

        <button className="group flex cursor-pointer items-center gap-2 px-3 py-1.5 transition-all duration-200 hover:border-[#00CC99]/30">
          <div className="flex h-7 w-7 items-center justify-center bg-linear-to-br from-[#00CC99] to-[#007A5E] text-xs font-bold text-white shadow-sm rounded-full">
            {avatarLetter}
          </div>
          <span className="text-sm font-medium text-white">{displayName}</span>
          <DownIcon />
        </button>
      </div>
    </nav>
  );
}
