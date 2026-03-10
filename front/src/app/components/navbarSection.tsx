import { DocumentIcon, DownIcon, FactIcon, RequestIcon } from "./icons";
import { BiHistory, BiHome, BiNotification } from "react-icons/bi";
import { GrNotification } from "react-icons/gr";
import { RxAvatar } from "react-icons/rx";

export const Navbar = () => {
  return (
    <nav className="w-full bg-[#0A0A0F] border-b border-[#1A1A2E] px-6 py-0 flex items-center justify-between h-16 shadow-lg shadow-black/40">
      {/* Logo */}
      <div className="flex items-center gap-3 shrink-0">
        <div className="rounded-full w-9 h-9 border border-[#00CC99] flex items-center justify-center shadow-md shadow-[#00CC99]/20">
          <DocumentIcon />
        </div>
        <div className="flex items-baseline gap-1.5">
          <span className="text-white font-bold text-lg tracking-wide">
            EPAS
          </span>
          <span className="text-[#4A4A6A] text-sm font-medium">
            Employee Portal
          </span>
        </div>
      </div>

      {/* Nav Links */}
      <div className="flex items-center gap-1">
        {[
          { icon: <BiHome className="w-4 h-4" />, label: "Нүүр", active: true },
          { icon: <RequestIcon />, label: "Хүсэлтүүд" },
          { icon: <FactIcon />, label: "Баримтууд" },
          { icon: <BiHistory className="w-4 h-4" />, label: "Түүх" },
          { icon: <RxAvatar className="w-4 h-4" />, label: "Профайл" },
        ].map(({ icon, label, active }) => (
          <button
            key={label}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 cursor-pointer
              ${
                active
                  ? "bg-[#00CC99]/10 text-[#00CC99]"
                  : "text-[#6B6B8A] hover:text-[#00CC99] hover:bg-[#00CC99]/5"
              }`}
          >
            <span className={active ? "text-[#00CC99]" : ""}>{icon}</span>
            {label}
          </button>
        ))}
      </div>

      {/* Right side */}
      <div className="flex items-center gap-3">
        <button className="relative w-9 h-9 rounded-lg bg-[#13131F] border border-[#1E1E32] flex items-center justify-center text-[#6B6B8A] hover:text-[#00CC99] hover:border-[#00CC99]/30 transition-all duration-200 cursor-pointer">
          <GrNotification className="w-4 h-4" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-[#00CC99] rounded-full border-2 border-[#0A0A0F]" />
        </button>

        <button className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[#13131F] border border-[#1E1E32] hover:border-[#00CC99]/30 transition-all duration-200 cursor-pointer group">
          <div className="w-7 h-7 rounded-full bg-gradient-to-br from-[#00CC99] to-[#007A5E] flex items-center justify-center text-white text-xs font-bold shadow-sm">
            S
          </div>
          <span className="text-white text-sm font-medium">Sunduibazrr</span>
          <DownIcon />
        </button>
      </div>
    </nav>
  );
};
