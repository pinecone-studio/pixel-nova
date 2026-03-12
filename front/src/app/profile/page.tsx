"use client";

import { useEffect, useEffectEvent, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";

import { fetchMe } from "@/lib/api";
import type { Employee } from "@/lib/types";
import {
  AjildOrson,
  Ajillasan,
  AjiltniiCode,
  AlbanTushaal,
  CompanyTsalin,
  Email,
  Engineering,
  EntraID,
  Github,
  Heltes,
  Idevhtei,
  KPI,
  Salbar,
  Senior,
  TursunUdur,
} from "../components/icons";

const TOKEN_STORAGE_KEY = "epas_auth_token";

function formatDate(value?: string | null) {
  if (!value) return "Мэдээлэлгүй";

  return new Date(value).toLocaleDateString("mn-MN", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

function getTenure(hireDate?: string | null) {
  if (!hireDate) return "Мэдээлэлгүй";

  const start = new Date(hireDate);
  const now = new Date();
  const months =
    (now.getFullYear() - start.getFullYear()) * 12 +
    (now.getMonth() - start.getMonth());

  if (months <= 0) return "1 сараас бага";

  const years = Math.floor(months / 12);
  const remainingMonths = months % 12;

  if (years === 0) return `${remainingMonths} сар`;
  if (remainingMonths === 0) return `${years} жил`;
  return `${years} жил ${remainingMonths} сар`;
}

function getInitials(employee: Employee | null) {
  if (!employee) return "EP";
  return `${employee.lastName?.[0] ?? ""}${employee.firstName?.[0] ?? ""}`.toUpperCase();
}

export default function Profile() {
  const router = useRouter();
  const [hrMessage, setHrMessage] = useState(false);
  const [employee, setEmployee] = useState<Employee | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const hydrateProfile = useEffectEvent(async (token: string) => {
    setLoading(true);
    setError(null);

    try {
      const me = await fetchMe(token);
      if (!me) {
        window.localStorage.removeItem(TOKEN_STORAGE_KEY);
        router.replace("/auth/employee");
        return;
      }

      setEmployee(me);
    } catch (err) {
      window.localStorage.removeItem(TOKEN_STORAGE_KEY);
      setError(
        err instanceof Error ? err.message : "Профайл ачаалж чадсангүй.",
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

    void hydrateProfile(storedToken);
  }, [router]);

  const fullName = useMemo(() => {
    if (!employee) return "Ажилтан";
    return `${employee.lastName} ${employee.firstName}`;
  }, [employee]);

  const englishName = useMemo(() => {
    if (!employee) return "Employee";
    const first = employee.firstNameEng ?? employee.firstName;
    const last = employee.lastNameEng ?? employee.lastName;
    return `${last} ${first}`;
  }, [employee]);

  if (loading) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        Профайл ачаалж байна...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white pt-[33px] pb-[199px] font-sans">
      <div className="mx-auto w-full max-w-[1056px]">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white">Профайл</h1>
          <p className="text-gray-400 mt-1">
            Таны хувийн болон ажлын мэдээлэл.
          </p>
        </div>

        <div className="bg-linear-to-r from-gray-900 to-teal-950 rounded-2xl p-6 mb-[32px] border border-gray-800">
          <div className="flex items-center gap-5">
            {employee?.imageUrl ? (
              <Image
                src={employee.imageUrl}
                alt={fullName}
                width={112}
                height={112}
                className="w-20 h-20 rounded-full object-cover border-2 border-teal-500"
              />
            ) : (
              <div className="w-20 h-20 rounded-full border-2 border-teal-500 bg-teal-950 flex items-center justify-center text-2xl font-bold text-teal-300">
                {getInitials(employee)}
              </div>
            )}

            <div>
              <h2 className="text-2xl font-bold text-white">{fullName}</h2>
              <p className="text-gray-400 text-sm mb-3">{englishName}</p>
              <div className="flex gap-2 flex-wrap">
                <span className="flex items-center gap-1 text-xs border border-teal-600 text-teal-400 px-3 py-1 rounded-full">
                  <span>
                    <AlbanTushaal />
                  </span>
                  {employee?.jobTitle ?? "Тодорхойгүй"}
                </span>
                <span className="flex items-center gap-1 text-xs border border-gray-700 text-white px-3 py-1 rounded-full">
                  <span>
                    <Engineering />
                  </span>
                  {employee?.department ?? "Тодорхойгүй"}
                </span>
                <span className="flex items-center gap-1 text-xs border border-teal-600 text-teal-400 px-3 py-1 rounded-full">
                  <span>
                    <Idevhtei />
                  </span>
                  {employee?.status ?? "Тодорхойгүй"}
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-[56px] mb-[32px] min-h-[479px]">
          <div className="bg-gray-900 rounded-2xl p-6 border border-gray-800 h-full">
            <h3 className="text-white font-semibold text-lg mb-5">
              Ажлын мэдээлэл
            </h3>
            <div className="border border-gray-800 w-100"></div>
            <div className="mt-5">
              {[
                {
                  icon: <AlbanTushaal />,
                  label: "Албан тушаал",
                  value: employee?.jobTitle ?? "Мэдээлэлгүй",
                },
                {
                  icon: <Senior />,
                  label: "Зэрэглэл",
                  value: employee?.level ?? "Мэдээлэлгүй",
                },
                {
                  icon: <Heltes />,
                  label: "Хэлтэс",
                  value: employee?.department ?? "Мэдээлэлгүй",
                },
                {
                  icon: <Salbar />,
                  label: "Салбар",
                  value: employee?.branch ?? "Мэдээлэлгүй",
                },
                {
                  icon: <AjildOrson />,
                  label: "Ажилд орсон",
                  value: formatDate(employee?.hireDate),
                },
                {
                  icon: <Ajillasan />,
                  label: "Ажилласан хугацаа",
                  value: getTenure(employee?.hireDate),
                },
              ].map((item) => (
                <div
                  key={item.label}
                  className="flex items-center gap-3 h-[68px]">
                  <div className="w-9 h-9 bg-teal-900/50 rounded-lg flex items-center justify-center text-sm shrink-0">
                    {item.icon}
                  </div>
                  <div>
                    <p className="text-gray-500 text-xs">{item.label}</p>
                    <p className="text-white font-medium text-sm">
                      {item.value}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-gray-900 rounded-2xl p-6 border border-gray-800 relative h-full">
            <h3 className="text-white font-semibold text-lg mb-5">
              Хувийн мэдээлэл
            </h3>
            <div className="border border-gray-800 w-100"></div>
            <div className="mt-5">
              {[
                {
                  icon: <AjiltniiCode />,
                  label: "Ажилтны код",
                  value: employee?.employeeCode ?? "Мэдээлэлгүй",
                },
                {
                  icon: <Email />,
                  label: "Имэйл",
                  value: employee?.email ?? "Мэдээлэлгүй",
                },
                {
                  icon: <TursunUdur />,
                  label: "Төрсөн өдөр",
                  value: employee?.birthDayAndMonth ?? "Мэдээлэлгүй",
                },
                {
                  icon: <Github />,
                  label: "GitHub",
                  value: employee?.github ?? "Мэдээлэлгүй",
                },
              ].map((item) => (
                <div
                  key={item.label}
                  className="flex items-center gap-3 h-[68px]">
                  <div className="w-9 h-9 bg-teal-900/50 rounded-lg flex items-center justify-center text-sm shrink-0">
                    {item.icon}
                  </div>
                  <div>
                    <p className="text-gray-500 text-xs">{item.label}</p>
                    <p className="text-white font-medium text-sm">
                      {item.value}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            <div className="absolute bottom-5 right-5 flex items-center gap-2">
              <span className="text-xs text-gray-400 flex items-center gap-1">
                <span className="text-base">HR</span> Мессеж
              </span>
              <button
                onClick={() => setHrMessage(!hrMessage)}
                className={`w-10 h-5 rounded-full transition-colors duration-200 relative ${
                  hrMessage ? "bg-teal-500" : "bg-gray-600"
                }`}>
                <span
                  className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform duration-200 ${
                    hrMessage ? "translate-x-5" : "translate-x-0.5"
                  }`}
                />
              </button>
            </div>
          </div>
        </div>

        <div className="bg-gray-900 rounded-2xl border border-gray-800 overflow-hidden">
          <div className="h-[83px] flex flex-col pt-[17px] px-[25px]">
            <h3 className="text-white font-semibold text-lg h-[28px]">
              Нэмэлт мэдээлэл
            </h3>
            <p className="text-gray-500 text-4 mt-sm h-[28px] flex items-center">
              Таны гэрээний болон бусад мэдээлэл
            </p>
          </div>
          <div className="border-t border-gray-800" />
          <div className="px-[25px] pt-[25px] pb-[23px]">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-gray-800 rounded-xl p-4 border border-gray-700 h-[107px] flex flex-col">
                <div className="flex items-center gap-2 h-[36px]">
                  <div className="w-8 h-8 bg-teal-900/50 rounded-lg flex items-center justify-center text-sm">
                    <KPI />
                  </div>
                  <span className="text-gray-300 text-xs font-semibold uppercase tracking-wider">
                    KPI тооцоо
                  </span>
                </div>
                <span className="mt-auto text-xs bg-teal-900 text-teal-400 px-2 py-0.5 rounded-full w-fit">
                  {employee?.isKpi ? "Тийм" : "Үгүй"}
                </span>
              </div>

              <div className="bg-gray-800 rounded-xl p-4 border border-gray-700 h-[107px] flex flex-col">
                <div className="flex items-center gap-2 h-[36px]">
                  <div className="w-8 h-8 bg-teal-900/50 rounded-lg flex items-center justify-center text-sm">
                    <CompanyTsalin />
                  </div>
                  <span className="text-gray-300 text-xs font-semibold uppercase tracking-wider">
                    Компанийн цалин
                  </span>
                </div>
                <span className="mt-auto text-xs bg-teal-900 text-teal-400 px-2 py-0.5 rounded-full w-fit">
                  {employee?.isSalaryCompany ? "Тийм" : "Үгүй"}
                </span>
              </div>

              <div className="bg-gray-800 rounded-xl p-4 border border-gray-700 h-[107px] flex flex-col">
                <div className="flex items-center gap-2 h-[36px]">
                  <div className="w-8 h-8 bg-teal-900/50 rounded-lg flex items-center justify-center text-sm">
                    <EntraID />
                  </div>
                  <span className="text-gray-300 text-xs font-semibold uppercase tracking-wider">
                    Entra ID
                  </span>
                </div>
                <span className="mt-4 text-xs text-gray-500">
                  {employee?.entraId ?? "Мэдээлэлгүй"}
                </span>
              </div>
            </div>
          </div>
        </div>

        {error ? (
          <div className="mt-6 rounded-xl border border-red-500/20 bg-red-500/5 px-4 py-3 text-sm text-red-400">
            {error}
          </div>
        ) : null}
      </div>
    </div>
  );
}
