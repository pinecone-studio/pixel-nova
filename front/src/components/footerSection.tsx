"use client";

import { usePathname } from "next/navigation";

export const FooterSection = () => {
  const pathname = usePathname();

  if (pathname.startsWith("/hr")) {
    return null;
  }

  return (
    <footer className="relative left-1/2 h-[69px] w-screen -translate-x-1/2 border-t border-[#DFDFDF] bg-white px-4">
      <div className="mx-auto flex h-[69px] w-full max-w-[1272px] items-center justify-between gap-4 text-[12px] font-medium tracking-[-0.072px] text-[rgba(63,65,69,0.8)]">
        <p>EPAS - Employee Paperwork Automation System</p>
        <p>2026 Бүх эрх хуулиар хамгаалагдсан</p>
      </div>
    </footer>
  );
};
