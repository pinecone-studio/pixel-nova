"use client";

import { useMutation, useQuery } from "@apollo/client/react";
import { useMemo, useState } from "react";

import { buildGraphQLHeaders } from "@/lib/apollo-client";
import { UPSERT_EMPLOYEE } from "@/graphql/mutations";
import { GET_EMPLOYEES } from "@/graphql/queries";
import type { Employee, UpsertEmployeeInput } from "@/lib/types";
import {
  AbsentIcon,
  ActiveIconn,
  BuildingIcon,
  CalIcon,
  FilterIcon,
  HiredIcon,
  LockIcon,
  MailIcon,
  PlusIcon,
  SearchIcon,
} from "./icons";

type ModalMode = "add" | "edit";

type EmployeeFormState = {
  id: string;
  employeeCode: string;
  firstName: string;
  lastName: string;
  email: string;
  department: string;
  branch: string;
  jobTitle: string;
  level: string;
  hireDate: string;
  status: string;
};

const DEPARTMENTS = [
  "Engineering",
  "HR",
  "Sales",
  "Finance",
  "Marketing",
  "Design",
];
const STATUSES = ["Ð˜Ñ€ÑÑÐ½", "Ð¢Ð°ÑÐ°Ð»ÑÐ°Ð½", "Ð§Ó©Ð»Ó©Ó©Ñ‚ÑÐ¹"];
const LEVELS = ["Junior", "Mid", "Senior", "Lead"];
const BRANCHES = ["Ulaanbaatar", "Darkhan", "Erdenet", "Remote"];

function getInitials(employee: Employee) {
  return `${employee.lastName.charAt(0)}${employee.firstName.charAt(0)}`;
}

function avatarColor(seed: string) {
  const colors = [
    "bg-cyan-500",
    "bg-purple-500",
    "bg-orange-500",
    "bg-teal-500",
    "bg-blue-600",
    "bg-pink-500",
  ];

  let hash = 0;
  for (let index = 0; index < seed.length; index += 1) {
    hash = (hash * 31 + seed.charCodeAt(index)) & 0xffffffff;
  }

  return colors[Math.abs(hash) % colors.length];
}

function statusStyle(status: string) {
  if (status === "Ð˜Ñ€ÑÑÐ½") {
    return "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30";
  }

  if (status === "Ð¢Ð°ÑÐ°Ð»ÑÐ°Ð½") {
    return "bg-red-500/20 text-red-400 border border-red-500/30";
  }

  return "bg-blue-500/20 text-blue-400 border border-blue-500/30";
}

function employeeToForm(employee?: Employee | null): EmployeeFormState {
  return {
    id: employee?.id ?? globalThis.crypto.randomUUID(),
    employeeCode: employee?.employeeCode ?? "",
    firstName: employee?.firstName ?? "",
    lastName: employee?.lastName ?? "",
    email: employee?.email ?? "",
    department: employee?.department ?? DEPARTMENTS[0],
    branch: employee?.branch ?? BRANCHES[0],
    jobTitle: employee?.jobTitle ?? "",
    level: employee?.level ?? LEVELS[0],
    hireDate:
      employee?.hireDate?.slice(0, 10) ?? new Date().toISOString().slice(0, 10),
    status: employee?.status ?? STATUSES[0],
  };
}

