import type { IconType } from "react-icons";
import { AiFillCheckCircle } from "react-icons/ai";
import {
  BiBriefcase,
  BiChevronDown,
  BiChevronRight,
  BiFile,
  BiFilterAlt,
  BiHomeAlt,
  BiLineChart,
  BiLockAlt,
  BiSearch,
  BiSolidBadgeCheck,
  BiUserPlus,
} from "react-icons/bi";
import {
  FiActivity,
  FiArrowUpRight,
  FiBell,
  FiCalendar,
  FiCheck,
  FiCheckCircle,
  FiClock,
  FiDownload,
  FiEye,
  FiFileText,
  FiFolder,
  FiGithub,
  FiKey,
  FiMail,
  FiMapPin,
  FiPaperclip,
  FiPlus,
  FiSettings,
  FiTrendingUp,
  FiUploadCloud,
  FiUsers,
  FiXCircle,
} from "react-icons/fi";
import {
  HiOutlineIdentification,
  HiOutlineOfficeBuilding,
} from "react-icons/hi";
import { LuWalletCards } from "react-icons/lu";
import { MdApartment } from "react-icons/md";
import { PiMedal, PiWarningCircleBold } from "react-icons/pi";
import { TbFileAnalytics } from "react-icons/tb";

type IconProps = {
  className?: string;
};

function withDefaults(Icon: IconType, defaultClassName: string) {
  return function WrappedIcon({ className }: IconProps) {
    return (
      <Icon
        className={[defaultClassName, className].filter(Boolean).join(" ")}
      />
    );
  };
}

export const DocumentIcon = withDefaults(FiFileText, "h-4 w-4 text-[#00C0A8]");
export const RequestIcon = withDefaults(
  FiArrowUpRight,
  "h-4 w-4 text-[#77818C]",
);
export const FactIcon = withDefaults(FiFileText, "h-4 w-4 text-[#77818C]");
export const DownIcon = withDefaults(BiChevronDown, "h-4 w-4 text-[#77818C]");

export const AlbanTushaal = withDefaults(BiBriefcase, "h-5 w-5 text-[#00C0A8]");
export const Heltes = withDefaults(MdApartment, "h-5 w-5 text-[#00C0A8]");
export const Salbar = withDefaults(FiMapPin, "h-5 w-5 text-[#00C0A8]");
export const AjildOrson = withDefaults(FiCalendar, "h-5 w-5 text-[#00C0A8]");
export const Ajillasan = withDefaults(FiClock, "h-5 w-5 text-[#00C0A8]");
export const AjiltniiCode = withDefaults(
  HiOutlineIdentification,
  "h-5 w-5 text-[#00C0A8]",
);
export const Email = withDefaults(FiMail, "h-5 w-5 text-[#00C0A8]");
export const TursunUdur = withDefaults(FiCalendar, "h-5 w-5 text-[#00C0A8]");
export const Github = withDefaults(FiGithub, "h-5 w-5 text-[#00C0A8]");
export const CompanyTsalin = withDefaults(
  LuWalletCards,
  "h-5 w-5 text-[#00C0A8]",
);
export const EntraID = withDefaults(FiKey, "h-5 w-5 text-[#00C0A8]");
export const KPI = withDefaults(FiTrendingUp, "h-5 w-5 text-[#00C0A8]");
export const Senior = withDefaults(PiMedal, "h-5 w-5 text-[#00C0A8]");
export const Engineering = withDefaults(HiOutlineOfficeBuilding, "h-4 w-4");
export const Idevhtei = withDefaults(BiSolidBadgeCheck, "h-4 w-4");

export const AuditLog = withDefaults(TbFileAnalytics, "h-5 w-5");
export const ArrowUpRightIcon = withDefaults(FiArrowUpRight, "h-4 w-4");
export const BriefcaseIcon = withDefaults(BiBriefcase, "h-5 w-5");
export const CalendarIcon = withDefaults(FiCalendar, "h-5 w-5");
export const CheckIcon = withDefaults(FiCheck, "h-5 w-5");
export const ClockIcon = withDefaults(FiClock, "h-5 w-5");
export const CubaIcon = withDefaults(FiFolder, "h-5 w-5");
export const DocIcon = withDefaults(BiHomeAlt, "h-5 w-5");
export const FileIcon = withDefaults(BiFile, "h-5 w-5");
export const InsightIcon = withDefaults(FiActivity, "h-5 w-5");
export const NotifIcon = withDefaults(FiBell, "h-5 w-5");
export const SettingsIcon = withDefaults(FiSettings, "h-5 w-5");
export const TrendIcon = withDefaults(BiLineChart, "h-5 w-5");
export const UsersIcon = withDefaults(FiUsers, "h-5 w-5");

