"use client";
import { useState, useRef } from "react";

// ── Types ──────────────────────────────────────────────
type Employee = {
  initials: string;
  color: string;
  name: string;
  role: string;
  empId: string;
  email: string;
  phone: string;
  dept: string;
  status: "Ирсэн" | "Тасалсан" | "Чөлөөтэй";
  joinDate: string;
};

// ── Data ──────────────────────────────────────────────
const initialEmployees: Employee[] = [
  {
    initials: "БЭ",
    color: "bg-cyan-500",
    name: "Бат-Эрдэнэ Дорж",
    role: "Senior Engineer",
    empId: "EMP-8842",
    email: "bat.erdene@company.mn",
    phone: "+976 9999-9999",
    dept: "Engineering",
    status: "Ирсэн",
    joinDate: "2/24/2024",
  },
  {
    initials: "СБ",
    color: "bg-purple-500",
    name: "Сарангэрэл Болд",
    role: "HR Manager",
    empId: "EMP-8820",
    email: "sarangerel.bold@company.mn",
    phone: "+976 8888-8888",
    dept: "HR",
    status: "Ирсэн",
    joinDate: "6/15/2023",
  },
  {
    initials: "ГБ",
    color: "bg-orange-500",
    name: "Ганхуяг Ганболд",
    role: "Sales Representative",
    empId: "EMP-8838",
    email: "ganhuag.ganbold@company.mn",
    phone: "+976 7777-7777",
    dept: "Sales",
    status: "Тасалсан",
    joinDate: "1/10/2024",
  },
  {
    initials: "ОН",
    color: "bg-teal-500",
    name: "Оюунчимэг Нямдорж",
    role: "Finance Director",
    empId: "EMP-8815",
    email: "oyunchimeg.nyamdorj@company.mn",
    phone: "+976 9900-9900",
    dept: "Finance",
    status: "Ирсэн",
    joinDate: "9/1/2022",
  },
];

const DEPTS = ["Engineering", "HR", "Sales", "Finance", "Marketing", "Design"];

const statusStyle: Record<string, string> = {
  Ирсэн: "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30",
  Тасалсан: "bg-red-500/20 text-red-400 border border-red-500/30",
  Чөлөөтэй: "bg-blue-500/20 text-blue-400 border border-blue-500/30",
};

