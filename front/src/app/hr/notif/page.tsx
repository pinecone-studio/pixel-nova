"use client";

import { BellIcon } from "@/components/icons";
import { Trash2Icon } from "lucide-react";
import { useState } from "react";

// ── Types ──────────────────────────────────────────────
type NotifStatus = "Нийтлэгдсэн" | "Ноорог" | "Төлөвлөсөн";

type Notif = {
  id: string;
  title: string;
  body: string;
  status: NotifStatus;
  audience: string;
  date?: string;
  views?: number;
};

// ── Icons ──────────────────────────────────────────────

function CheckCircleIcon() {
  return (
    <svg width="22" height="22" fill="none" viewBox="0 0 24 24">
      <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.8" />
      <path
        d="M7.5 12l3 3 6-6"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function ClockIcon() {
  return (
    <svg width="22" height="22" fill="none" viewBox="0 0 24 24">
      <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.8" />
      <path
        d="M12 7v5l3 3"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function EditIcon() {
  return (
    <svg width="15" height="15" fill="none" viewBox="0 0 24 24">
      <path
        d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function UserIcon() {
  return (
    <svg
      width="13"
      height="13"
      fill="none"
      viewBox="0 0 24 24"
      className="text-slate-500 flex-shrink-0"
    >
      <path
        d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
      />
      <circle cx="12" cy="7" r="4" stroke="currentColor" strokeWidth="1.6" />
    </svg>
  );
}

function CalSmIcon() {
  return (
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
}

function EyeSmIcon() {
  return (
    <svg
      width="13"
      height="13"
      fill="none"
      viewBox="0 0 24 24"
      className="text-slate-500 flex-shrink-0"
    >
      <path
        d="M1 12s4-7 11-7 11 7 11 7-4 7-11 7S1 12 1 12z"
        stroke="currentColor"
        strokeWidth="1.6"
      />
      <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="1.6" />
    </svg>
  );
}

function PlusIcon() {
  return (
    <svg width="15" height="15" fill="none" viewBox="0 0 24 24">
      <path
        d="M12 5v14M5 12h14"
        stroke="currentColor"
        strokeWidth="2.2"
        strokeLinecap="round"
      />
    </svg>
  );
}

function ChevronDownIcon() {
  return (
    <svg
      width="14"
      height="14"
      fill="none"
      viewBox="0 0 24 24"
      className="text-slate-400 pointer-events-none"
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
}

function CloseIcon() {
  return (
    <svg width="18" height="18" fill="none" viewBox="0 0 24 24">
      <path
        d="M18 6L6 18M6 6l12 12"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
    </svg>
  );
}

// ── Status badge ───────────────────────────────────────
function StatusBadge({ status }: { status: NotifStatus }) {
  const styles: Record<NotifStatus, string> = {
    Нийтлэгдсэн:
      "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30",
    Ноорог: "bg-slate-500/20 text-slate-400 border border-slate-500/30",
    Төлөвлөсөн: "bg-cyan-500/20 text-cyan-400 border border-cyan-500/30",
  };
  return (
    <span
      className={`text-xs px-2.5 py-0.5 rounded-full font-medium ${styles[status]}`}
    >
      {status}
    </span>
  );
}

// ── New Notif Modal ────────────────────────────────────
const AUDIENCES = [
  "Бүх ажилчид",
  "HR хэлтэс",
  "Инженерүүд",
  "Санхүү",
  "Маркетинг",
];

function NewNotifModal({
  onClose,
  onSave,
}: {
  onClose: () => void;
  onSave: (n: Omit<Notif, "id">) => void;
}) {
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [audience, setAudience] = useState("Бүх ажилчид");

  function handleSubmit() {
    if (!title.trim()) return;
    onSave({
      title: title.trim(),
      body: body.trim(),
      status: "Нийтлэгдсэн",
      audience,
      date: new Date().toLocaleDateString("mn-MN"),
      views: 0,
    });
    onClose();
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="mt-14 mr-4 bg-[#0d1117] rounded-2xl border border-slate-700/50 shadow-2xl flex flex-col gap-5 p-6 "
        style={{ width: 500, height: 485 }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between">
          <h2 className="text-white text-lg font-bold">Шинэ мэдэгдэл</h2>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white transition-colors cursor-pointer"
          >
            <CloseIcon />
          </button>
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="text-white text-sm font-medium">Гарчиг</label>
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Мэдэгдлийн гарчиг"
            className="w-full bg-transparent border border-slate-700/60 rounded-xl px-4 py-2.5 text-slate-300 text-sm placeholder:text-slate-600 outline-none focus:border-slate-500 transition-colors"
          />
        </div>

        {/* Агуулга */}
        <div className="flex flex-col gap-1.5">
          <label className="text-white text-sm font-medium">Агуулга</label>
          <textarea
            value={body}
            onChange={(e) => setBody(e.target.value)}
            placeholder="Мэдэгдлийн агуулга"
            rows={4}
            className="w-full bg-transparent border border-slate-700/60 rounded-xl px-4 py-2.5 text-slate-300 text-sm placeholder:text-slate-600 outline-none focus:border-slate-500 transition-colors resize-none"
          />
        </div>

        {/* Хүлээн авагчид */}
        <div className="flex flex-col gap-1.5">
          <label className="text-white text-sm font-medium">
            Хүлээн авагчид
          </label>
          <div className="relative">
            <select
              value={audience}
              onChange={(e) => setAudience(e.target.value)}
              className="w-full appearance-none bg-[#0a0f18] border border-slate-700/60 rounded-xl px-4 py-2.5 text-slate-300 text-sm outline-none focus:border-slate-500 transition-colors pr-9"
            >
              {AUDIENCES.map((a) => (
                <option key={a} value={a} className="bg-[#0d1117]">
                  {a}
                </option>
              ))}
            </select>
            <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
              <ChevronDownIcon />
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-end gap-3 pt-1">
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl border border-slate-600/50 text-slate-300 text-sm hover:bg-slate-800/40 transition-colors cursor-pointer"
          >
            Болих
          </button>
          <button
            onClick={handleSubmit}
            className="flex items-center gap-2 px-5 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black text-sm font-bold transition-colors cursor-pointer"
          >
            <PlusIcon />
            Илгээх
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Notification Row ───────────────────────────────────
function NotifRow({
  notif,
  onDelete,
}: {
  notif: Notif;
  onDelete: (id: string) => void;
}) {
  return (
    <div className="rounded-2xl border border-slate-700/40 bg-[#0d1117] px-5 py-4 flex items-start gap-4 hover:border-slate-600/50 transition-colors">
      {/* Icon */}
      <div className="w-10 h-10 rounded-xl bg-emerald-500/15 border border-emerald-500/20 flex items-center justify-center text-emerald-400 flex-shrink-0 mt-0.5">
        <BellIcon />
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2.5 flex-wrap mb-1">
          <p className="text-white font-semibold text-sm">{notif.title}</p>
          <StatusBadge status={notif.status} />
        </div>
        <p className="text-slate-400 text-sm leading-relaxed line-clamp-2 mb-2">
          {notif.body}
        </p>
        <div className="flex items-center gap-4 flex-wrap">
          <div className="flex items-center gap-1.5">
            <UserIcon />
            <span className="text-slate-500 text-xs">{notif.audience}</span>
          </div>
          {notif.date && (
            <div className="flex items-center gap-1.5">
              <CalSmIcon />
              <span className="text-slate-500 text-xs">{notif.date}</span>
            </div>
          )}
          {notif.views !== undefined && (
            <div className="flex items-center gap-1.5">
              <EyeSmIcon />
              <span className="text-slate-500 text-xs">
                {notif.views} үзсэн
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-2 flex-shrink-0">
        <button className="w-8 h-8 flex items-center justify-center rounded-lg text-slate-400 hover:text-white hover:bg-slate-700/50 transition-colors">
          <EditIcon />
        </button>
        <button
          onClick={() => onDelete(notif.id)}
          className="w-8 h-8 flex items-center justify-center rounded-lg text-slate-400 hover:text-red-400 hover:bg-red-500/10 transition-colors"
        >
          <Trash2Icon className="w-5 h-5 text-red-500 cursor-pointer" />
        </button>
      </div>
    </div>
  );
}

// ── Page ───────────────────────────────────────────────
const INITIAL_NOTIFS: Notif[] = [
  {
    id: "1",
    title: "Шинэ жилийн баяр",
    body: "Эрхэм хамт олон та бүхэндээ шинэ жилийн мэндийг хүргэе. Шинэ жилийн амралт 2024 оны 12-р сарын 31-ээс 2025 оны 1-р сарын 2 хүртэл байна.",
    status: "Нийтлэгдсэн",
    audience: "Бүх ажилчид",
    date: "12/25/2024",
    views: 89,
  },
  {
    id: "2",
    title: "Системийн шинэчлэл",
    body: "EPAS систем 2024 оны 1-р сарын 15-нд шинэчлэгдэнэ. Шинэчлэлт хийгдэх үед систем 2 цагийн турш ашиглах боломжгүй байна.",
    status: "Нийтлэгдсэн",
    audience: "HR хэлтэс",
    date: "1/10/2024",
    views: 12,
  },
  {
    id: "3",
    title: "Жилийн эцсийн урамшуулал",
    body: "2024 оны жилийн эцсийн урамшуулал 12-р сарын 20-нд олгогдоно.",
    status: "Ноорог",
    audience: "Бүх ажилчид",
  },
  {
    id: "4",
    title: "Эрүүл мэндийн үзлэг",
    body: "2024 оны эрүүл мэндийн үзлэг 2-р сарын 1-10-ны хооронд явагдана. Бүх ажилчид заавал хамрагдана уу.",
    status: "Төлөвлөсөн",
    audience: "Бүх ажилчид",
  },
];

export default function NotificationsPage() {
  const [notifs, setNotifs] = useState<Notif[]>(INITIAL_NOTIFS);
  const [showModal, setShowModal] = useState(false);

  const totalCount = notifs.length;
  const publishedCount = notifs.filter(
    (n) => n.status === "Нийтлэгдсэн",
  ).length;
  const scheduledCount = notifs.filter((n) => n.status === "Төлөвлөсөн").length;

  function handleAdd(data: Omit<Notif, "id">) {
    setNotifs((prev) => [{ id: crypto.randomUUID(), ...data }, ...prev]);
  }

  function handleDelete(id: string) {
    setNotifs((prev) => prev.filter((n) => n.id !== id));
  }

  return (
    <div className="min-h-screen bg-[#080c12] text-white font-sans">
      {showModal && (
        <NewNotifModal onClose={() => setShowModal(false)} onSave={handleAdd} />
      )}

      <div className="p-6 flex flex-col gap-6">
        {/* Stats */}
        <div className="grid grid-cols-3 gap-4">
          {/* Нийт */}
          <div className="rounded-2xl border border-slate-700/40 bg-gradient-to-br from-emerald-600/15 to-transparent p-5 flex items-center gap-4">
            <div className="w-11 h-11 rounded-xl bg-emerald-500/20 flex items-center justify-center text-emerald-400 flex-shrink-0">
              <BellIcon />
            </div>
            <div>
              <p className="text-white text-4xl font-bold">{totalCount}</p>
              <p className="text-slate-400 text-sm mt-0.5">Нийт мэдэгдэл</p>
            </div>
          </div>

          {/* Нийтлэгдсэн */}
          <div className="rounded-2xl border border-slate-700/40 bg-gradient-to-br from-cyan-600/15 to-transparent p-5 flex items-center gap-4">
            <div className="w-11 h-11 rounded-xl bg-cyan-500/20 flex items-center justify-center text-cyan-400 flex-shrink-0">
              <CheckCircleIcon />
            </div>
            <div>
              <p className="text-white text-4xl font-bold">{publishedCount}</p>
              <p className="text-slate-400 text-sm mt-0.5">Нийтлэгдсэн</p>
            </div>
          </div>

          {/* Төлөвлөсөн */}
          <div className="rounded-2xl border border-slate-700/40 bg-gradient-to-br from-blue-600/15 to-transparent p-5 flex items-center gap-4">
            <div className="w-11 h-11 rounded-xl bg-blue-500/20 flex items-center justify-center text-blue-400 flex-shrink-0">
              <ClockIcon />
            </div>
            <div>
              <p className="text-white text-4xl font-bold">{scheduledCount}</p>
              <p className="text-slate-400 text-sm mt-0.5">Төлөвлөсөн</p>
            </div>
          </div>
        </div>

        {/* List header */}
        <div className="flex items-center justify-between">
          <p className="text-white text-xl font-bold">Мэдэгдлүүд</p>
          <button
            onClick={() => setShowModal(true)}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black text-sm font-bold transition-colors shadow-lg shadow-emerald-500/20"
          >
            <PlusIcon />
            Шинэ мэдэгдэл
          </button>
        </div>

        {/* List */}
        <div className="flex flex-col gap-3">
          {notifs.map((notif) => (
            <NotifRow key={notif.id} notif={notif} onDelete={handleDelete} />
          ))}
        </div>
      </div>
    </div>
  );
}
