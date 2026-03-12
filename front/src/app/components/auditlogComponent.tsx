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
type DocItem = { name: string; size?: string; type?: string };
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
      { name: "Хөдөлмөрийн гэрээ", size: "245 KB", type: "PDF" },
      { name: "Нууцын гэрээ", size: "128 KB", type: "PDF" },
      { name: "Ажлын байрны тодорхойлолт", size: "89 KB", type: "DOCX" },
      { name: "Туршилтаар авах тушаал", size: "312 KB", type: "PDF" },
    ],
  },
  {
    name: "Сарангэрэл Болд",
    action: "Дэвшүүлэх",
    actionColor: "bg-blue-500/20 text-blue-400 border border-blue-500/30",
    date: "6/15/2024 2:22:45 PM",
    docCount: 1,
    docs: [{ name: "Үндсэн цалин нэмэх тушаал", size: "198 KB", type: "PDF" }],
  },
  {
    name: "Тэмүүлэн Ганбаатар",
    action: "Ажлаас гарах",
    actionColor: "bg-red-500/20 text-red-400 border border-red-500/30",
    date: "1/10/2025 10:30:00 AM",
    docCount: 2,
    docs: [
      { name: "Тойрох хуудас", size: "156 KB", type: "PDF" },
      { name: "Ажлаас чөлөөлөх тушаал", size: "203 KB", type: "DOCX" },
    ],
  },
  {
    name: "Оюунчимэг Нямдорж",
    action: "Албан тушаал өөрчлөх",
    actionColor: "bg-cyan-500/20 text-cyan-400 border border-cyan-500/30",
    date: "9/1/2024 11:45:12 AM",
    docCount: 3,
    docs: [
      { name: "Шинэ гэрээ", size: "274 KB", type: "PDF" },
      { name: "Дэвшүүлэх тушаал", size: "91 KB", type: "PDF" },
      { name: "Цалингийн тодорхойлолт", size: "143 KB", type: "DOCX" },
    ],
  },
];

// ── Inline Icons ───────────────────────────────────────
const EyeIcon = () => (
  <svg width="14" height="14" fill="none" viewBox="0 0 24 24">
    <path
      d="M1 12s4-7 11-7 11 7 11 7-4 7-11 7S1 12 1 12z"
      stroke="currentColor"
      strokeWidth="1.6"
    />
    <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="1.6" />
  </svg>
);