// ── Icons ──────────────────────────────────────────────
const SearchIcon = () => (
  <svg
    width="15"
    height="15"
    fill="none"
    viewBox="0 0 24 24"
    className="text-slate-500 flex-shrink-0"
  >
    <circle cx="11" cy="11" r="8" stroke="currentColor" strokeWidth="1.6" />
    <path
      d="M21 21l-4.35-4.35"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
    />
  </svg>
);
const MailIcon = () => (
  <svg
    width="13"
    height="13"
    fill="none"
    viewBox="0 0 24 24"
    className="text-slate-500 flex-shrink-0"
  >
    <rect
      x="2"
      y="4"
      width="20"
      height="16"
      rx="2"
      stroke="currentColor"
      strokeWidth="1.6"
    />
    <path
      d="M2 8l10 6 10-6"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
    />
  </svg>
);
const PhoneIcon = () => (
  <svg
    width="13"
    height="13"
    fill="none"
    viewBox="0 0 24 24"
    className="text-slate-500 flex-shrink-0"
  >
    <path
      d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07A19.5 19.5 0 013.07 9.81 19.79 19.79 0 01.01 1.18 2 2 0 012 0h3a2 2 0 012 1.72c.127.96.361 1.903.7 2.81a2 2 0 01-.45 2.11L6.09 7.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0122 16.92z"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinejoin="round"
    />
  </svg>
);
const BuildingIcon = () => (
  <svg
    width="13"
    height="13"
    fill="none"
    viewBox="0 0 24 24"
    className="text-slate-500 flex-shrink-0"
  >
    <rect
      x="2"
      y="7"
      width="20"
      height="14"
      rx="1"
      stroke="currentColor"
      strokeWidth="1.6"
    />
    <path
      d="M16 21V5a2 2 0 00-2-2h-4a2 2 0 00-2 2v16"
      stroke="currentColor"
      strokeWidth="1.6"
    />
  </svg>
);
const CalIcon = () => (
  <svg
    width="13"
    height="13"
    fill="none"
    viewBox="0 0 24 24"
    className="text-slate-500 flex-shrink-0"
  >
    <rect
      x="3"
      y="4"
      width="18"
      height="18"
      rx="2"
      stroke="currentColor"
      strokeWidth="1.6"
    />
    <path
      d="M16 2v4M8 2v4M3 10h18"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
    />
  </svg>
);
const FilterIcon = () => (
  <svg
    width="14"
    height="14"
    fill="none"
    viewBox="0 0 24 24"
    className="text-slate-400"
  >
    <path
      d="M22 3H2l8 9.46V19l4 2v-8.54L22 3z"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinejoin="round"
    />
  </svg>
);
const LockIcon = () => (
  <svg
    width="14"
    height="14"
    fill="none"
    viewBox="0 0 24 24"
    className="text-slate-400"
  >
    <rect
      x="3"
      y="11"
      width="18"
      height="11"
      rx="2"
      stroke="currentColor"
      strokeWidth="1.6"
    />
    <path
      d="M7 11V7a5 5 0 0110 0v4"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
    />
  </svg>
);
const UploadIcon = () => (
  <svg
    width="28"
    height="28"
    fill="none"
    viewBox="0 0 24 24"
    className="text-slate-400"
  >
    <path
      d="M12 16V8M12 8l-3 3M12 8l3 3"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M20.39 18.39A5 5 0 0018 9h-1.26A8 8 0 103 16.3"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);
const ChevronDown = () => (
  <svg
    width="14"
    height="14"
    fill="none"
    viewBox="0 0 24 24"
    className="text-slate-400"
  >
    <path
      d="M6 9l6 6 6-6"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

// ── Employee Form Modal ────────────────────────────────
type ModalMode = "add" | "edit";
const EmployeeModal = ({
  mode,
  employee,
  onClose,
  onSave,
}: {
  mode: ModalMode;
  employee?: Employee;
  onClose: () => void;
  onSave: (data: Partial<Employee>) => void;
}) => {
  const fileRef = useRef<HTMLInputElement>(null);
  const [form, setForm] = useState({
    firstName: employee?.name.split(" ")[0] ?? "Дорж",
    lastName: employee?.name.split(" ")[1] ?? "Дуламрагчаа",
    email: employee?.email ?? "Dorj@company.com",
    dept: employee?.dept ?? "Engineering",
    role: employee?.role ?? "Junior Engineer",
  });
  const [file, setFile] = useState<File | null>(null);
  const [dragging, setDragging] = useState(false);

  const set = (k: string, v: string) => setForm((f) => ({ ...f, [k]: v }));

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-end bg-black/50 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="w-[340px] bg-[#0f1520] border-l border-slate-700/50 min-h-screen p-6 flex flex-col gap-5 overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between">
          <h2 className="text-white font-bold text-lg">
            {mode === "add" ? "Шинэ ажилтан нэмэх" : "Ажилтны мэдээлэл засах"}
          </h2>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white transition-colors"
          >
            ✕
          </button>
        </div>

        {/* First / Last name */}
        <div className="grid grid-cols-2 gap-3">
          <div className="flex flex-col gap-1.5">
            <label className="text-slate-400 text-xs">Овог</label>
            <input
              value={form.firstName}
              onChange={(e) => set("firstName", e.target.value)}
              className="bg-transparent border border-slate-700/60 rounded-xl px-3 py-2.5 text-slate-200 text-sm outline-none focus:border-emerald-500/50 transition-colors placeholder:text-slate-600"
              placeholder="Дорж"
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-slate-400 text-xs">Нэр</label>
            <input
              value={form.lastName}
              onChange={(e) => set("lastName", e.target.value)}
              className="bg-transparent border border-slate-700/60 rounded-xl px-3 py-2.5 text-slate-200 text-sm outline-none focus:border-emerald-500/50 transition-colors placeholder:text-slate-600"
              placeholder="Дуламрагчаа"
            />
          </div>
        </div>

        {/* Email */}
        <div className="flex flex-col gap-1.5">
          <label className="text-slate-400 text-xs">Имэйл</label>
          <input
            value={form.email}
            onChange={(e) => set("email", e.target.value)}
            className="w-full bg-transparent border border-slate-700/60 rounded-xl px-3 py-2.5 text-slate-200 text-sm outline-none focus:border-emerald-500/50 transition-colors placeholder:text-slate-600"
            placeholder="Dorj@company.com"
          />
        </div>

        {/* Dept / Role */}
        <div className="grid grid-cols-2 gap-3">
          <div className="flex flex-col gap-1.5">
            <label className="text-slate-400 text-xs">Хэлтэс</label>
            <div className="relative">
              <select
                value={form.dept}
                onChange={(e) => set("dept", e.target.value)}
                className="w-full appearance-none bg-transparent border border-slate-700/60 rounded-xl px-3 py-2.5 text-slate-200 text-sm outline-none focus:border-emerald-500/50 transition-colors pr-8"
              >
                {DEPTS.map((d) => (
                  <option key={d} value={d} className="bg-[#0f1520]">
                    {d}
                  </option>
                ))}
              </select>
              <div className="absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none">
                <ChevronDown />
              </div>
            </div>
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-slate-400 text-xs">Албан тушаал</label>
            <input
              value={form.role}
              onChange={(e) => set("role", e.target.value)}
              className="bg-transparent border border-slate-700/60 rounded-xl px-3 py-2.5 text-slate-200 text-sm outline-none focus:border-emerald-500/50 transition-colors placeholder:text-slate-600"
              placeholder="Junior Engineer"
            />
          </div>
        </div>

        {/* File upload */}
        <div className="flex flex-col gap-1.5">
          <label className="text-slate-400 text-xs">Файл хавсаргах</label>
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
            className={`rounded-2xl border-2 border-dashed p-6 flex flex-col items-center gap-2 cursor-pointer transition-colors ${dragging ? "border-emerald-500/60 bg-emerald-500/5" : "border-slate-700/50 bg-slate-800/10"}`}
          >
            <input
              ref={fileRef}
              type="file"
              className="hidden"
              onChange={(e) => setFile(e.target.files?.[0] ?? null)}
            />
            <UploadIcon />
            {file ? (
              <p className="text-emerald-400 text-xs font-medium text-center">
                {file.name}
              </p>
            ) : (
              <>
                <p className="text-white text-xs font-semibold text-center">
                  Файл хавсаргах (Заавал биш)
                </p>
                <p className="text-slate-600 text-[10px] text-center">
                  JPEG, PNG, PDF, and MP4 formats, up to 50MB
                </p>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    fileRef.current?.click();
                  }}
                  className="mt-1 px-4 py-1.5 rounded-lg border border-slate-600/60 text-slate-300 text-xs hover:border-slate-400 transition-colors"
                >
                  Оруулах
                </button>
              </>
            )}
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-end gap-3 pt-2">
          <button
            onClick={onClose}
            className="px-5 py-2.5 rounded-xl border border-slate-600/50 text-slate-300 text-sm hover:bg-slate-800/50 transition-colors"
          >
            Татгалзах
          </button>
          <button
            onClick={() => {
              onSave({
                name: `${form.firstName} ${form.lastName}`,
                email: form.email,
                dept: form.dept,
                role: form.role,
              });
              onClose();
            }}
            className="flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black text-sm font-semibold transition-colors"
          >
            <svg width="14" height="14" fill="none" viewBox="0 0 24 24">
              <path
                d="M12 5v14M5 12h14"
                stroke="currentColor"
                strokeWidth="2.2"
                strokeLinecap="round"
              />
            </svg>
            Нэмэх
          </button>
        </div>
      </div>
    </div>
  );
};

