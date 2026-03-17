import { useMutation, useQuery } from "@apollo/client/react";
import { useEffect, useRef, useState } from "react";
import type { PointerEvent } from "react";
import { BiChevronRight, BiFile, BiPlus } from "react-icons/bi";
import { FiCheck, FiSend, FiX } from "react-icons/fi";

import { buildGraphQLHeaders } from "@/lib/apollo-client";
import {
  SUBMIT_CONTRACT_REQUEST,
  UPDATE_MY_DOCUMENT_PROFILE,
} from "@/graphql/mutations";
import { GET_SIGNATURE_STATUS } from "@/graphql/queries";
import type {
  ContractRequest,
  Employee,
  EmployeeDocumentProfile,
  EmployeeSignatureStatus,
} from "@/lib/types";

const TOKEN_KEY = "epas_auth_token";

const DIALOG_BG = "bg-[#030810]";
const DIALOG_BORDER = "border-[#1a2035]";
const INPUT_CLASS = `w-full bg-[#040d18] border border-[#1a2035] rounded-lg p-2.5 text-sm text-gray-300 focus:outline-none focus:border-[#00CC99]/40 appearance-none`;
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

function CloseBtn({ onClick }: { onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="text-gray-500 hover:text-white transition-colors">
      <FiX className="w-5 h-5" />
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
      className="bg-[#00CC99] hover:bg-[#00b388] disabled:opacity-50 disabled:cursor-not-allowed text-white text-sm font-medium px-5 py-2.5 rounded-lg flex items-center gap-2 transition-colors">
      <FiSend className="w-4 h-4" />
      {disabled ? "Илгээж байна..." : "Илгээх"}
    </button>
  );
}

function BackBtn({ onClick }: { onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="border border-[#1a2035] px-5 py-2.5 rounded-lg text-sm text-gray-400 hover:bg-white/5 hover:text-white transition-colors">
      Буцах
    </button>
  );
}

