"use client";
import { useState, useRef } from "react";
import {
  ActiveIcon,
  CalIcon,
  DocIcon,
  DocIconn,
  DownloadIcon,
  EyeIcon,
  OffboardIcon,
  OnboardIcon,
  PlusIcon,
  ReqIcon,
  SortIcon,
  TrashIcon,
} from "./icons";

const documents = [
  {
    name: "Тойрох хуудас",
    ye: "Ажлаас гарах үе",
    date: "2024-03-15",
    status: "Баталгаажсан",
  },
  {
    name: "Ажлаас чөлөөлөх тушаал",
    ye: "Ажлаас гарах үе",
    date: "2024-03-15",
    status: "Баталгаажсан",
  },
  {
    name: "Үндсэн цалин нэмэх тушаал",
    ye: "Ажлаас гарах үе",
    date: "2024-02-20",
    status: "Баталгаажсан",
  },
  {
    name: "Нууцын гэрээ",
    ye: "Ажлаас гарах үе",
    date: "2024-01-10",
    status: "Баталгаажсан",
  },
  {
    name: "Ажлын байрны тодорхойлолт",
    ye: "Ажлаас гарах үе",
    date: "2024-01-08",
    status: "Баталгаажсан",
    link: true,
  },
  {
    name: "Туршилтаар авах тушаал",
    ye: "Ажлаас гарах үе",
    date: "2024-01-05",
    status: "Баталгаажсан",
  },
  {
    name: "Хөдөлмөрийн гэрээ",
    ye: "Ажлаас гарах үе",
    date: "2024-01-01",
    status: "Баталгаажсан",
  },
];

const stages = [
  {
    label: "Ажилд орох үе",
    sub: "Onboarding",
    count: 4,
    icon: <OnboardIcon />,
    iconBg: "bg-emerald-500",
    border: "border-emerald-600/40",
    bg: "bg-linear-to-br from-green-600/40 to-black",
  },
  {
    label: "Ажиллах үе",
    sub: "Active Employment",
    count: 1,
    icon: <ActiveIcon />,
    iconBg: "bg-cyan-500",
    border: "border-cyan-600/40",
    bg: "bg-linear-to-br from-[#06B6D4]/40 to-black",
  },
  {
    label: "Ажлаас гарах үе",
    sub: "Offboarding",
    count: 2,
    icon: <OffboardIcon />,
    iconBg: "bg-red-500",
    border: "border-red-600/40",
    bg: "bg-linear-to-br from-red-600/40 to-black",
  },
];

const ALL_RECIPIENTS = [
  "hr_team",
  "department_chief",
  "branch_manager",
  "CEO",
  "finance_team",
  "it_team",
];