function EmployeeModal({
  mode,
  employee,
  saving,
  onClose,
  onSave,
}: {
  mode: ModalMode;
  employee?: Employee | null;
  saving: boolean;
  onClose: () => void;
  onSave: (value: EmployeeFormState) => Promise<void>;
}) {
  const [form, setForm] = useState<EmployeeFormState>(() =>
    employeeToForm(employee),
  );

  function updateField<Key extends keyof EmployeeFormState>(
    key: Key,
    value: EmployeeFormState[Key],
  ) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm"
      onClick={onClose}>
      <div
        className="w-[560px] max-w-[95vw] rounded-2xl bg-[#0f1520] p-6 flex flex-col gap-5 border border-slate-700/50"
        onClick={(event) => event.stopPropagation()}>
        <div className="flex items-center justify-between">
          <h2 className="text-white font-bold text-lg">
            {mode === "add"
              ? "Ð¨Ð¸Ð½Ñ Ð°Ð¶Ð¸Ð»Ñ‚Ð°Ð½ Ð½ÑÐ¼ÑÑ…"
              : "ÐÐ¶Ð¸Ð»Ñ‚Ð½Ñ‹ Ð¼ÑÐ´ÑÑÐ»ÑÐ» Ð·Ð°ÑÐ°Ñ…"}
          </h2>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white transition-colors">
            âœ•
          </button>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <input
            value={form.lastName}
            onChange={(event) => updateField("lastName", event.target.value)}
            className="bg-transparent border border-slate-700/60 rounded-xl px-3 py-2.5 text-slate-200 text-sm outline-none"
            placeholder="ÐžÐ²Ð¾Ð³"
          />
          <input
            value={form.firstName}
            onChange={(event) => updateField("firstName", event.target.value)}
            className="bg-transparent border border-slate-700/60 rounded-xl px-3 py-2.5 text-slate-200 text-sm outline-none"
            placeholder="ÐÑÑ€"
          />
          <input
            value={form.employeeCode}
            onChange={(event) =>
              updateField("employeeCode", event.target.value.toUpperCase())
            }
            className="bg-transparent border border-slate-700/60 rounded-xl px-3 py-2.5 text-slate-200 text-sm outline-none"
            placeholder="Employee code"
          />
          <input
            value={form.email}
            onChange={(event) => updateField("email", event.target.value)}
            className="bg-transparent border border-slate-700/60 rounded-xl px-3 py-2.5 text-slate-200 text-sm outline-none"
            placeholder="Ð˜Ð¼ÑÐ¹Ð»"
          />
          <select
            value={form.department}
            onChange={(event) => updateField("department", event.target.value)}
            className="bg-[#0f1520] border border-slate-700/60 rounded-xl px-3 py-2.5 text-slate-200 text-sm outline-none">
            {DEPARTMENTS.map((department) => (
              <option key={department} value={department}>
                {department}
              </option>
            ))}
          </select>
          <input
            value={form.jobTitle}
            onChange={(event) => updateField("jobTitle", event.target.value)}
            className="bg-transparent border border-slate-700/60 rounded-xl px-3 py-2.5 text-slate-200 text-sm outline-none"
            placeholder="ÐÐ»Ð±Ð°Ð½ Ñ‚ÑƒÑˆÐ°Ð°Ð»"
          />
        </div>

        <div className="flex items-center justify-end gap-3">
          <button
            onClick={onClose}
            className="px-5 py-2.5 rounded-xl border border-slate-600/50 text-slate-300 text-sm hover:bg-slate-800/50 transition-colors">
            Ð¢Ð°Ñ‚Ð³Ð°Ð»Ð·Ð°Ñ…
          </button>
          <button
            onClick={() => void onSave(form)}
            disabled={saving}
            className="px-5 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 disabled:opacity-60 text-black text-sm font-semibold transition-colors">
            {saving
              ? "Ð¥Ð°Ð´Ð³Ð°Ð»Ð¶ Ð±Ð°Ð¹Ð½Ð°..."
              : mode === "add"
                ? "ÐÑÐ¼ÑÑ…"
                : "Ð¥Ð°Ð´Ð³Ð°Ð»Ð°Ñ…"}
          </button>
        </div>
      </div>
    </div>
  );
}