export const Request = ({ employee }: { employee?: Employee }) => {
  const [activeTab, setActiveTab] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);
  const [sendError, setSendError] = useState<string | null>(null);

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
    setActiveTab(null);
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
    {
      icon: <BiFile className="w-5 h-5 text-[#FFD166]" />,
      title: "Гэрээний хүсэлт",
      desc: "Гэрээний баримт бичиг захиалах",
      bg: "border-[#4A3B00] bg-[radial-gradient(circle_at_top_left,_rgba(255,209,102,0.28),_transparent_38%),linear-gradient(180deg,#1a1402_0%,#0b0a06_100%)]",
      iconBg:
        "border-[#5E4B00] bg-[linear-gradient(180deg,rgba(46,35,3,0.95)_0%,rgba(24,19,5,0.95)_100%)]",
    },
  ];

  return (
    <div className="flex flex-col gap-4">
      <div className="flex h-[50px] items-center justify-between">
        <div>
          <h2 className="text-white text-[19.5px] font-semibold">
            Шуурхай үйлдлүүд
          </h2>
          <p className="text-[#4A4A6A] text-[14px] mt-0.5">Хүсэлт илгээх</p>
        </div>
        <a
          href="#"
          className="flex items-center gap-1 text-[#00CC99] text-[14px] font-medium hover:underline">
          Бүх хүсэлтүүд <BiChevronRight className="w-4 h-4" />
        </a>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
        {quickActions.map((action) => (
          <div
            key={action.title}
            className={`${action.bg} flex h-[136px] w-full items-center justify-between gap-3 rounded-[16px] border px-6 py-6 shadow-[0_0_0_1px_rgba(255,255,255,0.03)_inset]`}>
            <div className="flex items-center gap-4">
              <div
                className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-[12px] border ${action.iconBg}`}>
                {action.icon}
              </div>

              <div className="max-w-[260px]">
                <p className="text-[16px] font-semibold leading-5 text-white">
                  {action.title}
                </p>
                <p className="mt-1 text-[13px] leading-4 text-[#7C8698]">
                  {action.desc}
                </p>
              </div>
            </div>

            <button
              onClick={() => setActiveTab(action.title)}
              className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-[#8B96A8] transition-colors hover:bg-white/5 hover:text-white">
              <BiPlus className="h-5 w-5" />
            </button>
          </div>
        ))}
      </div>

      {submitted && activeTab && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/60 backdrop-blur-sm z-50">
          <div
            className={`w-[360px] rounded-2xl ${DIALOG_BG} text-white p-8 border ${DIALOG_BORDER} shadow-2xl flex flex-col items-center gap-4`}>
            <div className="w-14 h-14 rounded-full bg-[#00CC99]/15 border border-[#00CC99]/30 flex items-center justify-center">
              <FiCheck className="w-7 h-7 text-[#00CC99]" />
            </div>
            <div className="text-center">
              <p className="text-white font-semibold text-lg">
                Хүсэлт амжилттай илгээгдлээ
              </p>
              <p className="text-gray-500 text-sm mt-1">
                Таны хүсэлтийг хянаж үзнэ
              </p>
            </div>
          </div>
        </div>
      )}

      {activeTab === "Гэрээний хүсэлт" && !submitted && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/60 backdrop-blur-sm z-50">
          <div
            className={`w-[560px] max-h-[82vh] overflow-y-auto rounded-2xl ${DIALOG_BG} text-white p-6 border ${DIALOG_BORDER} shadow-2xl flex flex-col gap-4 animate-fade-up`}>
            <div className="flex justify-between items-start">
              <div>
                <h2 className="text-xl font-semibold">Гэрээний хүсэлт</h2>
                <p className="text-sm text-gray-500 mt-1">
                  Нэг дор 3 хүртэл гэрээ сонгох боломжтой.
                </p>
              </div>
              <CloseBtn onClick={closeDialog} />
            </div>

            <div className="flex items-center justify-between rounded-lg border border-white/10 bg-white/5 px-3 py-2">
              <span className="text-xs text-gray-400">
                Сонгосон: {contractTemplates.length}/3
              </span>
              <div className="flex flex-wrap gap-2">
                {contractTemplates.length > 0 ? (
                  contractTemplates.map((item) => (
                    <span
                      key={item}
                      className="rounded-full border border-[#00CC99]/30 bg-[#00CC99]/10 px-2.5 py-1 text-[11px] text-[#9BEBD7]">
                      {getTemplateLabel(item)}
                    </span>
                  ))
                ) : (
                  <span className="text-xs text-gray-500">Сонголт байхгүй</span>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 gap-2">
              {CONTRACT_TEMPLATES.map((template) => {
                const selected = contractTemplates.includes(template.id);
                return (
                  <button
                    key={template.id}
                    type="button"
                    onClick={() => toggleTemplate(template.id)}
                    className={`flex items-center justify-between rounded-lg border px-3 py-2 text-sm transition-colors ${
                      selected
                        ? "border-[#00CC99]/50 bg-[#00CC99]/15 text-white"
                        : "border-[#1a2035] bg-[#040d18] text-gray-300 hover:border-[#00CC99]/30"
                    }`}>
                    <span>{template.label}</span>
                    <span
                      className={`text-xs ${
                        selected ? "text-[#00CC99]" : "text-gray-500"
                      }`}>
                      {selected ? "Сонгосон" : "Сонгох"}
                    </span>
                  </button>
                );
              })}
            </div>

            <div className="rounded-lg border border-white/10 bg-[#040d18] p-3 flex flex-col gap-3">
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium text-white">
                  Гэрээний шаардлагатай мэдээлэл
                </p>
                {profileSaved ? (
                  <span className="text-xs text-emerald-300">Бүрдсэн</span>
                ) : (
                  <span className="text-xs text-amber-300">Бүрдээгүй</span>
                )}
              </div>

              {profileSaved ? (
                <div className="flex flex-wrap gap-3 text-sm text-gray-300">
                  <label className="flex items-center gap-2">
                    <input
                      type="radio"
                      name="profile-mode"
                      checked={useSavedProfile}
                      onChange={() => setUseSavedProfile(true)}
                      className="h-4 w-4 text-[#00CC99] border-[#1a2035] bg-[#040d18] focus:ring-0"
                    />
                    Мэдээллээр үргэлжлүүлэх
                  </label>
                  <label className="flex items-center gap-2">
                    <input
                      type="radio"
                      name="profile-mode"
                      checked={!useSavedProfile}
                      onChange={() => setUseSavedProfile(false)}
                      className="h-4 w-4 text-[#00CC99] border-[#1a2035] bg-[#040d18] focus:ring-0"
                    />
                    Засварлах
                  </label>
                </div>
              ) : null}

              {!profileSaved || !useSavedProfile ? (
                <div className="grid grid-cols-1 gap-2">
                  {PROFILE_REQUIRED_FIELDS.map((field) => (
                    <div key={field.key} className="flex flex-col gap-1">
                      <label className="text-xs text-gray-400">
                        {field.label}
                      </label>
                      <input
                        className={INPUT_CLASS}
                        value={profileForm[field.key] ?? ""}
                        onChange={(e) =>
                          updateProfileField(field.key, e.target.value)
                        }
                        placeholder={field.label}
                      />
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-gray-500">
                  Мэдээлэл бүрдсэн. Хэрэв өөрчлөх бол “Засварлах”‑ыг сонгоно уу.
                </p>
              )}

              {profileError ? (
                <p className="text-amber-300 text-xs bg-amber-500/10 border border-amber-500/20 rounded-lg px-3 py-2">
                  {profileError}
                </p>
              ) : null}

              {!profileSaved || !useSavedProfile ? (
                <div className="flex justify-end">
                  <button
                    type="button"
                    onClick={handleSaveProfile}
                    disabled={savingProfile}
                    className="border border-[#1a2035] px-4 py-2 rounded-lg text-xs text-gray-300 hover:bg-white/5 hover:text-white transition-colors disabled:opacity-50">
                    {savingProfile ? "Хадгалж байна..." : "Мэдээлэл хадгалах"}
                  </button>
                </div>
              ) : null}
            </div>

            <div className="rounded-lg border border-white/10 bg-[#040d18] p-3 flex flex-col gap-3">
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium text-white">Гарын үсэг</p>
                {signatureStatusLoading ? (
                  <span className="text-xs text-gray-500">Уншиж байна...</span>
                ) : null}
              </div>

              {signatureStatusLoading ? null : hasSignature ? (
                <div className="flex flex-wrap gap-3 text-sm text-gray-300">
                  <label className="flex items-center gap-2">
                    <input
                      type="radio"
                      name="signature-mode"
                      checked={signatureMode === "reuse"}
                      onChange={() => setSignatureMode("reuse")}
                      className="h-4 w-4 text-[#00CC99] border-[#1a2035] bg-[#040d18] focus:ring-0"
                    />
                    Өмнөх гарын үсэг ашиглах
                  </label>
                  <label className="flex items-center gap-2">
                    <input
                      type="radio"
                      name="signature-mode"
                      checked={signatureMode === "redraw"}
                      onChange={() => setSignatureMode("redraw")}
                      className="h-4 w-4 text-[#00CC99] border-[#1a2035] bg-[#040d18] focus:ring-0"
                    />
                    Дахин зурах
                  </label>
                </div>
              ) : (
                <p className="text-xs text-gray-500">
                  Эхний удаа гарын үсгээ зурж баталгаажуулна.
                </p>
              )}

              {signatureMode === "redraw" ? (
                <>
                  <div className="rounded-lg border border-dashed border-[#1a2035] bg-[#020812] p-3">
                    <canvas
                      ref={canvasRef}
                      onPointerDown={handlePointerDown}
                      onPointerMove={handlePointerMove}
                      onPointerUp={handlePointerUp}
                      onPointerLeave={handlePointerUp}
                      className="h-[120px] w-full cursor-crosshair rounded-md"
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <p className="text-xs text-gray-500">
                      Хуруу/хулганаар гарын үсгээ зурна уу.
                    </p>
                    <button
                      type="button"
                      onClick={clearSignature}
                      className="text-xs text-gray-400 hover:text-white transition-colors">
                      Арилгах
                    </button>
                  </div>

                  <div className="flex items-center gap-2">
                    <input
                      id="use-passcode"
                      type="checkbox"
                      checked={usePasscode}
                      onChange={(e) => {
                        setUsePasscode(e.target.checked);
                        setSendError(null);
                      }}
                      className="h-4 w-4 rounded border-[#1a2035] bg-[#040d18] text-[#00CC99] focus:ring-0"
                    />
                    <label
                      htmlFor="use-passcode"
                      className="text-sm text-gray-300">
                      4 оронтой код тохируулах (заавал биш)
                    </label>
                  </div>

                  {usePasscode && (
                    <div className="flex flex-col gap-1.5">
                      <label className="text-sm font-medium text-white">
                        Нууц код
                      </label>
                      <input
                        inputMode="numeric"
                        pattern="[0-9]*"
                        maxLength={4}
                        placeholder="0000"
                        className={INPUT_CLASS}
                        value={passcode}
                        onChange={(e) =>
                          setPasscode(e.target.value.replace(/\D/g, ""))
                        }
                      />
                    </div>
                  )}
                </>
              ) : (
                <>
                  {hasPasscode ? (
                    <div className="flex flex-col gap-1.5">
                      <label className="text-sm font-medium text-white">
                        Код баталгаажуулах
                      </label>
                      <input
                        inputMode="numeric"
                        pattern="[0-9]*"
                        maxLength={4}
                        placeholder="0000"
                        className={INPUT_CLASS}
                        value={passcode}
                        onChange={(e) =>
                          setPasscode(e.target.value.replace(/\D/g, ""))
                        }
                      />
                    </div>
                  ) : (
                    <p className="text-xs text-gray-500">
                      Танай гарын үсэг хадгалагдсан байна. Код шаардлагагүй.
                    </p>
                  )}
                </>
              )}
            </div>

            {contractWarning && (
              <p className="text-amber-300 text-xs bg-amber-500/10 border border-amber-500/20 rounded-lg px-3 py-2">
                {contractWarning}
              </p>
            )}

            {sendError && (
              <p className="text-red-400 text-xs bg-red-500/10 border border-red-500/20 rounded-lg px-3 py-2">
                {sendError}
              </p>
            )}

            <div className="flex justify-end gap-3">
              <BackBtn onClick={closeDialog} />
              <SendBtn onClick={handleSend} disabled={sendingContract} />
            </div>
          </div>
        </div>
      )}

      {toasts.length > 0 ? (
        <div className="fixed bottom-6 right-6 z-60 flex flex-col gap-2">
          {toasts.map((toast) => (
            <div
              key={toast.id}
              className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-200 shadow-lg">
              {toast.text}
            </div>
          ))}
        </div>
      ) : null}
    </div>
  );
};
