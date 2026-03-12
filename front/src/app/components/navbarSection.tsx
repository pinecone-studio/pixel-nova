"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { DocumentIcon, DownIcon, FactIcon, RequestIcon } from "./icons";
import { BiHistory, BiHome } from "react-icons/bi";
import { GrNotification } from "react-icons/gr";
import { RxAvatar } from "react-icons/rx";

const navItems = [
  { icon: <BiHome className="w-4 h-4" />, label: "Нүүр", href: "/" },
  { icon: <FactIcon />, label: "Баримтууд", href: "/employee/files" },

  {
    icon: <RxAvatar className="w-4 h-4" />,
    label: "Профайл",
    href: "/profile",
  },
];

export const Navbar = () => {
  const pathname = usePathname();

  if (pathname === "/" || pathname.startsWith("/auth")) return null;

  return (
    <nav className="w-full bg-[#0A0A0F] border-b border-[#1A1A2E] px-6 py-0 flex items-center justify-between h-16 shadow-lg shadow-black/40">
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
            <div
              key={label}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200
                ${
                  active
                    ? "bg-[#00CC99]/10 text-[#00CC99]"
                    : "text-[#6B6B8A] hover:text-[#00CC99] hover:bg-[#00CC99]/5"
                }`}
            >
              <span className={active ? "text-[#00CC99]" : ""}>{icon}</span>
              {label}
            </div>
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
            S
          </div>
          <span className="text-white text-sm font-medium">Sunduibazrr</span>
          <DownIcon />
        </button>
      </div>
    </nav>
  );
};
