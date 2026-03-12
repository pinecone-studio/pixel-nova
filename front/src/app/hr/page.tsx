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

type NavItem = { key: string; label: string; icon: React.ReactNode };

const navItems: NavItem[] = [
  { key: "files", label: "Баримтууд", icon: <GrDocument /> },
  { key: "users", label: "Ажилтнууд", icon: <UsersIcon /> },
  { key: "audit", label: "Лог", icon: <AuditLog /> },
  { key: "reports", label: "Тайлан", icon: <CubaIcon /> },
  { key: "insight", label: "Insight", icon: <InsightIcon /> },
  { key: "settings", label: "Settings", icon: <SettingsIcon /> },
];

const barData = [38, 52, 44, 61, 55, 67, 70, 63, 72, 78, 82, 88];
const insightBars = [55, 70, 62, 80, 74, 85, 78, 90, 83, 92, 86, 95];
const insightMonths = [
  "1-р",
  "2-р",
  "3-р",
  "4-р",
  "5-р",
  "6-р",
  "7-р",
  "8-р",
  "9-р",
  "10-р",
  "11-р",
  "12-р",
];

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

const allEmployees = [
  {
    initials: "Б",
    name: "Батбаяр Дорж",
    dept: "Технологи",
    role: "Ахлах инженер",
    status: "Идэвхтэй",
    color: "bg-blue-500",
  },
  {
    initials: "М",
    name: "Мөнхзул Бат",
    dept: "Дизайн",
    role: "Дизайнер",
    status: "Идэвхтэй",
    color: "bg-gradient-to-br from-teal-400 to-emerald-500",
  },
  {
    initials: "О",
    name: "Оюунчимэг Нямдорж",
    dept: "Санхүү",
    role: "Мэргэжилтэн",
    status: "Чөлөөтэй",
    color: "bg-gradient-to-br from-purple-500 to-pink-500",
  },
  {
    initials: "Э",
    name: "Энхбаяр Ганбат",
    dept: "Технологи",
    role: "Програмист",
    status: "Идэвхтэй",
    color: "bg-orange-500",
  },
  {
    initials: "С",
    name: "Сарнай Болд",
    dept: "HR",
    role: "HR менежер",
    status: "Идэвхтэй",
    color: "bg-red-500",
  },
  {
    initials: "Т",
    name: "Тэмүүлэн Гантөр",
    dept: "Маркетинг",
    role: "Контент менежер",
    status: "Амралттай",
    color: "bg-indigo-500",
  },
];

const auditLogs = [
  {
    user: "Б. Батбаяр",
    action: "Гэрээ шинэчилсэн",
    target: "01_contract.pdf",
    time: "5 мин өмнө",
    type: "edit",
  },
  {
    user: "С. Сарнай",
    action: "Ажилтан нэмсэн",
    target: "Энхбаяр Ганбат",
    time: "42 мин өмнө",
    type: "add",
  },
  {
    user: "О. Нямдорж",
    action: "Чөлөөний хүсэлт илгээсэн",
    target: "2025-03-15 ~ 03-20",
    time: "1 цаг өмнө",
    type: "send",
  },
  {
    user: "Т. Гантөр",
    action: "Тайлан экспортолсон",
    target: "Q1_report.xlsx",
    time: "2 цаг өмнө",
    type: "export",
  },
  {
    user: "Э. Ганбат",
    action: "Нууц үг солисон",
    target: "Аккаунт тохиргоо",
    time: "3 цаг өмнө",
    type: "security",
  },
  {
    user: "М. Бат",
    action: "Баримт оруулсан",
    target: "design_brief.pdf",
    time: "5 цаг өмнө",
    type: "upload",
  },
  {
    user: "Б. Батбаяр",
    action: "Хэлтэс өөрчилсөн",
    target: "Технологи → Дизайн",
    time: "1 өдөр өмнө",
    type: "edit",
  },
];