export const ReqIcon = withDefaults(FiFileText, "h-4 w-4");
export const AcepptedIcon = withDefaults(
  AiFillCheckCircle,
  "h-8 w-8 text-white",
);
export const RejectedIcon = withDefaults(FiXCircle, "h-8 w-8 text-white");
export const ScrollIcon = withDefaults(
  BiChevronRight,
  "h-8 w-8 text-[#99A1AF]",
);
export const CalIcon = withDefaults(FiCalendar, "h-4 w-4 text-slate-400");
export const EyeIcon = withDefaults(FiEye, "h-4 w-4 text-slate-400");
export const FilterIcon = withDefaults(BiFilterAlt, "h-4 w-4 text-slate-300");
export const DownloadIcon = withDefaults(FiDownload, "h-4 w-4 text-slate-300");
export const SearchIcon = withDefaults(BiSearch, "h-4 w-4 text-slate-500");
export const PreviewIcon = withDefaults(FiEye, "h-4 w-4");
export const OnboardIcon = withDefaults(BiUserPlus, "h-5 w-5");
export const ActiveIcon = withDefaults(FiClock, "h-5 w-5");
export const OffboardIcon = withDefaults(PiWarningCircleBold, "h-5 w-5");
export const EyeIconn = withDefaults(FiEye, "h-4 w-4");
export const PlusIcon = withDefaults(FiPlus, "h-4 w-4");
export const SortIcon = withDefaults(
  BiFilterAlt,
  "h-[18px] w-[18px] inline ml-1 opacity-60",
);
export const CheckCircle = withDefaults(
  FiCheckCircle,
  "h-7 w-7 text-[#0ad4b1]",
);
export const PaperclipIcon = withDefaults(
  FiPaperclip,
  "h-3.5 w-3.5 text-slate-500",
);
export const DocRowIcon = withDefaults(
  FiFileText,
  "h-3.5 w-3.5 text-slate-500 flex-shrink-0",
);
export const MailIcon = withDefaults(
  FiMail,
  "h-[13px] w-[13px] text-slate-500 flex-shrink-0",
);
export const BuildingIcon = withDefaults(
  HiOutlineOfficeBuilding,
  "h-[13px] w-[13px] text-slate-500 flex-shrink-0",
);
export const LockIcon = withDefaults(BiLockAlt, "h-3.5 w-3.5 text-slate-400");
export const UploadIcon = withDefaults(FiUploadCloud, "h-7 w-7 text-slate-400");
export const ChevronDownn = withDefaults(
  BiChevronDown,
  "h-3.5 w-3.5 text-slate-400",
);
export const ActiveIconn = withDefaults(
  AiFillCheckCircle,
  "h-8 w-8 text-white",
);
export const HiredIcon = withDefaults(BiUserPlus, "h-8 w-8 text-white");
export const AbsentIcon = withDefaults(FiCalendar, "h-8 w-8 text-white");
export const PhoneIcon = withDefaults(
  FiMail,
  "h-[13px] w-[13px] text-slate-500 flex-shrink-0",
);
export const DotsIcon = withDefaults(FiActivity, "h-4 w-4 text-slate-400");

export function ChevronDown({
  open,
  className,
}: {
  open: boolean;
  className?: string;
}) {
  return (
    <BiChevronDown
      className={[
        "h-[18px] w-[18px] text-slate-500 transition-transform duration-200",
        open ? "rotate-180" : "",
        className ?? "",
      ]
        .filter(Boolean)
        .join(" ")}
    />
  );
}