const DownloadIcon = () => (
  <svg width="14" height="14" fill="none" viewBox="0 0 24 24">
    <path
      d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M7 10l5 5 5-5M12 15V3"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

const CloseIcon = () => (
  <svg width="18" height="18" fill="none" viewBox="0 0 24 24">
    <path
      d="M18 6L6 18M6 6l12 12"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
    />
  </svg>
);

const DocBigIcon = () => (
  <svg width="48" height="48" fill="none" viewBox="0 0 24 24">
    <rect
      x="4"
      y="3"
      width="16"
      height="18"
      rx="2"
      stroke="#60a5fa"
      strokeWidth="1.4"
    />
    <path
      d="M8 8h8M8 12h8M8 16h5"
      stroke="#60a5fa"
      strokeWidth="1.4"
      strokeLinecap="round"
    />
  </svg>
);

const CheckIcon = () => (
  <svg width="16" height="16" fill="none" viewBox="0 0 24 24">
    <path
      d="M20 6L9 17l-5-5"
      stroke="currentColor"
      strokeWidth="2.2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

// ── Preview Modal ──────────────────────────────────────
const PreviewModal = ({
  doc,
  onClose,
}: {
  doc: DocItem;
  onClose: () => void;
}) => (
  <div
    className="fixed inset-0 z-50 flex items-center justify-center bg-black/65 backdrop-blur-sm"
    onClick={onClose}
  >
    <div
      className="w-[480px] max-w-[95vw] bg-[#0f1520] rounded-3xl border border-slate-700/50 shadow-2xl overflow-hidden"
      onClick={(e) => e.stopPropagation()}
    >
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-slate-700/40">
        <div className="flex items-center gap-3">
          <DocBigIcon />
          <div>
            <p className="text-white font-semibold text-base">{doc.name}</p>
            <p className="text-slate-500 text-xs mt-0.5">
              {doc.type} • {doc.size}
            </p>
          </div>
        </div>
        <button
          onClick={onClose}
          className="text-slate-400 hover:text-white transition-colors"
        >
          <CloseIcon />
        </button>
      </div>

      {/* Preview area */}
      <div className="bg-[#080c12] mx-6 my-5 rounded-2xl border border-slate-700/30 h-56 flex flex-col items-center justify-center gap-3">
        <div className="w-16 h-16 rounded-2xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center">
          <DocBigIcon />
        </div>
        <p className="text-slate-400 text-sm font-medium">{doc.name}</p>
        <p className="text-slate-600 text-xs">Урьдчилан харах боломжгүй</p>
      </div>

      {/* Meta */}
      <div className="px-6 pb-5 flex flex-col gap-2">
        <div className="grid grid-cols-2 gap-3">
          {[
            { label: "Файлын төрөл", value: doc.type ?? "—" },
            { label: "Хэмжээ", value: doc.size ?? "—" },
            { label: "Статус", value: "Баталгаажсан" },
            { label: "Огноо", value: "2024-01-15" },
          ].map(({ label, value }) => (
            <div key={label} className="bg-slate-800/30 rounded-xl px-3 py-2.5">
              <p className="text-slate-500 text-[10px] mb-0.5">{label}</p>
              <p
                className={`text-sm font-medium ${value === "Баталгаажсан" ? "text-emerald-400" : "text-slate-200"}`}
              >
                {value === "Баталгаажсан" && (
                  <span className="inline-flex items-center gap-1">
                    <svg width="11" height="11" fill="none" viewBox="0 0 24 24">
                      <circle
                        cx="12"
                        cy="12"
                        r="9"
                        stroke="currentColor"
                        strokeWidth="2"
                      />
                      <path
                        d="M7.5 12l3 3 6-6"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                    {value}
                  </span>
                )}
                {value !== "Баталгаажсан" && value}
              </p>
            </div>
          ))}
        </div>

        {/* Actions */}
        <div className="flex gap-3 mt-2">
          <button
            onClick={onClose}
            className="flex-1 py-2.5 rounded-xl border border-slate-600/50 text-slate-300 text-sm hover:bg-slate-800/50 transition-colors"
          >
            Хаах
          </button>
          <button className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black text-sm font-semibold transition-colors">
            <DownloadIcon /> Татах
          </button>
        </div>
      </div>
    </div>
  </div>
);

// ── Download Modal ─────────────────────────────────────
const DownloadModal = ({
  doc,
  onClose,
}: {
  doc: DocItem;
  onClose: () => void;
}) => {
  const [downloading, setDownloading] = useState(false);
  const [done, setDone] = useState(false);

  const startDownload = () => {
    setDownloading(true);
    setTimeout(() => {
      setDownloading(false);
      setDone(true);
    }, 1800);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/65 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="w-[380px] max-w-[95vw] bg-[#0f1520] rounded-3xl border border-slate-700/50 shadow-2xl p-6 flex flex-col gap-5"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between">
          <h2 className="text-white font-bold text-lg">Файл татах</h2>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white transition-colors"
          >
            <CloseIcon />
          </button>
        </div>

        {/* Doc info */}
        <div className="flex items-center gap-3 bg-slate-800/30 rounded-2xl p-4">
          <div className="w-12 h-12 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center flex-shrink-0">
            <DocBigIcon />
          </div>
          <div>
            <p className="text-white font-semibold text-sm">{doc.name}</p>
            <p className="text-slate-500 text-xs mt-0.5">
              {doc.type} • {doc.size}
            </p>
          </div>
        </div>

        {/* Progress / Done */}
        {!done ? (
          <>
            {downloading && (
              <div className="flex flex-col gap-2">
                <div className="flex items-center justify-between">
                  <span className="text-slate-400 text-xs">Татаж байна...</span>
                  <span className="text-slate-400 text-xs">{doc.size}</span>
                </div>
                <div className="w-full h-1.5 rounded-full bg-slate-700 overflow-hidden">
                  <div
                    className="h-full bg-emerald-500 rounded-full animate-[progress_1.8s_ease-in-out_forwards]"
                    style={{
                      animation: "width 1.8s ease-in-out",
                      width: downloading ? "100%" : "0%",
                      transition: "width 1.8s ease-in-out",
                    }}
                  />
                </div>
              </div>
            )}
            <div className="flex gap-3">
              <button
                onClick={onClose}
                className="flex-1 py-2.5 rounded-xl border border-slate-600/50 text-slate-300 text-sm hover:bg-slate-800/50 transition-colors"
              >
                Татгалзах
              </button>
              <button
                onClick={startDownload}
                disabled={downloading}
                className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 disabled:opacity-60 text-black text-sm font-semibold transition-colors"
              >
                <DownloadIcon />
                {downloading ? "Татаж байна..." : "Татах"}
              </button>
            </div>
          </>
        ) : (
          <div className="flex flex-col items-center gap-3 py-2">
            <div className="w-12 h-12 rounded-full bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
              <CheckIcon />
            </div>
            <p className="text-white font-semibold">Амжилттай татагдлаа!</p>
            <p className="text-slate-500 text-sm text-center">
              {doc.name} файл таны төхөөрөмжид хадгалагдлаа.
            </p>
            <button
              onClick={onClose}
              className="w-full py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black text-sm font-semibold transition-colors mt-1"
            >
              Хаах
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

// ── Accordion Row ──────────────────────────────────────
const LogRow = ({ entry }: { entry: LogEntry }) => {
  const [open, setOpen] = useState(false);
  const [previewDoc, setPreviewDoc] = useState<DocItem | null>(null);
  const [downloadDoc, setDownloadDoc] = useState<DocItem | null>(null);

  return (
    <>
      {previewDoc && (
        <PreviewModal doc={previewDoc} onClose={() => setPreviewDoc(null)} />
      )}
      {downloadDoc && (
        <DownloadModal doc={downloadDoc} onClose={() => setDownloadDoc(null)} />
      )}

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

        {/* Dropdown */}
        {open && (
          <div className="border-t border-slate-700/40 px-5 py-2 flex flex-col bg-[#0a0f18]">
            {entry.docs.map((doc, i) => (
              <div
                key={i}
                className="flex items-center justify-between py-2.5 border-b border-slate-800/50 last:border-0"
              >
                <div className="flex items-center gap-2.5">
                  <DocRowIcon />
                  <div>
                    <span className="text-slate-300 text-sm">{doc.name}</span>
                    {doc.size && (
                      <span className="ml-2 text-slate-600 text-xs">
                        {doc.type} • {doc.size}
                      </span>
                    )}
                  </div>
                </div>
                {/* Action buttons */}
                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => setPreviewDoc(doc)}
                    className="w-7 h-7 flex items-center justify-center rounded-lg border border-slate-700/50 text-slate-400 hover:text-blue-400 hover:border-blue-500/40 hover:bg-blue-500/10 transition-colors"
                    title="Харах"
                  >
                    <EyeIcon />
                  </button>
                  <button
                    onClick={() => setDownloadDoc(doc)}
                    className="w-7 h-7 flex items-center justify-center rounded-lg border border-slate-700/50 text-slate-400 hover:text-emerald-400 hover:border-emerald-500/40 hover:bg-emerald-500/10 transition-colors"
                    title="Татах"
                  >
                    <DownloadIcon />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </>
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
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium border cursor-pointer transition-all ${
              activeTab === tab
                ? "bg-[#0ad4b1] text-black border-[#0ad4b1]"
                : "text-slate-400 border-slate-700/50 hover:text-slate-200"
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

      {/* Footer */}
      <div className="rounded-2xl border border-slate-700/40 bg-[#0d1117] mt-2">
        <div className="grid grid-cols-3 divide-x divide-slate-700/40 py-5">
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