// ── New Document Modal ─────────────────────────────────
const NewDocModal = ({ onClose }: { onClose: () => void }) => {
  const [docName, setDocName] = useState("");
  const [recipients, setRecipients] = useState<string[]>([
    "hr_team",
    "department_chief",
    "branch_manager",
    "CEO",
  ]);
  const [file, setFile] = useState<File | null>(null);
  const [dragging, setDragging] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const removeRecipient = (r: string) =>
    setRecipients((prev) => prev.filter((x) => x !== r));

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragging(false);
    const f = e.dataTransfer.files?.[0];
    if (f) setFile(f);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/65 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="relative w-[500px] max-w-[95vw] bg-[#0f1520] rounded-3xl border border-slate-700/50 shadow-2xl p-7 flex flex-col gap-6"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between">
          <h2 className="text-white text-xl font-bold">
            Шинэ баримтын мэдээлэл
          </h2>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white transition-colors text-lg leading-none"
          >
            ✕
          </button>
        </div>

        {/* Doc name */}
        <div className="flex flex-col gap-2">
          <label className="text-white text-sm font-medium">Баримтын нэр</label>
          <input
            value={docName}
            onChange={(e) => setDocName(e.target.value)}
            placeholder="Баримтын нэр"
            className="w-full bg-transparent border border-slate-600/60 rounded-xl px-4 py-3 text-slate-300 text-sm placeholder:text-slate-600 outline-none focus:border-emerald-500/60 transition-colors"
          />
        </div>

        {/* Recipients */}
        <div className="flex flex-col gap-2">
          <label className="text-white text-sm font-medium">
            Хүлээн авагчид
          </label>
          <div className="flex flex-wrap gap-2">
            {recipients.map((r) => (
              <span
                key={r}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800/80 border border-slate-600/40 text-slate-300 text-xs font-medium"
              >
                {r}
                <button
                  onClick={() => removeRecipient(r)}
                  className="text-slate-500 hover:text-white transition-colors leading-none"
                >
                  ×
                </button>
              </span>
            ))}
          </div>
        </div>

        {/* File upload */}
        <div className="flex flex-col gap-2">
          <label className="text-white text-sm font-medium">
            Файл хавсаргах
          </label>
          <div
            onDragOver={(e) => {
              e.preventDefault();
              setDragging(true);
            }}
            onDragLeave={() => setDragging(false)}
            onDrop={handleDrop}
            className={`rounded-2xl border-2 border-dashed transition-colors p-8 flex flex-col items-center gap-3 cursor-pointer ${
              dragging
                ? "border-emerald-500/60 bg-emerald-500/5"
                : "border-slate-600/40 bg-slate-800/20"
            }`}
            onClick={() => fileRef.current?.click()}
          >
            <input
              ref={fileRef}
              type="file"
              className="hidden"
              accept=".jpg,.jpeg,.png,.pdf,.mp4"
              onChange={(e) => setFile(e.target.files?.[0] ?? null)}
            />
            {/* Upload cloud icon */}
            <svg
              width="40"
              height="40"
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

            {file ? (
              <p className="text-emerald-400 text-sm font-medium">
                {file.name}
              </p>
            ) : (
              <>
                <p className="text-white text-base font-semibold">
                  Файл хавсаргах(Заавал)
                </p>
                <p className="text-slate-500 text-xs">
                  JPEG, PNG, PDG, and MP4 formats, up to 50MB
                </p>
                <button
                  className="mt-1 px-5 py-2 rounded-xl bg-transparent border border-slate-600/60 text-slate-300 text-sm hover:border-slate-400 transition-colors"
                  onClick={(e) => {
                    e.stopPropagation();
                    fileRef.current?.click();
                  }}
                >
                  Оруулах
                </button>
              </>
            )}
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-end gap-3 mt-1">
          <button
            onClick={onClose}
            className="px-6 py-2.5 rounded-xl border border-slate-600/50 text-slate-300 text-sm font-medium hover:bg-slate-800/50 transition-colors"
          >
            Татгалзах
          </button>
          <button className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black text-sm font-semibold transition-colors">
            <svg width="15" height="15" fill="none" viewBox="0 0 24 24">
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

// ── Main Component ─────────────────────────────────────
export const FilesComponent = () => {
  const [showModal, setShowModal] = useState(false);

  return (
    <div className="flex gap-5 min-h-screen bg-[#080c12] text-white font-sans p-0">
      {showModal && <NewDocModal onClose={() => setShowModal(false)} />}

      {/* ── LEFT PANEL ── */}
      <div className="w-[500px] flex-shrink-0 flex flex-col gap-5">
        <div>
          <p className="text-slate-400 text-lg font-semibold uppercase tracking-widest mb-3">
            Нийт баримт
          </p>
          <div className="rounded-2xl border border-slate-700/40 bg-linear-to-br from-blue-600/40 to-black p-5 flex flex-col justify-between h-44">
            <div className="w-12 h-12 rounded-xl bg-blue-500/20 flex items-center justify-center">
              <ReqIcon />
            </div>
            <div>
              <p className="text-6xl font-bold text-white">7</p>
              <div className="flex items-center justify-between mt-1">
                <p className="text-slate-400 text-sm">Нийт баримт</p>
                <p className="text-emerald-400 text-sm font-semibold">
                  100%{" "}
                  <span className="text-slate-500 font-normal">
                    баталгаажсан
                  </span>
                </p>
              </div>
            </div>
          </div>
        </div>

        <div>
          <p className="text-slate-400 text-lg font-semibold uppercase tracking-widest mb-3">
            Үе шатаар
          </p>
          <div className="flex flex-col gap-8">
            {stages.map((s) => (
              <div
                key={s.label}
                className={`rounded-2xl border w-[415px] h-[88px] ${s.border} ${s.bg} p-4 flex items-center justify-between cursor-pointer hover:brightness-110 transition-all`}
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`w-9 h-9 rounded-xl ${s.iconBg} flex items-center justify-center flex-shrink-0`}
                  >
                    {s.icon}
                  </div>
                  <div>
                    <p className="text-white text-sm font-semibold">
                      {s.label}
                    </p>
                    <p className="text-slate-500 text-xs">{s.sub}</p>
                  </div>
                </div>
                <span className="text-white text-2xl font-bold">{s.count}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── RIGHT PANEL ── */}
      <div className="flex-1 flex flex-col">
        <div className="rounded-2xl border border-slate-700/40 bg-[#0a0f18] overflow-hidden flex-1">
          {/* Header */}
          <div
            className="grid items-center px-5 py-3.5 border-b border-slate-700/40 bg-slate-800/20"
            style={{ gridTemplateColumns: "2fr 1.2fr 1.1fr 1.1fr 0.8fr" }}
          >
            <span className="text-slate-400 font-medium">
              Баримт бичиг <SortIcon />
            </span>
            <span className="text-slate-400 font-medium">Үе</span>
            <span className="text-slate-400 font-medium">
              Огноо <SortIcon />
            </span>
            <span className="text-slate-400 font-medium">Төлөв</span>
            <span className="text-slate-400 font-medium">Үйлдэл</span>
          </div>

          {/* Rows */}
          {documents.map((doc, i) => (
            <div
              key={i}
              className="grid items-center px-5 py-3.5 border-b border-slate-800/50 hover:bg-slate-800/20 transition-colors"
              style={{ gridTemplateColumns: "2fr 1.2fr 1.1fr 1.1fr 0.8fr" }}
            >
              <div className="flex items-center gap-2.5">
                <DocIconn />
                <span
                  className={`text-sm ${doc.link ? "text-emerald-400 underline underline-offset-2 cursor-pointer" : "text-slate-200"}`}
                >
                  {doc.name}
                </span>
              </div>
              <span className="text-slate-400 text-sm">{doc.ye}</span>
              <div className="flex items-center gap-1.5">
                <CalIcon />
                <span className="text-slate-400 text-sm">{doc.date}</span>
              </div>
              <div>
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/15 border border-emerald-500/25 text-emerald-400 text-xs font-medium">
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
                  {doc.status}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <button className="w-7 h-7 flex items-center justify-center rounded-lg text-slate-400 hover:text-white hover:bg-slate-700/50 transition-colors">
                  <EyeIcon />
                </button>
                <button className="w-7 h-7 flex items-center justify-center rounded-lg text-slate-400 hover:text-white hover:bg-slate-700/50 transition-colors">
                  <DownloadIcon />
                </button>
                <button className="w-7 h-7 flex items-center justify-center rounded-lg text-slate-400 hover:text-red-400 hover:bg-red-500/10 transition-colors">
                  <TrashIcon />
                </button>
              </div>
            </div>
          ))}

          <div className="px-5 py-3.5">
            <span className="text-slate-500 text-sm">
              Нийт {documents.length} баримт ({documents.length} шиг)
            </span>
          </div>
        </div>

        <div className="flex justify-end mt-4">
          <button
            onClick={() => setShowModal(true)}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black font-semibold text-sm transition-colors shadow-lg shadow-emerald-500/20"
          >
            <PlusIcon />
            Шинэ баримт
          </button>
        </div>
      </div>
    </div>
  );
};

export default FilesComponent;
