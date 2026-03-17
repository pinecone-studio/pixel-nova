"use client";

import { useQuery } from "@apollo/client/react";
import { useMemo, useState } from "react";

import { EmployeeNotifEmptyState } from "@/components/employee-notif/EmployeeNotifEmptyState";
import { GET_CONTRACT_REQUESTS } from "@/graphql/queries";
import { buildGraphQLHeaders } from "@/lib/apollo-client";
import type { ContractRequest } from "@/lib/types";

import { HrNotifStats } from "./HrNotifStats";
import { mapContractRequestToHrNotifItem } from "./hrNotifUtils";
import { HrShellNotifRow } from "./HrShellNotifRow";

export function HrNotifPage() {
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const { data, loading } = useQuery<{ contractRequests: ContractRequest[] }>(
    GET_CONTRACT_REQUESTS,
    {
      context: {
        headers: buildGraphQLHeaders({ actorRole: "hr" }),
      },
      fetchPolicy: "network-only",
    },
  );

  const items = useMemo(
    () =>
      (data?.contractRequests ?? [])
        .map(mapContractRequestToHrNotifItem)
        .sort(
          (a, b) =>
            new Date(b.date).getTime() - new Date(a.date).getTime(),
        ),
    [data],
  );

  const totalCount = items.length;
  const sourceRows = data?.contractRequests ?? [];
  const pendingCount = sourceRows.filter((item) => item.status === "pending").length;
  const approvedCount = sourceRows.filter(
    (item) => item.status === "approved",
  ).length;

  return (
    <div className="min-h-screen bg-white px-6 pb-16 pt-8 text-[#101828]">
      <div className="mx-auto flex w-full max-w-[1120px] flex-col gap-6">
        <div>
          <h1 className="text-[34px] font-semibold tracking-[-0.03em] text-[#101828]">
            Мэдэгдэл
          </h1>
          <p className="mt-2 text-[16px] text-[#667085]">
            HR багт ирсэн гэрээ болон баримтын хүсэлтүүд.
          </p>
        </div>

        <HrNotifStats
          totalCount={totalCount}
          pendingCount={pendingCount}
          approvedCount={approvedCount}
        />

        <section className="overflow-hidden rounded-[28px] border border-[#EAECF0] bg-white shadow-[0_1px_2px_rgba(16,24,40,0.04)]">
          <div className="border-b border-[#EAECF0] px-7 pb-3 pt-2">
            <div className="flex items-center justify-between gap-3">
              <h2 className="text-[27px] font-semibold leading-none tracking-[-0.03em] text-[#101828]">
                Шинэ мэдэгдлүүд
              </h2>
              <span className="text-sm text-[#667085]">
                {loading ? "Ачаалж байна..." : `${items.length} мэдэгдэл`}
              </span>
            </div>
          </div>

          <div className="scrollbar-slim max-h-[calc(100vh-320px)] overflow-y-auto px-4 pb-5 pt-0">
            {loading ? (
              <div className="space-y-4 py-4">
                {Array.from({ length: 3 }).map((_, index) => (
                  <div
                    key={index}
                    className="rounded-[20px] border border-[#EAECF0] bg-white px-4 py-4"
                  >
                    <div className="h-4 w-48 rounded-full skeleton" />
                    <div className="mt-3 h-3 w-full rounded-full skeleton" />
                    <div className="mt-2 h-3 w-2/3 rounded-full skeleton" />
                  </div>
                ))}
              </div>
            ) : items.length === 0 ? (
              <EmployeeNotifEmptyState theme="light" />
            ) : (
              <EmployeeNotifPanel
                notifications={items}
                selectedId={selectedId}
                theme="light"
                onSelect={(item) =>
                  setSelectedId((current) => (current === item.id ? null : item.id))
                }
              />
            )}
          </div>
        </section>
      </div>
    </div>
  );
}
