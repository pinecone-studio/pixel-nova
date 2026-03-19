"use client";

import { useQuery } from "@apollo/client/react";
import { useMemo } from "react";

import { GET_DOCUMENTS } from "@/graphql/queries";
import { buildGraphQLHeaders } from "@/lib/apollo-client";
import type { Document } from "@/lib/types";

export function useEmployeeDocuments({
  authToken,
  employeeId,
}: {
  authToken: string;
  employeeId?: string | null;
}) {
  const { data, loading, error, refetch } = useQuery<{ documents: Document[] }>(
    GET_DOCUMENTS,
    {
      skip: !authToken || !employeeId,
      variables: { employeeId: employeeId ?? "" },
      context: { headers: buildGraphQLHeaders({ authToken }) },
      fetchPolicy: "network-only",
    },
  );

  const documents = useMemo(() => data?.documents ?? [], [data]);

  return {
    documents,
    loading: Boolean(employeeId && loading),
    errorMessage: error?.message ?? null,
    refetch,
  };
}
