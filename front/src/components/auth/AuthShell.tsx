"use client";

import Link from "next/link";
import type { ReactNode } from "react";
import { BiArrowBack } from "react-icons/bi";

import { EpasLogo } from "@/components/icons";

type AuthShellProps = {
  accentLabel: string;
  title: string;
  description: string;
  icon: ReactNode;
  children: ReactNode;
  backHref?: string;
  backLabel?: string;
  showBackLink?: boolean;
  sideTitle?: string;
  sideDescription?: string;
  sideBadges?: string[];
};

export function AuthShell({
  accentLabel,
  title,
  description,
  icon,
  children,
  backHref = "/",
  backLabel = "Буцах",
  showBackLink = true,
}: AuthShellProps) {
  return (
    <div className="px-4 py-6 sm:px-6 sm:py-8">
      <div className="mx-auto flex min-h-[calc(100vh-69px-3rem)] w-full max-w-[720px] items-center justify-center">
        <section className="w-full rounded-[28px] border border-black/8 bg-white p-6 shadow-[0_16px_36px_rgba(15,23,42,0.06)] sm:p-8">
          <div className="flex h-full flex-col gap-8">
            <div className="flex items-center gap-3">
              <EpasLogo className="h-10 w-10 rounded-2xl" />
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[#00C0A8]">
                  EPAS
                </p>
                <p className="text-base font-semibold tracking-[-0.02em] text-[#111827]">
                  Auth
                </p>
              </div>
            </div>

            <div className="space-y-4">
              <div className="inline-flex h-14 w-14 items-center justify-center rounded-2xl border border-black/10 bg-[#F8FAFC] text-[#111827]">
                {icon}
              </div>

              <div className="space-y-2">
                <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[#00C0A8]">
                  {accentLabel}
                </p>
                <h1 className="text-3xl font-semibold tracking-[-0.04em] text-[#111827]">
                  {title}
                </h1>
                <p className="max-w-[520px] text-sm leading-6 text-[rgba(63,65,69,0.8)]">
                  {description}
                </p>
              </div>
            </div>

            <div className="flex-1">{children}</div>

            {showBackLink ? (
              <Link
                href={backHref}
                className="inline-flex w-fit items-center gap-2 text-sm font-medium text-[rgba(63,65,69,0.8)] transition-colors hover:text-[#111827]"
              >
                <BiArrowBack className="h-4 w-4" />
                {backLabel}
              </Link>
            ) : null}
          </div>
        </section>
      </div>
    </div>
  );
}
