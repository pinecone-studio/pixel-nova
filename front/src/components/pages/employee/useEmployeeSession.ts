"use client";

import { useQuery } from "@apollo/client/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

import { GET_ME } from "@/graphql/queries";
import { buildGraphQLHeaders } from "@/lib/apollo-client";
import type { Employee } from "@/lib/types";

export const TOKEN_STORAGE_KEY = "epas_auth_token";

export function useEmployeeSession() {
  const router = useRouter();
  const [authToken] = useState(() =>
    typeof window === "undefined"
      ? ""
      : (window.localStorage.getItem(TOKEN_STORAGE_KEY) ?? ""),
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

    if (!loading && !employee) {
      window.localStorage.removeItem(TOKEN_STORAGE_KEY);
      router.replace("/auth/employee");
    }
  }, [authToken, employee, loading, router]);

  return {
    authToken,
    employee,
    loading,
    errorMessage: error?.message ?? null,
  };
}
