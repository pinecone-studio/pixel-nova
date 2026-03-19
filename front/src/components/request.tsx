import { useMutation } from "@apollo/client/react";
import { useState } from "react";
import { BiCalendar, BiChevronDown, BiPlus } from "react-icons/bi";
import { FiCheck, FiSend, FiUploadCloud, FiX } from "react-icons/fi";

import { SUBMIT_LEAVE_REQUEST } from "@/graphql/mutations";
import { buildGraphQLHeaders } from "@/lib/apollo-client";
import type { Employee, LeaveRequest } from "@/lib/types";
import { Planeicon } from "./icons";

const TOKEN_KEY = "epas_auth_token";

const INPUT_CLASS = `w-full bg-[#040d18] border border-[#1a2035] rounded-lg p-2.5 text-sm text-gray-300 focus:outline-none focus:border-[#00CC99]/40 appearance-none`;
const LIGHT_DIALOG_BG = "bg-white";
const LIGHT_DIALOG_BORDER = "border-[#E5E7EB]";
const LIGHT_INPUT_CLASS = `w-full bg-white border border-[#E5E7EB] rounded-lg p-2.5 text-sm text-[#111827] focus:outline-none focus:border-[#111827]/30 appearance-none`;
const LIGHT_TEXTAREA_CLASS = `w-full mt-[10px] h-[74px] bg-white border border-[#E5E7EB] rounded-lg p-3 text-sm text-[#111827] placeholder-[#9CA3AF] resize-none focus:outline-none focus:border-[#111827]/30`;

function CloseBtn({ onClick }: { onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="h-6 w-6 text-[#000000] transition-colors hover:text-white"
    >
      <FiX className="h-6 w-6" />
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
      className="flex w-[108px] items-center justify-evenly gap-2 rounded-lg bg-[#111827] text-4 font-medium text-white transition-colors hover:bg-[#0b1220] disabled:cursor-not-allowed disabled:opacity-50"
    >
      <FiSend className="h-[18px] w-[18px]" />
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
      className="h-9 w-[78px] rounded-lg border border-[#1a2035] text-sm text-gray-400 transition-colors hover:bg-white/5 hover:text-white"
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
    <div className="mt-9 flex h-[69px] w-[477px] flex-col justify-between">
      <label
        htmlFor={id}
        className={`${labelClassName} h-[24px] w-full text-[18px]`}
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
        <BiChevronDown className="pointer-events-none absolute right-4 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-500" />
      </div>
    </div>
  );
}