export function EpasLogo({ className = "h-9 w-9" }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 512 512"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* Outer circle */}
      <circle cx="256" cy="256" r="246" fill="#060610" stroke="#10B981" strokeWidth="10" />
      {/* Inner dashed orbit */}
      <circle cx="256" cy="256" r="226" fill="none" stroke="#10B981" strokeWidth="2" opacity="0.15" strokeDasharray="4 6" />

      {/* Hexagonal shield */}
      <path d="M256 60 L420 140 L420 340 L256 440 L92 340 L92 140 Z" fill="#10B981" opacity="0.04" />
      <path d="M256 60 L420 140 L420 340 L256 440 L92 340 L92 140 Z" fill="none" stroke="#10B981" strokeWidth="4" />
      {/* Inner hex dashed */}
      <path d="M256 100 L388 164 L388 316 L256 396 L124 316 L124 164 Z" fill="none" stroke="#10B981" strokeWidth="1.5" opacity="0.2" strokeDasharray="6 5" />

      {/* Person head - filled */}
      <circle cx="256" cy="190" r="46" fill="#34D399" />
      {/* Person shoulders - filled arc */}
      <path d="M172 340 C172 288 210 254 256 254 C302 254 340 288 340 340 L172 340 Z" fill="#34D399" opacity="0.25" />
      <path d="M172 340 C172 288 210 254 256 254 C302 254 340 288 340 340" fill="none" stroke="#34D399" strokeWidth="5" strokeLinecap="round" />

      {/* Document floating left */}
      <rect x="108" cy="220" y="200" width="44" height="56" rx="6" fill="none" stroke="#6EE7B7" strokeWidth="2.5" opacity="0.6" transform="rotate(-12 130 228)" />
      <line x1="118" y1="218" x2="142" y2="214" stroke="#6EE7B7" strokeWidth="2" opacity="0.4" transform="rotate(-12 130 228)" />
      <line x1="118" y1="228" x2="138" y2="225" stroke="#6EE7B7" strokeWidth="2" opacity="0.3" transform="rotate(-12 130 228)" />

      {/* Document floating right */}
      <rect x="360" y="200" width="44" height="56" rx="6" fill="none" stroke="#6EE7B7" strokeWidth="2.5" opacity="0.6" transform="rotate(12 382 228)" />
      <line x1="370" y1="218" x2="394" y2="222" stroke="#6EE7B7" strokeWidth="2" opacity="0.4" transform="rotate(12 382 228)" />
      <line x1="370" y1="228" x2="390" y2="231" stroke="#6EE7B7" strokeWidth="2" opacity="0.3" transform="rotate(12 382 228)" />

      {/* Checkmark badge bottom */}
      <circle cx="256" cy="400" r="22" fill="#059669" />
      <path d="M244 400 L252 408 L268 392" fill="none" stroke="white" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />

      {/* Energy particles spiraling */}
      <circle cx="148" cy="360" r="4" fill="#6EE7B7" opacity="0.8" />
      <circle cx="132" cy="320" r="3" fill="#34D399" opacity="0.6" />
      <circle cx="124" cy="280" r="2.5" fill="#10B981" opacity="0.4" />
      <circle cx="364" cy="360" r="4" fill="#6EE7B7" opacity="0.8" />
      <circle cx="380" cy="320" r="3" fill="#34D399" opacity="0.6" />
      <circle cx="388" cy="280" r="2.5" fill="#10B981" opacity="0.4" />

      {/* Top accent nodes */}
      <circle cx="196" cy="90" r="3" fill="#6EE7B7" opacity="0.7" />
      <circle cx="316" cy="90" r="3" fill="#6EE7B7" opacity="0.7" />
      <circle cx="256" cy="52" r="2.5" fill="#34D399" opacity="0.5" />

      {/* Connecting lines from nodes to hex */}
      <line x1="196" y1="90" x2="174" y2="120" stroke="#10B981" strokeWidth="1" opacity="0.15" />
      <line x1="316" y1="90" x2="338" y2="120" stroke="#10B981" strokeWidth="1" opacity="0.15" />
    </svg>
  );
}

export const BellIcon = () => {
  return (
    <svg width="22" height="22" fill="none" viewBox="0 0 24 24">
      <path
        d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M13.73 21a2 2 0 01-3.46 0"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
};
