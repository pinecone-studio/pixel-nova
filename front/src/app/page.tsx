"use client";

import { useEffect, useState } from "react";
import {
  BiBuilding,
  BiCheckCircle,
  BiFile,
  BiLogOut,
  BiPlus,
  BiShield,
} from "react-icons/bi";

import { DocumentIcon } from "./components/icons";
import {
  fetchAuditLogs,
  fetchDocuments,
  fetchMe,
  logout,
  requestOtp,
  verifyOtp,
} from "@/lib/api";
import type { AuditLog, Document, Employee } from "@/lib/types";
import { Request } from "./request/page";

const TOKEN_STORAGE_KEY = "epas_auth_token";

type AuthStep = "employee-code" | "otp" | "dashboard";

function formatDate(value: string) {
  return new Date(value).toLocaleString("mn-MN", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function Home() {
  const [step, setStep] = useState<AuthStep>("employee-code");
  const [employeeCode, setEmployeeCode] = useState("");
  const [otpCode, setOtpCode] = useState("");
  const [maskedEmail, setMaskedEmail] = useState("");
  const [expiresAt, setExpiresAt] = useState("");
  const [authToken, setAuthToken] = useState("");
  const [employee, setEmployee] = useState<Employee | null>(null);
  const [documents, setDocuments] = useState<Document[]>([]);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const storedToken = window.localStorage.getItem(TOKEN_STORAGE_KEY);
    if (!storedToken) {
      return;
    }

    void hydrateSession(storedToken);
  }, []);

  async function hydrateSession(token: string) {
    setLoading(true);
    setError(null);

    try {
      const me = await fetchMe(token);
      if (!me) {
        window.localStorage.removeItem(TOKEN_STORAGE_KEY);
        setAuthToken("");
        setStep("employee-code");
        return;
      }

      const [docs, logs] = await Promise.all([
        fetchDocuments(me.id, token),
        fetchAuditLogs(undefined, token),
      ]);

      setAuthToken(token);
      setEmployee(me);
      setDocuments(docs);
      setAuditLogs(logs);
      setStep("dashboard");
    } catch (authError) {
      window.localStorage.removeItem(TOKEN_STORAGE_KEY);
      setAuthToken("");
      setEmployee(null);
      setDocuments([]);
      setAuditLogs([]);
      setStep("employee-code");
      setError(
        authError instanceof Error
          ? authError.message
          : "Session ??????? ?????????.",
      );
    } finally {
      setLoading(false);
    }
  }

  // async function handleRequestOtp() {
  //   setLoading(true);
  //   setError(null);

  //   try {
  //     const result = await requestOtp(employeeCode.trim().toUpperCase());
  //     setMaskedEmail(result.maskedEmail);
  //     setExpiresAt(result.expiresAt);
  //     setStep("otp");
  //   } catch (requestError) {
  //     setError(
  //       requestError instanceof Error
  //         ? requestError.message
  //         : "OTP ?????? ?????????.",
  //     );
  //   } finally {
  //     setLoading(false);
  //   }
  // }

  // async function handleVerifyOtp() {
  //   setLoading(true);
  //   setError(null);

  //   try {
  //     const session = await verifyOtp(
  //       employeeCode.trim().toUpperCase(),
  //       otpCode.trim(),
  //     );
  //     window.localStorage.setItem(TOKEN_STORAGE_KEY, session.token);
  //     setOtpCode("");
  //     await hydrateSession(session.token);
  //   } catch (verifyError) {
  //     setError(
  //       verifyError instanceof Error
  //         ? verifyError.message
  //         : "OTP ????????????? ?????????.",
  //     );
  //     setLoading(false);
  //   }
  // }

  // async function handleLogout() {
  //   if (authToken) {
  //     try {
  //       await logout(authToken);
  //     } catch {
  //       // Ignore logout network issues and clear local session anyway.
  //     }
  //   }

  //   window.localStorage.removeItem(TOKEN_STORAGE_KEY);
  //   setAuthToken("");
  //   setEmployee(null);
  //   setDocuments([]);
  //   setAuditLogs([]);
  //   setEmployeeCode("");
  //   setOtpCode("");
  //   setMaskedEmail("");
  //   setExpiresAt("");
  //   setError(null);
  //   setStep("employee-code");
  // }

  // const docsGenerated = auditLogs.filter(
  //   (log) => log.documentsGenerated,
  // ).length;
  // const notified = auditLogs.filter((log) => log.recipientsNotified).length;

  const leaveUsed = 4;
  const leaveTotal = 14;
  const leavePercent = (leaveUsed / leaveTotal) * 100;
  const radius = 28;
  const circumference = 2 * Math.PI * radius;
  const dashOffset = circumference - (leavePercent / 100) * circumference;
  return (
    <div className="min-h-screen bg-[#0A0A0F]">
      <div className="max-w-6xl mx-auto px-6 py-8 flex flex-col gap-8">
        {/* Hero card */}
        <div className="w-full rounded-2xl border border-[#1a1a30] bg-[#0d0d1a] p-8 flex items-center justify-between gap-6">
          <div className="flex flex-col gap-3">
            <p className="text-[#00CC99] text-sm font-medium tracking-widest uppercase">
              Сайн байна уу?
            </p>
            <h1 className="text-white text-4xl font-bold tracking-tight">
              Бат-Эрдэнэ Дорж
            </h1>
            <p className="text-[#4A4A6A] text-sm leading-relaxed max-w-lg">
              Та хөдөлмөрийн баримт бичиг болон ажлын түүхээ авах боломжтой. Бүх
              баримтууд аюулгүй хадгалагдсан болно.
            </p>
            <div className="flex gap-2 mt-1 flex-wrap">
              <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#00CC99]/15 text-[#00CC99] text-xs font-semibold border border-[#00CC99]/20"></span>
            </div>
          </div>

          {/* Leave balance card */}
          <div className="shrink-0 rounded-xl border border-[#1a1a30] bg-[#0a0a14] p-5 flex flex-col gap-3 min-w-[180px]">
            <div className="flex items-center justify-between gap-6">
              <div>
                <p className="text-white text-2xl font-bold">4d 1h</p>
                <p className="text-[#4A4A6A] text-xs mt-0.5">Чөлөөний боломж</p>
              </div>

              <div className="relative w-16 h-16">
                <svg viewBox="0 0 72 72" className="w-full h-full -rotate-90">
                  <circle
                    cx="36"
                    cy="36"
                    r={radius}
                    fill="none"
                    stroke="#1a1a30"
                    strokeWidth="6"
                  />
                  <circle
                    cx="36"
                    cy="36"
                    r={radius}
                    fill="none"
                    stroke="#00CC99"
                    strokeWidth="6"
                    strokeLinecap="round"
                    strokeDasharray={circumference}
                    strokeDashoffset={dashOffset}
                  />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-white text-xs font-semibold">
                    {leaveUsed}
                    <span className="text-[#4A4A6A] text-[10px]">
                      /{leaveTotal}
                    </span>
                  </span>
                </div>
              </div>
            </div>
            <button className="w-full text-center text-xs text-[#8888AA] border border-[#2A2A40] rounded-lg py-1.5 hover:border-[#00CC99]/40 hover:text-white transition-colors">
              Дэлгэрэнгүй
            </button>
          </div>
        </div>

        {/* Quick actions */}
        <Request />
      </div>
    </div>
  );
}
