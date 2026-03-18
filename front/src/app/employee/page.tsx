"use client";

import { useQuery } from "@apollo/client/react";
import { useEffect, useMemo, useSyncExternalStore } from "react";
import { useRouter } from "next/navigation";

import { buildGraphQLHeaders } from "@/lib/apollo-client";
import { GET_DOCUMENTS, GET_ME } from "@/graphql/queries";
import type { Document, Employee } from "@/lib/types";

import { ContractPreview } from "@/components/contractPreview";
import { FactIcon } from "@/components/icons";
import { Request } from "@/components/request";

const TOKEN_STORAGE_KEY = "epas_auth_token";

export default function EmployeePage() {
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
    () =>
      typeof window === "undefined"
        ? ""
        : (window.localStorage.getItem(TOKEN_STORAGE_KEY) ?? ""),
    () => "",
  );

  const {
    data: meData,
    loading: meLoading,
    // error: meError,
  } = useQuery<{ me: Employee | null }>(GET_ME, {
    skip: !authToken,
    context: {
      headers: buildGraphQLHeaders({ authToken }),
    },
    fetchPolicy: "network-only",
  });

  const employee = meData?.me ?? null;

  const {
    data: documentsData,
    loading: documentsLoading,
    // error: documentsError,
  } = useQuery<{ documents: Document[] }>(GET_DOCUMENTS, {
    skip: !authToken || !employee?.id,
    variables: {
      employeeId: employee?.id ?? "",
    },
    context: {
      headers: buildGraphQLHeaders({ authToken }),
    },
    fetchPolicy: "network-only",
  });

  useEffect(() => {
    if (!authToken) {
      router.replace("/auth/employee");
      return;
    }

    if (!meLoading && !employee) {
      window.localStorage.removeItem(TOKEN_STORAGE_KEY);
      router.replace("/auth/employee");
    }
  }, [authToken, employee, meLoading, router]);

  const documents = useMemo(
    () => documentsData?.documents ?? [],
    [documentsData],
  );

  if (!authToken) {
    return null;
  }
  const loading = meLoading || Boolean(employee?.id && documentsLoading);
  // const error = meError?.message ?? documentsError?.message ?? null;

  const displayName = employee
    ? `${employee.lastName} ${employee.firstName}`
    : "???????";

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F5F7FB] flex items-center justify-center">
        <div className="flex items-center gap-3 text-white text-sm">
          <span className="w-5 h-5 border-2 border-white border-t-white  rounded-full animate-spin" />
          Уншиж байна.....
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F5F7FB]">
      <div className="mx-auto flex w-[1056px] max-w-full flex-col gap-4 px-0 py-10">
        <div className="mx-auto w-full max-w-264">
          <Request employee={employee ?? undefined} />
        </div>

        <div className="mt-[18px]">
          <div className="flex h-[89px] w-[1056px] max-w-full items-center justify-between rounded-[12px] border border-[#E5E7EB] bg-white px-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-[#9BC1FF] bg-[#EEF4FF]">
                <span className="text-[#2A8CFF] text-sm font-semibold">✈</span>
              </div>
              <div className="flex flex-col">
                <span className="text-[14px] font-semibold text-[#111827]">
                  {displayName}
                </span>
                <span className="text-[12px] text-[#6B7280]">Томилолт</span>
              </div>
            </div>
            <span className="rounded-full border border-[#BFD7FF] bg-[#EAF2FF] px-3 py-1 text-[12px] font-medium text-[#2A8CFF]">
              Хүлээгдэж буй
            </span>
          </div>
        </div>

        <section className="mx-auto mt-[16px] flex w-full max-w-264 flex-col gap-4 animate-fade-up">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <h2 className="text-[18px] font-semibold tracking-[-0.02em] text-[#111827]">
                Баримт бичиг шинэчлэлт
              </h2>
              <span className="rounded-full border border-[#E5E7EB] bg-white px-3 py-1 text-[12px] font-medium text-[#6B7280]">
                {Math.min(documents.length)} баримт
              </span>
            </div>
            <a
              href="/employee/files"
              className="text-[13.5px] font-medium hover:text-[#111827] transition-colors">
              Бүх баримт бичгүүд →
            </a>
          </div>

          <div className="flex flex-col divide-y divide-[#E5E7EB] rounded-2xl border border-[#E5E7EB] mt-2 bg-white">
            {documents.length > 0 ? (
              documents
                .slice(0, 4)
                .map((document) => (
                  <ContractPreview
                    key={document.id}
                    document={document}
                    authToken={authToken}
                  />
                ))
            ) : (
              <div className="flex flex-col items-center justify-center gap-3 py-10 text-center">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-[18px] border border-[#E5E7EB] bg-[#F8FAFC]">
                  <FactIcon />
                </div>
                <div className="flex flex-col items-center gap-1">
                  <h3 className="text-[13px] font-semibold text-[#6B7280]">
                    Баримт олдсонгүй
                  </h3>
                </div>
              </div>
            )}
          </div>
        </section>
      </div>
    </div>
  );
}
