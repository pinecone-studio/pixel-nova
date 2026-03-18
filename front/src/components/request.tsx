import { useMutation, useQuery } from "@apollo/client/react";
import { useEffect, useRef, useState } from "react";
import type { PointerEvent } from "react";
import {
  BiCalendar,
  BiChevronDown,
  BiFile,
  BiPlus,
} from "react-icons/bi";
import { FiCheck, FiSend, FiUploadCloud, FiX } from "react-icons/fi";

import { buildGraphQLHeaders } from "@/lib/apollo-client";
import {
  SUBMIT_LEAVE_REQUEST,
  SUBMIT_CONTRACT_REQUEST,
  UPDATE_MY_DOCUMENT_PROFILE,
} from "@/graphql/mutations";
import { GET_SIGNATURE_STATUS } from "@/graphql/queries";
import type {
  ContractRequest,
  Employee,
  EmployeeDocumentProfile,
  EmployeeSignatureStatus,
  LeaveRequest,
} from "@/lib/types";
import { Planeicon } from "./icons";

const TOKEN_KEY = "epas_auth_token";

const DIALOG_BG = "bg-[#030810]";
const DIALOG_BORDER = "border-[#1a2035]";
const INPUT_CLASS = `w-full bg-[#040d18] border border-[#1a2035] rounded-lg p-2.5 text-sm text-gray-300 focus:outline-none focus:border-[#00CC99]/40 appearance-none`;
const TEXTAREA_CLASS = `w-full bg-[#040d18] h-20 border border-[#1a2035] rounded-lg text-sm text-gray-300 placeholder-gray-600 resize-none focus:outline-none focus:border-[#00CC99]/40`;
const LIGHT_DIALOG_BG = "bg-white";
const LIGHT_DIALOG_BORDER = "border-[#E5E7EB]";
const LIGHT_INPUT_CLASS = `w-full bg-white border border-[#E5E7EB] rounded-lg p-2.5 text-sm text-[#111827] focus:outline-none focus:border-[#111827]/30 appearance-none`;
const LIGHT_TEXTAREA_CLASS = `w-full mt-[10px] h-[74px] bg-white border border-[#E5E7EB] rounded-lg p-3 text-sm text-[#111827] placeholder-[#9CA3AF] resize-none focus:outline-none focus:border-[#111827]/30`;
const MAX_CONTRACT_SELECTION = 3;
const PROFILE_REQUIRED_FIELDS: Array<{
  key: keyof EmployeeDocumentProfile;
  label: string;
}> = [
  { key: "company_name", label: "Байгууллагын нэр" },
  { key: "company_register_no", label: "Улсын бүртгэлийн дугаар" },
  { key: "company_address", label: "Байгууллагын хаяг" },
  { key: "employer_representative", label: "Ажил олгогчийн төлөөлөгч" },
  { key: "employee_register_no", label: "Ажилтны регистрийн дугаар" },
  { key: "employee_address", label: "Ажилтны хаяг" },
  { key: "employee_legal_phone", label: "Ажилтны утас" },
  { key: "contract_term", label: "Гэрээний хугацаа" },
  { key: "workplace_location", label: "Ажлын байр" },
  { key: "work_conditions", label: "Хөдөлмөрийн нөхцөл" },
  { key: "work_schedule_type", label: "Ажлын цагийн төрөл" },
  { key: "workday_from", label: "Ажлын өдөр (эхлэх)" },
  { key: "workday_to", label: "Ажлын өдөр (дуусах)" },
  { key: "workdays_count", label: "Ажлын өдрийн тоо" },
  { key: "daily_work_hours", label: "Өдрийн ажиллах цаг" },
  { key: "weekly_work_hours", label: "7 хоногийн ажиллах цаг" },
  { key: "work_start_time", label: "Ажил эхлэх цаг" },
  { key: "work_end_time", label: "Ажил дуусах цаг" },
  { key: "break_start_time", label: "Цайны цаг эхлэх" },
  { key: "break_end_time", label: "Цайны цаг дуусах" },
  { key: "monthly_base_salary_amount", label: "Үндсэн цалин (тоо)" },
  { key: "monthly_base_salary_words", label: "Үндсэн цалин (үсгээр)" },
  { key: "salary_pay_day_1", label: "Цалин буух өдөр 1" },
  { key: "salary_pay_day_2", label: "Цалин буух өдөр 2" },
];
const CONTRACT_TEMPLATES = [
  { id: "employment_contract", label: "Хөдөлмөрийн гэрээ" },
  { id: "probation_order", label: "Туршилтаар авах тушаал" },
  { id: "job_description", label: "Албан тушаалын тодорхойлолт" },
  { id: "nda", label: "Нууцын гэрээ" },
  { id: "salary_increase_order", label: "Цалин нэмэх тушаал" },
  { id: "position_update_order", label: "Албан тушаал өөрчлөх тушаал" },
];

