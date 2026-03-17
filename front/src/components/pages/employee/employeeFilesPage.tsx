"use client";

import { useMemo, useState } from "react";

import { FilesList } from "./files/FilesList";
import { FilesPageHeader } from "./files/FilesPageHeader";
import { FilesSectionHeader } from "./files/FilesSectionHeader";
import { FilesToolbar } from "./files/FilesToolbar";
import { useEmployeeDocuments } from "./useEmployeeDocuments";
import { useEmployeeSession } from "./useEmployeeSession";

export default function EmployeeFilesPage() {
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all");
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

  const filteredDocuments = useMemo(() => {
    const normalizedSearch = search.trim().toLowerCase();

    return documents.filter((document) => {
      const matchesSearch =
        !normalizedSearch ||
        document.documentName.toLowerCase().includes(normalizedSearch) ||
        document.action.toLowerCase().includes(normalizedSearch);
      const matchesFilter =
        filter === "all" ||
        document.documentName.toLowerCase().endsWith(`.${filter.toLowerCase()}`);

      return matchesSearch && matchesFilter;
    });
  }, [documents, filter, search]);

  if (!authToken) return null;

  const loading = employeeLoading || documentsLoading;
  const error = errorMessage ?? documentsError ?? null;
  const employeeName = employee ? `${employee.lastName} ${employee.firstName}` : null;

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#0a0b0f",
        padding: "32px 40px",
        fontFamily: "inherit",
      }}
    >
      <FilesPageHeader employeeName={employeeName} />

      <FilesToolbar
        search={search}
        filter={filter}
        onSearchChange={setSearch}
        onFilterChange={setFilter}
      />

      <FilesSectionHeader count={filteredDocuments.length} />

      <FilesList
        loading={loading}
        error={error}
        documents={filteredDocuments}
        authToken={authToken}
      />
    </div>
  );
}