function EmployeeCard({
  employee,
  onEdit,
}: {
  employee: Employee;
  onEdit: (employee: Employee) => void;
}) {
  return (
    <div className="rounded-2xl border border-slate-700/40 bg-[#0d1117] p-5 flex flex-col gap-3 hover:border-slate-600/60 transition-colors">
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          <div
            className={`w-11 h-11 rounded-xl ${avatarColor(employee.id)} flex items-center justify-center text-white font-bold text-sm shrink-0`}>
            {getInitials(employee)}
          </div>
          <div>
            <p className="text-white font-semibold text-sm">
              {employee.lastName} {employee.firstName}
            </p>
            <p className="text-slate-500 text-xs">
              {employee.jobTitle || employee.level}
            </p>
            <p className="text-slate-600 text-xs">{employee.employeeCode}</p>
          </div>
        </div>
        <span
          className={`text-xs px-2.5 py-1 rounded-full font-medium ${statusStyle(employee.status)}`}>
          {employee.status}
        </span>
      </div>

      <div className="flex flex-col gap-1.5">
        <div className="flex items-center gap-2">
          <MailIcon />
          <span className="text-slate-400 text-xs">
            {employee.email || "Ð˜Ð¼ÑÐ¹Ð» Ð±Ð°Ð¹Ñ…Ð³Ò¯Ð¹"}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <BuildingIcon />
          <span className="px-2 py-0.5 rounded-md bg-slate-700/50 text-slate-300 text-xs">
            {employee.department}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <LockIcon />
          <span className="text-slate-400 text-xs">{employee.branch}</span>
        </div>
      </div>

      <div className="h-px bg-slate-800/60" />

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          <CalIcon />
          <span className="text-slate-500 text-xs">
            ÐžÑ€ÑÐ¾Ð½: {employee.hireDate}
          </span>
        </div>
        <button
          onClick={() => onEdit(employee)}
          className="h-7 px-3 rounded-lg border border-slate-700/50 text-slate-400 text-xs hover:text-white hover:border-slate-500 transition-colors">
          Ð—Ð°ÑÐ°Ñ…
        </button>
      </div>
    </div>
  );
}

