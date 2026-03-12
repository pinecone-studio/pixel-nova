"use client";

import { useEffect, useState } from "react";
import { BiBuilding, BiCheckCircle, BiFile, BiLogOut, BiShield } from "react-icons/bi";

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
      setError(authError instanceof Error ? authError.message : "Session ??????? ?????????.");
    } finally {
      setLoading(false);
    }
  }

  async function handleRequestOtp() {
    setLoading(true);
    setError(null);

    try {
      const result = await requestOtp(employeeCode.trim().toUpperCase());
      setMaskedEmail(result.maskedEmail);
      setExpiresAt(result.expiresAt);
      setStep("otp");
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : "OTP ?????? ?????????.");
    } finally {
      setLoading(false);
    }
  }

  async function handleVerifyOtp() {
    setLoading(true);
    setError(null);

    try {
      const session = await verifyOtp(employeeCode.trim().toUpperCase(), otpCode.trim());
      window.localStorage.setItem(TOKEN_STORAGE_KEY, session.token);
      setOtpCode("");
      await hydrateSession(session.token);
    } catch (verifyError) {
      setError(verifyError instanceof Error ? verifyError.message : "OTP ????????????? ?????????.");
      setLoading(false);
    }
  }

  async function handleLogout() {
    if (authToken) {
      try {
        await logout(authToken);
      } catch {
        // Ignore logout network issues and clear local session anyway.
      }
    }

    window.localStorage.removeItem(TOKEN_STORAGE_KEY);
    setAuthToken("");
    setEmployee(null);
    setDocuments([]);
    setAuditLogs([]);
    setEmployeeCode("");
    setOtpCode("");
    setMaskedEmail("");
    setExpiresAt("");
    setError(null);
    setStep("employee-code");
  }

  const docsGenerated = auditLogs.filter((log) => log.documentsGenerated).length;
  const notified = auditLogs.filter((log) => log.recipientsNotified).length;
  const stats = [
    { value: documents.length, label: "???? ??????" },
    { value: auditLogs.length, label: "???? ????" },
    { value: docsGenerated, label: "?????? ??????" },
    { value: notified, label: "?????????" },
  ];

  return (
    <div className="min-h-screen bg-[#0A0A0F] text-white">
      <div className="mx-auto flex min-h-screen max-w-6xl flex-col gap-8 px-6 py-10">
        <div className="rounded-3xl border border-[#00CC99]/20 bg-[radial-gradient(circle_at_top_left,_rgba(0,204,153,0.18),_rgba(10,10,15,0.9)_45%)] p-8 shadow-[0_0_40px_rgba(0,204,153,0.08)]">
          <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
            <div className="max-w-2xl space-y-3">
              <p className="text-sm font-semibold uppercase tracking-[0.35em] text-[#00CC99]">
                EPAS Employee Portal
              </p>
              <h1 className="text-4xl font-bold tracking-tight">??????? ??????, ????, ????????</h1>
              <p className="max-w-xl text-sm leading-7 text-[#A7B0C0]">
                Employee code-?? ???????? email-??? ????? ??? ???????? ?????? ???????,
                ?????? ?????? ????? ????? action ?????? ??????? ????????.
              </p>
            </div>
            {step === "dashboard" && employee ? (
              <button
                className="inline-flex items-center gap-2 rounded-xl border border-[#2C3647] px-4 py-2 text-sm text-[#D0D7E2] transition hover:border-[#00CC99]/50 hover:text-[#00CC99]"
                onClick={() => void handleLogout()}
                type="button"
              >
                <BiLogOut className="h-4 w-4" />
                ?????
              </button>
            ) : null}
          </div>
        </div>

        {step !== "dashboard" ? (
          <div className="grid gap-6 md:grid-cols-[1.1fr_0.9fr]">
            <div className="rounded-3xl border border-[#1E2433] bg-[#0F1320] p-8">
              <div className="mb-6 flex items-center gap-3">
                <div className="rounded-2xl border border-[#00CC99]/30 bg-[#00CC99]/10 p-3 text-[#00CC99]">
                  <BiShield className="h-5 w-5" />
                </div>
                <div>
                  <h2 className="text-xl font-semibold">OTP ????????</h2>
                  <p className="text-sm text-[#8A93A5]">Employee code ????? email ???????????????</p>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="mb-2 block text-sm text-[#9EA8BA]">Employee code</label>
                  <input
                    className="w-full rounded-2xl border border-[#253047] bg-[#0B0F18] px-4 py-3 text-base outline-none transition focus:border-[#00CC99]/60"
                    value={employeeCode}
                    onChange={(event) => setEmployeeCode(event.target.value.toUpperCase())}
                    placeholder="EMP-0042"
                  />
                </div>

                {step === "otp" ? (
                  <div>
                    <label className="mb-2 block text-sm text-[#9EA8BA]">??? ???????? ???</label>
                    <input
                      className="w-full rounded-2xl border border-[#253047] bg-[#0B0F18] px-4 py-3 text-base tracking-[0.4em] outline-none transition focus:border-[#00CC99]/60"
                      value={otpCode}
                      onChange={(event) => setOtpCode(event.target.value.replace(/\D/g, "").slice(0, 6))}
                      placeholder="123456"
                    />
                  </div>
                ) : null}

                {error ? (
                  <div className="rounded-2xl border border-[#7A2438] bg-[#2B1018] px-4 py-3 text-sm text-[#FFB4C1]">
                    {error}
                  </div>
                ) : null}

                {step === "otp" ? (
                  <div className="rounded-2xl border border-[#223146] bg-[#0D1624] px-4 py-3 text-sm text-[#B6C1D2]">
                    <p>{maskedEmail} ???? ??? OTP ????????.</p>
                    <p className="mt-1 text-xs text-[#7F8AA0]">???????? ???????: {formatDate(expiresAt)}</p>
                  </div>
                ) : null}

                <div className="flex flex-wrap gap-3">
                  {step === "employee-code" ? (
                    <button
                      className="rounded-2xl bg-[#00CC99] px-5 py-3 font-semibold text-[#04150F] transition hover:bg-[#19e0ad] disabled:cursor-not-allowed disabled:opacity-60"
                      disabled={loading || employeeCode.trim().length === 0}
                      onClick={() => void handleRequestOtp()}
                      type="button"
                    >
                      {loading ? "?????? ?????..." : "OTP ????"}
                    </button>
                  ) : (
                    <>
                      <button
                        className="rounded-2xl bg-[#00CC99] px-5 py-3 font-semibold text-[#04150F] transition hover:bg-[#19e0ad] disabled:cursor-not-allowed disabled:opacity-60"
                        disabled={loading || otpCode.length !== 6}
                        onClick={() => void handleVerifyOtp()}
                        type="button"
                      >
                        {loading ? "?????? ?????..." : "???????"}
                      </button>
                      <button
                        className="rounded-2xl border border-[#2C3647] px-5 py-3 text-sm text-[#D0D7E2] transition hover:border-[#00CC99]/50 hover:text-[#00CC99]"
                        onClick={() => {
                          setStep("employee-code");
                          setOtpCode("");
                          setError(null);
                        }}
                        type="button"
                      >
                        ?????
                      </button>
                    </>
                  )}
                </div>
              </div>
            </div>

            <div className="rounded-3xl border border-[#1E2433] bg-[#0D1018] p-8">
              <h2 className="mb-5 text-xl font-semibold">??????????? ???????</h2>
              <div className="space-y-4 text-sm text-[#A7B0C0]">
                <div className="rounded-2xl border border-[#1F2A3E] bg-[#111829] p-4">
                  <p className="font-medium text-white">1. Employee code ???????</p>
                  <p className="mt-1">?????? ???? ??????? ??????? ????? email ??????? ????.</p>
                </div>
                <div className="rounded-2xl border border-[#1F2A3E] bg-[#111829] p-4">
                  <p className="font-medium text-white">2. OTP email ??????</p>
                  <p className="mt-1">6 ??????? ??? 10 ??????? ?????????????? ???? email ??? ????.</p>
                </div>
                <div className="rounded-2xl border border-[#1F2A3E] bg-[#111829] p-4">
                  <p className="font-medium text-white">3. ??????? ????????? ?????</p>
                  <p className="mt-1">?????? ?????? ?????, action ????, ?????????? ??????? ?????.</p>
                </div>
              </div>
            </div>
            <button className="w-full text-center text-xs text-[#8888AA] border border-[#2A2A40] rounded-lg py-1.5 hover:border-[#00CC99]/40 hover:text-white transition-colors">
              Дэлгэрэнгүй
            </button>
          </div>
        ) : (
          <>
            <div className="rounded-3xl border border-[#00CC99]/20 bg-[#0F1320] p-8">
              <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                <div>
                  <p className="text-sm uppercase tracking-[0.3em] text-[#00CC99]">?????? ?????</p>
                  <h2 className="mt-2 text-3xl font-bold">{employee?.lastName} {employee?.firstName}</h2>
                  <p className="mt-2 max-w-xl text-sm text-[#95A1B6]">
                    ???? ??????????? ????????? ????? lifecycle action ???? ??? ?????????.
                  </p>
                </div>
                <div className="flex flex-wrap gap-2 text-xs">
                  <span className="inline-flex items-center gap-1.5 rounded-xl border border-[#00CC99]/20 bg-[#00CC99]/10 px-3 py-2 text-[#00CC99]">
                    <BiBuilding className="h-4 w-4" />
                    {employee?.department}
                  </span>
                  <span className="rounded-xl border border-[#243046] bg-[#111829] px-3 py-2 text-[#D6DFEA]">
                    {employee?.level}
                  </span>
                  <span className="rounded-xl border border-[#243046] bg-[#111829] px-3 py-2 text-[#D6DFEA]">
                    {employee?.employeeCode}
                  </span>
                </div>
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-4">
              {stats.map(({ value, label }) => (
                <div
                  key={label}
                  className="rounded-2xl border border-[#1E2433] bg-[#0D1018] p-5 transition hover:border-[#00CC99]/30"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="text-3xl font-bold text-white">{value}</p>
                      <p className="mt-1 text-xs text-[#6C7891]">{label}</p>
                    </div>
                    <div className="rounded-xl border border-[#00CC99]/20 bg-[#00CC99]/10 p-2 text-[#00CC99]">
                      <DocumentIcon />
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
              <div className="rounded-3xl border border-[#1E2433] bg-[#0F1320] p-6">
                <div className="mb-4 flex items-center gap-2">
                  <BiFile className="h-5 w-5 text-[#00CC99]" />
                  <h3 className="text-lg font-semibold">????? ?????????</h3>
                </div>
                <div className="space-y-3">
                  {documents.length === 0 ? (
                    <p className="rounded-2xl border border-dashed border-[#243046] px-4 py-6 text-sm text-[#7D879A]">
                      ???????? ?????? ?????????.
                    </p>
                  ) : (
                    documents.map((document) => (
                      <div
                        key={document.id}
                        className="rounded-2xl border border-[#1D2738] bg-[#0C111B] px-4 py-3"
                      >
                        <p className="font-medium text-white">{document.documentName}</p>
                        <p className="mt-1 text-xs uppercase tracking-[0.2em] text-[#00CC99]">{document.action}</p>
                        <p className="mt-2 text-xs text-[#7F8AA0]">{formatDate(document.createdAt)}</p>
                      </div>
                    ))
                  )}
                </div>
              </div>

              <div className="rounded-3xl border border-[#1E2433] bg-[#0F1320] p-6">
                <div className="mb-4 flex items-center gap-2">
                  <BiCheckCircle className="h-5 w-5 text-[#00CC99]" />
                  <h3 className="text-lg font-semibold">??????? ????</h3>
                </div>
                <div className="space-y-3">
                  {auditLogs.length === 0 ? (
                    <p className="rounded-2xl border border-dashed border-[#243046] px-4 py-6 text-sm text-[#7D879A]">
                      ???????? action ???? ????.
                    </p>
                  ) : (
                    auditLogs.slice(0, 6).map((log) => (
                      <div
                        key={log.id}
                        className="rounded-2xl border border-[#1D2738] bg-[#0C111B] px-4 py-3"
                      >
                        <div className="flex items-center justify-between gap-3">
                          <p className="font-medium text-white">{log.action}</p>
                          <span className={`rounded-full px-2.5 py-1 text-[11px] font-semibold ${log.recipientsNotified ? "bg-[#00CC99]/15 text-[#00CC99]" : "bg-[#2A3142] text-[#A9B3C5]"}`}>
                            {log.recipientsNotified ? "?????????" : "Pending"}
                          </span>
                        </div>
                        <p className="mt-2 text-xs text-[#7F8AA0]">{formatDate(log.timestamp)}</p>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
