"use client";

import { usePathname } from "next/navigation";

export const FooterSection = () => {
  const pathname = usePathname();

  if (pathname.startsWith("/hr")) {
    return null;
  }

  return (
    <footer className="relative left-1/2 h-[69px] w-screen -translate-x-1/2 border-t border-[#E5E7EB] bg-white px-4">
      <div className="mx-auto flex h-[69px] w-[1400px] max-w-full items-center justify-between gap-2 text-center text-sm text-[#6B7280]">
        <p>EPAS - Ажилтны баримт бичгийн автоматжуулалтын систем</p>
        <p>2026 Бүх эрх хуулиар хамгаалагдсан</p>
      </div>
    </footer>
  );
};