// ── Employee Card ──────────────────────────────────────
const EmployeeCard = ({
  emp,
  onEdit,
}: {
  emp: Employee;
  onEdit: (e: Employee) => void;
}) => (
  <div className="rounded-2xl border border-slate-700/40 bg-[#0d1117] p-5 flex flex-col gap-3 hover:border-slate-600/60 transition-colors">
    {/* Header */}
    <div className="flex items-start justify-between">
      <div className="flex items-center gap-3">
        <div
          className={`w-11 h-11 rounded-xl ${emp.color} flex items-center justify-center text-white font-bold text-sm flex-shrink-0`}
        >
          {emp.initials}
        </div>
        <div>
          <p className="text-white font-semibold text-sm">{emp.name}</p>
          <p className="text-slate-500 text-xs">{emp.role}</p>
          <p className="text-slate-600 text-xs">{emp.empId}</p>
        </div>
      </div>
      <span
        className={`text-xs px-2.5 py-1 rounded-full font-medium ${statusStyle[emp.status]}`}
      >
        {emp.status === "Ирсэн"
          ? "● "
          : emp.status === "Тасалсан"
            ? "● "
            : "● "}
        {emp.status}
      </span>
    </div>

    {/* Info */}
    <div className="flex flex-col gap-1.5">
      <div className="flex items-center gap-2">
        <MailIcon />
        <span className="text-slate-400 text-xs">{emp.email}</span>
      </div>
      <div className="flex items-center gap-2">
        <PhoneIcon />
        <span className="text-slate-400 text-xs">{emp.phone}</span>
      </div>
      <div className="flex items-center gap-2">
        <BuildingIcon />
        <span className="px-2 py-0.5 rounded-md bg-slate-700/50 text-slate-300 text-xs">
          {emp.dept}
        </span>
      </div>
    </div>

    {/* Divider */}
    <div className="h-px bg-slate-800/60" />

    {/* Footer */}
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-1.5">
        <CalIcon />
        <span className="text-slate-500 text-xs">Орсон: {emp.joinDate}</span>
      </div>
      <div className="flex gap-2">
        <button className="h-7 px-3 rounded-lg border border-slate-700/50 text-slate-400 text-xs hover:text-white hover:border-slate-500 transition-colors">
          Харах
        </button>
        <button
          onClick={() => onEdit(emp)}
          className="h-7 px-3 rounded-lg border border-slate-700/50 text-slate-400 text-xs hover:text-white hover:border-slate-500 transition-colors"
        >
          Засах
        </button>
      </div>
    </div>
  </div>
);

