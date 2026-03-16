"use client";

import { usePathname } from "next/navigation";

export const FooterSection = () => {
  const pathname = usePathname();

  if (pathname.startsWith("/hr")) {
    return null;
  }

  return (
    <footer className="relative left-1/2 mt-2 w-screen -translate-x-1/2 border-t border-[#162236] px-4">
      <div className="flex items-center justify-between gap-2 text-center text-sm text-[#6F7B8A] h-20 px-20">
        <p>EPAS - Ажилтны баримт бичгийн автоматжуулалтын систем</p>
        <p>2024 Бүх эрх хуулиар хамгаалагдсан</p>
      </div>
    </footer>
  );
};
