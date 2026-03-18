import Link from "next/link";

import { EpasLogo } from "@/components/icons";

export function NavbarBrand() {
  return (
    <Link href="/employee" className="flex shrink-0 items-center gap-3">
      <EpasLogo className="h-9 w-9 shrink-0" />
      <div className="flex items-baseline gap-1.5">
        <span className="text-lg font-bold tracking-wide text-white">EPAS</span>
        <span className="text-sm font-medium text-[#4A4A6A]">ÐÐ¶Ð¸Ð»Ñ‚Ð½Ñ‹ Ð¿Ð¾Ñ€Ñ‚Ð°Ð»</span>
      </div>
    </Link>
  );
}
