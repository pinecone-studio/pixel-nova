import type { ReactNode } from "react";
import { CiWarning } from "react-icons/ci";

import { ActiveIcon, OnboardIcon } from "@/components/icons";

export const PHASES = ["onboarding", "working", "offboarding"] as const;

export const PHASE_ICONS: Record<string, ReactNode> = {
  onboarding: <OnboardIcon className="h-5 w-5" />,
  working: <ActiveIcon className="h-5 w-5" />,
  offboarding: <CiWarning className="h-5 w-5" />,
};

export function getEmployeeDocumentProfile(
  documentProfile: unknown,
): Record<string, string | undefined> | null {
  return (documentProfile as Record<string, string | undefined> | null) ?? null;
}
