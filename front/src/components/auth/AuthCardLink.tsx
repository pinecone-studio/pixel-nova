"use client";

import Link from "next/link";
import type { ReactNode } from "react";

type AuthCardLinkProps = {
  href: string;
  icon: ReactNode;
  title: string;
  description: string;
};

export function AuthCardLink({
  href,
  icon,
  title,
  description,
}: AuthCardLinkProps) {
  return (
    <Link
      href={href}
      className="group flex items-start gap-4 rounded-[20px] border border-black/8 bg-[#F8FAFC] p-5 transition-colors hover:border-black/12 hover:bg-white"
    >
      <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border border-black/10 bg-white text-[#111827]">
        {icon}
      </span>
      <span className="space-y-1">
        <span className="block text-base font-semibold tracking-[-0.02em] text-[#111827]">
          {title}
        </span>
        <span className="block text-sm leading-6 text-[rgba(63,65,69,0.8)]">
          {description}
        </span>
      </span>
    </Link>
  );
}
