import { useMutation } from "@apollo/client/react";
import { useState } from "react";
import {
  BiCalendar,
  BiChevronDown,
  BiChevronRight,
  BiFile,
  BiPlus,
} from "react-icons/bi";
import { FiCheck, FiSend, FiUploadCloud, FiX } from "react-icons/fi";

import { buildGraphQLHeaders } from "@/lib/apollo-client";
import { SUBMIT_LEAVE_REQUEST } from "@/graphql/mutations";
import type { LeaveRequest } from "@/lib/types";

const TOKEN_KEY = "epas_auth_token";

const DIALOG_BG = "bg-[#030810]";
const DIALOG_BORDER = "border-[#1a2035]";
const INPUT_CLASS = `w-full bg-[#040d18] border border-[#1a2035] rounded-lg p-2.5 text-sm text-gray-300 focus:outline-none focus:border-[#00CC99]/40 appearance-none`;
const TEXTAREA_CLASS = `w-full bg-[#040d18] border border-[#1a2035] rounded-lg p-3 text-sm text-gray-300 placeholder-gray-600 resize-none focus:outline-none focus:border-[#00CC99]/40`;

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

function SelectField({
  label,
  id,
  options,
  placeholder = "Сонгоно уу",
  value,
  onChange,
}: {
  label: string;
  id: string;
  options: string[];
  placeholder?: string;
  value?: string;
  onChange?: (v: string) => void;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={id} className="text-sm font-medium text-white">
        {label}
      </label>
      <div className="relative">
        <select
          id={id}
          className={INPUT_CLASS}
          value={value}
          onChange={(e) => onChange?.(e.target.value)}>
          <option value="">{placeholder}</option>
          {options.map((opt) => (
            <option key={opt} value={opt}>
              {opt}
            </option>
          ))}
        </select>
        <BiChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 pointer-events-none" />
      </div>
    </div>
  );
}

function UploadArea({ label, subtitle }: { label: string; subtitle?: string }) {
  return (
    <div className="flex flex-col gap-1.5">
      <span className="text-sm font-medium text-white">{label}</span>
      <div className="border border-dashed border-[#1a2035] rounded-xl p-7 flex flex-col items-center gap-2 hover:border-[#00CC99]/30 transition-colors cursor-pointer">
        <FiUploadCloud className="w-8 h-8 text-gray-500" />
        <p className="text-sm font-medium text-white">
          {subtitle ?? "Файл хавсаргах (заавал биш)"}
        </p>
        <p className="text-xs text-gray-500">
          JPEG, PNG, PDF, MP4 төрлүүд — 50MB хүртэл
        </p>
        <button className="mt-1 border border-[#1a2035] text-xs text-gray-300 px-4 py-1.5 rounded-lg hover:bg-white/5 transition-colors">
          Оруулах
        </button>
      </div>
    </div>
  );
}

