"use client";
import { useState } from "react";
import {
  AcepptedIcon,
  DocIcon,
  DocIconn,
  DownloadIcon,
  FilterIcon,
  PreviewIcon,
  RejectedIcon,
  ReqIcon,
  ScrollIcon,
  SearchIcon,
} from "./icons";

// ── Types ──────────────────────────────────────────────
type Row = {
  initials: string;
  avatarColor: string;
  name: string;
  empId: string;
  dept: string;
  status: string;
  requestTitle: string;
  startDate: string;
  endDate: string;
  totalDays: string;
  remainingLeave: string;
  reason: string;
};

// ── Avatar ─────────────────────────────────────────────
const Avatar = ({ initials, color }: { initials: string; color: string }) => (
  <div
    className={`w-11 h-11 rounded-xl ${color} flex items-center justify-center font-bold text-white text-sm flex-shrink-0`}
  >
    {initials}
  </div>
);

// ── Status Badge ───────────────────────────────────────
const StatusBadge = ({ status }: { status: string }) => {
  const styles: Record<string, string> = {
    "Хүлээгдэж буй":
      "bg-yellow-600/30 text-yellow-400 border border-yellow-600/40",
    Яаралтай: "bg-yellow-600/30 text-yellow-400 border border-yellow-600/40",
    Батласан: "bg-green-600/30 text-green-400 border border-green-600/40",
    Татгалзсан: "bg-red-600/30 text-red-400 border border-red-600/40",
  };
  return (
    <span
      className={`text-xs px-3 py-1 rounded-full font-medium whitespace-nowrap ${styles[status] ?? ""}`}
    >
      {status}
    </span>
  );
};

const eyeStyleMap: Record<string, string> = {
  Яаралтай: "border-yellow-600/40 text-yellow-500 bg-yellow-500/10",
  "Хүлээгдэж буй": "border-blue-500/40 text-blue-400 bg-blue-500/10",
  Батласан: "border-green-500/40 text-green-400 bg-green-500/10",
  Татгалзсан: "border-red-500/40 text-red-400 bg-red-500/10",
};

// ── Preview Modal ──────────────────────────────────────
const PreviewModal = ({ row, onClose }: { row: Row; onClose: () => void }) => {
  const [note, setNote] = useState("");

  return (
    /* backdrop */
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm"
      onClick={onClose}
    >
      {/* panel */}
      <div
        className="relative w-[420px] max-w-[95vw] bg-[#0f1520] rounded-3xl border border-slate-700/60 shadow-2xl p-6 flex flex-col gap-5"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            {/* Profile photo placeholder — circular */}
            <div className="w-14 h-14 rounded-full bg-slate-700 overflow-hidden flex-shrink-0">
              <div
                className={`w-full h-full ${row.avatarColor} flex items-center justify-center text-white font-bold text-lg`}
              >
                {row.initials}
              </div>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <p className="text-white font-bold text-xl">{row.name}</p>
                <StatusBadge status={row.status} />
              </div>
              <p className="text-slate-400 text-sm mt-0.5">
                {row.empId} • {row.dept}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white transition-colors text-xl leading-none mt-1"
          >
            ✕
          </button>
        </div>

        {/* Divider */}
        <div className="h-px bg-slate-700/50" />

        {/* Request details block */}
        <div className="bg-[#161d2b] rounded-2xl p-4 flex flex-col gap-4">
          <p className="text-white font-semibold text-base">
            {row.requestTitle}
          </p>

          <div className="grid grid-cols-2 gap-y-4">
            <div>
              <p className="text-slate-500 text-xs mb-1">Эхлэх өдөр</p>
              <p className="text-white text-sm font-medium">{row.startDate}</p>
            </div>
            <div>
              <p className="text-slate-500 text-xs mb-1">Дуусах өдөр</p>
              <p className="text-white text-sm font-medium">{row.endDate}</p>
            </div>
            <div>
              <p className="text-slate-500 text-xs mb-1">Нийт өдөр</p>
              <p className="text-[#0ad4b1] text-sm font-semibold">
                {row.totalDays}
              </p>
            </div>
            <div>
              <p className="text-slate-500 text-xs mb-1">Үлдсэн амралт</p>
              <p className="text-white text-sm font-medium">
                {row.remainingLeave}
              </p>
            </div>
            <div className="col-span-2">
              <p className="text-slate-500 text-xs mb-1">Шалтгаан</p>
              <p className="text-white text-sm font-medium">{row.reason}</p>
            </div>
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

        {/* Action buttons */}
        <div className="flex items-center justify-end gap-3 mt-1">
          <button
            onClick={onClose}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl border border-red-500/50 text-red-400 text-sm font-medium hover:bg-red-500/10 transition-colors"
          >
            <span>✕</span> Татгалзах
          </button>
          <button className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#0ad4b1] text-black text-sm font-medium hover:bg-[#08bfa0] transition-colors">
            <span>✓</span> Батлах
          </button>
        </div>
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
  row: Row;
  onPreview: (row: Row) => void;
  divider?: boolean;
}) => (
  <>
    <div className="flex items-center justify-between px-5 py-3.5 hover:bg-slate-800/30 transition-colors cursor-pointer">
      <div className="flex items-center gap-3">
        <Avatar initials={row.initials} color={row.avatarColor} />
        <div>
          <p className="text-white font-semibold text-sm">{row.name}</p>
          <p className="text-slate-500 text-xs">
            {row.empId} • {row.dept}
          </p>
        </div>
      </div>
      <div className="flex items-center gap-3">
        <StatusBadge status={row.status} />
        <button
          onClick={() => onPreview(row)}
          className={`w-9 h-9 flex items-center justify-center rounded-xl border transition-colors ${eyeStyleMap[row.status] ?? "border-slate-700 text-slate-400"}`}
        >
          {/* Eye icon */}
          <PreviewIcon />
        </button>
      </div>
    </div>
    {divider && <div className="h-px bg-slate-800/60" />}
  </>
);

