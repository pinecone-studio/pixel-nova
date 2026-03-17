import Link from "next/link";

import { DocumentIcon } from "@/components/icons";

export function NavbarBrand() {
  return (
    <Link href="/employee" className="flex shrink-0 items-center gap-3">
      <div className="flex h-9 w-9 items-center justify-center rounded-full border border-[#00CC99] shadow-md shadow-[#00CC99]/20">
        <DocumentIcon />
      </div>
      <div className="flex items-baseline gap-1.5">
        <span className="text-lg font-bold tracking-wide text-white">EPAS</span>
        <span className="text-sm font-medium text-[#4A4A6A]">Ажилтны портал</span>
      </div>
    </Link>
  );
}
