"use client";

import { usePathname } from "next/navigation";
import { Navbar } from "@/components/navbarSection";

export default function LayoutShell({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  const hideNavbar = pathname.startsWith("/hr");

  return (
    <>
      {!hideNavbar && <Navbar />}
      {children}
    </>
  );
}
