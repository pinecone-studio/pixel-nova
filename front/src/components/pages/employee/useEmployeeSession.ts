"use client";

import { useQuery } from "@apollo/client/react";
import { useRouter } from "next/navigation";
import { useEffect, useSyncExternalStore } from "react";

import { GET_ME } from "@/graphql/queries";
import { buildGraphQLHeaders } from "@/lib/apollo-client";
import { notifyAuthStateChanged } from "@/lib/auth-events";
import type { Employee } from "@/lib/types";

export const TOKEN_STORAGE_KEY = "epas_auth_token";

export function useEmployeeSession() {
  const router = useRouter();
  const authToken = useSyncExternalStore(
    (callback) => {
      if (typeof window === "undefined") {
        return () => {};
      }
      const handler = () => callback();
      window.addEventListener("storage", handler);
      return () => window.removeEventListener("storage", handler);
    },
    () => window.localStorage.getItem(TOKEN_STORAGE_KEY) ?? "",
    () => "",
  );

  const { data, loading, error } = useQuery<{ me: Employee | null }>(GET_ME, {
    skip: !authToken,
    context: { headers: buildGraphQLHeaders({ authToken }) },
    fetchPolicy: "network-only",
  });

  const employee = data?.me ?? null;

  useEffect(() => {
    if (!authToken) {
      router.replace("/auth/employee");
      return;
    }

    if (!loading && !error && !employee) {
      window.localStorage.removeItem(TOKEN_STORAGE_KEY);
      notifyAuthStateChanged();
      router.replace("/auth/employee");
    }
  }, [authToken, employee, error, loading, router]);

  return {
    authToken,
    employee,
    loading,
    errorMessage: error?.message ?? null,
  };
}