// ── Main Component ─────────────────────────────────────
export const WorkersComponent = () => {
  const [employees, setEmployees] = useState<Employee[]>(initialEmployees);
  const [search, setSearch] = useState("");
  const [showAdd, setShowAdd] = useState(false);
  const [editEmp, setEditEmp] = useState<Employee | null>(null);

  const filtered = employees.filter(
    (e) =>
      e.name.toLowerCase().includes(search.toLowerCase()) ||
      e.email.toLowerCase().includes(search.toLowerCase()) ||
      e.empId.toLowerCase().includes(search.toLowerCase()),
  );

  const totalActive = employees.filter((e) => e.status === "Ирсэн").length;

  return (
    <div className="min-h-screen bg-[#080c12] text-white font-sans flex flex-col gap-5 p-0">
      {/* Modals */}
      {showAdd && (
        <EmployeeModal
          mode="add"
          onClose={() => setShowAdd(false)}
          onSave={(data) =>
            setEmployees((prev) => [
              ...prev,
              {
                initials: (data.name ?? "НН")
                  .split(" ")
                  .map((w) => w[0])
                  .join("")
                  .slice(0, 2)
                  .toUpperCase(),
                color: "bg-emerald-500",
                name: data.name ?? "Шинэ Ажилтан",
                role: data.role ?? "",
                empId: `EMP-${Math.floor(1000 + Math.random() * 9000)}`,
                email: data.email ?? "",
                phone: "+976 0000-0000",
                dept: data.dept ?? "Engineering",
                status: "Ирсэн",
                joinDate: new Date().toLocaleDateString("en-US"),
              },
            ])
          }
        />
      )}
      {editEmp && (
        <EmployeeModal
          mode="edit"
          employee={editEmp}
          onClose={() => setEditEmp(null)}
          onSave={(data) => {
            setEmployees((prev) =>
              prev.map((e) =>
                e.empId === editEmp.empId ? { ...e, ...data } : e,
              ),
            );
          }}
        />
      )}

      {/* Stats row */}
      <div
        className="grid gap-4"
        style={{ gridTemplateColumns: "1.4fr 1fr 1fr" }}
      >
        {/* Total */}
        <div className="rounded-2xl border border-slate-700/40 bg-gradient-to-br from-slate-800/60 to-[#0a0f1a] p-5">
          <p className="text-slate-500 text-xs font-semibold uppercase tracking-widest mb-3">
            Нийт ажилчид
          </p>
          <div className="flex items-end justify-between">
            <div>
              <div className="flex items-center gap-3">
                <p className="text-6xl font-bold text-white">324</p>
                <span className="px-2 py-1 rounded-lg bg-emerald-500/15 text-emerald-400 text-xs font-semibold">
                  ↗ +12%
                </span>
              </div>
              <p className="text-slate-500 text-sm mt-1">Өмнөх сар (289)</p>
              <div className="flex gap-4 mt-4">
                {[
                  ["178", "Sales Marketing"],
                  ["79", "Инженерүүд"],
                  ["67", "Санхүү"],
                ].map(([n, l]) => (
                  <div key={l}>
                    <p className="text-white font-bold text-lg">{n}</p>
                    <p className="text-slate-500 text-xs">{l}</p>
                  </div>
                ))}
              </div>
            </div>
            <div className="w-12 h-12 rounded-xl bg-emerald-500/20 flex items-center justify-center">
              <svg width="24" height="24" fill="none" viewBox="0 0 24 24">
                <path
                  d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"
                  stroke="#4ade80"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                />
                <circle
                  cx="9"
                  cy="7"
                  r="4"
                  stroke="#4ade80"
                  strokeWidth="1.8"
                />
                <path
                  d="M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75"
                  stroke="#4ade80"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                />
              </svg>
            </div>
          </div>
        </div>

        {/* Active */}
        <div className="rounded-2xl border border-cyan-600/30 bg-gradient-to-br from-cyan-600/15 to-transparent p-5">
          <div className="flex items-start justify-between mb-3">
            <p className="text-slate-500 text-xs font-semibold uppercase tracking-widest">
              Идэвхтэй
            </p>
            <span className="px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-400 text-xs font-medium">
              98%
            </span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-cyan-500/20 flex items-center justify-center mb-3">
            <svg width="20" height="20" fill="none" viewBox="0 0 24 24">
              <circle
                cx="12"
                cy="12"
                r="9"
                stroke="#22d3ee"
                strokeWidth="1.8"
              />
              <path
                d="M7.5 12l3 3 6-6"
                stroke="#22d3ee"
                strokeWidth="1.8"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>
          <p className="text-5xl font-bold text-white">312</p>
          <div className="flex gap-4 mt-3">
            {[
              ["178", "Sales Marketing"],
              ["79", "Инженерүүд"],
              ["67", "Санхүү"],
            ].map(([n, l]) => (
              <div key={l}>
                <p className="text-white font-bold">{n}</p>
                <p className="text-slate-500 text-xs">{l}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Right column */}
        <div className="flex flex-col gap-4">
          {/* New this month */}
          <div className="rounded-2xl border border-emerald-600/30 bg-gradient-to-br from-emerald-600/15 to-transparent p-4 flex-1">
            <div className="flex items-start justify-between mb-2">
              <p className="text-slate-500 text-xs uppercase tracking-widest">
                Энэ сар ажилд авсан
              </p>
              <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 text-xs">
                +3 өнөөдөр
              </span>
            </div>
            <div className="w-9 h-9 rounded-xl bg-emerald-500/20 flex items-center justify-center mb-2">
              <svg width="18" height="18" fill="none" viewBox="0 0 24 24">
                <path
                  d="M16 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"
                  stroke="#4ade80"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                />
                <circle
                  cx="8.5"
                  cy="7"
                  r="4"
                  stroke="#4ade80"
                  strokeWidth="1.8"
                />
                <line
                  x1="20"
                  y1="8"
                  x2="20"
                  y2="14"
                  stroke="#4ade80"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                />
                <line
                  x1="23"
                  y1="11"
                  x2="17"
                  y2="11"
                  stroke="#4ade80"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                />
              </svg>
            </div>
            <p className="text-4xl font-bold text-white">18</p>
          </div>
          {/* On leave */}
          <div className="rounded-2xl border border-purple-600/30 bg-gradient-to-br from-purple-600/15 to-transparent p-4 flex-1">
            <div className="flex items-start justify-between mb-2">
              <p className="text-slate-500 text-xs uppercase tracking-widest">
                Чөлөөтэй
              </p>
              <span className="px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-400 text-xs">
                Өнөөдөр
              </span>
            </div>
            <div className="w-9 h-9 rounded-xl bg-purple-500/20 flex items-center justify-center mb-2">
              <svg width="18" height="18" fill="none" viewBox="0 0 24 24">
                <rect
                  x="3"
                  y="4"
                  width="18"
                  height="18"
                  rx="2"
                  stroke="#a78bfa"
                  strokeWidth="1.8"
                />
                <path
                  d="M16 2v4M8 2v4M3 10h18"
                  stroke="#a78bfa"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                />
              </svg>
            </div>
            <p className="text-4xl font-bold text-white">12</p>
          </div>
        </div>
      </div>

      {/* Search + filter */}
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
            <FilterIcon /> Бүгд <ChevronDown />
          </button>
          <button className="flex items-center gap-2 px-3 py-2 rounded-xl bg-[#0d1117] border border-slate-700/50 text-slate-300 text-sm hover:bg-slate-800 transition-colors">
            <LockIcon /> Бүгд <ChevronDown />
          </button>
        </div>
      </div>

      {/* Count */}
      <p className="text-slate-500 text-sm">Нийт {filtered.length} ажилтан</p>

      {/* Employee grid */}
      <div className="grid grid-cols-2 gap-4">
        {filtered.map((emp, i) => (
          <EmployeeCard key={i} emp={emp} onEdit={setEditEmp} />
        ))}
      </div>

      {/* Add button */}
      <div className="flex justify-end mt-2">
        <button
          onClick={() => setShowAdd(true)}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black font-semibold text-sm transition-colors shadow-lg shadow-emerald-500/20"
        >
          <svg width="15" height="15" fill="none" viewBox="0 0 24 24">
            <path
              d="M12 5v14M5 12h14"
              stroke="currentColor"
              strokeWidth="2.2"
              strokeLinecap="round"
            />
          </svg>
          Ажилтан нэмэх
        </button>
      </div>
    </div>
  );
};

export default WorkersComponent;