const logTypeStyle: Record<string, string> = {
  edit: "bg-blue-500/15 text-blue-400 border-blue-500/20",
  add: "bg-[#0ad4b1]/15 text-[#0ad4b1] border-[#0ad4b1]/20",
  send: "bg-purple-500/15 text-purple-400 border-purple-500/20",
  export: "bg-orange-500/15 text-orange-400 border-orange-500/20",
  security: "bg-red-500/15 text-red-400 border-red-500/20",
  upload: "bg-pink-500/15 text-pink-400 border-pink-500/20",
};
const logTypeLabel: Record<string, string> = {
  edit: "Засвар",
  add: "Нэмэлт",
  send: "Илгээсэн",
  export: "Экспорт",
  security: "Аюулгүй байдал",
  upload: "Оруулсан",
};

const reportData = [
  { month: "1-р сар", hired: 4, left: 1, attendance: 96 },
  { month: "2-р сар", hired: 6, left: 2, attendance: 94 },
  { month: "3-р сар", hired: 3, left: 0, attendance: 98 },
  { month: "4-р сар", hired: 8, left: 3, attendance: 95 },
  { month: "5-р сар", hired: 5, left: 1, attendance: 97 },
  { month: "6-р сар", hired: 7, left: 2, attendance: 96 },
];

const insightStats = [
  { label: "Нийт ажилтан", value: "324", change: "+12.5%", up: true },
  { label: "Дундаж ирц", value: "96.2%", change: "+1.3%", up: true },
  { label: "Чөлөөний хүсэлт", value: "18", change: "-3", up: false },
  { label: "Шинэ ажилтан", value: "6", change: "+2", up: true },
];
const topEmployees = [
  {
    initials: "Б",
    name: "Батбаяр Дорж",
    role: "Ахлах инженер",
    score: 98,
    color: "bg-blue-500",
  },
  {
    initials: "М",
    name: "Мөнхзул Бат",
    role: "Дизайнер",
    score: 95,
    color: "bg-gradient-to-br from-teal-400 to-emerald-500",
  },
  {
    initials: "О",
    name: "Оюунчимэг Нямдорж",
    role: "Мэргэжилтэн",
    score: 92,
    color: "bg-gradient-to-br from-purple-500 to-pink-500",
  },
];

const settingSections = [
  {
    title: "Мэдэгдэл",
    items: [
      {
        id: "notif_email",
        label: "И-мэйл мэдэгдэл",
        desc: "Шинэ хүсэлт ирэхэд и-мэйлээр мэдэгдэнэ",
        default: true,
      },
      {
        id: "notif_push",
        label: "Push мэдэгдэл",
        desc: "Браузерт push notification явуулна",
        default: false,
      },
      {
        id: "notif_urgent",
        label: "Яаралтай хүсэлтийн дуут",
        desc: "Яаралтай хүсэлт ирэхэд дуугаар анхааруулна",
        default: true,
      },
    ],
  },
  {
    title: "Аюулгүй байдал",
    items: [
      {
        id: "2fa",
        label: "Хоёр шатлалт баталгаажуулалт",
        desc: "Нэвтрэхэд нэмэлт кодоор баталгаажуулна",
        default: true,
      },
      {
        id: "session_log",
        label: "Сессийн бүртгэл",
        desc: "Бүх нэвтрэлтийг бүртгэж хадгална",
        default: true,
      },
      {
        id: "ip_limit",
        label: "IP хязгаарлалт",
        desc: "Зөвхөн зөвшөөрөгдсөн IP-ээс нэвтрэхийг зөвшөөрнө",
        default: false,
      },
    ],
  },
  {
    title: "Систем",
    items: [
      {
        id: "dark_mode",
        label: "Харанхуй горим",
        desc: "Харанхуй дэвсгэртэй горим идэвхжүүлнэ",
        default: true,
      },
      {
        id: "lang_mn",
        label: "Монгол хэл",
        desc: "Системийн хэлийг монгол болгоно",
        default: true,
      },
      {
        id: "auto_backup",
        label: "Автомат нөөцлөлт",
        desc: "24 цаг тутамд өгөгдлийг автоматаар нөөцөлнө",
        default: false,
      },
    ],
  },
];

