import Image from "next/image";
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
  FiX,
  FiXCircle,
} from "react-icons/fi";
import {
  HiOutlineIdentification,
  HiOutlineOfficeBuilding,
} from "react-icons/hi";
import { LuWalletCards } from "react-icons/lu";
import { MdApartment } from "react-icons/md";
import { PiWarningCircleBold } from "react-icons/pi";
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

export const DocumentIcon = withDefaults(FiFileText, "h-4 w-4 text-[#000000]");
export const RequestIcon = withDefaults(
  FiArrowUpRight,
  "h-4 w-4 text-[#77818C]",
);
export const FactIcon = withDefaults(FiFileText, "h-4 w-4 text-[#77818C]");
export const DownIcon = withDefaults(BiChevronDown, "h-4 w-4 text-[#000000]");
export const Planeicon = () => {
  return (
    <svg
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M17.8 19.2L16 11L19.5 7.5C21 6 21.5 4 21 3C20 2.5 18 3 16.5 4.5L13 8L4.8 6.2C4.3 6.1 3.9 6.3 3.7 6.7L3.4 7.2C3.2 7.7 3.3 8.2 3.7 8.5L9 12L7 15H4L3 16L6 18L8 21L9 20V17L12 15L15.5 20.3C15.8 20.7 16.3 20.8 16.8 20.6L17.3 20.4C17.7 20.1 17.9 19.7 17.8 19.2Z"
        stroke="#178AFC"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
};
export const Righticon = () => {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 16 16"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M3.33325 8H12.6666"
        stroke="black"
        strokeWidth="1.33333"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M8 3.33331L12.6667 7.99998L8 12.6666"
        stroke="black"
        strokeWidth="1.33333"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
};
export const AlbanTushaal = withDefaults(BiBriefcase, "h-5 w-5 text-[#111827]");
export const Heltes = withDefaults(MdApartment, "h-5 w-5 text-[#111827]");
export const Salbar = withDefaults(FiMapPin, "h-5 w-5 text-[#111827]");
export const AjildOrson = withDefaults(FiCalendar, "h-5 w-5 text-[#111827]");
export const Ajillasan = withDefaults(FiClock, "h-5 w-5 text-[#111827]");
export const AjiltniiCode = withDefaults(
  HiOutlineIdentification,
  "h-5 w-5 text-[#00C0A8]",
);

export const Email = withDefaults(FiMail, "h-5 w-5 text-[#111827]");
export const TursunUdur = withDefaults(FiCalendar, "h-5 w-5 text-[#111827]");
export const Github = withDefaults(FiGithub, "h-5 w-5 text-[#111827]");
export const CompanyTsalin = withDefaults(
  LuWalletCards,
  "h-5 w-5 text-[#00C0A8]",
);
export const EntraID = withDefaults(FiKey, "h-5 w-5 text-[#00C0A8]");
export const KPI = withDefaults(FiTrendingUp, "h-5 w-5 text-[#00C0A8]");
export const Senior = () => {
  return (
    <svg
      width="12"
      height="12"
      viewBox="0 0 12 12"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M8 10V2C8 1.73478 7.89464 1.48043 7.70711 1.29289C7.51957 1.10536 7.26522 1 7 1H5C4.73478 1 4.48043 1.10536 4.29289 1.29289C4.10536 1.48043 4 1.73478 4 2V10"
        stroke="black"
        strokeOpacity="0.7"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M10 3H2C1.44772 3 1 3.44772 1 4V9C1 9.55228 1.44772 10 2 10H10C10.5523 10 11 9.55228 11 9V4C11 3.44772 10.5523 3 10 3Z"
        stroke="black"
        strokeOpacity="0.7"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
};
export const Engineering = withDefaults(HiOutlineOfficeBuilding, "h-4 w-4");
export const Idevhtei = () => {
  return (
    <svg
      width="12"
      height="12"
      viewBox="0 0 12 12"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <g clipPath="url(#clip0_588_2600)">
        <path
          d="M6 11C8.76142 11 11 8.76142 11 6C11 3.23858 8.76142 1 6 1C3.23858 1 1 3.23858 1 6C1 8.76142 3.23858 11 6 11Z"
          stroke="black"
          strokeOpacity="0.7"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M4.5 6L5.5 7L7.5 5"
          stroke="black"
          strokeOpacity="0.7"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </g>
      <defs>
        <clipPath id="clip0_588_2600">
          <rect width="12" height="12" fill="white" />
        </clipPath>
      </defs>
    </svg>
  );
};

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
        fill="#111827"
        fillOpacity="0.1"
      />
      <path
        d="M16 0V1H28V0V-1H16V0ZM44 16H43V28H44H45V16H44ZM28 44V43H16V44V45H28V44ZM0 28H1V16H0H-1V28H0ZM16 44V43C7.71573 43 1 36.2843 1 28H0H-1C-1 37.3888 6.61116 45 16 45V44ZM44 28H43C43 36.2843 36.2843 43 28 43V44V45C37.3888 45 45 37.3888 45 28H44ZM28 0V1C36.2843 1 43 7.71573 43 16H44H45C45 6.61116 37.3888 -1 28 -1V0ZM16 0V-1C6.61116 -1 -1 6.61116 -1 16H0H1C1 7.71573 7.71573 1 16 1V0Z"
        fill="#111827"
        fillOpacity="0.2"
        mask="url(#path-1-inside-1_785_1485)"
      />
      <path
        d="M31 27L28.844 25.132C28.7727 25.0645 28.6832 25.0194 28.5864 25.0024C28.4897 24.9854 28.3901 24.9973 28.3001 25.0365C28.2101 25.0758 28.1337 25.1407 28.0803 25.2231C28.0269 25.3055 27.999 25.4018 28 25.5V26C28 26.2652 27.8946 26.5196 27.7071 26.7071C27.5196 26.8947 27.2652 27 27 27H25C24.7348 27 24.4804 26.8947 24.2929 26.7071C24.1054 26.5196 24 26.2652 24 26C24 23.455 20.009 22.03 15.5 22C14.837 22 14.2011 22.2634 13.7322 22.7322C13.2634 23.2011 13 23.837 13 24.5C13 25.1631 13.2634 25.7989 13.7322 26.2678C14.2011 26.7366 14.837 27 15.5 27C19.653 27 20.245 15.705 21.208 13.5C21.3707 13.1278 21.6216 12.8008 21.9391 12.5474C22.2565 12.294 22.6309 12.1218 23.0299 12.0456C23.4289 11.9694 23.8405 11.9916 24.229 12.1102C24.6175 12.2289 24.9712 12.4404 25.2595 12.7265C25.5479 13.0126 25.7622 13.3646 25.8839 13.7522C26.0056 14.1397 26.0311 14.5511 25.958 14.9507C25.885 15.3503 25.7157 15.726 25.4648 16.0455C25.2139 16.3649 24.8889 16.6184 24.518 16.784M13 31H31"
        stroke="#111827"
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
        fill="#111827"
        fillOpacity="0.1"
      />
      <path
        d="M16 0V1H28V0V-1H16V0ZM44 16H43V28H44H45V16H44ZM28 44V43H16V44V45H28V44ZM0 28H1V16H0H-1V28H0ZM16 44V43C7.71573 43 1 36.2843 1 28H0H-1C-1 37.3888 6.61116 45 16 45V44ZM44 28H43C43 36.2843 36.2843 43 28 43V44V45C37.3888 45 45 37.3888 45 28H44ZM28 0V1C36.2843 1 43 7.71573 43 16H44H45C45 6.61116 37.3888 -1 28 -1V0ZM16 0V-1C6.61116 -1 -1 6.61116 -1 16H0H1C1 7.71573 7.71573 1 16 1V0Z"
        fill="#111827"
        fillOpacity="0.2"
        mask="url(#path-1-inside-1_588_2667)"
      />
      <path
        d="M15.333 19.5H28.6663"
        stroke="#111827"
        strokeWidth="1.66667"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M15.333 24.5H28.6663"
        stroke="#111827"
        strokeWidth="1.66667"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M20.3337 14.5L18.667 29.5"
        stroke="#111827"
        strokeWidth="1.66667"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M25.3337 14.5L23.667 29.5"
        stroke="#111827"
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

export const FilesEyeIcon = () => {
  return (
    <svg
      width="20"
      height="20"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      viewBox="0 0 24 24"
    >
      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  );
};
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
  "h-8 w-8 text-black",
);
export const HiredIcon = withDefaults(BiUserPlus, "h-8 w-8 text-black");
export const AbsentIcon = withDefaults(FiCalendar, "h-8 w-8 text-white");
export const PhoneIcon = withDefaults(
  FiMail,
  "h-[13px] w-[13px] text-slate-500 flex-shrink-0",
);
export const DotsIcon = withDefaults(FiActivity, "h-4 w-4 text-slate-400");
export const CloseIcon = withDefaults(FiX, "h-[18px] w-[18px]");
export const DocBigIcon = withDefaults(FiFileText, "h-12 w-12 text-blue-400");

export const TrashIcon = () => (
  <svg width="14" height="14" fill="none" viewBox="0 0 24 24">
    <path
      d="M3 6h18M8 6V4h8v2M19 6l-1 14H6L5 6"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

export const EditIcon = () => (
  <svg width="14" height="14" fill="none" viewBox="0 0 24 24">
    <path
      d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

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
    <Image
      src="/icon.svg"
      alt="EPAS logo"
      className={className}
      width={200}
      height={200}
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

export const AnnouncementIcon = () => {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 20 20"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M9.16667 5C11.7011 5.06529 14.1783 4.23959 16.1667 2.66667C16.2905 2.57381 16.4377 2.51727 16.5918 2.50337C16.746 2.48947 16.9009 2.51877 17.0393 2.58798C17.1778 2.65719 17.2942 2.76358 17.3755 2.89522C17.4569 3.02687 17.5 3.17857 17.5 3.33333V13.3333C17.5 13.4881 17.4569 13.6398 17.3755 13.7714C17.2942 13.9031 17.1778 14.0095 17.0393 14.0787C16.9009 14.1479 16.746 14.1772 16.5918 14.1633C16.4377 14.1494 16.2905 14.0929 16.1667 14C14.1783 12.4271 11.7011 11.6014 9.16667 11.6667H4.16667C3.72464 11.6667 3.30072 11.4911 2.98816 11.1785C2.67559 10.866 2.5 10.442 2.5 10V6.66667C2.5 6.22464 2.67559 5.80072 2.98816 5.48816C3.30072 5.17559 3.72464 5 4.16667 5H9.16667Z"
        stroke="#00C0A8"
        strokeWidth="1.66667"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M5 11.6667C5 13.8305 5.70178 15.9358 7 17.6667C7.26522 18.0204 7.66005 18.2542 8.09763 18.3167C8.53522 18.3792 8.97971 18.2653 9.33333 18.0001C9.68696 17.7349 9.92074 17.34 9.98325 16.9025C10.0458 16.4649 9.93188 16.0204 9.66667 15.6667C8.80119 14.5128 8.33333 13.1092 8.33333 11.6667"
        stroke="#00C0A8"
        strokeWidth="1.66667"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M6.66699 5V11.6667"
        stroke="#00C0A8"
        strokeWidth="1.66667"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
};