// type GraphQLErrorLike = {
//   graphQLErrors?: Array<{ message?: string | null }>;
// };

function CloseBtn({ onClick }: { onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="text-[#000000] w-6 h-6  hover:text-white transition-colors"
    >
      <FiX className="w-6 h-6" />
    </button>
  );
}

function SendBtn({
  onClick,
  disabled,
}: {
  onClick?: () => void;
  disabled?: boolean;
}) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className="bg-[#111827] hover:bg-[#0b1220] disabled:opacity-50 justify-evenly disabled:cursor-not-allowed text-white text-4 font-medium w-[108px] rounded-lg flex items-center gap-2 transition-colors"
    >
      <FiSend className="w-[18px] h-[18px]" />
      <span className="flex h-5 w-[54px] items-center justify-center">
        {disabled ? "Илгээж байна..." : "Илгээх"}
      </span>
    </button>
  );
}

function BackBtn({ onClick }: { onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="border border-[#1a2035] h-9 w-[78px] rounded-lg text-sm text-gray-400 hover:bg-white/5 hover:text-white transition-colors"
    >
      Буцах
    </button>
  );
}

function SelectField({
  label,
  id,
  options,
  placeholder = "Сонгоно уу",
  value,
  onChange,
  labelClassName = "text-sm font-medium text-white",
  inputClassName = INPUT_CLASS,
}: {
  label: string;
  id: string;
  options: string[];
  placeholder?: string;
  value?: string;
  onChange?: (v: string) => void;
  labelClassName?: string;
  inputClassName?: string;
}) {
  return (
    <div className="flex h-[69px] w-[477px] flex-col justify-between mt-9">
      <label
        htmlFor={id}
        className={`${labelClassName} w-full h-[24px] text-[18px]`}
      >
        {label}
      </label>
      <div className="relative h-[35px]">
        <select
          id={id}
          className={`${inputClassName} text-[16px]`}
          value={value}
          onChange={(e) => onChange?.(e.target.value)}
        >
          <option value="">{placeholder}</option>
          {options.map((opt) => (
            <option key={opt} value={opt}>
              {opt}
            </option>
          ))}
        </select>
        <BiChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 pointer-events-none" />
      </div>
    </div>
  );
}

function UploadArea({
  label,
  subtitle,
  variant = "dark",
  value,
  onChange,
  error,
  disabled,
}: {
  label: string;
  subtitle?: string;
  variant?: "dark" | "light";
  value?: File | null;
  onChange?: (file: File | null) => void;
  error?: string;
  disabled?: boolean;
}) {
  const isLight = variant === "light";
  const inputId = `upload-${label.replace(/\s+/g, "-").toLowerCase()}`;
  return (
    <div className="flex flex-col gap-1.5 mt-9 w-[477px] h-[202px] justify-between">
      <span
        className={`text-[18px] h-6 font-medium flex items-center ${
          isLight ? "text-[#000000]" : "text-white"
        }`}
      >
        {label}
      </span>
      <input
        id={inputId}
        type="file"
        className="hidden"
        disabled={disabled}
        onChange={(event) => {
          const file = event.target.files?.[0] ?? null;
          onChange?.(file);
        }}
      />
      <div
        className={`border border-dashed rounded-xl w-[477px] h-[168px] flex flex-col items-center justify-evenly mt-[10px] transition-colors cursor-pointer ${
          isLight
            ? "border-[#E5E7EB] hover:border-[#111827]/20"
            : "border-[#1a2035] hover:border-[#00CC99]/30"
        }`}
      >
        <FiUploadCloud
          className={`w-6 h-6 ${isLight ? "text-[#000000]" : "text-gray-500"}`}
        />
        <div className="h-10 w-[445px] flex flex-col items-center">
          {" "}
          <p
            className={`text-4 h-5 font-medium flex items-center ${
              isLight ? "text-[#111827]" : "text-white"
            }`}
          >
            {subtitle ?? "Файл хавсаргах (заавал биш)"}
          </p>
          <p
            className={`text-3 h-5 flex items-center ${isLight ? "text-[#9CA3AF]" : "text-gray-500"}`}
          >
            JPEG, PNG, PDF, MP4 төрлүүд — 50MB хүртэл
          </p>
        </div>

        <button
          className={` border text-[14px] h-8 w-[105px]  rounded-lg transition-colors ${
            isLight
              ? "border-[#E5E7EB] text-[#6B7280] hover:bg-[#F3F4F6] hover:text-[#111827]"
              : "border-[#1a2035] text-gray-300 hover:bg-white/5"
          }`}
        >
          Оруулах
        </button>
      </div>
      {error ? (
        <p className="text-xs text-red-500">{error}</p>
      ) : null}
    </div>
  );
}