export default function HrPage() {
  const [activeKey, setActiveKey] = useState("files");
  const [toggles, setToggles] = useState<Record<string, boolean>>(() => {
    const init: Record<string, boolean> = {};
    settingSections.forEach((s) =>
      s.items.forEach((i) => {
        init[i.id] = i.default;
      }),
    );
    return init;
  });
  const toggle = (id: string) => setToggles((p) => ({ ...p, [id]: !p[id] }));

  const renderContent = () => {
    /* ── АЖИЛТНУУД ── */
    if (activeKey === "users")
      return (
        <div className="flex flex-col gap-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-white text-2xl font-bold tracking-tight">
                Ажилтнууд
              </p>
              <p className="text-slate-500 text-sm mt-1">
                Бүх ажилтны жагсаалт болон мэдээлэл
              </p>
            </div>
            <button className="flex items-center gap-2 h-9 px-4 rounded-lg bg-[#0ad4b1] text-[#060d0c] text-sm font-semibold hover:bg-[#12e6c0] transition-colors">
              ＋ Ажилтан нэмэх
            </button>
          </div>
          <div className="rounded-2xl border border-white/8 bg-[#0a0f0e] overflow-hidden">
            <div className="grid grid-cols-5 px-5 py-3 border-b border-white/5 text-xs text-slate-500 uppercase tracking-wider">
              <span className="col-span-2">Ажилтан</span>
              <span>Хэлтэс</span>
              <span>Статус</span>
              <span className="text-right">Үйлдэл</span>
            </div>
            {allEmployees.map((e, i) => (
              <div
                key={i}
                className="grid grid-cols-5 items-center px-5 py-3.5 border-b border-white/5 hover:bg-white/2 transition-colors"
              >
                <div className="col-span-2 flex items-center gap-3">
                  <div
                    className={`w-9 h-9 rounded-xl ${e.color} flex items-center justify-center text-white text-sm font-bold shrink-0`}
                  >
                    {e.initials}
                  </div>
                  <div>
                    <p className="text-white text-sm font-medium">{e.name}</p>
                    <p className="text-slate-500 text-xs">{e.role}</p>
                  </div>
                </div>
                <span className="text-slate-400 text-sm">{e.dept}</span>
                <span>
                  <span
                    className={`px-2 py-0.5 rounded-full text-xs font-medium border ${
                      e.status === "Идэвхтэй"
                        ? "bg-[#0ad4b1]/10 text-[#0ad4b1] border-[#0ad4b1]/20"
                        : e.status === "Чөлөөтэй"
                          ? "bg-blue-500/10 text-blue-400 border-blue-500/20"
                          : "bg-orange-500/10 text-orange-400 border-orange-500/20"
                    }`}
                  >
                    {e.status}
                  </span>
                </span>
                <div className="flex justify-end gap-2">
                  <button className="h-7 px-3 rounded-lg border border-white/10 text-slate-400 text-xs hover:border-white/20 hover:text-white transition-colors">
                    Харах
                  </button>
                  <button className="h-7 px-3 rounded-lg border border-white/10 text-slate-400 text-xs hover:border-white/20 hover:text-white transition-colors">
                    Засах
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      );

    /* ── ЛОГ ── */
    if (activeKey === "audit")
      return (
        <div className="flex flex-col gap-5">
          <div>
            <p className="text-white text-2xl font-bold tracking-tight">
              Аудитын лог
            </p>
            <p className="text-slate-500 text-sm mt-1">
              Системд хийгдсэн бүх үйлдлийн бүртгэл
            </p>
          </div>
          <div className="rounded-2xl border border-white/8 bg-[#0a0f0e] overflow-hidden">
            <div className="grid grid-cols-5 px-5 py-3 border-b border-white/5 text-xs text-slate-500 uppercase tracking-wider">
              <span>Хэрэглэгч</span>
              <span className="col-span-2">Үйлдэл</span>
              <span>Төрөл</span>
              <span className="text-right">Цаг</span>
            </div>
            {auditLogs.map((l, i) => (
              <div
                key={i}
                className="grid grid-cols-5 items-center px-5 py-3.5 border-b border-white/5 hover:bg-white/2 transition-colors"
              >
                <span className="text-slate-300 text-sm font-medium">
                  {l.user}
                </span>
                <div className="col-span-2">
                  <p className="text-white text-sm">{l.action}</p>
                  <p className="text-slate-500 text-xs mt-0.5">{l.target}</p>
                </div>
                <span>
                  <span
                    className={`px-2 py-0.5 rounded-full text-xs font-medium border ${logTypeStyle[l.type]}`}
                  >
                    {logTypeLabel[l.type]}
                  </span>
                </span>
                <span className="text-slate-600 text-xs text-right">
                  {l.time}
                </span>
              </div>
            ))}
          </div>
        </div>
      );

    /* ── ТАЙЛАН ── */
    if (activeKey === "reports")
      return (
        <div className="flex flex-col gap-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-white text-2xl font-bold tracking-tight">
                Тайлан
              </p>
              <p className="text-slate-500 text-sm mt-1">
                Сарын хүний нөөцийн тайлан
              </p>
            </div>
            <button className="flex items-center gap-2 h-9 px-4 rounded-lg border border-white/10 text-slate-300 text-sm hover:border-white/20 transition-colors">
              ↓ Экспорт
            </button>
          </div>
          {/* Summary cards */}
          <div className="grid grid-cols-3 gap-4">
            {[
              {
                label: "Нийт авсан",
                value: "33",
                sub: "6 сарын дотор",
                color: "text-[#0ad4b1]",
              },
              {
                label: "Нийт гарсан",
                value: "9",
                sub: "6 сарын дотор",
                color: "text-red-400",
              },
              {
                label: "Дундаж ирц",
                value: "96%",
                sub: "Сарын дундаж",
                color: "text-blue-400",
              },
            ].map((c) => (
              <div
                key={c.label}
                className="rounded-2xl border border-white/8 bg-[#0a0f0e] p-5"
              >
                <p className="text-slate-500 text-xs uppercase tracking-wider mb-2">
                  {c.label}
                </p>
                <p className={`text-4xl font-bold ${c.color}`}>{c.value}</p>
                <p className="text-slate-600 text-xs mt-1">{c.sub}</p>
              </div>
            ))}
          </div>
          {/* Table */}
          <div className="rounded-2xl border border-white/8 bg-[#0a0f0e] overflow-hidden">
            <div className="grid grid-cols-4 px-5 py-3 border-b border-white/5 text-xs text-slate-500 uppercase tracking-wider">
              <span>Сар</span>
              <span className="text-center">Авсан</span>
              <span className="text-center">Гарсан</span>
              <span className="text-right">Ирц %</span>
            </div>
            {reportData.map((r, i) => (
              <div
                key={i}
                className="grid grid-cols-4 items-center px-5 py-3.5 border-b border-white/5 hover:bg-white/2 transition-colors"
              >
                <span className="text-white text-sm font-medium">
                  {r.month}
                </span>
                <span className="text-[#0ad4b1] text-sm font-semibold text-center">
                  +{r.hired}
                </span>
                <span className="text-red-400 text-sm font-semibold text-center">
                  -{r.left}
                </span>
                <div className="flex items-center justify-end gap-2">
                  <div className="w-20 h-1.5 rounded-full bg-white/8 overflow-hidden">
                    <div
                      className="h-full rounded-full bg-blue-400"
                      style={{ width: `${r.attendance}%` }}
                    />
                  </div>
                  <span className="text-slate-300 text-xs w-8 text-right">
                    {r.attendance}%
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      );

    /* ── INSIGHT ── */
    if (activeKey === "insight")
      return (
        <div className="flex flex-col gap-5">
          <div>
            <p className="text-white text-2xl font-bold tracking-tight">
              Insight
            </p>
            <p className="text-slate-500 text-sm mt-1">
              Байгууллагын гүйцэтгэлийн дүн шинжилгээ
            </p>
          </div>
          <div className="grid grid-cols-4 gap-4">
            {insightStats.map((s) => (
              <div
                key={s.label}
                className="rounded-2xl border border-white/8 bg-[#0a0f0e] p-4"
              >
                <p className="text-slate-500 text-xs uppercase tracking-widest mb-3">
                  {s.label}
                </p>
                <div className="flex items-end justify-between">
                  <p className="text-3xl font-bold text-white">{s.value}</p>
                  <span
                    className={`text-xs px-2 py-0.5 rounded-full font-medium ${s.up ? "bg-[#0ad4b1]/15 text-[#0ad4b1]" : "bg-red-500/15 text-red-400"}`}
                  >
                    {s.change}
                  </span>
                </div>
              </div>
            ))}
          </div>
          <div className="rounded-2xl border border-white/8 bg-[#0a0f0e] p-6">
            <div className="flex items-center justify-between mb-6">
              <p className="text-white font-semibold">Сарын ирцийн дүн</p>
              <span className="text-xs text-slate-500">2025 он</span>
            </div>
            <div className="flex items-end gap-2 h-32">
              {insightBars.map((h, i) => (
                <div
                  key={i}
                  className="flex-1 flex flex-col items-center gap-1"
                >
                  <div
                    className="w-full rounded-t-sm bg-[#0ad4b1]/30 hover:bg-[#0ad4b1]/70 transition-colors"
                    style={{ height: `${(h / 95) * 100}%` }}
                  />
                  <span className="text-[9px] text-slate-600">
                    {insightMonths[i]}
                  </span>
                </div>
              ))}
            </div>
          </div>
          <div className="rounded-2xl border border-white/8 bg-[#0a0f0e] p-6">
            <p className="text-white font-semibold mb-4">Шилдэг ажилтнууд</p>
            <div className="flex flex-col gap-3">
              {topEmployees.map((e, i) => (
                <div key={i} className="flex items-center gap-4">
                  <span className="text-slate-600 text-sm w-4">{i + 1}</span>
                  <div
                    className={`w-9 h-9 rounded-xl ${e.color} flex items-center justify-center text-white text-sm font-bold shrink-0`}
                  >
                    {e.initials}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-white text-sm font-medium">{e.name}</p>
                    <p className="text-slate-500 text-xs">{e.role}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-28 h-1.5 rounded-full bg-white/8 overflow-hidden">
                      <div
                        className="h-full rounded-full bg-[#0ad4b1]"
                        style={{ width: `${e.score}%` }}
                      />
                    </div>
                    <span className="text-[#0ad4b1] text-xs font-semibold w-8 text-right">
                      {e.score}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      );

    /* ── SETTINGS ── */
    if (activeKey === "settings")
      return (
        <div className="flex flex-col gap-5">
          <div>
            <p className="text-white text-2xl font-bold tracking-tight">
              Тохиргоо
            </p>
            <p className="text-slate-500 text-sm mt-1">
              Системийн ерөнхий тохиргоо болон хувийн сонголтууд
            </p>
          </div>
          {settingSections.map((section) => (
            <div
              key={section.title}
              className="rounded-2xl border border-white/8 bg-[#0a0f0e] overflow-hidden"
            >
              <div className="px-6 py-4 border-b border-white/5">
                <p className="text-white font-semibold">{section.title}</p>
              </div>
              {section.items.map((item, i) => (
                <div
                  key={item.id}
                  className={`flex items-center justify-between px-6 py-4 ${i < section.items.length - 1 ? "border-b border-white/5" : ""}`}
                >
                  <div>
                    <p className="text-white text-sm font-medium">
                      {item.label}
                    </p>
                    <p className="text-slate-500 text-xs mt-0.5">{item.desc}</p>
                  </div>
                  <button
                    onClick={() => toggle(item.id)}
                    className="shrink-0 ml-6"
                  >
                    {toggles[item.id] ? (
                      <BiToggleRight className="text-3xl text-[#0ad4b1]" />
                    ) : (
                      <BiToggleLeft className="text-3xl text-slate-600" />
                    )}
                  </button>
                </div>
              ))}
            </div>
          ))}
          <div className="rounded-2xl border border-red-500/20 bg-red-500/5 p-6">
            <p className="text-red-400 font-semibold mb-1">Аюултай бүс</p>
            <p className="text-slate-500 text-xs mb-4">
              Доорх үйлдлүүд буцаагдахгүй тул болгоомжтой хэрэглэнэ.
            </p>
            <div className="flex gap-3">
              <button className="h-9 px-4 rounded-lg border border-red-500/30 text-red-400 text-sm hover:bg-red-500/10 transition-colors">
                Бүх өгөгдлийг цэвэрлэх
              </button>
              <button className="h-9 px-4 rounded-lg bg-red-500/20 border border-red-500/30 text-red-400 text-sm hover:bg-red-500/30 transition-colors">
                Бүртгэл устгах
              </button>
            </div>
          </div>
        </div>
      );

    /* ── FILES (default) ── */
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
