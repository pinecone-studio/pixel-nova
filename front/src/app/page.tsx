import { DocumentIcon, DownIcon } from "./components/icons";
import { Navbar } from "./components/navbarSection";
import {
  BiBuilding,
  BiFile,
  BiTime,
  BiCheckCircle,
  BiLoader,
} from "react-icons/bi";

const stats = [
  { value: 4, label: "Нийт баримт" },
  { value: 2, label: "Хүлээгдэж буй" },
  { value: 1, label: "Батлагдсан" },
  { value: 1, label: "Шийдвэрлэгдсэн" },
];

export default function Home() {
  return (
    <div className="min-h-screen bg-[#0A0A0F]">
      <Navbar />

      <div className="max-w-6xl mx-auto px-6 py-8 flex flex-col gap-6">
        {/* Hero / Welcome Card */}
        <div className="w-full rounded-2xl border border-[#00CC99]/30  p-8">
          <div className="flex flex-col gap-3">
            <p className="text-[#00CC99] text-sm font-medium tracking-widest uppercase">
              Сайн байна уу
            </p>
            <p className="text-white text-4xl font-bold tracking-tight">
              Sunduibazrr.B
            </p>
            <p className="text-[#4A4A6A] text-sm leading-relaxed max-w-lg">
              Таны хөдөлмөрийн баримт бичгүүд болон ажлын түүхийг энд харах
              боломжтой. Бүх баримтууд аюулгүй хадгалагдсан.
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
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-4 gap-4">
          {stats.map(({ value, label }) => (
            <div
              key={label}
              className="rounded-xl border border-[#1E1E32] bg-[#0D0D18] p-5 hover:border-[#00CC99]/30 hover:bg-[#0D1A16] transition-all duration-200 group"
            >
              <div className="flex items-start justify-between">
                <div className="flex flex-col gap-1">
                  <p className="text-3xl font-bold text-white group-hover:text-[#00CC99] transition-colors duration-200">
                    {value}
                  </p>
                  <p className="text-[#4A4A6A] text-xs">{label}</p>
                </div>
                <div className="rounded-lg w-9 h-9 border border-[#00CC99]/30 bg-[#00CC99]/5 flex items-center justify-center shadow-sm shadow-[#00CC99]/10 group-hover:border-[#00CC99]/60 transition-all duration-200">
                  <DocumentIcon />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
