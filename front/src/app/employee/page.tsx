"use client";

import { useQuery } from "@apollo/client/react";
import Link from "next/link";
import { useEffect, useMemo, useSyncExternalStore } from "react";
import { useRouter } from "next/navigation";

import { buildGraphQLHeaders } from "@/lib/apollo-client";
import { notifyAuthStateChanged } from "@/lib/auth-events";
import { GET_DOCUMENTS, GET_ME } from "@/graphql/queries";
import type { Document, Employee } from "@/lib/types";

import { ContractPreview } from "@/components/contractPreview";
import { FactIcon, Planeicon, Righticon } from "@/components/icons";
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
    error: meError,
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
    error: documentsError,
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

    if (!meLoading && !meError && !employee) {
      window.localStorage.removeItem(TOKEN_STORAGE_KEY);
      notifyAuthStateChanged();
      router.replace("/auth/employee");
    }
  }, [authToken, employee, meError, meLoading, router]);

  const documents = useMemo(
    () => documentsData?.documents ?? [],
    [documentsData],
  );

  if (!authToken) {
    return null;
  }

  const loading = meLoading || Boolean(employee?.id && documentsLoading);
  const error = meError?.message ?? documentsError?.message ?? null;

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F5F7FB] flex items-center justify-center">
        <div className="flex items-center gap-3 text-white text-sm">
          <span className="w-5 h-5 border-2 border-white border-t-white rounded-full animate-spin" />
          Уншиж байна.....
        </div>
      </div>
    );
  }

  if (error && !employee) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#F5F7FB] px-4">
        <div className="max-w-md rounded-2xl border border-[#FECACA] bg-white px-6 py-5 text-center shadow-sm">
          <h2 className="text-base font-semibold text-[#111827]">
            Өгөгдөл ачаалж чадсангүй
          </h2>
          <p className="mt-2 text-sm text-[#B91C1C]">{error}</p>
        </div>
      </div>
    );
  }

  const displayName = employee
    ? `${employee.lastName} ${employee.firstName}`
    : "Ажилтан";

  return (
    <div className="bg-[#F5F7FB]">
      <div className="mx-auto mt-[71px] flex w-[1056px] max-w-full flex-col pb-[11px]">
        <div className="mx-auto w-full max-w-264">
          <Request employee={employee ?? undefined} />
        </div>

        <div className="mt-9">
          <div
            className="box-border flex max-w-full items-center justify-between rounded-[12px] border border-[#E5E7EB] bg-white p-5"
            style={{ width: 1056, height: 89 }}
          >
            <div className="flex h-[48px] items-center gap-4">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg border border-[#9BC1FF] bg-[#EEF4FF]">
                <Planeicon />
              </div>
              <div className="flex h-10 flex-col justify-between">
                <span className="text-[16px] min-w-[200px] h-[20px] font-semibold text-[#111827]">
                  {displayName}
                </span>
                <span className="text-[14px] text-[#6B7280] w-[64px] h-[16px]">
                  Томилолт
                </span>
              </div>
            </div>
            <span className="h-[24px] w-[113px] rounded-full border border-[#BFD7FF] bg-[#EAF2FF] px-3 py-1 text-[12px] font-semibold text-[#2A8CFF]">
              Хүлээгдэж буй
            </span>
          </div>
        </div>

        <section className="mx-auto mt-9 flex w-full max-w-264 flex-col gap-4 animate-fade-up">
          <div className="flex items-center justify-between">
            <div className="flex h-8 w-[365px] items-center justify-between">
              <h2 className="h-8 w-[246px] text-[20px] font-semibold tracking-[-0.02em] text-[#111827]">
                Баримт бичиг шинэчлэлт
              </h2>
              <span className="rounded-full border min-w-[79px] h-[24px] border-[#E5E7EB] bg-white px-3 py-1 text-[12px] font-medium text-[#6B7280]">
                {Math.min(documents.length)} баримт
              </span>
            </div>
            <Link
              href="/employee/files"
              className="flex h-8 w-[175px] items-center justify-evenly text-[14px] font-medium transition-colors hover:text-[#111827]"
            >
              <span className="h-5 w-[133px]">Бүх баримт бичгүүд</span>
              <span className="flex h-5 items-end">
                <Righticon />
              </span>
            </Link>
          </div>

          <div className="flex h-[356px] w-[1056px] flex-col divide-y divide-[#E5E7EB] rounded-2xl border border-[#E5E7EB] bg-white">
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
                  {error ? (
                    <p className="text-xs text-[#B91C1C]">{error}</p>
                  ) : null}
                </div>
              </div>
            )}
          </div>
        </section>
      </div>
    </div>
  );
}
