import { useState } from "react";
import { BiCalendar, BiChevronRight, BiFile, BiPlus } from "react-icons/bi";

export const Request = () => {
  const [activeTab, setActiveTab] = useState<string | null>(null);

  const quickActions = [
    {
      icon: <BiCalendar className="w-5 h-5 text-[#00CC99]" />,
      title: "Чөлөө авах",
      desc: "Эзлийн амралт, өвчний чөлөө",
      bg: "border-[#123C77] bg-[radial-gradient(circle_at_top_left,_rgba(22,95,210,0.30),_transparent_38%),linear-gradient(180deg,#031224_0%,#03070d_100%)]",
      iconBg: "border-[#0C3F61] bg-[linear-gradient(180deg,rgba(7,43,62,0.95)_0%,rgba(6,24,35,0.95)_100%)]",
    },
    {
      icon: <BiCalendar className="w-5 h-5 text-[#00CC99]" />,
      title: "Тойрох хуудас",
      desc: "Тойрох хуудас авах хүсэлт",
      bg: "border-[#5B269D] bg-[radial-gradient(circle_at_top_left,_rgba(129,81,244,0.30),_transparent_38%),linear-gradient(180deg,#180e2a_0%,#04070d_100%)]",
      iconBg: "border-[#29397A] bg-[linear-gradient(180deg,rgba(27,29,75,0.95)_0%,rgba(16,18,38,0.95)_100%)]",
    },
    {
      icon: <BiFile className="w-5 h-5 text-[#2A8CFF]" />,
      title: "Томилолт",
      desc: "Томилолт авах хүсэлт",
      bg: "border-[#0E6A3F] bg-[radial-gradient(circle_at_top_left,_rgba(12,137,74,0.30),_transparent_38%),linear-gradient(180deg,#05160e_0%,#04070c_100%)]",
      iconBg: "border-[#0E4360] bg-[linear-gradient(180deg,rgba(7,37,58,0.95)_0%,rgba(8,24,34,0.95)_100%)]",
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

      <div className="grid grid-cols-3 gap-6">
        {quickActions.map((action) => (
          <div
            key={action.title}
            className={`${action.bg} flex min-h-[144px] items-center justify-between gap-4 rounded-[32px] border px-8 py-9 shadow-[0_0_0_1px_rgba(255,255,255,0.03)_inset]`}
          >
            <div className="flex items-center gap-4">
              <div
                className={`flex h-16 w-16 shrink-0 items-center justify-center rounded-[22px] border ${action.iconBg}`}
              >
                {action.icon}
              </div>

              <div className="max-w-[220px]">
                <p className="text-[20px] font-semibold leading-7 text-white">
                  {action.title}
                </p>
                <p className="mt-1 text-[16px] leading-6 text-[#7C8698]">
                  {action.desc}
                </p>
              </div>
            </div>

            <button
              onClick={() => setActiveTab(action.title)}
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-[#8B96A8] transition-colors hover:bg-white/5 hover:text-white"
            >
              <BiPlus className="h-8 w-8" />
            </button>
          </div>
        ))}
      </div>
      {activeTab === "Чөлөө авах" && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <div className="w-[480px] rounded-2xl bg-[#0f0f0f] text-white p-7 border border-gray-800 shadow-xl">
            <div className="flex justify-between items-center mb-1">
              <h2 className="text-xl font-semibold">Чөлөөний хүсэлт</h2>
              <button
                onClick={() => setActiveTab(null)}
                className="text-gray-400 hover:text-white transition-colors"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="w-5 h-5"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            </div>
            <p className="text-sm text-gray-500 mb-6">
              Таны чөлөө авах боломжит үлдэгдэл
              <span className="text-white font-medium">4 цаг.</span>
            </p>

            <label className="block text-sm font-medium mb-1.5">
              Чөлөөний төрөл
            </label>
            <select className="w-full mb-5 bg-[#0f0f0f] border border-gray-700 rounded-lg p-2.5 text-sm text-gray-300 focus:outline-none focus:border-gray-500">
              <option>Сонгоно уу</option>
            </select>

            <label className="block text-sm font-medium mb-3">Төрөл</label>
            <div className="flex gap-8 mb-6">
              <label className="flex items-center gap-2.5 cursor-pointer">
                <div className="w-5 h-5 rounded-full border-2 border-gray-600 flex items-center justify-center">
                  <div className="w-2 h-2 rounded-full bg-transparent" />
                </div>
                <span className="text-sm text-gray-300">Өдрөөр</span>
              </label>
              <label className="flex items-center gap-2.5 cursor-pointer">
                <div className="w-5 h-5 rounded-full border-2 border-gray-600 flex items-center justify-center">
                  <div className="w-2 h-2 rounded-full bg-transparent" />
                </div>
                <span className="text-sm text-gray-300">Цагаар</span>
              </label>
            </div>

            <div className="flex gap-4 mb-5">
              <div className="flex flex-col flex-1">
                <label className="text-sm font-medium mb-1.5">Эхлэх цаг</label>
                <select className="bg-[#0f0f0f] border border-gray-700 rounded-lg p-2.5 text-sm text-gray-300 focus:outline-none focus:border-gray-500">
                  <option>Сонгох</option>
                </select>
              </div>
              <div className="flex flex-col flex-1">
                <label className="text-sm font-medium mb-1.5">Дуусах цаг</label>
                <select className="bg-[#0f0f0f] border border-gray-700 rounded-lg p-2.5 text-sm text-gray-300 focus:outline-none focus:border-gray-500">
                  <option>Сонгох</option>
                </select>
              </div>
            </div>

            <label className="block text-sm font-medium mb-1.5">Шалтгаан</label>
            <textarea
              placeholder="Чөлөө авах шалтгаанаа бичнэ үү..."
              rows={3}
              className="w-full bg-[#0f0f0f] border border-gray-700 rounded-lg p-3 text-sm text-gray-300 placeholder-gray-600 mb-6 resize-none focus:outline-none focus:border-gray-500"
            />

            <div className="flex justify-end gap-3">
              <button
                onClick={() => setActiveTab(null)}
                className="border border-gray-700 px-5 py-2.5 rounded-lg text-sm hover:bg-gray-800 transition-colors"
              >
                Буцах
              </button>
              <button className="bg-teal-500 hover:bg-teal-400 text-white text-sm font-medium px-5 py-2.5 rounded-lg flex items-center gap-2 transition-colors">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="w-4 h-4"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <line x1="22" y1="2" x2="11" y2="13" />
                  <polygon points="22 2 15 22 11 13 2 9 22 2" />
                </svg>
                Илгээх
              </button>
            </div>
          </div>
        </div>
      )}

      {activeTab === "Тойрох хуудас" && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/60 z-50">
          <div className="w-[460px] rounded-2xl bg-[#03080F] text-white p-7 border border-gray-800 shadow-2xl">
            <div className="flex items-start justify-between mb-1">
              <h2 className="text-xl font-semibold">
                Тойрох хуудас авах хүсэлт
              </h2>
              <button
                onClick={() => setActiveTab(null)}
                className="text-gray-400 hover:text-white transition-colors mt-0.5"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="w-5 h-5"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            </div>
            <p className="text-sm text-gray-500 mb-6">
              Тойрох хуудас авах шалтгаан болон файл оруулна уу
            </p>

            <label className="block text-sm font-medium mb-1.5">Төрөл</label>
            <select className="w-full mb-5 bg-[#03080F] border border-gray-700 rounded-lg p-2.5 text-gray-400 text-sm appearance-none cursor-pointer focus:outline-none focus:border-gray-500">
              <option>Сонгоно уу</option>
            </select>

            <label className="block text-sm font-medium mb-2">
              Файл хавсаргах
            </label>
            <div className="border-2 border-dashed border-gray-700 rounded-xl p-8 text-center mb-5 hover:border-gray-500 transition-colors cursor-pointer">
              <div className="flex justify-center mb-3">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="w-9 h-9 text-gray-400"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.5"
                >
                  <polyline points="16 16 12 12 8 16" />
                  <line x1="12" y1="12" x2="12" y2="21" />
                  <path d="M20.39 18.39A5 5 0 0 0 18 9h-1.26A8 8 0 1 0 3 16.3" />
                </svg>
              </div>
              <p className="text-sm font-medium mb-1">
                Файл хавсаргах (Заавал биш)
              </p>
              <p className="text-xs text-gray-500 mb-4">
                JPEG, PNG, PDG, and MP4 formats, up to 50MB
              </p>
              <button className="border border-gray-600 text-sm px-5 py-1.5 rounded-lg hover:bg-gray-800 transition-colors">
                Оруулах
              </button>
            </div>

            <label className="block text-sm font-medium mb-1.5">Шалтгаан</label>
            <textarea
              placeholder="Чөлөө авах шалтгаанаа бичнэ үү..."
              rows={3}
              className="w-full bg-[#0f0f0f] border border-gray-700 rounded-lg p-3 text-sm text-gray-300 placeholder-gray-600 mb-6 resize-none focus:outline-none focus:border-gray-500"
            />

            <div className="flex justify-end gap-3">
              <button
                className="border border-gray-700 text-sm px-5 py-2.5 rounded-lg hover:bg-gray-800 transition-colors"
                onClick={() => setActiveTab(null)}
              >
                Буцах
              </button>
              <button className="bg-teal-500 hover:bg-teal-400 text-sm font-medium px-5 py-2.5 rounded-lg transition-colors flex items-center gap-2">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="w-4 h-4"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <line x1="22" y1="2" x2="11" y2="13" />
                  <polygon points="22 2 15 22 11 13 2 9 22 2" />
                </svg>
                Илгээх
              </button>
            </div>
          </div>
        </div>
      )}
      {activeTab === "Томилолт" && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/60 z-50">
          <div className="w-[460px] rounded-2xl bg-[#0f0f0f] text-white p-7 border border-gray-800 shadow-2xl">
            <div className="flex items-start justify-between mb-1">
              <h2 className="text-xl font-semibold">Томилолтын мэдээлэл</h2>
              <button
                onClick={() => setActiveTab(null)}
                className="text-gray-400 hover:text-white transition-colors mt-0.5"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="w-5 h-5"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            </div>
            <p className="text-sm text-gray-500 mb-6">
              Томилолтын мэдээлэлээ оруулна уу.
            </p>

            <label className="block text-sm font-medium mb-2">
              Файл хавсаргах
            </label>
            <div className="border-2 border-dashed border-gray-700 rounded-xl p-8 text-center mb-6 hover:border-gray-500 transition-colors cursor-pointer">
              <div className="flex justify-center mb-3">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="w-9 h-9 text-gray-400"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.5"
                >
                  <polyline points="16 16 12 12 8 16" />
                  <line x1="12" y1="12" x2="12" y2="21" />
                  <path d="M20.39 18.39A5 5 0 0 0 18 9h-1.26A8 8 0 1 0 3 16.3" />
                </svg>
              </div>
              <p className="text-sm font-medium mb-1">Файл хавсаргана уу.</p>
              <p className="text-xs text-gray-500 mb-4">
                JPEG, PNG, PDG, and MP4 formats, up to 50MB
              </p>
              <button className="border border-gray-600 text-sm px-5 py-1.5 rounded-lg hover:bg-gray-800 transition-colors">
                Оруулах
              </button>
            </div>

            <div className="flex justify-end gap-3">
              <button
                className="border border-gray-700 text-sm px-5 py-2.5 rounded-lg hover:bg-gray-800 transition-colors"
                onClick={() => setActiveTab(null)}
              >
                Буцах
              </button>
              <button className="bg-teal-500 hover:bg-teal-400 text-sm font-medium px-5 py-2.5 rounded-lg transition-colors flex items-center gap-2">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="w-4 h-4"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <line x1="22" y1="2" x2="11" y2="13" />
                  <polygon points="22 2 15 22 11 13 2 9 22 2" />
                </svg>
                Илгээх
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