export const Request = () => {
  const [activeTab, setActiveTab] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);
  const [sendError, setSendError] = useState<string | null>(null);

  const [, setLeaveType] = useState("");
  const [, setLeaveStart] = useState("");
  const [, setLeaveEnd] = useState("");
  const [, setLeaveReason] = useState("");

  const [clearanceType, setClearanceType] = useState("");
  const [clearanceReason, setClearanceReason] = useState("");

  const [submitLeaveRequest, { loading: sending }] = useMutation<{
    submitLeaveRequest: LeaveRequest;
  }>(SUBMIT_LEAVE_REQUEST);

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

    try {
      if (activeTab === "Тойрох хуудас") {
        await sendRequest({
          type: `Тойрох хуудас${clearanceType ? ` - ${clearanceType}` : ""}`,
          startTime: new Date().toISOString(),
          endTime: new Date().toISOString(),
          reason: clearanceReason,
        });
      } else if (activeTab === "Томилолт") {
        await sendRequest({
          type: "Томилолт",
          startTime: new Date().toISOString(),
          endTime: new Date().toISOString(),
          reason: clearanceReason,
        });
      }

      setSubmitted(true);
      setTimeout(() => {
        setSubmitted(false);
        setActiveTab(null);
        setLeaveType("");
        setLeaveStart("");
        setLeaveEnd("");
        setLeaveReason("");
        setClearanceType("");
        setClearanceReason("");
      }, 2000);
    } catch (err) {
      setSendError(
        err instanceof Error ? err.message : "Алдаа гарлаа. Дахин оролдоно уу.",
      );
    }
  }

  function closeDialog() {
    setSubmitted(false);
    setSendError(null);
    setActiveTab(null);
    setLeaveType("");
    setLeaveStart("");
    setLeaveEnd("");
    setLeaveReason("");
    setClearanceType("");
    setClearanceReason("");
  }

  const quickActions = [
    {
      icon: <BiFile className="w-5 h-5 text-[#2A8CFF]" />,
      title: "Томилолт",
      desc: "Томилолт авах хүсэлт",
      bg: "border-[#0E6A3F] bg-[radial-gradient(circle_at_top_left,_rgba(12,137,74,0.30),_transparent_38%),linear-gradient(180deg,#05160e_0%,#04070c_100%)]",
      iconBg:
        "border-[#0E4360] bg-[linear-gradient(180deg,rgba(7,37,58,0.95)_0%,rgba(8,24,34,0.95)_100%)]",
    },
    {
      icon: <BiCalendar className="w-5 h-5 text-[#00CC99]" />,
      title: "Тойрох хуудас",
      desc: "Тойрох хуудас авах хүсэлт",
      bg: "border-[#5B269D] bg-[radial-gradient(circle_at_top_left,_rgba(129,81,244,0.30),_transparent_38%),linear-gradient(180deg,#180e2a_0%,#04070d_100%)]",
      iconBg:
        "border-[#29397A] bg-[linear-gradient(180deg,rgba(27,29,75,0.95)_0%,rgba(16,18,38,0.95)_100%)]",
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

      <div className="grid grid-cols-2 gap-4">
        {quickActions.map((action) => (
          <div
            key={action.title}
            className={`${action.bg} flex h-[136px] w-[520px] items-center justify-between gap-3 rounded-[16px] border px-6 py-6 shadow-[0_0_0_1px_rgba(255,255,255,0.03)_inset]`}>
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

      {activeTab === "Тойрох хуудас" && !submitted && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/60 backdrop-blur-sm z-50">
          <div
            className={`w-[460px] rounded-2xl ${DIALOG_BG} text-white p-7 border ${DIALOG_BORDER} shadow-2xl flex flex-col gap-5`}>
            <div className="flex justify-between items-start">
              <div>
                <h2 className="text-xl font-semibold">
                  Тойрох хуудас авах хүсэлт
                </h2>
                <p className="text-sm text-gray-500 mt-1">
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
            />

            <UploadArea label="Файл хавсаргах" />

            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-white">Шалтгаан</label>
              <textarea
                rows={3}
                placeholder="Шалтгаанаа бичнэ үү..."
                className={TEXTAREA_CLASS}
                value={clearanceReason}
                onChange={(e) => setClearanceReason(e.target.value)}
              />
            </div>

            {sendError && (
              <p className="text-red-400 text-xs bg-red-500/10 border border-red-500/20 rounded-lg px-3 py-2">
                {sendError}
              </p>
            )}

            <div className="flex justify-end gap-3">
              <BackBtn onClick={closeDialog} />
              <SendBtn onClick={handleSend} disabled={sending} />
            </div>
          </div>
        </div>
      )}

      {activeTab === "Томилолт" && !submitted && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/60 backdrop-blur-sm z-50">
          <div
            className={`w-[460px] rounded-2xl ${DIALOG_BG} text-white p-7 border ${DIALOG_BORDER} shadow-2xl flex flex-col gap-5`}>
            <div className="flex justify-between items-start">
              <div>
                <h2 className="text-xl font-semibold">Томилолтын мэдээлэл</h2>
                <p className="text-sm text-gray-500 mt-1">
                  Томилолтын мэдээллээ оруулна уу.
                </p>
              </div>
              <CloseBtn onClick={closeDialog} />
            </div>

            <UploadArea label="Файл хавсаргах" subtitle="Файл хавсаргана уу." />

            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-white">Шалтгаан</label>
              <textarea
                rows={3}
                placeholder="Томилолтын шалтгаанаа бичнэ үү..."
                className={TEXTAREA_CLASS}
                value={clearanceReason}
                onChange={(e) => setClearanceReason(e.target.value)}
              />
            </div>

            {sendError && (
              <p className="text-red-400 text-xs bg-red-500/10 border border-red-500/20 rounded-lg px-3 py-2">
                {sendError}
              </p>
            )}

            <div className="flex justify-end gap-3">
              <BackBtn onClick={closeDialog} />
              <SendBtn onClick={handleSend} disabled={sending} />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
