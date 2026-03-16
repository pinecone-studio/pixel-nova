"use client";

import { useMutation, useQuery } from "@apollo/client/react";
import { useMemo, useState } from "react";

import { buildGraphQLHeaders } from "@/lib/apollo-client";
import { UPSERT_EMPLOYEE } from "@/graphql/mutations";
import { GET_EMPLOYEES } from "@/graphql/queries";
import type { Employee, UpsertEmployeeInput } from "@/lib/types";
import { EmployeeCard } from "@/components/hr/workers/employee-card";
import { EmployeeModal } from "@/components/hr/workers/employee-modal";
import { WorkersStats } from "@/components/hr/workers/stats";
import { WorkersToolbar } from "@/components/hr/workers/toolbar";
import type { EmployeeFormState } from "@/components/hr/workers/shared";

import { PlusIcon } from "./icons";

export function WorkersComponent() {
  const [search, setSearch] = useState("");
  const [showAdd, setShowAdd] = useState(false);
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
      employees.filter((employee) =>
        [
          employee.firstName,
          employee.lastName,
          employee.employeeCode,
          employee.email ?? "",
          employee.department,
          employee.jobTitle,
        ].some((value) => value.toLowerCase().includes(search.toLowerCase())),
      ),
    [employees, search],
  );

  const totalActive = employees.filter((employee) => employee.status === "Ирсэн").length;
  const totalOnLeave = employees.filter((employee) => employee.status === "Чөлөөтэй").length;
  const totalNewThisMonth = employees.filter((employee) => {
    const hireDate = new Date(employee.hireDate);
    const now = new Date();
    return (
      hireDate.getFullYear() === now.getFullYear() &&
      hireDate.getMonth() === now.getMonth()
    );
  }).length;

  async function handleSave(form: EmployeeFormState) {
    setError(null);
    try {
      const payload: UpsertEmployeeInput = {
        id: form.id,
        employeeCode: form.employeeCode,
        firstName: form.firstName,
        lastName: form.lastName,
        email: form.email || null,
        department: form.department,
        branch: form.branch,
        jobTitle: form.jobTitle || null,
        level: form.level,
        hireDate: form.hireDate,
        status: form.status,
        firstNameEng: null,
        lastNameEng: null,
        entraId: null,
        imageUrl: null,
        github: null,
        terminationDate: null,
        numberOfVacationDays: null,
        isSalaryCompany: null,
        isKpi: null,
        birthDayAndMonth: null,
        birthdayPoster: null,
      };

      await saveEmployee({ variables: { input: payload } });
      setShowAdd(false);
      setEditEmp(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Хадгалж чадсангүй.");
    }
  }

  return (
    <div className="min-h-screen bg-[#080c12] text-white font-sans flex flex-col gap-5 p-0 animate-fade-up">
      {showAdd && (
        <EmployeeModal
          mode="add"
          saving={saving}
          onClose={() => setShowAdd(false)}
          onSave={handleSave}
        />
      )}

      {editEmp && (
        <EmployeeModal
          mode="edit"
          employee={editEmp}
          saving={saving}
          onClose={() => setEditEmp(null)}
          onSave={handleSave}
        />
      )}

      <WorkersStats
        totalEmployees={employees.length}
        totalActive={totalActive}
        totalNewThisMonth={totalNewThisMonth}
        totalOnLeave={totalOnLeave}
      />

      <WorkersToolbar search={search} onSearchChange={setSearch} />

      {error && (
        <div className="rounded-xl border border-red-500/20 bg-red-500/5 px-4 py-3 text-sm text-red-400">
          {error}
        </div>
      )}

      <p className="text-slate-500 text-sm">Нийт {filtered.length} ажилтан</p>

      {loading ? (
        <div className="py-8 flex flex-col gap-3">
          <div className="h-4 w-56 rounded-full skeleton" />
          <div className="h-3 w-80 rounded-full skeleton" />
          <div className="h-3 w-72 rounded-full skeleton" />
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-4">
          {filtered.map((employee) => (
            <EmployeeCard
              key={employee.id}
              employee={employee}
              onEdit={setEditEmp}
            />
          ))}
        </div>
      )}

      <div className="flex justify-end mt-2">
        <button
          onClick={() => setShowAdd(true)}
          className="flex items-center cursor-pointer gap-2 px-5 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black font-semibold text-sm transition-colors shadow-lg shadow-emerald-500/20"
        >
          <PlusIcon />
          Ажилтан нэмэх
        </button>
      </div>
    </div>
  );
}

export default WorkersComponent;
