"use client";

import { useMutation, useQuery } from "@apollo/client/react";
import { useMemo, useRef, useState } from "react";

import { buildGraphQLHeaders } from "@/lib/apollo-client";
import { UPSERT_EMPLOYEE } from "@/graphql/mutations";
import { GET_EMPLOYEES } from "@/graphql/queries";
import type {
  Employee,
  UpsertEmployeeInput,
} from "@/lib/types";
import { formatBranch, formatDepartment, formatLevel } from "@/lib/labels";
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
import { Button } from "./ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "./ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import { Input } from "./ui/input";
import { Label } from "@/components/ui/label";
import { Upload } from "lucide-react";

// ── Types ──────────────────────────────────────────────
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
const STATUSES = ["Ирсэн", "Тасалсан", "Чөлөөтэй"];
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
  for (let i = 0; i < seed.length; i++) {
    hash = (hash * 31 + seed.charCodeAt(i)) & 0xffffffff;
  }
  return colors[Math.abs(hash) % colors.length];
}

function statusStyle(status: string) {
  if (status === "Ирсэн")
    return "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30";
  if (status === "Тасалсан")
    return "bg-red-500/20 text-red-400 border border-red-500/30";
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
// ── Employee Modal ─────────────────────────────────────
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
  const fileRef = useRef<HTMLInputElement>(null);
  const [file, setFile] = useState<File | null>(null);
  const [dragging, setDragging] = useState(false);
  const [form, setForm] = useState<EmployeeFormState>(() =>
    employeeToForm(employee),
  );

  function updateField<K extends keyof EmployeeFormState>(
    key: K,
    value: EmployeeFormState[K],
  ) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  return (
    <Dialog
      open
      onOpenChange={(open) => {
        if (!open) onClose();
      }}>
      <DialogContent
        style={{ width: 500, height: 601, maxWidth: 500 }}
        className="
          bg-[#0d1117]
          border border-slate-700/50
          rounded-3xl
          p-7
          flex flex-col gap-4
          overflow-hidden
          [&>button]:text-slate-400
          [&>button]:hover:text-white
          [&>button]:transition-colors
        ">
        {/* Header */}
        <DialogHeader className="shrink-0">
          <DialogTitle className="text-white text-xl font-bold">
            {mode === "add" ? "Шинэ ажилтан нэмэх" : "Ажилтны мэдээлэл засах"}
          </DialogTitle>
        </DialogHeader>

        {/* Овог / Нэр */}
        <div className="grid grid-cols-2 gap-4 shrink-0">
          <div className="flex flex-col gap-1.5">
            <Label className="text-white text-sm font-medium">Овог</Label>
            <Input
              value={form.lastName}
              onChange={(e) => updateField("lastName", e.target.value)}
              placeholder="Дорж"
              className="bg-transparent border-slate-700/60 rounded-2xl px-4 py-3 h-auto text-slate-300 text-sm placeholder:text-slate-600 focus-visible:ring-0 focus-visible:border-slate-500 transition-colors"
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label className="text-white text-sm font-medium">Нэр</Label>
            <Input
              value={form.firstName}
              onChange={(e) => updateField("firstName", e.target.value)}
              placeholder="Дуламрагчаа"
              className="bg-transparent border-slate-700/60 rounded-2xl px-4 py-3 h-auto text-slate-300 text-sm placeholder:text-slate-600 focus-visible:ring-0 focus-visible:border-slate-500 transition-colors"
            />
          </div>
        </div>

        {/* Имэйл */}
        <div className="flex flex-col gap-1.5 shrink-0">
          <Label className="text-white text-sm font-medium">Имэйл</Label>
          <Input
            value={form.email}
            onChange={(e) => updateField("email", e.target.value)}
            placeholder="Dorj@company.com"
            className="bg-transparent border-slate-700/60 rounded-2xl px-4 py-3 h-auto text-slate-300 text-sm placeholder:text-slate-600 focus-visible:ring-0 focus-visible:border-slate-500 transition-colors"
          />
        </div>

        {/* Хэлтэс / Албан тушаал */}
        <div className="grid grid-cols-2 gap-4 shrink-0">
          <div className="flex flex-col gap-1.5">
            <Label className="text-white text-sm font-medium">Хэлтэс</Label>
            <Select
              value={form.department}
              onValueChange={(v) => updateField("department", v)}>
              <SelectTrigger className="bg-transparent cursor-pointer border-slate-700/60 rounded-2xl px-4 py-3 h-auto text-slate-300 text-sm focus:ring-0 focus:border-slate-500  [&>svg]:text-slate-400">
                <SelectValue placeholder="Хэлтэс сонгох" />
              </SelectTrigger>
              <SelectContent className="bg-[#0d1117] border-slate-700/60 rounded-xl">
                {DEPARTMENTS.map((d) => (
                  <SelectItem
                    key={d}
                    value={d}
                    className="text-slate-300 focus:bg-slate-800 focus:text-white cursor-pointer rounded-lg">
                    {d}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="flex flex-col gap-1.5">
            <Label className="text-white text-sm font-medium">
              Албан тушаал
            </Label>
            <Input
              value={form.jobTitle}
              onChange={(e) => updateField("jobTitle", e.target.value)}
              placeholder="Junior Engineer"
              className="bg-transparent border-slate-700/60 rounded-2xl px-4 py-3 h-auto text-slate-300 text-sm placeholder:text-slate-600 focus-visible:ring-0 focus-visible:border-slate-500 transition-colors"
            />
          </div>
        </div>

        {/* Файл хавсаргах */}
        <div className="flex flex-col gap-1.5 flex-1 min-h-0">
          <Label className="text-white text-sm font-medium shrink-0">
            Файл хавсаргах
          </Label>
          <input
            ref={fileRef}
            type="file"
            className="hidden"
            accept=".jpg,.jpeg,.png,.pdf,.mp4"
            onChange={(e) => setFile(e.target.files?.[0] ?? null)}
          />
          <div
            onDragOver={(e) => {
              e.preventDefault();
              setDragging(true);
            }}
            onDragLeave={() => setDragging(false)}
            onDrop={(e) => {
              e.preventDefault();
              setDragging(false);
              const f = e.dataTransfer.files?.[0];
              if (f) setFile(f);
            }}
            onClick={() => fileRef.current?.click()}
            className={`flex-1 rounded-2xl border-2 border-dashed flex flex-col items-center justify-center gap-2 cursor-pointer transition-colors ${
              dragging
                ? "border-emerald-500/60 bg-emerald-500/5"
                : "border-slate-700/50 hover:border-slate-600/60"
            }`}>
            <Upload />
            {file ? (
              <p className="text-emerald-400 text-sm font-semibold px-4 text-center">
                {file.name}
              </p>
            ) : (
              <>
                <p className="text-white text-sm font-semibold">
                  Файл хавсаргах (Заавал биш)
                </p>
                <p className="text-muted-foreground text-xs">
                  JPEG, PNG, PDG, and MP4 formats, up to 50MB
                </p>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    fileRef.current?.click();
                  }}
                  className="mt-1 cursor-pointer rounded-xl border-slate-600/60 bg-transparent text-slate-300 hover:bg-slate-800/50 hover:text-white hover:border-slate-500">
                  Оруулах
                </Button>
              </>
            )}
          </div>
        </div>

        <div className="flex items-center justify-end gap-3">
          <Button
            onClick={onClose}
            className="px-6 py-2.5 h-auto rounded-2xl border-slate-600/50 bg-transparent cursor-pointer text-slate-300 hover:bg-slate-800/40 hover:text-white hover:border-slate-500">
            Татгалзах
          </Button>
          <Button
            onClick={() => void onSave(form)}
            disabled={saving}
            className="flex items-center gap-2 px-6 py-2.5 cursor-pointer h-auto rounded-2xl bg-emerald-500 hover:bg-emerald-400 disabled:opacity-60 text-black font-bold shadow-lg shadow-emerald-500/20">
            <svg width="14" height="14" fill="none" viewBox="0 0 24 24">
              <path
                d="M12 5v14M5 12h14"
                stroke="currentColor"
                strokeWidth="2.4"
                strokeLinecap="round"
              />
            </svg>
            {saving
              ? "Хадгалж байна..."
              : mode === "add"
                ? "Нэмэх"
                : "Хадгалах"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

// ── Employee Card ──────────────────────────────────────
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
              {employee.jobTitle || formatLevel(employee.level)}
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
            {employee.email || "Имэйл байхгүй"}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <BuildingIcon />
          <span className="px-2 py-0.5 rounded-md bg-slate-700/50 text-slate-300 text-xs">
            {formatDepartment(employee.department)}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <LockIcon />
          <span className="text-slate-400 text-xs">
            {formatBranch(employee.branch)}
          </span>
        </div>
      </div>

      <div className="h-px bg-slate-800/60" />

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          <CalIcon />
          <span className="text-slate-500 text-xs">
            Орсон: {employee.hireDate}
          </span>
        </div>
        <button
          onClick={() => onEdit(employee)}
          className="h-7 px-3 rounded-lg border border-slate-700/50 text-slate-400 text-xs hover:text-white hover:border-slate-500 transition-colors">
          Засах
        </button>
      </div>
    </div>
  );
}

// ── Main Component ─────────────────────────────────────
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

  const totalActive = employees.filter((e) => e.status === "Ирсэн").length;
  const totalOnLeave = employees.filter((e) => e.status === "Чөлөөтэй").length;
  const totalNewThisMonth = employees.filter((e) => {
    const hireDate = new Date(e.hireDate);
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
    <div className="min-h-screen bg-[#080c12] text-white font-sans flex flex-col gap-5 p-0">
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

      {/* Stats */}
      <div
        className="grid gap-4"
        style={{ gridTemplateColumns: "1.4fr 1fr 1fr" }}>
        <div className="rounded-2xl border border-slate-700/40 bg-linear-to-br from-green-700/30 to-black p-5">
          <p className="text-slate-500 text-xs font-semibold uppercase tracking-widest mb-3">
            Нийт ажилчид
          </p>
          <div className="flex items-end justify-between">
            <div>
              <div className="flex items-center gap-3">
                <p className="text-6xl font-bold text-white">
                  {employees.length}
                </p>
                <span className="px-2 py-1 rounded-lg bg-emerald-500/15 text-emerald-400 text-xs font-semibold">
                  Бодит өгөгдөл
                </span>
              </div>
              <p className="text-slate-500 text-sm mt-1">
                Backend ажилтны жагсаалт
              </p>
            </div>
            <div className="w-12 h-12 rounded-xl bg-emerald-500/20 flex items-center justify-center">
              <HiredIcon />
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-cyan-600/30 bg-linear-to-br from-cyan-600/15 to-transparent p-5">
          <p className="text-slate-500 text-xs font-semibold uppercase tracking-widest mb-3">
            Идэвхтэй
          </p>
          <div className="w-10 h-10 rounded-xl bg-cyan-500/20 flex items-center justify-center mb-3">
            <ActiveIconn />
          </div>
          <p className="text-5xl font-bold text-white">{totalActive}</p>
        </div>

        <div className="flex flex-col gap-4">
          <div className="rounded-2xl border border-emerald-600/30 bg-linear-to-br from-emerald-600/15 to-transparent p-4 flex-1">
            <p className="text-slate-500 text-xs uppercase tracking-widest mb-2">
              Энэ сар
            </p>
            <div className="w-9 h-9 rounded-xl bg-emerald-500/20 flex items-center justify-center mb-2">
              <HiredIcon />
            </div>
            <p className="text-4xl font-bold text-white">{totalNewThisMonth}</p>
          </div>
          <div className="rounded-2xl border border-purple-600/30 bg-linear-to-br from-purple-600/15 to-transparent p-4 flex-1">
            <p className="text-slate-500 text-xs uppercase tracking-widest mb-2">
              Чөлөөтэй
            </p>
            <div className="w-9 h-9 rounded-xl bg-purple-500/20 flex items-center justify-center mb-2">
              <AbsentIcon />
            </div>
            <p className="text-4xl font-bold text-white">{totalOnLeave}</p>
          </div>
        </div>
      </div>

      {/* Search + Filter */}
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2 bg-[#0d1117] border border-slate-700/50 rounded-xl px-3 py-2.5 flex-1 max-w-xs">
          <SearchIcon />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="bg-transparent text-slate-300 text-sm outline-none placeholder:text-slate-600 w-full"
            placeholder="Нэр, имэйл, код..."
          />
        </div>
        <div className="flex items-center gap-2 ml-auto">
          <button className="flex items-center gap-2 px-3 py-2 rounded-xl bg-[#0d1117] border border-slate-700/50 text-slate-300 text-sm hover:bg-slate-800 transition-colors">
            <FilterIcon /> Бүгд
          </button>
          <button className="flex items-center gap-2 px-3 py-2 rounded-xl bg-[#0d1117] border border-slate-700/50 text-slate-300 text-sm hover:bg-slate-800 transition-colors">
            <LockIcon /> Бүгд
          </button>
        </div>
      </div>

      {error && (
        <div className="rounded-xl border border-red-500/20 bg-red-500/5 px-4 py-3 text-sm text-red-400">
          {error}
        </div>
      )}

      <p className="text-slate-500 text-sm">Нийт {filtered.length} ажилтан</p>

      {loading ? (
        <div className="py-12 flex items-center justify-center gap-3 text-slate-500 text-sm">
          <span className="w-4 h-4 border-2 border-slate-700 border-t-slate-400 rounded-full animate-spin" />
          Ажилтнуудыг уншиж байна...
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
          Ажилтан нэмэх
        </button>
      </div>
    </div>
  );
}

export default WorkersComponent;
