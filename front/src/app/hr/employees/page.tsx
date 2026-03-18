"use client";

import { useMutation, useQuery } from "@apollo/client/react";
import { useMemo, useState } from "react";

import { EmployeeCard } from "@/components/hr/workers/employee-card";
import { EmployeeModal } from "@/components/hr/workers/employee-modal";
import { WorkersStats } from "@/components/hr/workers/stats";
import { WorkersToolbar } from "@/components/hr/workers/toolbar";
import type { EmployeeFormState } from "@/components/hr/workers/shared";
import { PlusIcon } from "@/components/icons";
import { UPSERT_EMPLOYEE } from "@/graphql/mutations";
import { GET_EMPLOYEES } from "@/graphql/queries";
import { buildGraphQLHeaders } from "@/lib/apollo-client";
import type { Employee, UpsertEmployeeInput } from "@/lib/types";

export default function HrEmployeesPage() {
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

  const totalActive = employees.filter(
    (employee) => employee.status === "Ирсэн",
  ).length;
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

      <div className="flex flex-col gap-2">
        <h1 className="text-[28px] font-semibold leading-8 tracking-[-0.02em] text-slate-950">
          Ажилтнууд
        </h1>
        <p className="text-sm leading-6 text-slate-500">
          Байгууллагын бүх ажилтны мэдээлэл, төлөв болон үндсэн дэлгэрэнгүй.
        </p>
      </div>

      <WorkersStats
        totalEmployees={employees.length}
        totalActive={totalActive}
        totalNewThisMonth={totalNewThisMonth}
      />

      <WorkersToolbar search={search} onSearchChange={setSearch} />

      {error ? (
        <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-500">
          {error}
        </div>
      ) : null}

      <div className="flex items-center justify-between gap-4">
        <p className="text-sm font-medium text-slate-500">
          Нийт {filtered.length} ажилтан
        </p>
        <button
          onClick={() => setShowAdd(true)}
          className="inline-flex h-11 items-center gap-2 rounded-2xl bg-slate-950 px-5 text-sm font-semibold text-white transition-colors hover:bg-slate-800"
        >
          <PlusIcon />
          Ажилтан нэмэх
        </button>
      </div>

      {loading ? (
        <div className="flex flex-col gap-3 py-8">
          <div className="skeleton h-4 w-56 rounded-full" />
          <div className="skeleton h-3 w-80 rounded-full" />
          <div className="skeleton h-3 w-72 rounded-full" />
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
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
