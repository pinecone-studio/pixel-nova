"use client";
import { useState } from "react";
import {
  CheckCircle,
  ChevronDown,
  DocRowIcon,
  PaperclipIcon,
  SearchIcon,
} from "./icons";

// ── Types ──────────────────────────────────────────────
type DocItem = { name: string };
type LogEntry = {
  name: string;
  action: string;
  actionColor: string;
  date: string;
  docCount: number;
  docs: DocItem[];
};

// ── Data ───────────────────────────────────────────────
const logs: LogEntry[] = [
  {
    name: "Бат-Эрдэнэ Дорж",
    action: "Ажилтан нэмэх",
    actionColor:
      "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30",
    date: "2/24/2024 9:15:32 AM",
    docCount: 4,
    docs: [
      { name: "Хөдөлмөрийн гэрээ" },
      { name: "Нууцын гэрээ" },
      { name: "Ажлын байрны тодорхойлолт" },
      { name: "Туршилтаар авах тушаал" },
    ],
  },
  {
    name: "Сарангэрэл Болд",
    action: "Дэвшүүлэх",
    actionColor: "bg-blue-500/20 text-blue-400 border border-blue-500/30",
    date: "6/15/2024 2:22:45 PM",
    docCount: 1,
    docs: [{ name: "Үндсэн цалин нэмэх тушаал" }],
  },
  {
    name: "Тэмүүлэн Ганбаатар",
    action: "Ажлаас гарах",
    actionColor: "bg-red-500/20 text-red-400 border border-red-500/30",
    date: "1/10/2025 10:30:00 AM",
    docCount: 2,
    docs: [{ name: "Тойрох хуудас" }, { name: "Ажлаас чөлөөлөх тушаал" }],
  },
  {
    name: "Оюунчимэг Нямдорж",
    action: "Албан тушаал өөрчлөх",
    actionColor: "bg-cyan-500/20 text-cyan-400 border border-cyan-500/30",
    date: "9/1/2024 11:45:12 AM",
    docCount: 3,
    docs: [
      { name: "Шинэ гэрээ" },
      { name: "Дэвшүүлэх тушаал" },
      { name: "Цалингийн тодорхойлолт" },
    ],
  },
];

// ── Icons ──────────────────────────────────────────────

// ── Accordion Row ──────────────────────────────────────
const LogRow = ({ entry }: { entry: LogEntry }) => {
  const [open, setOpen] = useState(false);

  return (
    <div className="rounded-2xl border border-slate-700/40 bg-[#0d1117] overflow-hidden">
      {/* Header */}
      <button
        onClick={() => setOpen((o) => !o)}
        className="w-full flex items-center justify-between px-5 py-4 hover:bg-slate-800/30 transition-colors"
      >
        <div className="flex items-center gap-4">
          <CheckCircle />
          <div className="text-left">
            <div className="flex items-center gap-2.5 flex-wrap">
              <span className="text-white font-semibold text-sm">
                {entry.name}
              </span>
              <span
                className={`text-xs px-2.5 py-0.5 rounded-full font-medium ${entry.actionColor}`}
              >
                {entry.action}
              </span>
              <span className="text-slate-500 text-xs">{entry.date}</span>
            </div>
            <div className="flex items-center gap-1.5 mt-1">
              <PaperclipIcon />
              <span className="text-slate-500 text-xs">
                {entry.docCount} баримт үүсгэгдэв
              </span>
            </div>
          </div>
        </div>
        <ChevronDown open={open} />
      </button>

      {/* Dropdown content */}
      {open && (
        <div className="border-t border-slate-700/40 px-5 py-3 flex flex-col gap-2 bg-[#0a0f18]">
          {entry.docs.map((doc, i) => (
            <div
              key={i}
              className="flex items-center gap-2.5 py-2 border-b border-slate-800/50 last:border-0"
            >
              <DocRowIcon />
              <span className="text-slate-300 text-sm">{doc.name}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

// ── Main Component ─────────────────────────────────────
export const AuditlogComponent = () => {
  const [activeTab, setActiveTab] = useState("Бүгд");
  const [search, setSearch] = useState("");

  const tabs = ["Бүгд", "Амжилттай", "Алдаа"];

  const successCount = logs.length;
  const errorCount = 0;

  const filtered = logs.filter((l) =>
    l.name.toLowerCase().includes(search.toLowerCase()),
  );

  return (
    <div className="min-h-screen bg-[#080c12] text-white font-sans flex flex-col gap-4 p-0">
      {/* Search */}
      <div className="flex items-center gap-2 bg-[#0d1117] border border-slate-700/50 rounded-xl px-4 py-2.5">
        <SearchIcon />
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="bg-transparent text-slate-300 text-sm outline-none placeholder:text-slate-600 w-full"
          placeholder="Ажилтан нэрээр хайх..."
        />
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2">
        {tabs.map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium border border-gray-500 cursor-pointer transition-all ${
              activeTab === tab
                ? "bg-[#0ad4b1] text-black"
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            {tab !== "Бүгд" && (
              <svg width="14" height="14" fill="none" viewBox="0 0 24 24">
                {tab === "Амжилттай" ? (
                  <>
                    <circle
                      cx="12"
                      cy="12"
                      r="9"
                      stroke="currentColor"
                      strokeWidth="1.8"
                    />
                    <path
                      d="M7.5 12l3 3 6-6"
                      stroke="currentColor"
                      strokeWidth="1.8"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </>
                ) : (
                  <>
                    <circle
                      cx="12"
                      cy="12"
                      r="9"
                      stroke="currentColor"
                      strokeWidth="1.8"
                    />
                    <path
                      d="M9 9l6 6M15 9l-6 6"
                      stroke="currentColor"
                      strokeWidth="1.8"
                      strokeLinecap="round"
                    />
                  </>
                )}
              </svg>
            )}
            {tab}
          </button>
        ))}
      </div>

      {/* Log rows */}
      <div className="flex flex-col gap-3">
        {filtered.map((entry, i) => (
          <LogRow key={i} entry={entry} />
        ))}
      </div>

      {/* Footer summary */}
      <div className="rounded-2xl border border-slate-700/40 bg-[#0d1117] mt-2">
        <div className="grid grid-cols-3 divide-x divide-slate-700/40 px-0 py-5">
          <div className="flex flex-col items-center gap-1 px-6">
            <span className="text-slate-500 text-sm">Нийт үйлдэл</span>
            <span className="text-white text-2xl font-bold">{logs.length}</span>
          </div>
          <div className="flex flex-col items-center gap-1 px-6">
            <span className="text-slate-500 text-sm">Амжилттай</span>
            <span className="text-emerald-400 text-2xl font-bold">
              {successCount}
            </span>
          </div>
          <div className="flex flex-col items-center gap-1 px-6">
            <span className="text-slate-500 text-sm">Алдаа</span>
            <span className="text-red-400 text-2xl font-bold">
              {errorCount}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuditlogComponent;
