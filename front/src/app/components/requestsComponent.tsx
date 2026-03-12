"use client";
import { useEffect, useState } from "react";
import {
  AcepptedIcon,
  DownloadIcon,
  FilterIcon,
  PreviewIcon,
  RejectedIcon,
  ReqIcon,
  ScrollIcon,
  SearchIcon,
} from "./icons";
import {
  fetchLeaveRequests,
  approveLeaveRequest,
  rejectLeaveRequest,
} from "@/lib/api";
import type { LeaveRequest } from "@/lib/types";

// ── Status Badge ───────────────────────────────────────
const StatusBadge = ({ status }: { status: string }) => {
  const styles: Record<string, string> = {
    pending: "bg-yellow-600/30 text-yellow-400 border border-yellow-600/40",
    approved: "bg-green-600/30 text-green-400 border border-green-600/40",
    rejected: "bg-red-600/30 text-red-400 border border-red-600/40",
  };
  const labels: Record<string, string> = {
    pending: "Хүлээгдэж буй",
    approved: "Батласан",
    rejected: "Татгалзсан",
  };
  return (
    <span
      className={`text-xs px-3 py-1 rounded-full font-medium whitespace-nowrap ${styles[status] ?? "bg-slate-600/30 text-slate-400"}`}>
      {labels[status] ?? status}
    </span>
  );
};

const eyeStyleMap: Record<string, string> = {
  pending: "border-yellow-600/40 text-yellow-500 bg-yellow-500/10",
  approved: "border-green-500/40 text-green-400 bg-green-500/10",
  rejected: "border-red-500/40 text-red-400 bg-red-500/10",
};

function getInitials(firstName: string, lastName: string) {
  return `${lastName.charAt(0)}${firstName.charAt(0)}`;
}

const avatarColors = [
  "bg-cyan-500",
  "bg-purple-500",
  "bg-teal-500",
  "bg-blue-600",
  "bg-orange-500",
  "bg-pink-500",
  "bg-indigo-500",
];
function avatarColor(str: string) {
  let h = 0;
  for (let i = 0; i < str.length; i++)
    h = (h * 31 + str.charCodeAt(i)) & 0xffffffff;
  return avatarColors[Math.abs(h) % avatarColors.length];
}

// ── Preview Modal ──────────────────────────────────────
const PreviewModal = ({
  row,
  onClose,
  onApprove,
  onReject,
}: {
  row: LeaveRequest;
  onClose: () => void;
  onApprove: (id: string, note: string) => Promise<void>;
  onReject: (id: string, note: string) => Promise<void>;
}) => {
  const [note, setNote] = useState(row.note ?? "");
  const [acting, setActing] = useState(false);

  const initials = getInitials(row.employee.firstName, row.employee.lastName);
  const color = avatarColor(row.employeeId);

  async function handleApprove() {
    setActing(true);
    await onApprove(row.id, note);
    setActing(false);
    onClose();
  }

  async function handleReject() {
    setActing(true);
    await onReject(row.id, note);
    setActing(false);
    onClose();
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm"
      onClick={onClose}>
      <div
        className="relative w-[420px] max-w-[95vw] bg-[#0f1520] rounded-3xl border border-slate-700/60 shadow-2xl p-6 flex flex-col gap-5"
        onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="w-14 h-14 rounded-full overflow-hidden shrink-0">
              <div
                className={`w-full h-full ${color} flex items-center justify-center text-white font-bold text-lg`}>
                {initials}
              </div>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <p className="text-white font-bold text-xl">
                  {row.employee.lastName} {row.employee.firstName}
                </p>
                <StatusBadge status={row.status} />
              </div>
              <p className="text-slate-400 text-sm mt-0.5">
                {row.employee.employeeCode} • {row.employee.department}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white transition-colors text-xl leading-none mt-1">
            ✕
          </button>
        </div>

        <div className="h-px bg-slate-700/50" />

        {/* Request details */}
        <div className="bg-[#161d2b] rounded-2xl p-4 flex flex-col gap-4">
          <p className="text-white font-semibold text-base">{row.type}</p>
          <div className="grid grid-cols-2 gap-y-4">
            <div>
              <p className="text-slate-500 text-xs mb-1">Эхлэх цаг</p>
              <p className="text-white text-sm font-medium">{row.startTime}</p>
            </div>
            <div>
              <p className="text-slate-500 text-xs mb-1">Дуусах цаг</p>
              <p className="text-white text-sm font-medium">{row.endTime}</p>
            </div>
            <div>
              <p className="text-slate-500 text-xs mb-1">Илгээсэн огноо</p>
              <p className="text-[#0ad4b1] text-sm font-semibold">
                {new Date(row.createdAt).toLocaleDateString("mn-MN")}
              </p>
            </div>
            <div>
              <p className="text-slate-500 text-xs mb-1">Албан тушаал</p>
              <p className="text-white text-sm font-medium">
                {row.employee.jobTitle}
              </p>
            </div>
            {row.reason && (
              <div className="col-span-2">
                <p className="text-slate-500 text-xs mb-1">Шалтгаан</p>
                <p className="text-white text-sm font-medium">{row.reason}</p>
              </div>
            )}
          </div>
        </div>

        {/* Note textarea */}
        <div className="flex flex-col gap-2">
          <p className="text-white font-semibold text-base">
            Тайлбар{" "}
            <span className="text-slate-500 font-normal">(Заавал биш)</span>
          </p>
          <textarea
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="Энд бичнэ үү..."
            rows={3}
            className="w-full bg-[#161d2b] border border-slate-700/50 rounded-2xl px-4 py-3 text-slate-300 text-sm placeholder:text-slate-600 outline-none resize-none focus:border-blue-500/50 transition-colors"
          />
        </div>

        {/* Action buttons — only show for pending */}
        {row.status === "pending" ? (
          <div className="flex items-center justify-end gap-3 mt-1">
            <button
              onClick={handleReject}
              disabled={acting}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl border border-red-500/50 text-red-400 text-sm font-medium hover:bg-red-500/10 disabled:opacity-50 transition-colors">
              <span>✕</span> Татгалзах
            </button>
            <button
              onClick={handleApprove}
              disabled={acting}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#0ad4b1] text-black text-sm font-medium hover:bg-[#08bfa0] disabled:opacity-50 transition-colors">
              <span>✓</span> {acting ? "Түр хүлээнэ үү..." : "Батлах"}
            </button>
          </div>
        ) : (
          <p className="text-center text-slate-500 text-sm">
            Энэ хүсэлт аль хэдийн <StatusBadge status={row.status} />
          </p>
        )}
      </div>
    </div>
  );
};