function UploadArea({
  label,
  subtitle,
  variant = "dark",
  onChange,
  error,
  disabled,
  fileName,
}: {
  label: string;
  subtitle?: string;
  variant?: "dark" | "light";
  onChange?: (file: File | null) => void;
  error?: string;
  disabled?: boolean;
  fileName?: string;
}) {
  const isLight = variant === "light";
  const inputId = `upload-${label.replace(/\s+/g, "-").toLowerCase()}`;

  return (
    <div className="mt-9 flex h-[202px] w-[477px] flex-col justify-between gap-1.5">
      <span
        className={`flex h-6 items-center text-[18px] font-medium ${
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
        onClick={() => document.getElementById(inputId)?.click()}
        className={`mt-[10px] flex h-[168px] w-[477px] cursor-pointer flex-col items-center justify-evenly rounded-xl border border-dashed transition-colors ${
          isLight
            ? "border-[#E5E7EB] hover:border-[#111827]/20"
            : "border-[#1a2035] hover:border-[#00CC99]/30"
        }`}
      >
        <FiUploadCloud
          className={`h-6 w-6 ${isLight ? "text-[#000000]" : "text-gray-500"}`}
        />
        <div className="flex h-10 w-[445px] flex-col items-center">
          {fileName ? (
            <p className={`flex h-5 items-center text-4 font-medium text-[#00CC99]`}>
              {fileName}
            </p>
          ) : (
            <p
              className={`flex h-5 items-center text-4 font-medium ${
                isLight ? "text-[#111827]" : "text-white"
              }`}
            >
              {subtitle ?? "Файл хавсаргана уу"}
            </p>
          )}
          <p
            className={`flex h-5 items-center text-3 ${
              isLight ? "text-[#9CA3AF]" : "text-gray-500"
            }`}
          >
            JPEG, PNG, PDF, MP4 төрлүүд - 50MB хүртэл
          </p>
        </div>

        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            document.getElementById(inputId)?.click();
          }}
          className={`h-8 w-[105px] rounded-lg border text-[14px] transition-colors ${
            isLight
              ? "border-[#E5E7EB] text-[#6B7280] hover:bg-[#F3F4F6] hover:text-[#111827]"
              : "border-[#1a2035] text-gray-300 hover:bg-white/5"
          }`}
        >
          Оруулах
        </button>
      </div>
      {error ? <p className="text-xs text-red-500">{error}</p> : null}
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
  const [toasts, setToasts] = useState<Array<{ id: string; text: string }>>([]);

  void employee;

  const [submitLeaveRequest, { loading: sending }] = useMutation<{
    submitLeaveRequest: LeaveRequest;
  }>(SUBMIT_LEAVE_REQUEST);

  function pushToast(text: string) {
    const id = crypto.randomUUID();
    setToasts((prev) => [...prev, { id, text }]);
    setTimeout(
      () => setToasts((prev) => prev.filter((toast) => toast.id !== id)),
      2200,
    );
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

  async function handleSend() {
    setSendError(null);
    setFieldErrors({});

    try {
      if (activeTab === "Тойрох хуудас") {
        const nextErrors: Record<string, string> = {};
        if (!clearanceType.trim()) nextErrors.clearanceType = "Заавал бөглөнө.";
        if (!clearanceFile) nextErrors.clearanceFile = "Файл хавсаргана уу.";
        if (!clearanceReason.trim()) {
          nextErrors.clearanceReason = "Заавал бөглөнө.";
        }
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
        if (!clearanceReason.trim()) {
          nextErrors.clearanceReason = "Заавал бөглөнө.";
        }
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
      } else {
        return;
      }

      setSubmitted(true);
      pushToast("Хүсэлт амжилттай илгээгдлээ.");
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
      icon: <Planeicon />,
      title: "Томилолт",
      desc: "Томилолт авах хүсэлт",
      iconBg: "border-[#D7E3FF] bg-[#EEF4FF]",
    },
    {
      icon: <BiCalendar className="h-5 w-5 text-[#00CC99]" />,
      title: "Тойрох хуудас",
      desc: "Тойрох хуудас авах хүсэлт",
      iconBg: "border-[#C6F7D4] bg-[#ECFDF3]",
    },
  ];

  return (
    <div className="flex w-[1056px] max-w-full flex-col gap-5">
      <div className="flex h-[46px] items-center justify-between">
        <div className="flex flex-col gap-2">
          <h2 className="h-[24px] w-[190px] text-[20px] font-semibold text-[#111827]">
            Шуурхай үйлдлүүд
          </h2>
          <p className="h-[20px] w-[190px] text-[14px] text-[#6B7280]">
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

              <div className="flex h-[42px] w-[332px] flex-col justify-between">
                <p className="h-[24px] text-[18px] font-semibold leading-5 text-[#111827]">
                  {action.title}
                </p>
                <p className="h-[18px] text-[12px] leading-4 text-[#6B7280]">
                  {action.desc}
                </p>
              </div>

              <button
                type="button"
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
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <div className="flex w-90 flex-col items-center gap-4 rounded-2xl border border-[#E5E7EB] bg-white p-8 text-[#111827] shadow-2xl">
            <div className="flex h-14 w-14 items-center justify-center rounded-full border border-[#00CC99]/30 bg-[#00CC99]/15">
              <FiCheck className="h-7 w-7 text-[#00CC99]" />
            </div>
            <div className="text-center">
              <p className="text-lg font-semibold text-[#111827]">
                Хүсэлт амжилттай илгээгдлээ
              </p>
              <p className="mt-1 text-sm text-[#6B7280]">
                Таны хүсэлтийг хянаж үзнэ
              </p>
            </div>
          </div>
        </div>
      )}

      {activeTab === "Тойрох хуудас" && !submitted && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <div
            className={`flex h-[677px] w-[525px] flex-col rounded-2xl border px-6 py-[30px] text-[#111827] shadow-2xl ${LIGHT_DIALOG_BG} ${LIGHT_DIALOG_BORDER}`}
          >
            <div className="flex h-[58px] w-[477px] items-start justify-between">
              <div className="flex h-[58px] w-[453px] flex-col justify-between">
                <h2 className="h-[24px] w-[453px] text-[20px] font-semibold">
                  Тойрох хуудас авах хүсэлт
                </h2>
                <p className="text-4 h-[24px] text-[#6B7280]">
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
              labelClassName="h-[24px] w-[186px] text-[18px] font-medium text-[#000000]"
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
              onChange={(file) => {
                setClearanceFile(file);
                setFieldErrors((prev) => ({ ...prev, clearanceFile: "" }));
              }}
              error={fieldErrors.clearanceFile}
              fileName={clearanceFile?.name}
            />

            <div className="mt-9 flex h-[108px] w-[477px] flex-col">
              <label className="flex h-6 w-full items-center text-[18px] font-medium text-[#111827]">
                Шалтгаан
              </label>
              <textarea
                rows={3}
                placeholder="Шалтгаанаа бичнэ үү..."
                className={`${LIGHT_TEXTAREA_CLASS} ${
                  fieldErrors.clearanceReason
                    ? "border-red-400 focus:border-red-500"
                    : ""
                }`}
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
              <p className="rounded-lg border border-red-500/20 bg-red-500/10 px-3 py-2 text-xs text-red-400">
                {sendError}
              </p>
            )}

            <div className="mt-9 flex h-9 w-[477px] justify-end gap-5">
              <BackBtn onClick={closeDialog} />
              <SendBtn onClick={handleSend} disabled={sending} />
            </div>
          </div>
        </div>
      )}

      {activeTab === "Томилолт" && !submitted && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <div
            className={`flex h-[428px] w-[525px] flex-col rounded-2xl border px-6 py-[30px] text-[#111827] shadow-2xl ${LIGHT_DIALOG_BG} ${LIGHT_DIALOG_BORDER}`}
          >
            <div className="flex h-[58px] w-[477px] justify-between">
              <div className="flex h-[58px] w-[453px] flex-col justify-between">
                <h2 className="flex h-6 w-[453px] items-center text-[20px] font-semibold">
                  Томилолтын мэдээлэл
                </h2>
                <p className="flex h-6 w-[453px] items-center text-[16px] text-[#6B7280]">
                  Томилолтын мэдээллээ оруулна уу.
                </p>
              </div>
              <CloseBtn onClick={closeDialog} />
            </div>

            <UploadArea
              label="Файл хавсаргах"
              subtitle="Файл хавсаргана уу."
              variant="light"
              onChange={(file) => {
                setTripFile(file);
                setFieldErrors((prev) => ({ ...prev, tripFile: "" }));
              }}
              error={fieldErrors.tripFile}
              fileName={tripFile?.name}
            />

            {sendError && (
              <p className="rounded-lg border border-red-500/20 bg-red-500/10 px-3 py-2 text-xs text-red-400">
                {sendError}
              </p>
            )}

            <div className="mt-9 flex justify-end gap-3">
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
