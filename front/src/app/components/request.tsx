 "use client";

import { useState } from "react";
import { BiCalendar, BiChevronRight, BiFile, BiPlus } from "react-icons/bi";

export const Request = () => {
  const [activeTab, setActiveTab] = useState<string | null>(null);

  const quickActions = [
    {
      icon: <BiCalendar className="w-5 h-5 text-[#00CC99]" />,
      title: "Чөлөө авах",
      desc: "Эзлийн амралт, өвчний чөлөө",
      bg: "bg-[#111120]",
    },
    {
      icon: <BiCalendar className="w-5 h-5 text-[#00CC99]" />,
      title: "Тойрох хуудас",
      desc: "Тойрох хуудас авах хүсэлт",
      bg: "bg-gradient-to-br from-[#1a1040] to-[#0d0d2b]",
    },
    {
      icon: <BiFile className="w-5 h-5 text-[#00CC99]" />,
      title: "Томилолт",
      desc: "Томилолт авах хүсэлт",
      bg: "bg-[#0d1a14]",
    },
  ];

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-baseline justify-between">
        <div>
          <h2 className="text-white text-xl font-semibold">Шуурхай үйлдлүүд</h2>
          <p className="text-[#4A4A6A] text-sm mt-0.5">Хүсэлт илгээх</p>
        </div>
        <a
          href="#"
          className="flex items-center gap-1 text-[#00CC99] text-sm font-medium hover:underline"
        >
          Бүх хүсэлтүүд <BiChevronRight className="w-4 h-4" />
        </a>
      </div>

      <div className="grid grid-cols-3 gap-4">
        {quickActions.map((action) => (
          <div
            key={action.title}
            className={`${action.bg} rounded-2xl border border-[#1a1a30] p-5 flex items-center justify-between gap-4 hover:border-[#00CC99]/30 transition-colors`}
          >
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-xl bg-[#00CC99]/10 border border-[#00CC99]/20 flex items-center justify-center shrink-0">
                {action.icon}
              </div>
              <div>
                <p className="text-white text-sm font-semibold">
                  {action.title}
                </p>
                <p className="text-[#4A4A6A] text-xs mt-0.5">{action.desc}</p>
              </div>
            </div>
            <button
              className="w-8 h-8 rounded-lg border border-[#2A2A40] flex items-center justify-center text-[#4A4A6A] hover:border-[#00CC99]/40 hover:text-[#00CC99] transition-colors shrink-0"
              onClick={() => setActiveTab(action.title)}
            >
              <BiPlus className="w-4 h-4" />
            </button>
          </div>
        ))}
      </div>

      {activeTab === "Чөлөө авах" && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/60">
          <div className="w-[420px] rounded-xl bg-[#071018] text-white p-6 border border-gray-700">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-semibold">Чөлөөний хүсэлт</h2>
            </div>
            <p className="text-sm text-gray-400 mb-4">
              Таны чөлөө авах боломжит үлдэгдэл 4 цаг.
            </p>
            <label className="text-sm">Чөлөөний төрөл</label>
            <select className="w-full mt-1 mb-4 bg-[#0f1b26] border border-gray-600 rounded-md p-2">
              <option>Сонгоно уу</option>
            </select>
            <div className="flex gap-6 mb-4">
              <label className="flex items-center gap-2">
                <input type="radio" /> Өдрөөр
              </label>
              <label className="flex items-center gap-2">
                <input type="radio" /> Цагаар
              </label>
            </div>
            <div className="flex gap-4 mb-4">
              <select className="flex-1 bg-[#0f1b26] border border-gray-600 rounded-md p-2">
                <option>Эхлэх цаг</option>
              </select>
              <select className="flex-1 bg-[#0f1b26] border border-gray-600 rounded-md p-2">
                <option>Дуусах цаг</option>
              </select>
            </div>
            <textarea
              placeholder="Чөлөө авах шалтгаанаа бичнэ үү..."
              className="w-full bg-[#0f1b26] border border-gray-600 rounded-md p-2 mb-5"
            />
            <div className="flex justify-end gap-3">
              <button
                className="border border-gray-600 px-4 py-2 rounded-md"
                onClick={() => setActiveTab(null)}
              >
                Буцах
              </button>
              <button className="bg-teal-500 px-4 py-2 rounded-md">
                Илгээх
              </button>
            </div>
          </div>
        </div>
      )}

      {activeTab === "Тойрох хуудас" && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/60">
          <div className="w-[420px] rounded-xl bg-[#071018] text-white p-6 border border-gray-700">
            <h2 className="text-lg mb-4">Тойрох хуудас авах хүсэлт</h2>

            <label className="text-sm">Төрөл</label>

            <select className="w-full mt-1 mb-4 bg-[#0f1b26] border border-gray-600 rounded-md p-2">
              <option>Сонгоно уу</option>
            </select>

            <div className="border-2 border-dashed border-gray-600 p-6 rounded-lg text-center mb-4">
              <p className="text-sm text-gray-400">
                Файл хавсаргах (Заавал биш)
              </p>

              <button className="mt-3 border border-gray-500 px-4 py-1 rounded-md">
                Оруулах
              </button>
            </div>

            <textarea
              placeholder="Чөлөө авах шалтгаанаа бичнэ үү..."
              className="w-full bg-[#0f1b26] border border-gray-600 rounded-md p-2 mb-5"
            />

            <div className="flex justify-end gap-3">
              <button
                className="border border-gray-600 px-4 py-2 rounded-md"
                onClick={() => setActiveTab(null)}
              >
                Буцах
              </button>

              <button className="bg-teal-500 px-4 py-2 rounded-md">
                Илгээх
              </button>
            </div>
          </div>
        </div>
      )}

      {activeTab === "Томилолт" && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/60">
          <div className="w-[420px] rounded-xl bg-[#071018] text-white p-6 border border-gray-700">
            <h2 className="text-lg ">Томилолтын мэдээлэл</h2>
            <h2 className="opacity-15 mb-15 ">
              Томилолтын мэдээлэл оруулна уу
            </h2>

            <div className="border-2 border-dashed border-gray-600 p-6 rounded-lg text-center mb-4">
              <p className="text-sm text-gray-400">Файл хавсаргана уу</p>

              <button className="mt-3 border border-gray-500 px-4 py-1 rounded-md">
                Оруулах
              </button>
            </div>

            <div className="flex justify-end gap-3">
              <button
                className="border border-gray-600 px-4 py-2 rounded-md"
                onClick={() => setActiveTab(null)}
              >
                Буцах
              </button>

              <button className="bg-teal-500 px-4 py-2 rounded-md">
                Илгээх
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