// ── Request Row ────────────────────────────────────────
const RequestRow = ({
  row,
  onPreview,
  divider = true,
}: {
  row: LeaveRequest;
  onPreview: (row: LeaveRequest) => void;
  divider?: boolean;
}) => {
  const initials = getInitials(row.employee.firstName, row.employee.lastName);
  const color = avatarColor(row.employeeId);

  return (
    <>
      <div className="flex items-center justify-between px-5 py-3.5 hover:bg-slate-800/30 transition-colors cursor-pointer">
        <div className="flex items-center gap-3">
          <div
            className={`w-11 h-11 rounded-xl ${color} flex items-center justify-center font-bold text-white text-sm shrink-0`}>
            {initials}
          </div>
          <div>
            <p className="text-white font-semibold text-sm">
              {row.employee.lastName} {row.employee.firstName}
            </p>
            <p className="text-slate-500 text-xs">
              {row.employee.employeeCode} • {row.employee.department}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-slate-400 text-xs hidden sm:block">
            {row.type}
          </span>
          <StatusBadge status={row.status} />
          <button
            onClick={() => onPreview(row)}
            className={`w-9 h-9 flex items-center justify-center rounded-xl border transition-colors ${eyeStyleMap[row.status] ?? "border-slate-700 text-slate-400"}`}>
            <PreviewIcon />
          </button>
        </div>
      </div>
      {divider && <div className="h-px bg-slate-800/60" />}
    </>
  );
};

