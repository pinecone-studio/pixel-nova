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
export const Signature = () => {
  return (
    <svg
      width="44"
      height="44"
      viewBox="0 0 44 44"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <mask id="path-1-inside-1_785_1485" fill="white">
        <path d="M0 16C0 7.16344 7.16344 0 16 0H28C36.8366 0 44 7.16344 44 16V28C44 36.8366 36.8366 44 28 44H16C7.16344 44 0 36.8366 0 28V16Z" />
      </mask>
      <path
        d="M0 16C0 7.16344 7.16344 0 16 0H28C36.8366 0 44 7.16344 44 16V28C44 36.8366 36.8366 44 28 44H16C7.16344 44 0 36.8366 0 28V16Z"
        fill="#00C0A8"
        fillOpacity="0.1"
      />
      <path
        d="M16 0V1H28V0V-1H16V0ZM44 16H43V28H44H45V16H44ZM28 44V43H16V44V45H28V44ZM0 28H1V16H0H-1V28H0ZM16 44V43C7.71573 43 1 36.2843 1 28H0H-1C-1 37.3888 6.61116 45 16 45V44ZM44 28H43C43 36.2843 36.2843 43 28 43V44V45C37.3888 45 45 37.3888 45 28H44ZM28 0V1C36.2843 1 43 7.71573 43 16H44H45C45 6.61116 37.3888 -1 28 -1V0ZM16 0V-1C6.61116 -1 -1 6.61116 -1 16H0H1C1 7.71573 7.71573 1 16 1V0Z"
        fill="#00C0A8"
        fillOpacity="0.2"
        mask="url(#path-1-inside-1_785_1485)"
      />
      <path
        d="M31 27L28.844 25.132C28.7727 25.0645 28.6832 25.0194 28.5864 25.0024C28.4897 24.9854 28.3901 24.9973 28.3001 25.0365C28.2101 25.0758 28.1337 25.1407 28.0803 25.2231C28.0269 25.3055 27.999 25.4018 28 25.5V26C28 26.2652 27.8946 26.5196 27.7071 26.7071C27.5196 26.8947 27.2652 27 27 27H25C24.7348 27 24.4804 26.8947 24.2929 26.7071C24.1054 26.5196 24 26.2652 24 26C24 23.455 20.009 22.03 15.5 22C14.837 22 14.2011 22.2634 13.7322 22.7322C13.2634 23.2011 13 23.837 13 24.5C13 25.1631 13.2634 25.7989 13.7322 26.2678C14.2011 26.7366 14.837 27 15.5 27C19.653 27 20.245 15.705 21.208 13.5C21.3707 13.1278 21.6216 12.8008 21.9391 12.5474C22.2565 12.294 22.6309 12.1218 23.0299 12.0456C23.4289 11.9694 23.8405 11.9916 24.229 12.1102C24.6175 12.2289 24.9712 12.4404 25.2595 12.7265C25.5479 13.0126 25.7622 13.3646 25.8839 13.7522C26.0056 14.1397 26.0311 14.5511 25.958 14.9507C25.885 15.3503 25.7157 15.726 25.4648 16.0455C25.2139 16.3649 24.8889 16.6184 24.518 16.784M13 31H31"
        stroke="#00C0A8"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
};
export const EmployeeCode = () => {
  return (
    <svg
      width="44"
      height="44"
      viewBox="0 0 44 44"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <mask id="path-1-inside-1_588_2667" fill="white">
        <path d="M0 16C0 7.16344 7.16344 0 16 0H28C36.8366 0 44 7.16344 44 16V28C44 36.8366 36.8366 44 28 44H16C7.16344 44 0 36.8366 0 28V16Z" />
      </mask>
      <path
        d="M0 16C0 7.16344 7.16344 0 16 0H28C36.8366 0 44 7.16344 44 16V28C44 36.8366 36.8366 44 28 44H16C7.16344 44 0 36.8366 0 28V16Z"
        fill="#00C0A8"
        fillOpacity="0.1"
      />
      <path
        d="M16 0V1H28V0V-1H16V0ZM44 16H43V28H44H45V16H44ZM28 44V43H16V44V45H28V44ZM0 28H1V16H0H-1V28H0ZM16 44V43C7.71573 43 1 36.2843 1 28H0H-1C-1 37.3888 6.61116 45 16 45V44ZM44 28H43C43 36.2843 36.2843 43 28 43V44V45C37.3888 45 45 37.3888 45 28H44ZM28 0V1C36.2843 1 43 7.71573 43 16H44H45C45 6.61116 37.3888 -1 28 -1V0ZM16 0V-1C6.61116 -1 -1 6.61116 -1 16H0H1C1 7.71573 7.71573 1 16 1V0Z"
        fill="#00C0A8"
        fill-opacity="0.2"
        mask="url(#path-1-inside-1_588_2667)"
      />
      <path
        d="M15.333 19.5H28.6663"
        stroke="#00C0A8"
        strokeWidth="1.66667"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M15.333 24.5H28.6663"
        stroke="#00C0A8"
        strokeWidth="1.66667"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M20.3337 14.5L18.667 29.5"
        stroke="#00C0A8"
        strokeWidth="1.66667"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M25.3337 14.5L23.667 29.5"
        stroke="#00C0A8"
        strokeWidth="1.66667"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
};
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
