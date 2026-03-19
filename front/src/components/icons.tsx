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
export const AnalyticsIcon = () => {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 20 20"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M2.5 2.5V15.8333C2.5 16.2754 2.67559 16.6993 2.98816 17.0118C3.30072 17.3244 3.72464 17.5 4.16667 17.5H17.5"
        stroke="#121316"
        strokeWidth="1.66667"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M15 14.1667V7.5"
        stroke="#121316"
        strokeWidth="1.66667"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M10.8335 14.1667V4.16675"
        stroke="#121316"
        strokeWidth="1.66667"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M6.6665 14.1667V11.6667"
        stroke="#121316"
        strokeWidth="1.66667"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
};
export const ClipboardIcon = () => {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 20 20"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M12.4998 1.66675H7.49984C7.0396 1.66675 6.6665 2.03984 6.6665 2.50008V4.16675C6.6665 4.62699 7.0396 5.00008 7.49984 5.00008H12.4998C12.9601 5.00008 13.3332 4.62699 13.3332 4.16675V2.50008C13.3332 2.03984 12.9601 1.66675 12.4998 1.66675Z"
        stroke="#121316"
        strokeWidth="1.66667"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M13.3335 3.33325H15.0002C15.4422 3.33325 15.8661 3.50885 16.1787 3.82141C16.4912 4.13397 16.6668 4.55789 16.6668 4.99992V16.6666C16.6668 17.1086 16.4912 17.5325 16.1787 17.8451C15.8661 18.1577 15.4422 18.3333 15.0002 18.3333H5.00016C4.55814 18.3333 4.13421 18.1577 3.82165 17.8451C3.50909 17.5325 3.3335 17.1086 3.3335 16.6666V4.99992C3.3335 4.55789 3.50909 4.13397 3.82165 3.82141C4.13421 3.50885 4.55814 3.33325 5.00016 3.33325H6.66683"
        stroke="#121316"
        strokeWidth="1.66667"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M10 9.16675H13.3333"
        stroke="#121316"
        strokeWidth="1.66667"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M10 13.3333H13.3333"
        stroke="#121316"
        strokeWidth="1.66667"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M6.6665 9.16675H6.67484"
        stroke="#121316"
        strokeWidth="1.66667"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M6.6665 13.3333H6.67484"
        stroke="#121316"
        strokeWidth="1.66667"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
};
export const BoxIcon = () => {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 20 20"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M9.16667 18.1084C9.42003 18.2547 9.70744 18.3317 10 18.3317C10.2926 18.3317 10.58 18.2547 10.8333 18.1084L16.6667 14.7751C16.9198 14.6289 17.13 14.4188 17.2763 14.1658C17.4225 13.9127 17.4997 13.6257 17.5 13.3334V6.66675C17.4997 6.37448 17.4225 6.08742 17.2763 5.83438C17.13 5.58134 16.9198 5.37122 16.6667 5.22508L10.8333 1.89175C10.58 1.74547 10.2926 1.66846 10 1.66846C9.70744 1.66846 9.42003 1.74547 9.16667 1.89175L3.33333 5.22508C3.08022 5.37122 2.86998 5.58134 2.72372 5.83438C2.57745 6.08742 2.5003 6.37448 2.5 6.66675V13.3334C2.5003 13.6257 2.57745 13.9127 2.72372 14.1658C2.86998 14.4188 3.08022 14.6289 3.33333 14.7751L9.16667 18.1084Z"
        stroke="#121316"
        strokeWidth="1.66667"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M10 18.3333V10"
        stroke="#121316"
        strokeWidth="1.66667"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M2.7417 5.83325L10 9.99992L17.2584 5.83325"
        stroke="#121316"
        strokeWidth="1.66667"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M6.25 3.55835L13.75 7.85002"
        stroke="#121316"
        strokeWidth="1.66667"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
};
export const RedirectIcon = () => {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 20 20"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M5.8335 5.83325H14.1668V14.1666"
        stroke="#1ABA52"
        strokeWidth="1.66667"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M5.8335 14.1666L14.1668 5.83325"
        stroke="#1ABA52"
        strokeWidth="1.66667"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
};
export const StatisticIcon = () => {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 20 20"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <g clipPath="url(#clip0_1161_1521)">
        <path
          d="M18.3332 10.0001H16.2665C15.9023 9.9993 15.5479 10.1178 15.2574 10.3376C14.967 10.5573 14.7565 10.8661 14.6582 11.2167L12.6998 18.1834C12.6872 18.2267 12.6609 18.2647 12.6248 18.2917C12.5888 18.3188 12.5449 18.3334 12.4998 18.3334C12.4548 18.3334 12.4109 18.3188 12.3748 18.2917C12.3388 18.2647 12.3125 18.2267 12.2998 18.1834L7.69984 1.81675C7.68722 1.77347 7.6609 1.73546 7.62484 1.70841C7.58878 1.68137 7.54491 1.66675 7.49984 1.66675C7.45476 1.66675 7.4109 1.68137 7.37484 1.70841C7.33878 1.73546 7.31246 1.77347 7.29984 1.81675L5.3415 8.78341C5.24356 9.13271 5.03432 9.44051 4.74556 9.66009C4.45679 9.87967 4.10427 9.99904 3.7415 10.0001H1.6665"
          stroke="#121316"
          strokeWidth="1.66667"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </g>
      <defs>
        <clipPath id="clip0_1161_1521">
          <rect width="20" height="20" fill="white" />
        </clipPath>
      </defs>
    </svg>
  );
};
export const SettingsIcon3 = () => {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 20 20"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M10.1833 1.66675H9.81667C9.37464 1.66675 8.95072 1.84234 8.63816 2.1549C8.3256 2.46746 8.15 2.89139 8.15 3.33341V3.48341C8.1497 3.77569 8.07255 4.06274 7.92628 4.31578C7.78002 4.56882 7.56978 4.77895 7.31667 4.92508L6.95834 5.13341C6.70497 5.2797 6.41756 5.35671 6.125 5.35671C5.83244 5.35671 5.54503 5.2797 5.29167 5.13341L5.16667 5.06675C4.78422 4.84613 4.32987 4.78628 3.90334 4.90034C3.47681 5.01439 3.11296 5.29303 2.89167 5.67508L2.70833 5.99175C2.48772 6.37419 2.42787 6.82855 2.54192 7.25508C2.65598 7.68161 2.93461 8.04546 3.31667 8.26675L3.44167 8.35008C3.69356 8.49551 3.90302 8.70432 4.04921 8.95577C4.1954 9.20723 4.27325 9.49256 4.275 9.78341V10.2084C4.27617 10.5021 4.19971 10.7909 4.05337 11.0455C3.90703 11.3001 3.69601 11.5116 3.44167 11.6584L3.31667 11.7334C2.93461 11.9547 2.65598 12.3186 2.54192 12.7451C2.42787 13.1716 2.48772 13.626 2.70833 14.0084L2.89167 14.3251C3.11296 14.7071 3.47681 14.9858 3.90334 15.0998C4.32987 15.2139 4.78422 15.154 5.16667 14.9334L5.29167 14.8667C5.54503 14.7205 5.83244 14.6435 6.125 14.6435C6.41756 14.6435 6.70497 14.7205 6.95834 14.8667L7.31667 15.0751C7.56978 15.2212 7.78002 15.4313 7.92628 15.6844C8.07255 15.9374 8.1497 16.2245 8.15 16.5167V16.6667C8.15 17.1088 8.3256 17.5327 8.63816 17.8453C8.95072 18.1578 9.37464 18.3334 9.81667 18.3334H10.1833C10.6254 18.3334 11.0493 18.1578 11.3618 17.8453C11.6744 17.5327 11.85 17.1088 11.85 16.6667V16.5167C11.8503 16.2245 11.9275 15.9374 12.0737 15.6844C12.22 15.4313 12.4302 15.2212 12.6833 15.0751L13.0417 14.8667C13.295 14.7205 13.5824 14.6435 13.875 14.6435C14.1676 14.6435 14.455 14.7205 14.7083 14.8667L14.8333 14.9334C15.2158 15.154 15.6701 15.2139 16.0967 15.0998C16.5232 14.9858 16.887 14.7071 17.1083 14.3251L17.2917 14.0001C17.5123 13.6176 17.5721 13.1633 17.4581 12.7367C17.344 12.3102 17.0654 11.9464 16.6833 11.7251L16.5583 11.6584C16.304 11.5116 16.093 11.3001 15.9466 11.0455C15.8003 10.7909 15.7238 10.5021 15.725 10.2084V9.79175C15.7238 9.49806 15.8003 9.20929 15.9466 8.95466C16.093 8.70003 16.304 8.48859 16.5583 8.34175L16.6833 8.26675C17.0654 8.04546 17.344 7.68161 17.4581 7.25508C17.5721 6.82855 17.5123 6.37419 17.2917 5.99175L17.1083 5.67508C16.887 5.29303 16.5232 5.01439 16.0967 4.90034C15.6701 4.78628 15.2158 4.84613 14.8333 5.06675L14.7083 5.13341C14.455 5.2797 14.1676 5.35671 13.875 5.35671C13.5824 5.35671 13.295 5.2797 13.0417 5.13341L12.6833 4.92508C12.4302 4.77895 12.22 4.56882 12.0737 4.31578C11.9275 4.06274 11.8503 3.77569 11.85 3.48341V3.33341C11.85 2.89139 11.6744 2.46746 11.3618 2.1549C11.0493 1.84234 10.6254 1.66675 10.1833 1.66675Z"
        stroke="#121316"
        strokeWidth="1.66667"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M10 12.5C11.3807 12.5 12.5 11.3807 12.5 10C12.5 8.61929 11.3807 7.5 10 7.5C8.61929 7.5 7.5 8.61929 7.5 10C7.5 11.3807 8.61929 12.5 10 12.5Z"
        stroke="#121316"
        strokeWidth="1.66667"
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

export const Note = () => {
  return (
    <svg
      width="14"
      height="14"
      viewBox="0 0 14 14"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M3.50016 12.8334C3.19074 12.8334 2.894 12.7104 2.6752 12.4916C2.45641 12.2729 2.3335 11.9761 2.3335 11.6667V2.33336C2.3335 2.02394 2.45641 1.72719 2.6752 1.5084C2.894 1.28961 3.19074 1.16669 3.50016 1.16669H8.16683C8.35149 1.16639 8.53438 1.20262 8.70497 1.2733C8.87557 1.34398 9.03049 1.44772 9.16083 1.57852L11.2538 3.67152C11.385 3.8019 11.489 3.95697 11.5599 4.12778C11.6308 4.29859 11.6671 4.48175 11.6668 4.66669V11.6667C11.6668 11.9761 11.5439 12.2729 11.3251 12.4916C11.1063 12.7104 10.8096 12.8334 10.5002 12.8334H3.50016Z"
        stroke="#3F4145"
        strokeOpacity="0.6"
        strokeWidth="1.16667"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M8.1665 1.16669V4.08335C8.1665 4.23806 8.22796 4.38644 8.33736 4.49583C8.44675 4.60523 8.59513 4.66669 8.74984 4.66669H11.6665"
        stroke="#3F4145"
        strokeOpacity="0.6"
        strokeWidth="1.16667"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
};

export const Pen = () => {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 16 16"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <g clipPath="url(#clip0_1417_2770)">
        <path
          d="M14.1161 4.54132C14.4686 4.18894 14.6666 3.71097 14.6667 3.21256C14.6668 2.71415 14.4688 2.23613 14.1165 1.88366C13.7641 1.53118 13.2861 1.33313 12.7877 1.33307C12.2893 1.33301 11.8113 1.53094 11.4588 1.88332L2.56145 10.7827C2.40667 10.937 2.29219 11.127 2.22812 11.336L1.34745 14.2373C1.33022 14.295 1.32892 14.3562 1.34369 14.4146C1.35845 14.4729 1.38873 14.5261 1.43132 14.5687C1.4739 14.6112 1.5272 14.6414 1.58556 14.656C1.64392 14.6707 1.70516 14.6693 1.76279 14.652L4.66479 13.772C4.87357 13.7085 5.06357 13.5947 5.21812 13.4407L14.1161 4.54132Z"
          stroke="white"
          strokeWidth="1.33333"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </g>
      <defs>
        <clipPath id="clip0_1417_2770">
          <rect width="16" height="16" fill="white" />
        </clipPath>
      </defs>
    </svg>
  );
};

export const Sth = () => {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 16 16"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M4.66699 4.66669H11.3337V11.3334"
        stroke="white"
        strokeWidth="1.33333"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M4.66699 11.3334L11.3337 4.66669"
        stroke="white"
        strokeWidth="1.33333"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
};
