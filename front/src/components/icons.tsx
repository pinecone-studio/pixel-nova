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
