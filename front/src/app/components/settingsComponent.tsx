"use client";
import { useState } from "react";
import { BiToggleLeft, BiToggleRight } from "react-icons/bi";

export const SettingsComponent = () => {
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
  return (
    <div className="flex flex-col gap-5">
      <div>
        <p className="text-white text-2xl font-bold tracking-tight">Тохиргоо</p>
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
                <p className="text-white text-sm font-medium">{item.label}</p>
                <p className="text-slate-500 text-xs mt-0.5">{item.desc}</p>
              </div>
              <button onClick={() => toggle(item.id)} className="shrink-0 ml-6">
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
};