export const Request = ({ employee }: { employee?: Employee }) => {
  const [activeTab, setActiveTab] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);
  const [sendError, setSendError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  const [clearanceType, setClearanceType] = useState("");
  const [clearanceReason, setClearanceReason] = useState("");
  const [clearanceFile, setClearanceFile] = useState<File | null>(null);
  const [tripFile, setTripFile] = useState<File | null>(null);

  const [contractTemplates, setContractTemplates] = useState<string[]>([]);
  const [contractWarning, setContractWarning] = useState<string | null>(null);
  const [signatureMode, setSignatureMode] = useState<"reuse" | "redraw">(
    "redraw",
  );
  const [usePasscode, setUsePasscode] = useState(false);
  const [passcode, setPasscode] = useState("");
  const [signatureData, setSignatureData] = useState("");
  const [drawing, setDrawing] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [profileForm, setProfileForm] = useState<EmployeeDocumentProfile>({});
  const [profileError, setProfileError] = useState<string | null>(null);
  const [profileSaved, setProfileSaved] = useState(false);
  const [useSavedProfile, setUseSavedProfile] = useState(true);
  const [toasts, setToasts] = useState<Array<{ id: string; text: string }>>([]);

  const authToken =
    typeof window === "undefined"
      ? ""
      : (window.localStorage.getItem(TOKEN_KEY) ?? "");

  const { data: signatureStatusData, loading: signatureStatusLoading } =
    useQuery<{ mySignatureStatus: EmployeeSignatureStatus }>(
      GET_SIGNATURE_STATUS,
      {
        skip: !authToken || activeTab !== "Гэрээний хүсэлт",
        context: {
          headers: buildGraphQLHeaders({ authToken }),
        },
        fetchPolicy: "network-only",
      },
    );

  const signatureStatus = signatureStatusData?.mySignatureStatus ?? null;
  const hasSignature = signatureStatus?.hasSignature ?? false;
  const hasPasscode = signatureStatus?.hasPasscode ?? false;

  const [submitLeaveRequest, { loading: sending }] = useMutation<{
    submitLeaveRequest: LeaveRequest;
  }>(SUBMIT_LEAVE_REQUEST);

  const [submitContractRequest, { loading: sendingContract }] = useMutation<{
    submitContractRequest: ContractRequest;
  }>(SUBMIT_CONTRACT_REQUEST);

  const [updateDocumentProfile, { loading: savingProfile }] = useMutation<{
    updateMyDocumentProfile: Employee;
  }>(UPDATE_MY_DOCUMENT_PROFILE);

  function pushToast(text: string) {
    const id = crypto.randomUUID();
    setToasts((prev) => [...prev, { id, text }]);
    setTimeout(
      () => setToasts((prev) => prev.filter((toast) => toast.id !== id)),
      2200,
    );
  }

  useEffect(() => {
    if (activeTab !== "Гэрээний хүсэлт") return;
    if (signatureStatusLoading) return;

    let isActive = true;
    queueMicrotask(() => {
      if (!isActive) return;
      if (hasSignature) {
        setSignatureMode("reuse");
      } else {
        setSignatureMode("redraw");
      }
    });

    return () => {
      isActive = false;
    };
  }, [activeTab, hasSignature, signatureStatusLoading]);

  useEffect(() => {
    if (activeTab !== "Гэрээний хүсэлт") return;
    const existing = employee?.documentProfile ?? {};

    let isActive = true;
    queueMicrotask(() => {
      if (!isActive) return;
      setProfileForm(existing);
      setProfileSaved(
        Object.values(existing).some((value) =>
          value ? String(value).trim().length > 0 : false,
        ),
      );
      setUseSavedProfile(true);
    });

    return () => {
      isActive = false;
    };
  }, [activeTab, employee?.documentProfile]);

  useEffect(() => {
    if (activeTab !== "Гэрээний хүсэлт") return;
    if (signatureMode !== "redraw") return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const resize = () => {
      const rect = canvas.getBoundingClientRect();
      const ratio = window.devicePixelRatio || 1;
      canvas.width = rect.width * ratio;
      canvas.height = rect.height * ratio;
      const ctx = canvas.getContext("2d");
      if (!ctx) return;
      ctx.setTransform(ratio, 0, 0, ratio, 0, 0);
      ctx.lineWidth = 2;
      ctx.lineCap = "round";
      ctx.strokeStyle = "#111827";
    };

    resize();
    window.addEventListener("resize", resize);
    return () => window.removeEventListener("resize", resize);
  }, [activeTab, signatureMode]);

  useEffect(() => {
    let isActive = true;
    queueMicrotask(() => {
      if (!isActive) return;
      if (signatureMode === "reuse") {
        setUsePasscode(false);
        setSignatureData("");
      }
      setPasscode("");
    });

    return () => {
      isActive = false;
    };
  }, [signatureMode]);

  function clearSignature() {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    setSignatureData("");
  }

  function getCanvasPoint(event: PointerEvent<HTMLCanvasElement>) {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();
    return {
      x: event.clientX - rect.left,
      y: event.clientY - rect.top,
    };
  }

  function handlePointerDown(event: PointerEvent<HTMLCanvasElement>) {
    if (signatureMode !== "redraw") return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const { x, y } = getCanvasPoint(event);
    ctx.beginPath();
    ctx.moveTo(x, y);
    setDrawing(true);
  }

  function handlePointerMove(event: PointerEvent<HTMLCanvasElement>) {
    if (!drawing || signatureMode !== "redraw") return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const { x, y } = getCanvasPoint(event);
    ctx.lineTo(x, y);
    ctx.stroke();
  }

  function handlePointerUp() {
    if (signatureMode !== "redraw") return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    setDrawing(false);
    setSignatureData(canvas.toDataURL("image/png"));
  }

  function resetForm() {
    setSubmitted(false);
    setSendError(null);
    setFieldErrors({});
    setActiveTab(null);
    setClearanceType("");
    setClearanceReason("");
    setClearanceFile(null);
    setTripFile(null);
    setContractTemplates([]);
    setContractWarning(null);
    setSignatureMode("redraw");
    setUsePasscode(false);
    setPasscode("");
    setSignatureData("");
    setProfileError(null);
  }

  function updateProfileField(
    key: keyof EmployeeDocumentProfile,
    value: string,
  ) {
    setProfileForm((prev) => ({ ...prev, [key]: value }));
  }

  function missingProfileFields() {
    return PROFILE_REQUIRED_FIELDS.filter((field) => {
      const value = profileForm[field.key];
      return !value || String(value).trim().length === 0;
    });
  }

  async function handleSaveProfile() {
    setProfileError(null);
    const missing = missingProfileFields();
    if (missing.length > 0) {
      setProfileError("Заавал бөглөх талбарууд байна.");
      return;
    }

    if (!authToken) {
      setProfileError("Нэвтрэх шаардлагатай");
      return;
    }

    await updateDocumentProfile({
      variables: { input: profileForm },
      context: { headers: buildGraphQLHeaders({ authToken }) },
    });

    setProfileSaved(true);
    setUseSavedProfile(true);
    pushToast("Мэдээлэл амжилттай хадгаллаа.");
  }

  async function sendRequest(payload: {
    type: string;
    startTime: string;
    endTime: string;
    reason: string;
  }) {
    const token = window.localStorage.getItem(TOKEN_KEY);
    if (!token) {
      throw new Error("Нэвтрэх шаардлагатай");
    }

    await submitLeaveRequest({
      variables: payload,
      context: {
        headers: buildGraphQLHeaders({ authToken: token }),
      },
    });
  }

  function getTemplateLabel(templateId: string) {
    return (
      CONTRACT_TEMPLATES.find((item) => item.id === templateId)?.label ??
      templateId
    );
  }

  function toggleTemplate(templateId: string) {
    setContractWarning(null);
    setContractTemplates((prev) => {
      if (prev.includes(templateId)) {
        return prev.filter((item) => item !== templateId);
      }
      if (prev.length >= MAX_CONTRACT_SELECTION) {
        setContractWarning("Нэг дор 3 хүртэл гэрээ сонгоно.");
        return prev;
      }
      return [...prev, templateId];
    });
  }

  async function handleSend() {
    setSendError(null);
    setContractWarning(null);
    setFieldErrors({});

    try {
      if (activeTab === "Гэрээний хүсэлт") {
        if (!profileSaved || !useSavedProfile) {
          setSendError("Гэрээний мэдээллээ эхлээд бүрдүүлнэ үү.");
          return;
        }
        if (contractTemplates.length === 0) {
          setSendError("Хамгийн багадаа 1 гэрээ сонгоно уу.");
          return;
        }
        if (signatureMode === "redraw" && !signatureData) {
          setSendError("Гарын үсгээ зурна уу.");
          return;
        }
        if (signatureMode === "reuse" && hasPasscode && passcode.length !== 4) {
          setSendError("4 оронтой кодоо бүрэн оруулна уу.");
          return;
        }
        if (
          signatureMode === "redraw" &&
          usePasscode &&
          passcode.length !== 4
        ) {
          setSendError("4 оронтой кодоо бүрэн оруулна уу.");
          return;
        }

        if (!authToken) {
          setSendError("Нэвтрэх шаардлагатай");
          return;
        }

        await submitContractRequest({
          variables: {
            templateIds: contractTemplates,
            signatureMode,
            passcode:
              signatureMode === "reuse"
                ? hasPasscode
                  ? passcode
                  : null
                : usePasscode
                  ? passcode
                  : null,
            signatureData: signatureMode === "redraw" ? signatureData : null,
          },
          context: {
            headers: buildGraphQLHeaders({ authToken }),
          },
        });
        pushToast("Гэрээний хүсэлт амжилттай илгээгдлээ.");
      } else if (activeTab === "Тойрох хуудас") {
        const nextErrors: Record<string, string> = {};
        if (!clearanceType.trim()) nextErrors.clearanceType = "Заавал бөглөнө.";
        if (!clearanceFile) nextErrors.clearanceFile = "Файл хавсаргана уу.";
        if (!clearanceReason.trim())
          nextErrors.clearanceReason = "Заавал бөглөнө.";
        if (Object.keys(nextErrors).length > 0) {
          setFieldErrors(nextErrors);
          return;
        }
        await sendRequest({
          type: `Тойрох хуудас${clearanceType ? ` - ${clearanceType}` : ""}`,
          startTime: new Date().toISOString(),
          endTime: new Date().toISOString(),
          reason: clearanceReason,
        });
      } else if (activeTab === "Томилолт") {
        const nextErrors: Record<string, string> = {};
        if (!tripFile) nextErrors.tripFile = "Файл хавсаргана уу.";
        if (!clearanceReason.trim())
          nextErrors.clearanceReason = "Заавал бөглөнө.";
        if (Object.keys(nextErrors).length > 0) {
          setFieldErrors(nextErrors);
          return;
        }
        await sendRequest({
          type: "Томилолт",
          startTime: new Date().toISOString(),
          endTime: new Date().toISOString(),
          reason: clearanceReason,
        });
      }

      setSubmitted(true);
      setTimeout(() => {
        resetForm();
      }, 2000);
    } catch (err) {
      const apolloError = err as
        | { graphQLErrors?: Array<{ message: string }> }
        | undefined;
      const gqlMessage = apolloError?.graphQLErrors?.[0]?.message?.trim() ?? "";
      setSendError(
        gqlMessage ||
          (err instanceof Error
            ? err.message
            : "Алдаа гарлаа. Дахин оролдоно уу."),
      );
    }
  }

  function closeDialog() {
    resetForm();
  }

  const quickActions = [
    // {
    //   icon: <BiFile className="w-5 h-5 text-[#FFD166]" />,
    //   title: "Гэрээний хүсэлт",
    //   desc: "Гэрээний баримт бичиг захиалах",
    //   iconBg: "border-[#FFE7A3] bg-[#FFF7E0]",
    // },
    {
      icon: <Planeicon />,
      title: "Томилолт",
      desc: "Томилолт авах хүсэлт",
      iconBg: "border-[#D7E3FF] bg-[#EEF4FF]",
    },
    {
      icon: <BiCalendar className="w-5 h-5 text-[#00CC99]" />,
      title: "Тойрох хуудас",
      desc: "Тойрох хуудас авах хүсэлт",
      iconBg: "border-[#C6F7D4] bg-[#ECFDF3]",
    },
  ];

  return (
    <div className="flex w-[1056px] max-w-full flex-col gap-5">
      <div className="flex h-[46px] items-center justify-between">
        <div className="flex flex-col gap-2 ">
          <h2 className="h-[24px] w-[190px] text-[20px] font-semibold text-[#111827]">
            Шуурхай үйлдлүүд
          </h2>
          <p className="h-[20px] text-[14px] text-[#6B7280] w-[190px] ">
            Хүсэлт илгээх
          </p>
        </div>
      </div>

      <div className="grid w-full grid-cols-1 gap-4 md:grid-cols-2">
        {quickActions.map((action) => (
          <div
            key={action.title}
            className="flex h-[136px] w-[520px] rounded-[16px] border border-[#E5E7EB] bg-white p-6 shadow-[0_4px_14px_rgba(15,23,42,0.06)]"
          >
            <div className="relative flex h-[88px] w-[470px] box-border items-center gap-5 p-5">
              <div
                className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-lg border ${action.iconBg}`}
              >
                {action.icon}
              </div>

              <div className="h-[42px] w-[332px] flex flex-col justify-between">
                <p className="text-[18px] font-semibold h-[24px] leading-5 text-[#111827]">
                  {action.title}
                </p>
                <p className=" text-[12px] leading-4 h-[18px] text-[#6B7280]">
                  {action.desc}
                </p>
              </div>

              <button
                onClick={() => setActiveTab(action.title)}
                className="absolute right-5 top-1/2 flex h-5 w-5 -translate-y-1/2 items-center justify-center text-[#6B7280] transition-colors hover:bg-[#F3F4F6] hover:text-[#111827]"
              >
                <BiPlus className="h-5 w-5" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {submitted && activeTab && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/60 backdrop-blur-sm z-50">
          <div
            className={`w-90 rounded-2xl bg-white text-[#111827] p-8 border border-[#E5E7EB] shadow-2xl flex flex-col items-center gap-4`}
          >
            <div className="w-14 h-14 rounded-full bg-[#00CC99]/15 border border-[#00CC99]/30 flex items-center justify-center">
              <FiCheck className="w-7 h-7 text-[#00CC99]" />
            </div>
            <div className="text-center">
              <p className="text-[#111827] font-semibold text-lg">
                Хүсэлт амжилттай илгээгдлээ
              </p>
              <p className="text-[#6B7280] text-sm mt-1">
                Таны хүсэлтийг хянаж үзнэ
              </p>
            </div>
          </div>
        </div>
      )}

      {activeTab === "Тойрох хуудас" && !submitted && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/60 backdrop-blur-sm z-50">
          <div
            className={`w-[525px] h-[677px] rounded-2xl ${LIGHT_DIALOG_BG} text-[#111827] px-6 py-[30px] border ${LIGHT_DIALOG_BORDER} shadow-2xl flex flex-col`}
          >
            <div className="flex justify-between items-start w-[477px] h-[58px]">
              <div className="w-[453px] h-[58px] flex flex-col justify-between ">
                <h2 className="text-[20px] font-semibold w-[453px] h-[24px]">
                  Тойрох хуудас авах хүсэлт
                </h2>
                <p className="text-4 text-[#6B7280] h-[24px]">
                  Тойрох хуудас авах шалтгаан болон файл оруулна уу
                </p>
              </div>
              <CloseBtn onClick={closeDialog} />
            </div>

            <SelectField
              label="Төрөл"
              id="clearance-type"
              options={[
                "Ажлаас гарах",
                "Дотоод шилжилт",
                "Гадаад томилолт",
                "Бусад",
              ]}
              value={clearanceType}
              onChange={setClearanceType}
              labelClassName="text-[18px] font-medium text-[#000000] w-[186px] h-[24px]"
              inputClassName={LIGHT_INPUT_CLASS}
            />
            {fieldErrors.clearanceType ? (
              <p className="text-xs text-red-500">
                {fieldErrors.clearanceType}
              </p>
            ) : null}

            <UploadArea
              label="Файл хавсаргах"
              variant="light"
              value={clearanceFile}
              onChange={(file) => {
                setClearanceFile(file);
                setFieldErrors((prev) => ({ ...prev, clearanceFile: "" }));
              }}
              error={fieldErrors.clearanceFile}
            />

            <div className="w-[477px] h-[108px] flex flex-col mt-9">
              <label className="text-[18px] flex items-center h-6 w-full font-medium text-[#111827]">
                Шалтгаан
              </label>
              <textarea
                rows={3}
                placeholder="Шалтгаанаа бичнэ үү..."
                className={`${LIGHT_TEXTAREA_CLASS} ${fieldErrors.clearanceReason ? "border-red-400 focus:border-red-500" : ""}`}
                value={clearanceReason}
                onChange={(e) => {
                  setClearanceReason(e.target.value);
                  setFieldErrors((prev) => ({ ...prev, clearanceReason: "" }));
                }}
              />
              {fieldErrors.clearanceReason ? (
                <p className="text-xs text-red-500">
                  {fieldErrors.clearanceReason}
                </p>
              ) : null}
            </div>

            {sendError && (
              <p className="text-red-400 text-xs bg-red-500/10 border border-red-500/20 rounded-lg px-3 py-2">
                {sendError}
              </p>
            )}

            <div className="flex justify-end mt-9 h-9 w-[477px] gap-5">
              <BackBtn onClick={closeDialog} />
              <SendBtn onClick={handleSend} disabled={sending} />
            </div>
          </div>
        </div>
      )}

      {activeTab === "Томилолт" && !submitted && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/60 backdrop-blur-sm z-50">
          <div
            className={`w-[525px] h-[428px] rounded-2xl ${LIGHT_DIALOG_BG} text-[#111827] px-6 py-[30px] border ${LIGHT_DIALOG_BORDER} shadow-2xl flex flex-col`}
          >
            <div className="flex w-[477px] h-[58px] justify-between ">
              <div className="w-[453px] h-[58px] flex flex-col justify-between ">
                <h2 className="text-[20px] w-[453px] h-6 font-semibold flex items-center">
                  Томилолтын мэдээлэл
                </h2>
                <p className="text-[16px] h-6 w-[453px] text-[#6B7280] flex items-center">
                  Томилолтын мэдээллээ оруулна уу.
                </p>
              </div>
              <CloseBtn onClick={closeDialog} />
            </div>

            <UploadArea
              label="Файл хавсаргах"
              subtitle="Файл хавсаргана уу."
              variant="light"
              value={tripFile}
              onChange={(file) => {
                setTripFile(file);
                setFieldErrors((prev) => ({ ...prev, tripFile: "" }));
              }}
              error={fieldErrors.tripFile}
            />

            {sendError && (
              <p className="text-red-400 text-xs bg-red-500/10 border border-red-500/20 rounded-lg px-3 py-2">
                {sendError}
              </p>
            )}

            <div className="flex justify-end mt-9 gap-3">
              <BackBtn onClick={closeDialog} />
              <SendBtn onClick={handleSend} disabled={sending} />
            </div>
          </div>
        </div>
      )}
      {toasts.length > 0 ? (
        <div className="fixed bottom-6 right-6 z-60 flex flex-col gap-2">
          {toasts.map((toast) => (
            <div
              key={toast.id}
              className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-200 shadow-lg"
            >
              {toast.text}
            </div>
          ))}
        </div>
      ) : null}
    </div>
  );
};
