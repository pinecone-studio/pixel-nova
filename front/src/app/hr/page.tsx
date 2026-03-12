"use client";

import { useState } from "react";
import {
  AuditLog,
  ArrowUpRightIcon,
  BriefcaseIcon,
  CalendarIcon,
  CheckIcon,
  ClockIcon,
  CubaIcon,
  DocIcon,
  FileIcon,
  InsightIcon,
  NotifIcon,
  SettingsIcon,
  TrendIcon,
  UsersIcon,
} from "../components/icons";
import { FiFilter } from "react-icons/fi";
import { BiToggleLeft, BiToggleRight } from "react-icons/bi";

import { GrDocument } from "react-icons/gr";

import { RequestsComponent } from "../components/requestsComponent";
import { WorkersComponent } from "../components/workersComponent";
import { FilesComponent } from "../components/filesComponent";
import { AuditlogComponennt } from "../components/auditlogComponent";
import { SettingsComponent } from "../components/settingsComponent";

type NavItem = { key: string; label: string; icon: React.ReactNode };

const navItems: NavItem[] = [
  { key: "dashboard", label: "dashboard", icon: <GrDocument /> },
  { key: "users", label: "Ажилтнууд", icon: <UsersIcon /> },
  { key: "requests", label: "Хүсэлтүүд", icon: <AuditLog /> },
  { key: "files", label: "Баримт бичигүүд", icon: <CubaIcon /> },
  { key: "auditlog", label: "Audit Log", icon: <InsightIcon /> },
  { key: "settings", label: "Settings", icon: <SettingsIcon /> },
];

const barData = [38, 52, 44, 61, 55, 67, 70, 63, 72, 78, 82, 88];

const requests = [
  {
    initials: "С",
    name: "Бат-Эрдэнэ Дорж",
    role: "Чөлөөний хүсэлт – Эзлжийн амралт",
    urgent: true,
    time: "5 цаг өмнө",
    color: "bg-red-500",
  },
  {
    initials: "Б",
    name: "Бат-Эрдэнэ Дорж",
    role: "Зохион байгуулагч",
    urgent: false,
    time: "2 цаг өмнө",
    color: "bg-blue-500",
  },
  {
    initials: "О",
    name: "Оюунчимэг Нямдорж",
    role: "Эрхлэх мэргэжилтэн",
    urgent: false,
    time: "1 өдөр өмнө",
    color: "bg-gradient-to-br from-purple-500 to-pink-500",
  },
  {
    initials: "Э",
    name: "Энхбаяр Ганбат",
    role: "Ахлах инженер",
    urgent: true,
    time: "3 цаг өмнө",
    color: "bg-orange-500",
  },
  {
    initials: "М",
    name: "Мөнхзул Бат",
    role: "Дизайнер",
    urgent: true,
    time: "3 цаг өмнө",
    color: "bg-gradient-to-br from-teal-400 to-emerald-500",
  },
];

