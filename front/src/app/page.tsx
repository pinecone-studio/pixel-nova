import { BiBuilding, BiCalendar, BiFile, BiPlus, BiChevronRight } from "react-icons/bi";

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

export default function Home() {
  const leaveUsed = 4;
  const leaveTotal = 14;
  const leavePercent = (leaveUsed / leaveTotal) * 100;
  const radius = 28;
  const circumference = 2 * Math.PI * radius;
  const dashOffset = circumference - (leavePercent / 100) * circumference;

  return (
    <div className="min-h-screen bg-[#0A0A0F]">
      <div className="max-w-6xl mx-auto px-6 py-8 flex flex-col gap-8">
        {/* Hero card */}
        <div className="w-full rounded-2xl border border-[#1a1a30] bg-[#0d0d1a] p-8 flex items-center justify-between gap-6">
          <div className="flex flex-col gap-3">
            <p className="text-[#00CC99] text-sm font-medium tracking-widest uppercase">
              Сайн байна уу?
            </p>
            <h1 className="text-white text-4xl font-bold tracking-tight">
              Бат-Эрдэнэ Дорж
            </h1>
            <p className="text-[#4A4A6A] text-sm leading-relaxed max-w-lg">
              Та хөдөлмөрийн баримт бичиг болон ажлын түүхээ авах боломжтой.
              Бүх баримтууд аюулгүй хадгалагдсан болно.
            </p>
            <div className="flex gap-2 mt-1 flex-wrap">
              <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#00CC99]/15 text-[#00CC99] text-xs font-semibold border border-[#00CC99]/20">
                <BiBuilding className="w-3.5 h-3.5" />
                Engineering
              </span>
              <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#1A1A2E] text-[#8888AA] text-xs font-medium border border-[#2A2A40]">
                Senior Engineer
              </span>
              <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#1A1A2E] text-[#8888AA] text-xs font-medium border border-[#2A2A40]">
                EMP-0042
              </span>
            </div>
          </div>

          {/* Leave balance card */}
          <div className="shrink-0 rounded-xl border border-[#1a1a30] bg-[#0a0a14] p-5 flex flex-col gap-3 min-w-[180px]">
            <div className="flex items-center justify-between gap-6">
              <div>
                <p className="text-white text-2xl font-bold">4d 1h</p>
                <p className="text-[#4A4A6A] text-xs mt-0.5">Чөлөөний боломж</p>
              </div>
              <div className="relative w-16 h-16">
                <svg viewBox="0 0 72 72" className="w-full h-full -rotate-90">
                  <circle
                    cx="36" cy="36" r={radius}
                    fill="none"
                    stroke="#1a1a30"
                    strokeWidth="6"
                  />
                  <circle
                    cx="36" cy="36" r={radius}
                    fill="none"
                    stroke="#00CC99"
                    strokeWidth="6"
                    strokeLinecap="round"
                    strokeDasharray={circumference}
                    strokeDashoffset={dashOffset}
                  />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-white text-xs font-semibold">
                    {leaveUsed}
                    <span className="text-[#4A4A6A] text-[10px]">/{leaveTotal}</span>
                  </span>
                </div>
              </div>
            </div>
            <button className="w-full text-center text-xs text-[#8888AA] border border-[#2A2A40] rounded-lg py-1.5 hover:border-[#00CC99]/40 hover:text-white transition-colors">
              Дэлгэрэнгүй
            </button>
          </div>
        </div>

        {/* Quick actions */}
        <div className="flex flex-col gap-4">
          <div className="flex items-baseline justify-between">
            <div>
              <h2 className="text-white text-xl font-semibold">Шуурхай үйлдлүүд</h2>
              <p className="text-[#4A4A6A] text-sm mt-0.5">Хүсэлт илгээх</p>
            </div>
            <a href="#" className="flex items-center gap-1 text-[#00CC99] text-sm font-medium hover:underline">
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
                    <p className="text-white text-sm font-semibold">{action.title}</p>
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
      </div>
    </div>
  );
}
