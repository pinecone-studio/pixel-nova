"use client";

import { useMutation, useQuery } from "@apollo/client/react";
import { useMemo, useState } from "react";

import { EmployeeCard } from "@/components/hr/workers/employee-card";
import { EmployeeModal } from "@/components/hr/workers/employee-modal";
import { WorkersStats } from "@/components/hr/workers/stats";
import { WorkersToolbar } from "@/components/hr/workers/toolbar";
import type { EmployeeFormState } from "@/components/hr/workers/shared";
import {
  BRANCHES,
  DEPARTMENTS,
  LEVELS,
  STATUSES,
} from "@/components/hr/workers/shared";
import {
  CsvImportDialog,
  type CsvEmployeeRow,
} from "@/components/hr/workers/csv-import-dialog";
import { PlusIcon } from "@/components/icons";
import { FiUpload } from "react-icons/fi";
import { UPSERT_EMPLOYEE } from "@/graphql/mutations";
import { GET_EMPLOYEES } from "@/graphql/queries";
import { buildGraphQLHeaders } from "@/lib/apollo-client";
import type { Employee, UpsertEmployeeInput } from "@/lib/types";

export default function HrEmployeesPage() {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string | null>(null);
  const [departmentFilter, setDepartmentFilter] = useState<string | null>(null);
  const [showAdd, setShowAdd] = useState(false);
  const [showCsvImport, setShowCsvImport] = useState(false);
  const [importing, setImporting] = useState(false);
  const [lastSyncTime, setLastSyncTime] = useState<string | null>(null);
  const [syncSource, setSyncSource] = useState<string | null>(null);
  const [editEmp, setEditEmp] = useState<Employee | null>(null);
  const [error, setError] = useState<string | null>(null);

  const queryContext = useMemo(
    () => ({ headers: buildGraphQLHeaders({ actorRole: "hr" }) }),
    [],
  );

  const { data, loading } = useQuery<{ employees: Employee[] }>(GET_EMPLOYEES, {
    variables: { search: null, status: null, department: null },
    context: queryContext,
    fetchPolicy: "cache-and-network",
  });

  const [saveEmployee, { loading: saving }] = useMutation<{
    upsertEmployee: { employee: Employee; resolvedAction?: string | null };
  }>(UPSERT_EMPLOYEE, {
    context: queryContext,
    refetchQueries: [
      {
        query: GET_EMPLOYEES,
        variables: { search: null, status: null, department: null },
        context: queryContext,
      },
    ],
    awaitRefetchQueries: true,
  });

  const employees = useMemo(() => data?.employees ?? [], [data]);

  const filtered = useMemo(
    () =>
      employees.filter((employee) => {
        if (statusFilter && employee.status !== statusFilter) return false;
        if (departmentFilter && employee.department !== departmentFilter)
          return false;
        return [
          employee.firstName,
          employee.lastName,
          employee.employeeCode,
          employee.email ?? "",
          employee.department,
          employee.jobTitle,
        ].some((value) => value.toLowerCase().includes(search.toLowerCase()));
      }),
    [employees, search, statusFilter, departmentFilter],
  );

  const totalActive = employees.filter(
    (employee) => employee.status === "Ирсэн",
  ).length;
  async function handleSave(form: EmployeeFormState) {
    setError(null);
    try {
      const payload: UpsertEmployeeInput = {
        id: form.id,
        employeeCode: form.employeeCode,
        firstName: form.firstName,
        lastName: form.lastName,
        firstNameEng: form.firstNameEng || null,
        lastNameEng: form.lastNameEng || null,
        email: form.email || null,
        entraId: form.entraId || null,
        github: form.github || null,
        department: form.department,
        branch: form.branch,
        jobTitle: form.jobTitle || null,
        level: form.level,
        hireDate: form.hireDate,
        terminationDate: form.terminationDate || null,
        status: form.status,
        birthDayAndMonth: form.birthDayAndMonth || null,
        imageUrl: null,
        numberOfVacationDays: null,
        isSalaryCompany: null,
        isKpi: null,
        birthdayPoster: null,
      };

      await saveEmployee({ variables: { input: payload } });
      setShowAdd(false);
      setEditEmp(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Хадгалж чадсангүй.");
    }
  }

  async function handleCsvImport(rows: CsvEmployeeRow[]) {
    setImporting(true);
    setError(null);
    let successCount = 0;
    const errors: string[] = [];

    for (const row of rows) {
      try {
        const payload: UpsertEmployeeInput = {
          id: globalThis.crypto.randomUUID(),
          employeeCode: row.employeeCode,
          firstName: row.firstName,
          lastName: row.lastName,
          firstNameEng: null,
          lastNameEng: null,
          email: row.email || null,
          entraId: null,
          github: null,
          department: row.department || DEPARTMENTS[0],
          branch: row.branch || BRANCHES[0],
          jobTitle: row.jobTitle || null,
          level: row.level || LEVELS[0],
          hireDate: row.hireDate || new Date().toISOString().slice(0, 10),
          terminationDate: null,
          status: row.status || STATUSES[0],
          birthDayAndMonth: null,
          imageUrl: null,
          numberOfVacationDays: null,
          isSalaryCompany: null,
          isKpi: null,
          birthdayPoster: null,
        };
        await saveEmployee({ variables: { input: payload } });
        successCount++;
      } catch (err) {
        errors.push(
          `${row.employeeCode}: ${err instanceof Error ? err.message : "Алдаа"}`,
        );
      }
    }

    setImporting(false);
    setShowCsvImport(false);
    setLastSyncTime(new Date().toISOString());
    setSyncSource("CSV");

    if (errors.length > 0) {
      setError(
        `${successCount} амжилттай, ${errors.length} алдаатай: ${errors.slice(0, 3).join("; ")}`,
      );
    }
  }

  return (
    <div className="flex min-h-full flex-col gap-6 text-slate-900 animate-fade-up">
      {showAdd ? (
        <EmployeeModal
          mode="add"
          saving={saving}
          onClose={() => setShowAdd(false)}
          onSave={handleSave}
        />
      ) : null}

      {editEmp ? (
        <EmployeeModal
          mode="edit"
          employee={editEmp}
          saving={saving}
          onClose={() => setEditEmp(null)}
          onSave={handleSave}
        />
      ) : null}

      <CsvImportDialog
        open={showCsvImport}
        onClose={() => setShowCsvImport(false)}
        onImport={handleCsvImport}
        importing={importing}
      />

      <WorkersStats
        totalEmployees={employees.length}
        totalActive={totalActive}
        lastSyncTime={lastSyncTime}
        syncSource={syncSource}
      />

      <WorkersToolbar
        search={search}
        onSearchChange={setSearch}
        statusFilter={statusFilter}
        onStatusFilterChange={setStatusFilter}
        departmentFilter={departmentFilter}
        onDepartmentFilterChange={setDepartmentFilter}
      />

      <div className="h-px w-full bg-slate-200/80" />

      {error ? (
        <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-500">
          {error}
        </div>
      ) : null}

      <div className="flex items-center justify-between gap-4">
        <p className="text-[14px] font-medium text-[#3f4145b3]">
          Нийт {filtered.length} ажилтан
        </p>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowCsvImport(true)}
            className="inline-flex h-10 items-center gap-2 rounded-[10px] border border-slate-200 bg-white px-4 text-[14px] font-medium text-slate-600 transition-colors hover:bg-slate-50 hover:text-slate-900"
          >
            <FiUpload className="h-4 w-4" />
            CSV оруулах
          </button>
          <button
            onClick={() => setShowAdd(true)}
            className="inline-flex h-10 items-center gap-2 rounded-[10px] bg-[#1f2126] px-5 text-[14px] font-semibold text-white transition-colors hover:bg-[#121316]"
          >
            <PlusIcon />
            Ажилтан нэмэх
          </button>
        </div>
      </div>

      {loading ? (
        <div className="flex flex-col gap-3 py-8">
          <div className="skeleton h-4 w-56 rounded-full" />
          <div className="skeleton h-3 w-80 rounded-full" />
          <div className="skeleton h-3 w-72 rounded-full" />
        </div>
      ) : (
        <div className="mx-auto grid w-fit grid-cols-1 justify-center gap-y-6 px-4 md:grid-cols-2 xl:grid-cols-4 xl:gap-x-[38px] xl:px-0">
          {filtered.map((employee) => (
            <EmployeeCard
              key={employee.id}
              employee={employee}
              onEdit={setEditEmp}
            />
          ))}
        </div>
      )}
    </div>
  );
}