export default function HrPage() {
  const [activeKey, setActiveKey] = useState("files");

  const renderContent = () => {
    if (activeKey === "users") return <WorkersComponent />;

    /* ── requests ── */
    if (activeKey === "requests") return <RequestsComponent />;

    /* ── files ── */
    if (activeKey === "files") return <FilesComponent />;

    /* ── audit log ── */
    if (activeKey === "auditlog") return <AuditlogComponennt />;

    /* ── SETTINGS ── */
    if (activeKey === "settings") return <SettingsComponent />;

    return (
      <>
        <div className="rounded-2xl border border-white/8 bg-linear-to-br from-[#0e2b26] to-[#092a25] p-6 relative overflow-hidden">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_right,rgba(10,212,177,0.08),transparent_60%)] pointer-events-none" />
          <div className="relative flex items-start justify-between">
            <div>
              <p className="text-xs uppercase tracking-[0.2em] text-white font-medium mb-3">
                Нийт ажилчид
              </p>
              <div className="flex items-center gap-3 mb-1">
                <p className="text-5xl font-bold text-[#0ad4b1]">324</p>
                <span className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-[#0ad4b1]/15 text-[#0ad4b1] text-xs font-semibold">
                  <ArrowUpRightIcon className="w-3.5 h-3.5" /> +12.5%
                </span>
              </div>
              <p className="text-white text-sm">Өмнө сар: 318</p>
            </div>
            <div className="w-14 h-14 rounded-2xl bg-[#0ad4b1] flex items-center justify-center shadow-[0_8px_24px_rgba(10,212,177,0.4)]">
              <UsersIcon />
            </div>
          </div>
          <div className="mt-6 flex items-end gap-2 h-16">
            {barData.map((h, i) => (
              <div
                key={i}
                className="flex-1 rounded-sm bg-[#0ad4b1]/30 hover:bg-[#0ad4b1]/60 transition-colors"
                style={{ height: `${(h / 88) * 100}%` }}
              />
            ))}
          </div>
        </div>
        <div className="grid grid-cols-2 gap-5">
          <div className="rounded-2xl border border-white/8 bg-[#130c06] p-6 relative overflow-hidden">
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_right,rgba(255,165,0,0.5),black_70%)] pointer-events-none" />
            <div className="relative">
              <div className="flex items-start justify-between mb-4">
                <div className="w-11 h-11 rounded-xl bg-orange-500 flex items-center justify-center shadow-[0_6px_20px_rgba(251,146,60,0.4)]">
                  <ClockIcon className="w-5 h-5 text-white" />
                </div>
                <button className="text-slate-600 hover:text-slate-400 text-lg">
                  ⋯
                </button>
              </div>
              <p className="text-slate-400 text-sm mb-3">Хүлээгдэж буй</p>
              <p className="text-4xl font-bold text-white mb-3">18</p>
              <div className="flex items-center gap-1.5 text-orange-400 text-xs">
                <ClockIcon className="w-3.5 h-3.5" />
                <span>3 яаралтай</span>
              </div>
            </div>
          </div>
          <div className="rounded-2xl border border-white/8 bg-[#071210] p-6 relative overflow-hidden">
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_right,rgba(10,212,177,0.07),transparent_60%)] pointer-events-none" />
            <div className="relative">
              <div className="flex items-start justify-between mb-4">
                <div className="w-11 h-11 rounded-xl bg-[#0ad4b1] flex items-center justify-center shadow-[0_6px_20px_rgba(10,212,177,0.4)]">
                  <CheckIcon className="w-5 h-5 text-[#060d0c]" />
                </div>
                <button className="text-slate-600 hover:text-slate-400 text-lg">
                  ⋯
                </button>
              </div>
              <p className="text-slate-400 text-sm mb-3">Баталсан</p>
              <p className="text-4xl font-bold text-white mb-3">142</p>
              <div className="flex items-center gap-1.5 text-[#0ad4b1] text-xs">
                <ArrowUpRightIcon className="w-3.5 h-3.5" />
                <span>+8.2% энэ сар</span>
              </div>
            </div>
          </div>
        </div>
        <div className="grid grid-cols-4 gap-4">
          {[
            {
              icon: <BriefcaseIcon />,
              value: "12",
              label: "Хэлтэс",
              color: "bg-blue-500/20 text-blue-400",
            },
            {
              icon: <FileIcon />,
              value: "87",
              label: "Баримт",
              color: "bg-purple-500/20 text-purple-400",
            },
            {
              icon: <CalendarIcon />,
              value: "5",
              label: "Чөлөөтэй",
              color: "bg-pink-500/20 text-pink-400",
            },
            {
              icon: <TrendIcon />,
              value: "98%",
              label: "Ирц",
              color: "bg-[#0ad4b1]/20 text-[#0ad4b1]",
            },
          ].map((s) => (
            <div
              key={s.label}
              className="rounded-2xl border border-white/8 bg-[#0a0f0e] p-4 flex items-center gap-4"
            >
              <div
                className={`w-10 h-10 rounded-xl flex items-center justify-center ${s.color}`}
              >
                {s.icon}
              </div>
              <div>
                <p className="text-white text-xl font-bold leading-tight">
                  {s.value}
                </p>
                <p className="text-slate-500 text-xs mt-0.5">{s.label}</p>
              </div>
            </div>
          ))}
        </div>
        <div className="rounded-2xl border border-[#0ad4b1]/40 bg-[#0a0f0e] overflow-hidden">
          <div className="flex items-center justify-between px-6 py-5 border-b border-dashed border-[#0ad4b1]/30">
            <div>
              <p className="text-white text-xl font-bold">
                Хүлээгдэж буй хүсэлтүүд
              </p>
              <p className="text-slate-500 text-sm mt-0.5">
                Шинээр ирсэн хүсэлтүүдийг хянах
              </p>
            </div>
            <div className="flex items-center gap-3">
              <button className="flex items-center gap-2 h-9 px-4 rounded-lg border border-white/10 text-slate-300 text-sm hover:border-white/20 transition-colors">
                <FiFilter /> Шүүх
              </button>
              <button className="flex items-center gap-2 h-9 px-4 rounded-lg bg-[#085044] text-[#0ad4b1] text-sm font-semibold hover:bg-[#0ad4b1]/20 transition-colors">
                Бүгдийг харах <ArrowUpRightIcon className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
          <div className="flex flex-col">
            {requests.map((r, i) => (
              <div
                key={i}
                className="flex items-center gap-4 px-6 py-4 border-b border-white/5 hover:bg-white/2 transition-colors cursor-pointer"
              >
                <div
                  className={`w-11 h-11 rounded-xl ${r.color} flex items-center justify-center text-white text-base font-bold shrink-0`}
                >
                  {r.initials}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="text-white text-sm font-semibold">{r.name}</p>
                    {r.urgent && (
                      <span className="px-2 py-0.5 rounded-full bg-red-500/20 text-red-400 text-xs font-medium border border-red-500/20">
                        Яаралтай
                      </span>
                    )}
                  </div>
                  <p className="text-slate-500 text-xs mt-0.5">{r.role}</p>
                </div>
                <span className="text-slate-600 text-sm shrink-0">
                  {r.time}
                </span>
              </div>
            ))}
          </div>
        </div>
      </>
    );
  };

  return (
    <div className="min-h-screen bg-[#060d0c] flex flex-col">
      <div className="flex flex-1">
        {/* ── Sidebar ── */}
        <aside className="group w-16 hover:w-60 transition-[width] duration-300 border-r border-white/8 bg-[#060d0c] flex flex-col py-4 px-2 shrink-0">
          <div className="mb-8 flex justify-center">
            <div className="w-9 h-9 rounded-xl bg-[#0ad4b1]/15 border border-[#0ad4b1]/30 flex items-center justify-center">
              <DocIcon />
            </div>
          </div>
          <div className="flex flex-col gap-1 flex-1">
            {navItems.map((item) => {
              const active = activeKey === item.key;
              return (
                <button
                  key={item.key}
                  onClick={() => setActiveKey(item.key)}
                  className={`relative flex items-center gap-3 rounded-xl px-2 py-2 transition-all duration-200 text-left w-full
                    ${
                      active
                        ? "bg-[#0ad4b1]/10 text-[#0ad4b1] border border-[#0ad4b1]/25 shadow-[0_0_12px_rgba(10,212,177,0.15)]"
                        : "text-slate-500 hover:text-slate-200 hover:bg-white/5 border border-transparent"
                    }`}
                >
                  {/* Active left bar */}
                  {active && (
                    <span className="absolute left-0 top-1/2 -translate-y-1/2 w-0.75 h-5 rounded-r-full bg-[#0ad4b1] shadow-[0_0_8px_rgba(10,212,177,0.8)]" />
                  )}
                  <span
                    className={`flex h-9 w-9 items-center justify-center rounded-lg shrink-0 transition-all ${active ? "bg-[#0ad4b1]/15" : ""}`}
                  >
                    {item.icon}
                  </span>
                  <span className="whitespace-nowrap text-sm font-medium opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                    {item.label}
                  </span>
                  {/* Active dot (collapsed state) */}
                </button>
              );
            })}
          </div>
          <button className="flex items-center gap-3 rounded-xl px-2 py-2 hover:bg-white/5 transition-colors">
            <span className="flex h-9 w-9 items-center justify-center rounded-full bg-linear-to-br from-purple-500 to-pink-500 text-white text-xs font-bold shrink-0">
              HR
            </span>
            <span className="whitespace-nowrap text-sm text-slate-400 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
              HR Team
            </span>
          </button>
        </aside>

        {/* ── Main ── */}
        <main className="flex-1 overflow-y-auto flex flex-col">
          <header className="h-14 border-b border-white/8 flex items-center justify-between px-6 shrink-0 bg-[#060d0c]">
            <div className="flex items-center gap-2 text-sm">
              <span className="text-slate-500">HR</span>
              <span className="text-slate-600">›</span>
              <span className="text-[#0ad4b1] font-semibold">
                {navItems.find((n) => n.key === activeKey)?.label}
              </span>
            </div>
            <div className="flex items-center gap-3">
              <button className="flex items-center gap-2 h-9 px-4 rounded-lg border cursor-pointer border-[#0ad4b1]/50 bg-linear-to-br from-[#0a3b33] to-[#0ad4b1]/20 text-white text-sm font-medium hover:border-[#0ad4b1] transition-colors">
                <span>＋</span> Ажилтан нэмэх
              </button>
              <div className="relative">
                <button className="h-9 w-9 rounded-lg border border-[#0ad4b1] cursor-pointer text-slate-300 flex items-center justify-center hover:border-white/40 transition-colors">
                  <NotifIcon />
                </button>
                <span className="absolute -top-1.5 -right-1.5 w-4 h-4 rounded-full bg-[#0ad4b1] text-[#060d0c] text-[9px] font-bold flex items-center justify-center">
                  6
                </span>
              </div>
            </div>
          </header>
          <div className="flex-1 px-6 py-6 flex flex-col gap-5">
            {renderContent()}
          </div>
        </main>
      </div>
    </div>
  );
}
