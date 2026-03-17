"use client";

import { Request } from "@/components/request";

import { EmployeeDocumentsSection } from "./home/EmployeeDocumentsSection";
import { EmployeeHero } from "./home/EmployeeHero";
import { useEmployeeDocuments } from "./useEmployeeDocuments";
import { useEmployeeSession } from "./useEmployeeSession";

export default function EmployeeHomePage() {
  const { authToken, employee, loading: employeeLoading, errorMessage } =
    useEmployeeSession();
  const {
    documents,
    loading: documentsLoading,
    errorMessage: documentsError,
  } = useEmployeeDocuments({
    authToken,
    employeeId: employee?.id,
  });

  if (!authToken) {
    return null;
  }

  const loading = employeeLoading || documentsLoading;
  const error = errorMessage ?? documentsError ?? null;

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#0A0A0F]">
        <div className="flex items-center gap-3 text-sm text-white/70">
          <span className="h-5 w-5 animate-spin rounded-full border-2 border-white/20 border-t-white" />
          Уншиж байна.....
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0A0A0F]">
      <div className="mx-auto flex w-full max-w-[1200px] flex-col gap-10 px-6 py-10">
        <EmployeeHero employee={employee} error={error} />
        <div className="mx-auto w-full max-w-[1056px]">
          <Request />
        </div>
        <EmployeeDocumentsSection documents={documents} authToken={authToken} />
      </div>
    </div>
  );
}