// ── Main Component ─────────────────────────────────────
export const RequestsComponent = () => {
  const [activeTab, setActiveTab] = useState("Бүгд");
  const [previewRow, setPreviewRow] = useState<Row | null>(null);

  const tabs = [
    { label: "Бүгд", count: 7 },
    { label: "Чөлөө", count: 3 },
    { label: "Баримт", count: 2 },
    { label: "Бусад", count: 2 },
  ];

  const rows: Row[] = [
    {
      initials: "БЭ",
      avatarColor: "bg-cyan-500",
      name: "Бат-Эрдэнэ Дорж",
      empId: "EMP-0042",
      dept: "Engineering",
      status: "Яаралтай",
      requestTitle: "Ээлжийн амралт",
      startDate: "2026-02-01",
      endDate: "2026-02-14",
      totalDays: "10 хоног",
      remainingLeave: "15 хоног",
      reason: "Гэр бүлийн амралт",
    },
    {
      initials: "СБ",
      avatarColor: "bg-purple-500",
      name: "Сарангэрэл Болд",
      empId: "EMP-0028",
      dept: "HR",
      status: "Яаралтай",
      requestTitle: "Өвчний чөлөө",
      startDate: "2026-02-05",
      endDate: "2026-02-07",
      totalDays: "3 хоног",
      remainingLeave: "12 хоног",
      reason: "Эмчилгээ хийлгэх",
    },
    {
      initials: "ОН",
      avatarColor: "bg-teal-500",
      name: "Оюунчимэг Нямдорж",
      empId: "EMP-0016",
      dept: "Finance",
      status: "Хүлээгдэж буй",
      requestTitle: "Тусгай чөлөө",
      startDate: "2026-02-18",
      endDate: "2026-02-20",
      totalDays: "3 хоног",
      remainingLeave: "20 хоног",
      reason: "Хувийн хэрэг",
    },
    {
      initials: "ГБ",
      avatarColor: "bg-blue-600",
      name: "Ганбат Энхбаяр",
      empId: "EMP-0033",
      dept: "Engineering",
      status: "Батласан",
      requestTitle: "Цалингийн тодорхойлолт",
      startDate: "2026-01-20",
      endDate: "2026-01-20",
      totalDays: "1 өдөр",
      remainingLeave: "—",
      reason: "Зээлийн баримт бэлдэх",
    },
    {
      initials: "МД",
      avatarColor: "bg-orange-500",
      name: "Мөнхдалай Дорж",
      empId: "EMP-0051",
      dept: "Design",
      status: "Батласан",
      requestTitle: "Ээлжийн амралт",
      startDate: "2026-01-10",
      endDate: "2026-01-17",
      totalDays: "8 хоног",
      remainingLeave: "7 хоног",
      reason: "Амралт",
    },
    {
      initials: "ТГ",
      avatarColor: "bg-pink-500",
      name: "Төгөлдөр Ганчимэг",
      empId: "EMP-0019",
      dept: "Marketing",
      status: "Батласан",
      requestTitle: "Эрхлэх өргөдөл",
      startDate: "2026-01-22",
      endDate: "2026-01-22",
      totalDays: "1 өдөр",
      remainingLeave: "—",
      reason: "Банкны лавлагаа",
    },
    {
      initials: "НБ",
      avatarColor: "bg-indigo-500",
      name: "Нарантуяа Батжаргал",
      empId: "EMP-0007",
      dept: "HR",
      status: "Батласан",
      requestTitle: "Өвчний чөлөө",
      startDate: "2026-01-08",
      endDate: "2026-01-09",
      totalDays: "2 өдөр",
      remainingLeave: "18 хоног",
      reason: "Ханиад томуу",
    },
  ];

  return (
    <div className="min-h-screen bg-[#080c12] text-white font-sans p-6 flex flex-col gap-4">
      {/* Preview Modal */}
      {previewRow && (
        <PreviewModal row={previewRow} onClose={() => setPreviewRow(null)} />
      )}

      {/* Top Summary Cards */}
      <div className="grid grid-cols-3 gap-4">
        <div className="rounded-2xl border border-blue-500/50 bg-gradient-to-br from-blue-600/25 to-transparent p-5 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-blue-500/30 flex items-center justify-center flex-shrink-0">
              <ReqIcon />
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-5xl font-bold">7</span>
              <span className="text-slate-400 text-lg">Хүсэлтүүд</span>
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-green-500/50 bg-gradient-to-br from-green-600/25 to-transparent p-5 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-green-500/30 flex items-center justify-center flex-shrink-0">
              <AcepptedIcon />
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-5xl font-bold">2</span>
              <span className="text-slate-400 text-lg">Батласан</span>
            </div>
          </div>
          <ScrollIcon />
        </div>

        <div className="rounded-2xl border border-red-500/50 bg-gradient-to-br from-red-600/25 to-transparent p-5 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-red-500/30 flex items-center justify-center flex-shrink-0">
              <RejectedIcon />
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-5xl font-bold">1</span>
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
              placeholder="Ажилтаны кодоор хайх"
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
                }`}
              >
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
          {rows.map((row, i) => (
            <RequestRow
              key={i}
              row={row}
              onPreview={setPreviewRow}
              divider={i < rows.length - 1}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default RequestsComponent;