// ── Main Component ─────────────────────────────────────
export const RequestsComponent = () => {
  const [activeTab, setActiveTab] = useState("Бүгд");
  const [search, setSearch] = useState("");
  const [previewRow, setPreviewRow] = useState<LeaveRequest | null>(null);
  const [requests, setRequests] = useState<LeaveRequest[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchLeaveRequests()
      .then(setRequests)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  async function handleApprove(id: string, note: string) {
    try {
      const updated = await approveLeaveRequest(id, note);
      setRequests((prev) => prev.map((r) => (r.id === id ? updated : r)));
    } catch (e) {
      console.error(e);
    }
  }

  async function handleReject(id: string, note: string) {
    try {
      const updated = await rejectLeaveRequest(id, note);
      setRequests((prev) => prev.map((r) => (r.id === id ? updated : r)));
    } catch (e) {
      console.error(e);
    }
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const pendingCount = requests.filter((r) => r.status === "pending").length;
  const approvedCount = requests.filter((r) => r.status === "approved").length;
  const rejectedCount = requests.filter((r) => r.status === "rejected").length;

  const filtered = requests.filter((r) => {
    const matchTab =
      activeTab === "Бүгд"
        ? true
        : activeTab === "Чөлөө"
          ? true // all types for now
          : activeTab === "Батласан"
            ? r.status === "approved"
            : activeTab === "Татгалзсан"
              ? r.status === "rejected"
              : true;
    const matchSearch =
      !search ||
      r.employee.firstName.toLowerCase().includes(search.toLowerCase()) ||
      r.employee.lastName.toLowerCase().includes(search.toLowerCase()) ||
      r.employee.employeeCode.toLowerCase().includes(search.toLowerCase());
    return matchTab && matchSearch;
  });

  const tabs = [
    { label: "Бүгд", count: requests.length },
    { label: "Чөлөө", count: requests.length },
    { label: "Батласан", count: approvedCount },
    { label: "Татгалзсан", count: rejectedCount },
  ];

  return (
    <div className="min-h-screen bg-[#080c12] text-white font-sans p-6 flex flex-col gap-4">
      {previewRow && (
        <PreviewModal
          row={previewRow}
          onClose={() => setPreviewRow(null)}
          onApprove={handleApprove}
          onReject={handleReject}
        />
      )}

      {/* Summary Cards */}
      <div className="grid grid-cols-3 gap-4">
        <div className="rounded-2xl border border-blue-500/50 bg-linear-to-br from-blue-600/25 to-transparent p-5 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-blue-500/30 flex items-center justify-center shrink-0">
              <ReqIcon />
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-5xl font-bold">
                {loading ? "—" : requests.length}
              </span>
              <span className="text-slate-400 text-lg">Хүсэлтүүд</span>
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-green-500/50 bg-linear-to-br from-green-600/25 to-transparent p-5 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-green-500/30 flex items-center justify-center shrink-0">
              <AcepptedIcon />
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-5xl font-bold">
                {loading ? "—" : approvedCount}
              </span>
              <span className="text-slate-400 text-lg">Батласан</span>
            </div>
          </div>
          <ScrollIcon />
        </div>

        <div className="rounded-2xl border border-red-500/50 bg-linear-to-br from-red-600/25 to-transparent p-5 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-red-500/30 flex items-center justify-center shrink-0">
              <RejectedIcon />
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-5xl font-bold">
                {loading ? "—" : rejectedCount}
              </span>
              <span className="text-slate-400 text-lg">Татгалзсан</span>
            </div>
          </div>
          <ScrollIcon />
        </div>
      </div>

      {/* List Container */}
      <div className="rounded-2xl border border-blue-500/50 bg-[#0b0f18] overflow-hidden">
        {/* Filter Bar */}
        <div className="flex items-center gap-3 px-5 py-4 flex-wrap">
          <div className="flex items-center gap-2 bg-[#0d1117] border border-slate-700/50 rounded-xl px-3 py-2 min-w-[230px]">
            <SearchIcon />
            <input
              className="bg-transparent text-slate-400 text-sm outline-none placeholder:text-slate-600 w-full"
              placeholder="Ажилтаны нэр эсвэл кодоор хайх"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          <div className="flex items-center gap-1.5">
            {tabs.map((tab) => (
              <button
                key={tab.label}
                onClick={() => setActiveTab(tab.label)}
                className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                  activeTab === tab.label
                    ? "bg-[#0ad4b1] text-black"
                    : "bg-[#0d1117] border border-slate-700/50 text-slate-400 hover:text-slate-200"
                }`}>
                {tab.label} ({tab.count})
              </button>
            ))}
          </div>

          <div className="flex items-center gap-2 ml-auto">
            <button className="flex items-center gap-2 px-3 py-2 rounded-xl bg-[#0d1117] border border-slate-700/50 text-slate-300 text-sm hover:bg-slate-800 transition-colors">
              <FilterIcon />
              Шүүлтүүр
            </button>
            <button className="flex items-center gap-2 px-3 py-2 rounded-xl bg-[#0d1117] border border-slate-700/50 text-slate-300 text-sm hover:bg-slate-800 transition-colors">
              <DownloadIcon />
              Татах
            </button>
          </div>
        </div>

        <div className="h-px bg-blue-500/40" />

        <div className="flex flex-col">
          {loading ? (
            <div className="py-12 flex items-center justify-center gap-3 text-slate-500 text-sm">
              <span className="w-4 h-4 border-2 border-slate-700 border-t-slate-400 rounded-full animate-spin" />
              Уншиж байна...
            </div>
          ) : filtered.length === 0 ? (
            <div className="py-12 text-center text-slate-500 text-sm">
              Хүсэлт олдсонгүй
            </div>
          ) : (
            filtered.map((row, i) => (
              <RequestRow
                key={row.id}
                row={row}
                onPreview={setPreviewRow}
                divider={i < filtered.length - 1}
              />
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default RequestsComponent;
