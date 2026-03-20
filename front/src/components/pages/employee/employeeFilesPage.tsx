"use client";

import { useMemo, useState } from "react";

import { FilesList } from "./files/FilesList";
import { FilesPageHeader } from "./files/FilesPageHeader";

import { FilesToolbar } from "./files/FilesToolbar";
import { useEmployeeDocuments } from "./useEmployeeDocuments";
import { useEmployeeSession } from "./useEmployeeSession";

export default function EmployeeFilesPage() {
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all");
  const {
    authToken,
    employee,
    loading: employeeLoading,
    errorMessage,
  } = useEmployeeSession();
  const {
    documents,
    loading: documentsLoading,
    errorMessage: documentsError,
  } = useEmployeeDocuments({
    authToken,
    employeeId: employee?.id,
  });

  const filteredDocuments = useMemo(() => {
    const normalizedSearch = search.trim().toLowerCase();

    return documents.filter((document) => {
      const matchesSearch =
        !normalizedSearch ||
        document.documentName.toLowerCase().includes(normalizedSearch) ||
        document.action.toLowerCase().includes(normalizedSearch);
      const matchesFilter =
        filter === "all" ||
        document.documentName
          .toLowerCase()
          .endsWith(`.${filter.toLowerCase()}`);

      return matchesSearch && matchesFilter;
    });
  }, [documents, filter, search]);

  if (!authToken) return null;

  const loading = employeeLoading || documentsLoading;
  const error = errorMessage ?? documentsError ?? null;
  const employeeName = employee
    ? `${employee.lastName} ${employee.firstName}`
    : null;

  return (
    <div className="bg-[#f5f7fb]">
      <div className="mx-auto flex w-[1056px] max-w-full flex-col mt-[32px] pb-[103px]">
        <FilesPageHeader employeeName={employeeName} />

        <FilesToolbar
          search={search}
          filter={filter}
          onSearchChange={setSearch}
          onFilterChange={setFilter}
        />
        <div className="flex items-center w-[1056px] mt-8 h-6 gap-10">
          <h2 className="text-[20px] flex items-center w-[246px] h-6 font-semibold tracking-[-0.02em] text-[#111827]">
            Баримт бичиг шинэчлэлт
          </h2>
          <span className="rounded-full border h-[24px] flex items-center min-w-[79px] border-[#E5E7EB] bg-white justify-center text-[12px] font-medium text-[#6B7280]">
            {Math.min(documents.length)} баримт
          </span>
        </div>
        <FilesList
          loading={loading}
          error={error}
          documents={filteredDocuments}
          authToken={authToken}
        />
      </div>
    </div>
  );
}
