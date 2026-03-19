"use client";

import { useEffect, useSyncExternalStore } from "react";
import { useRouter } from "next/navigation";

import { getHrAuthSnapshot, subscribeHrAuth } from "@/components/hr/auth";
import { HrShell } from "@/components/hr/shell";

export function HrAccessGate({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const authenticated = useSyncExternalStore(
    subscribeHrAuth,
    getHrAuthSnapshot,
    () => false,
  );

  useEffect(() => {
    if (!authenticated) {
      router.replace("/auth/hr");
    }
  }, [authenticated, router]);

  if (!authenticated) {
    return null;
  }

  return <HrShell>{children}</HrShell>;
}
