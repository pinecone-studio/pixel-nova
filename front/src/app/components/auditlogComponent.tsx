export const AuditlogComponennt = () => {
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
    )
}