export function WorkersComponent() {
  const [search, setSearch] = useState("");
  const [showAdd, setShowAdd] = useState(false);
  const [editEmp, setEditEmp] = useState<Employee | null>(null);
  const [error, setError] = useState<string | null>(null);

  const queryContext = useMemo(
    () => ({
      headers: buildGraphQLHeaders({ actorRole: "hr" }),
    }),
    [],
  );

  const { data, loading } = useQuery<{ employees: Employee[] }>(GET_EMPLOYEES, {
    variables: { search: null, status: null, department: null },
    context: queryContext,
    fetchPolicy: "cache-and-network",
  });

  const [saveEmployee, { loading: saving }] = useMutation<{
    upsertEmployee: {
      employee: Employee;
      resolvedAction?: string | null;
    };
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
    (employee) => employee.status === "Ð˜Ñ€ÑÑÐ½",
  ).length;
  const totalOnLeave = employees.filter(
    (employee) => employee.status === "Ð§Ó©Ð»Ó©Ó©Ñ‚ÑÐ¹",
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

      await saveEmployee({
        variables: { input: payload },
      });

      setShowAdd(false);
      setEditEmp(null);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Ð¥Ð°Ð´Ð³Ð°Ð»Ð¶ Ñ‡Ð°Ð´ÑÐ°Ð½Ð³Ò¯Ð¹.",
      );
    }
  }

  return (
    <div className="min-h-screen bg-[#080c12] text-white font-sans flex flex-col gap-5 p-0">
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

      <div
        className="grid gap-4"
        style={{ gridTemplateColumns: "1.4fr 1fr 1fr" }}>
        <div className="rounded-2xl border border-slate-700/40 bg-linear-to-br from-green-700/30 to-black p-5">
          <p className="text-slate-500 text-xs font-semibold uppercase tracking-widest mb-3">
            ÐÐ¸Ð¹Ñ‚ Ð°Ð¶Ð¸Ð»Ñ‡Ð¸Ð´
          </p>
          <div className="flex items-end justify-between">
            <div>
              <div className="flex items-center gap-3">
                <p className="text-6xl font-bold text-white">
                  {employees.length}
                </p>
                <span className="px-2 py-1 rounded-lg bg-emerald-500/15 text-emerald-400 text-xs font-semibold">
                  Real data
                </span>
              </div>
              <p className="text-slate-500 text-sm mt-1">
                Backend employee Ð¶Ð°Ð³ÑÐ°Ð°Ð»Ñ‚
              </p>
            </div>
            <div className="w-12 h-12 rounded-xl bg-emerald-500/20 flex items-center justify-center">
              <HiredIcon />
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-cyan-600/30 bg-linear-to-br from-cyan-600/15 to-transparent p-5">
          <div className="flex items-start justify-between mb-3">
            <p className="text-slate-500 text-xs font-semibold uppercase tracking-widest">
              Ð˜Ð´ÑÐ²Ñ…Ñ‚ÑÐ¹
            </p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-cyan-500/20 flex items-center justify-center mb-3">
            <ActiveIconn />
          </div>
          <p className="text-5xl font-bold text-white">{totalActive}</p>
        </div>

        <div className="flex flex-col gap-4">
          <div className="rounded-2xl border border-emerald-600/30 bg-linear-to-br from-emerald-600/15 to-transparent p-4 flex-1">
            <p className="text-slate-500 text-xs uppercase tracking-widest mb-2">
              Ð­Ð½Ñ ÑÐ°Ñ€
            </p>
            <div className="w-9 h-9 rounded-xl bg-emerald-500/20 flex items-center justify-center mb-2">
              <HiredIcon />
            </div>
            <p className="text-4xl font-bold text-white">{totalNewThisMonth}</p>
          </div>
          <div className="rounded-2xl border border-purple-600/30 bg-linear-to-br from-purple-600/15 to-transparent p-4 flex-1">
            <p className="text-slate-500 text-xs uppercase tracking-widest mb-2">
              Ð§Ó©Ð»Ó©Ó©Ñ‚ÑÐ¹
            </p>
            <div className="w-9 h-9 rounded-xl bg-purple-500/20 flex items-center justify-center mb-2">
              <AbsentIcon />
            </div>
            <p className="text-4xl font-bold text-white">{totalOnLeave}</p>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2 bg-[#0d1117] border border-slate-700/50 rounded-xl px-3 py-2.5 flex-1 max-w-xs">
          <SearchIcon />
          <input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            className="bg-transparent text-slate-300 text-sm outline-none placeholder:text-slate-600 w-full"
            placeholder="ÐÑÑ€, Ð¸Ð¼ÑÐ¹Ð», ÐºÐ¾Ð´..."
          />
        </div>
        <div className="flex items-center gap-2 ml-auto">
          <button className="flex items-center gap-2 px-3 py-2 rounded-xl bg-[#0d1117] border border-slate-700/50 text-slate-300 text-sm">
            <FilterIcon /> Ð‘Ò¯Ð³Ð´
          </button>
          <button className="flex items-center gap-2 px-3 py-2 rounded-xl bg-[#0d1117] border border-slate-700/50 text-slate-300 text-sm">
            <LockIcon /> Ð‘Ò¯Ð³Ð´
          </button>
        </div>
      </div>

      {error ? (
        <div className="rounded-xl border border-red-500/20 bg-red-500/5 px-4 py-3 text-sm text-red-400">
          {error}
        </div>
      ) : null}

      <p className="text-slate-500 text-sm">
        ÐÐ¸Ð¹Ñ‚ {filtered.length} Ð°Ð¶Ð¸Ð»Ñ‚Ð°Ð½
      </p>

      {loading ? (
        <div className="py-12 flex items-center justify-center gap-3 text-slate-500 text-sm">
          <span className="w-4 h-4 border-2 border-slate-700 border-t-slate-400 rounded-full animate-spin" />
          ÐÐ¶Ð¸Ð»Ñ‚Ð½ÑƒÑƒÐ´Ñ‹Ð³ ÑƒÐ½ÑˆÐ¸Ð¶ Ð±Ð°Ð¹Ð½Ð°...
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
          className="flex items-center cursor-pointer gap-2 px-5 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black font-semibold text-sm transition-colors shadow-lg shadow-emerald-500/20">
          <PlusIcon />
          ÐÐ¶Ð¸Ð»Ñ‚Ð°Ð½ Ð½ÑÐ¼ÑÑ…
        </button>
      </div>
    </div>
  );
}

export default WorkersComponent;
