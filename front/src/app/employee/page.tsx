"use client";

import { useEffect, useEffectEvent, useState } from "react";
import { useRouter } from "next/navigation";

import { fetchDocuments, fetchMe } from "@/lib/api";
import type { Document, Employee } from "@/lib/types";

import { ContractPreview } from "../components/contractPreview";
import { FooterSection } from "../components/footerSection";
import { FactIcon } from "../components/icons";
import { Request } from "../components/request";

const TOKEN_STORAGE_KEY = "epas_auth_token";

const fallbackDocuments = [
  {
    title: "Хөдөлмөрийн гэрээ",
    fileName: "01_employment_contract.pdf",
    date: "2024-02-24",
  },
  {
    title: "Туршилтын хугацааны тушаал",
    fileName: "02_probation_order.pdf",
    date: "2024-02-24",
  },
  {
    title: "Ажлын байрны тодорхойлолт",
    fileName: "03_job_description.pdf",
    date: "2024-02-24",
  },
];

export default function EmployeePage() {
  const router = useRouter();
  const [authToken, setAuthToken] = useState("");
  const [employee, setEmployee] = useState<Employee | null>(null);
  const [documents, setDocuments] = useState<Document[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const hydrateSession = useEffectEvent(async (token: string) => {
    setLoading(true);
    setError(null);

    try {
      const me = await fetchMe(token);
      if (!me) {
        window.localStorage.removeItem(TOKEN_STORAGE_KEY);
        router.replace("/auth/employee");
        return;
      }

      const docs = await fetchDocuments(me.id, token);

      setAuthToken(token);
      setEmployee(me);
      setDocuments(docs);
    } catch (authError) {
      window.localStorage.removeItem(TOKEN_STORAGE_KEY);
      setAuthToken("");
      setEmployee(null);
      setDocuments([]);
      setError(
        authError instanceof Error
          ? authError.message
          : "Ажилтны session ачаалж чадсангүй.",
      );
      router.replace("/auth/employee");
    } finally {
      setLoading(false);
    }
  });

  useEffect(() => {
    const storedToken = window.localStorage.getItem(TOKEN_STORAGE_KEY);
    if (!storedToken) {
      router.replace("/auth/employee");
      return;
    }

    void hydrateSession(storedToken);
  }, [router]);

  const leaveUsed = 4;
  const leaveTotal = 14;
  const leavePercent = (leaveUsed / leaveTotal) * 100;
  const radius = 28;
  const circumference = 2 * Math.PI * radius;
  const dashOffset = circumference - (leavePercent / 100) * circumference;
  const displayName = employee
    ? `${employee.lastName} ${employee.firstName}`
    : "Ажилтан";

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0A0A0F] flex items-center justify-center">
        <div className="flex items-center gap-3 text-white/70 text-sm">
          <span className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin" />
          Уншиж байна...
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0A0A0F]">
      <div className="max-w-6xl mx-auto px-6 py-8 flex flex-col gap-8">
        <div className="w-full rounded-2xl border border-[#1a1a30] bg-[#0d0d1a] p-8 flex items-center justify-between gap-6">
          <div className="flex flex-col gap-3">
            <p className="text-[#00CC99] text-sm font-medium tracking-widest uppercase">
              Сайн байна уу?
            </p>
            <h1 className="text-white text-4xl font-bold tracking-tight">
              {displayName}
            </h1>
            <p className="text-[#4A4A6A] text-sm leading-relaxed max-w-lg">
              Та хөдөлмөрийн баримт бичиг болон ажлын түүхээ авах боломжтой.
              Бүх баримтууд аюулгүй хадгалагдсан болно.
            </p>
            <div className="flex gap-2 mt-1 flex-wrap">
              {employee?.department ? (
                <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#00CC99]/15 text-[#00CC99] text-xs font-semibold border border-[#00CC99]/20">
                  {employee.department}
                </span>
              ) : null}
              {employee?.jobTitle ? (
                <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/5 text-[#94A3B8] text-xs font-semibold border border-white/10">
                  {employee.jobTitle}
                </span>
              ) : null}
              {employee?.employeeCode ? (
                <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/5 text-[#94A3B8] text-xs font-semibold border border-white/10">
                  {employee.employeeCode}
                </span>
              ) : null}
              {error ? (
                <span className="px-3 py-1.5 rounded-lg bg-red-500/10 text-red-400 text-xs font-semibold border border-red-500/20">
                  {error}
                </span>
              ) : null}
            </div>
          </div>

          <div className="shrink-0 rounded-xl border border-[#1a1a30] bg-[#0a0a14] p-5 flex flex-col gap-3 min-w-45">
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
                    <span className="text-[#4A4A6A] text-[10px]">/{leaveTotal}</span>
                  </span>
                </div>
              </div>
            </div>
            <button className="w-full text-center text-xs text-[#8888AA] border border-[#2A2A40] rounded-lg py-1.5 hover:border-[#00CC99]/40 hover:text-white transition-colors">
              Дэлгэрэнгүй
            </button>
          </div>
        </div>

        <Request />

        <section className="flex flex-col gap-6">
          <div className="flex items-center gap-4">
            <h2 className="text-[24px] font-semibold tracking-[-0.02em] text-white">
              Бүртгэл
            </h2>
            <span className="rounded-full border border-[#233246] bg-[#162130] px-4 py-1 text-[14px] font-medium text-[#94A3B8]">
              {(documents.length > 0 ? documents.length : fallbackDocuments.length)} баримт
            </span>
          </div>

          <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
            {documents.length > 0
              ? documents.map((document) => (
                  <ContractPreview
                    key={document.id}
                    document={document}
                    authToken={authToken}
                  />
                ))
              : fallbackDocuments.map((document) => (
                  <article
                    key={document.fileName}
                    className="flex h-45 w-full max-w-80.75 flex-col rounded-[28px] border border-[#0E2741] bg-[linear-gradient(180deg,#03101d_0%,#041424_100%)] p-7 shadow-[0_0_0_1px_rgba(255,255,255,0.03)_inset]"
                  >
                    <div className="flex items-start gap-5">
                      <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-[18px] border border-[#24374F] bg-[#132131]">
                        <FactIcon />
                      </div>
                      <div className="flex min-w-0 flex-1 flex-col gap-1 pt-1">
                        <h3 className="max-w-54.25 text-[17px] font-semibold leading-5 text-[#E7EDF5]">
                          {document.title}
                        </h3>
                        <p className="truncate text-[13px] text-[#6E7D90]">
                          {document.fileName}
                        </p>
                        <p className="text-[13px] text-[#8D9AAC]">{document.date}</p>
                      </div>
                    </div>
                  </article>
                ))}
          </div>
        </section>

      </div>
    </div>
  );
}
