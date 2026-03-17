"use client";

import { useQuery } from "@apollo/client/react";
import { useEffect, useMemo, useSyncExternalStore } from "react";
import { useRouter } from "next/navigation";

import { buildGraphQLHeaders } from "@/lib/apollo-client";
import { GET_DOCUMENTS, GET_ME } from "@/graphql/queries";
import type { Document, Employee } from "@/lib/types";

import { ContractPreview } from "@/components/contractPreview";
import { FactIcon } from "@/components/icons";
import { EmployeeNotifications } from "@/components/employeeNotifications";
import { Request } from "@/components/request";
import { MyContractRequests } from "@/components/myContractRequests";

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
  const error = meError?.message ?? documentsError?.message ?? null;

  const displayName = employee
    ? `${employee.lastName} ${employee.firstName}`
    : "???????";

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0A0A0F] flex items-center justify-center">
        <div className="flex items-center gap-3 text-white/70 text-sm">
          <span className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin" />
          Уншиж байна.....
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0A0A0F]">
      <div className="mx-auto flex w-full max-w-[1200px] flex-col gap-10 px-6 py-10">
        <div className="mx-auto flex h-[264px] w-full max-w-[1056px] items-center rounded-2xl bg-[linear-gradient(135deg,#0a0f15_0%,#0b1018_45%,#0a0d12_100%)] p-10 shadow-[0_0_0_1px_rgba(0,153,255,0.2),0_20px_60px_rgba(0,0,0,0.45)]">
          <div className="flex max-w-[640px] flex-col gap-3">
            <p className="text-[#00CC99] text-sm font-medium tracking-widest uppercase">
              Сайн байна уу?
            </p>
            <h1 className="text-white text-[36px] font-semibold leading-[1.1] tracking-[-0.02em]">
              {displayName}
            </h1>
            <p className="text-[#4A4A6A] text-sm leading-relaxed max-w-lg">
              Та хөдөлмөрийн баримт бичиг болон ажлын түүхээ нэг дороос харах
              боломжтой. Бүх мэдээлэл backend-аас бодитоор ачааллагдана.
            </p>
            <div className="flex gap-2 mt-1 flex-wrap">
              {employee?.department ? (
                <span className="flex items-center gap-1.5 rounded-lg border border-[#00CC99]/30 bg-[#00CC99]/15 px-3 py-1.5 text-[13px] font-semibold text-[#00CC99]">
                  {employee.department}
                </span>
              ) : null}
              {employee?.jobTitle ? (
                <span className="flex items-center gap-1.5 rounded-lg border border-white/10 bg-white/5 px-3 py-1.5 text-[13px] font-semibold text-[#94A3B8]">
                  {employee.jobTitle}
                </span>
              ) : null}
              {employee?.employeeCode ? (
                <span className="flex items-center gap-1.5 rounded-lg border border-white/10 bg-white/5 px-3 py-1.5 text-[13px] font-semibold text-[#94A3B8]">
                  {employee.employeeCode}
                </span>
              ) : null}
              {error ? (
                <span className="rounded-lg border border-red-500/20 bg-red-500/10 px-3 py-1.5 text-[13px] font-semibold text-red-400">
                  {error}
                </span>
              ) : null}
            </div>
          </div>
        </div>

        <div className="mx-auto w-full max-w-[1056px]">
          <Request employee={employee ?? undefined} />
        </div>

        <MyContractRequests />
        <EmployeeNotifications />

        <section className="mx-auto flex w-full max-w-[1056px] flex-col gap-6 animate-fade-up">
          <div className="flex items-center gap-4">
            <h2 className="text-[24px] font-semibold tracking-[-0.02em] text-white">
              Бичиг Баримтууд
            </h2>
            <span className="rounded-full border border-[#233246] bg-[#162130] px-4 py-1 text-[14px] font-medium text-[#94A3B8]">
              {documents.length} баримт
            </span>
          </div>

          <div className="flex flex-col divide-y divide-white/10 rounded-xl border border-white/5 bg-[#0B0E14]/40">
            {documents.length > 0 ? (
              documents.map((document) => (
                <ContractPreview
                  key={document.id}
                  document={document}
                  authToken={authToken}
                />
              ))
            ) : (
              <div className="flex flex-col items-center justify-center gap-3 py-10 text-center">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-[18px] border border-[#24374F] bg-[#132131]">
                  <FactIcon />
                </div>
                <div className="flex flex-col items-center gap-1">
                  <h3 className="text-[13px] font-semibold text-[#E7EDF5]">
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
