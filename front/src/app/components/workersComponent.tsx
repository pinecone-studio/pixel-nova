export const WorkersComponent = () => {
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
    )
}