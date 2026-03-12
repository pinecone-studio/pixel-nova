import { BiCalendar, BiChevronRight, BiFile, BiPlus } from "react-icons/bi";

export const Request = () => {
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
            <button className="w-8 h-8 rounded-lg border border-[#2A2A40] flex items-center justify-center text-[#4A4A6A] hover:border-[#00CC99]/40 hover:text-[#00CC99] transition-colors shrink-0">
              <BiPlus className="w-4 h-4" />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};
