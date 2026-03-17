import Link from "next/link";

import { employeeNavItems, isActivePath } from "./navItems";

export function NavbarLinks({ pathname }: { pathname: string }) {
  return (
    <div className="flex items-center gap-1">
      {employeeNavItems.map(({ icon, label, href }) => {
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
  );
}
