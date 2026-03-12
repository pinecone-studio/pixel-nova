"use client";

import { useEffect, useEffectEvent, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { DocumentIcon, DownIcon, FactIcon } from "./icons";
import { BiHome } from "react-icons/bi";
import { GrNotification } from "react-icons/gr";
import { RxAvatar } from "react-icons/rx";
import { fetchMe } from "@/lib/api";
import type { Employee } from "@/lib/types";

const TOKEN_STORAGE_KEY = "epas_auth_token";

const navItems = [
  { icon: <BiHome className="w-4 h-4" />, label: "Нүүр", href: "/employee" },
  { icon: <FactIcon />, label: "Баримтууд", href: "/files" },

  {
    icon: <RxAvatar className="w-4 h-4" />,
    label: "Профайл",
    href: "/profile",
  },
];

export const Navbar = () => {
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
    <nav className="w-full bg-[#0A0A0F] border-b border-[#1A1A2E] px-25 py-0 flex items-center justify-between h-16 shadow-lg shadow-black/40">
      {/* Logo */}
      <Link href="/" className="flex items-center gap-3 shrink-0">
        <div className="rounded-full w-9 h-9 border border-[#00CC99] flex items-center justify-center shadow-md shadow-[#00CC99]/20">
          <DocumentIcon />
        </div>
        <div className="flex items-baseline gap-1.5">
          <span className="text-white font-bold text-lg tracking-wide">
            EPAS
          </span>
          <span className="text-[#4A4A6A] text-sm font-medium">
            Employee Portal
          </span>
        </div>
      </Link>

      {/* Nav Links */}
      
      <div className="flex items-center gap-1">
        {navItems.map(({ icon, label, href }) => {
          const active = pathname === href;
          return (
            <Link
              key={label}
              href={href}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200
                ${
                  active
                    ? "bg-[#00CC99]/10 text-[#00CC99]"
                    : "text-[#6B6B8A] hover:text-[#00CC99] hover:bg-[#00CC99]/5"
                }`}
            >
              <span className={active ? "text-[#00CC99]" : ""}>{icon}</span>
              {label}
            </Link>
          );
        })}
      </div>

      {/* Right side */}
      <div className="flex items-center gap-3">
        <button className="relative w-9 h-9 flex items-center justify-center text-[#6B6B8A] hover:text-[#00CC99] hover:border-[#00CC99]/30 transition-all duration-200 cursor-pointer">
          <GrNotification className="w-4 h-4" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-[#00CC99] rounded-full border-2 border-[#0A0A0F]" />
        </button>

        <button className="flex items-center gap-2 px-3 py-1.5   hover:border-[#00CC99]/30 transition-all duration-200 cursor-pointer group">
          <div className="w-7 h-7 rounded-full bg-linear-to-br from-[#00CC99] to-[#007A5E] flex items-center justify-center text-white text-xs font-bold shadow-sm">
            {avatarLetter}
          </div>
          <span className="text-white text-sm font-medium">{displayName}</span>
          <DownIcon />
        </button>
      </div>
    </nav>
  );
};
