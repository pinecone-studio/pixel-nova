"use client";

import { useQuery } from "@apollo/client/react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

import { buildGraphQLHeaders } from "@/lib/apollo-client";
import { notifyAuthStateChanged } from "@/lib/auth-events";
import { GET_ME } from "@/graphql/queries";
import type { Employee } from "@/lib/types";
import { formatBranch, formatDepartment } from "@/lib/labels";

import {
  AjildOrson,
  Ajillasan,
  AlbanTushaal,
  Email,
  EmployeeCode,
  Engineering,
  Github,
  Heltes,
  Idevhtei,
  Salbar,
  Senior,
  Signature,
  TursunUdur,
} from "@/components/icons";

const TOKEN_STORAGE_KEY = "epas_auth_token";

function formatHireDate(value?: string | null) {
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
  if (!employee) {
    return "EP";
  }

  return (
    `${employee.lastName?.charAt(0) ?? ""}${employee.firstName?.charAt(0) ?? ""}`.toUpperCase() ||
    "EP"
  );
}

export default function Profile() {
  const router = useRouter();
  const [authToken, setAuthToken] = useState("");
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    const token = window.localStorage.getItem(TOKEN_STORAGE_KEY) ?? "";
    if (!token) {
      router.replace("/auth/employee");
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setHydrated(true);
      return;
    }

    setAuthToken(token);
    setHydrated(true);
  }, [router]);

  const { data, loading, error } = useQuery<{ me: Employee | null }>(GET_ME, {
    skip: !hydrated || !authToken,
    context: {
      headers: buildGraphQLHeaders({ authToken }),
    },
    fetchPolicy: "network-only",
  });

  const employee = data?.me ?? null;

  useEffect(() => {
    if (hydrated && !loading && !employee) {
      if (error) {
        return;
      }
      window.localStorage.removeItem(TOKEN_STORAGE_KEY);
      notifyAuthStateChanged();
      router.replace("/auth/employee");
    }
  }, [employee, error, hydrated, loading, router]);

  if (!hydrated || !authToken) {
    return null;
  }

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#FAFAFA] text-[#111827]">
        <div className="flex items-center gap-3 text-sm text-[#6B7280]">
          <span className="h-5 w-5 animate-spin rounded-full border-2 border-[#D1D5DB] border-t-[#111827]" />
          Профайл ачаалж байна...
        </div>
      </div>
    );
  }

  if (error && !employee) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#FAFAFA] px-4 text-[#111827]">
        <div className="max-w-md rounded-2xl border border-[#FECACA] bg-white px-6 py-5 text-center shadow-sm">
          <h2 className="text-base font-semibold text-[#111827]">
            Профайл ачаалж чадсангүй
          </h2>
          <p className="mt-2 text-sm text-[#B91C1C]">{error.message}</p>
        </div>
      </div>
    );
  }

  const displayName = employee
    ? `${employee.lastName} ${employee.firstName}`
    : "Профайл";
  const displayNameEng =
    employee?.lastNameEng || employee?.firstNameEng
      ? `${employee.lastNameEng ?? ""} ${employee.firstNameEng ?? ""}`.trim()
      : "Ажилтан";

  const personalInfo = [
    {
      icon: <EmployeeCode />,
      label: "Ажилтны код",
      value: employee?.employeeCode ?? "Мэдээлэлгүй",
      selfContainedIcon: true,
    },
    {
      icon: <Signature />,
      label: "Гарын үсэг харах",
      value: employee ? "******" : "Мэдээлэлгүй",
      selfContainedIcon: true,
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
  ];

  const workInfo = [
    {
      icon: <AlbanTushaal />,
      label: "Албан тушаал",
      value: employee?.jobTitle ?? "Мэдээлэлгүй",
    },
    {
      icon: <Heltes />,
      label: "Хэлтэс",
      value: employee?.department
        ? formatDepartment(employee.department)
        : "Мэдээлэлгүй",
    },
    {
      icon: <Salbar />,
      label: "Салбар",
      value: employee?.branch ? formatBranch(employee.branch) : "Мэдээлэлгүй",
    },
    {
      icon: <AjildOrson />,
      label: "Ажилд орсон",
      value: formatHireDate(employee?.hireDate),
    },
    {
      icon: <Ajillasan />,
      label: "Ажилласан хугацаа",
      value: getTenure(employee?.hireDate),
    },
  ];

  return (
    <div className="bg-[#F5F7FB]">
      <div className="mx-auto flex w-[1056px] max-w-full flex-col mt-[42px] pb-[103px]">
        <div className="flex h-[62px] w-full flex-col justify-between">
          <h1 className="text-[28px] h-[30px] flex items-center font-semibold leading-[30px] tracking-[-0.28px] text-[#121316]">
            Профайл
          </h1>
          <p className="text-[16px] h-6 leading-6 flex items-center tracking-[-0.16px] text-black/70">
            Таны хувийн болон ажлын мэдээлэл.
          </p>
        </div>

        <div className="relative mt-8 overflow-hidden rounded-2xl border border-[#DFDFDF] bg-white shadow-[0px_1px_3px_0px_rgba(0,0,0,0.08),0px_1px_2px_-1px_rgba(0,0,0,0.08)] md:h-[168px]">
          <div className="h-28 bg-white md:h-36" />
          <div className="-mt-14 flex flex-col gap-5 px-5 pb-5 md:absolute md:inset-x-0 md:top-8 md:mt-0 md:flex-row md:items-center md:gap-6 md:px-10 md:pb-0">
            {employee?.imageUrl ? (
              <Image
                src={employee.imageUrl}
                alt="Профайл"
                width={112}
                height={112}
                className="h-28 w-28 rounded-full border border-white object-cover shadow-[0px_10px_24px_rgba(0,0,0,0.12)]"
                unoptimized
              />
            ) : (
              <div className="flex h-28 w-28 items-center justify-center rounded-full border border-white bg-[#1F2126] text-[28px] font-semibold text-white shadow-[0px_10px_24px_rgba(0,0,0,0.12)]">
                {getInitials(employee)}
              </div>
            )}
            <div className="min-w-0 flex-1 md:pb-1">
              <h2 className="text-[22px] font-semibold leading-[30px] tracking-[-0.088px] text-[#121316]">
                {displayName}
              </h2>
              <p className="text-[16px] leading-6 tracking-[-0.16px] text-black/70">
                {displayNameEng}
              </p>
              <div className="flex flex-wrap items-center gap-2 pt-[10px]">
                <span className="flex items-center gap-1 rounded-[10px] border border-black/12 px-[13px] py-[5px] text-center text-[12px] font-medium leading-[18px] text-black/70">
                  <Senior />
                  {employee?.jobTitle ?? "Мэдээлэлгүй"}
                </span>
                <span className="flex items-center gap-1 rounded-[10px] border border-black/12 px-[13px] py-[5px] text-center text-[12px] font-medium leading-[18px] text-black/70">
                  <Engineering className="h-3 w-3 text-black/70" />
                  {employee?.department
                    ? formatDepartment(employee.department)
                    : "Мэдээлэлгүй"}
                </span>
                <span className="flex items-center gap-1 rounded-[10px] border border-black/12 px-[13px] py-[5px] text-center text-[12px] font-medium leading-[18px] text-black/70">
                  <Idevhtei />
                  {employee?.status ?? "Мэдээлэлгүй"}
                </span>
              </div>
              {error ? (
                <p className="mt-3 text-sm text-[#DC2626]">{error.message}</p>
              ) : null}
            </div>
          </div>
        </div>

        <div className="mt-8 grid md:grid-cols-[500px_500px] md:justify-between gap-[56px]">
          <div className="overflow-hidden rounded-2xl border border-[#DFDFDF] bg-white shadow-[0px_1px_3px_0px_rgba(0,0,0,0.1),0px_1px_2px_-1px_rgba(0,0,0,0.1)] md:h-[475px] md:w-[500px]">
            <div className="border-b border-[#DFDFDF] px-6 pb-[21px] pt-[25px]">
              <h3 className="text-[20px] font-semibold leading-6 text-[#121316]">
                Хувийн мэдээлэл
              </h3>
            </div>
            <div className="flex flex-col gap-1 px-6 py-6 md:h-[380px]">
              {personalInfo.map((item) => (
                <div
                  key={item.label}
                  className="flex min-h-[68px] items-center gap-4 rounded-2xl p-3"
                >
                  {item.selfContainedIcon ? (
                    <div className="flex h-11 w-11 shrink-0 items-center justify-center">
                      {item.icon}
                    </div>
                  ) : (
                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border-2 border-black/12 bg-white text-[#111827]">
                      {item.icon}
                    </div>
                  )}
                  <div className="min-w-0">
                    <p className="text-[12px] font-medium leading-[18px] text-[#77818C]">
                      {item.label}
                    </p>
                    <p className="text-[16px] font-bold leading-5 tracking-[-0.096px] text-black/90">
                      {item.value}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="overflow-hidden rounded-2xl border border-[#DFDFDF] bg-white shadow-[0px_1px_3px_0px_rgba(0,0,0,0.1),0px_1px_2px_-1px_rgba(0,0,0,0.1)] md:h-[475px] md:w-[500px]">
            <div className="border-b border-[#DFDFDF] px-6 pb-[21px] pt-[25px]">
              <h3 className="text-[20px] font-semibold leading-6 text-[#121316]">
                Ажлын мэдээлэл
              </h3>
            </div>
            <div className="flex flex-col gap-1 px-6 py-6 md:h-[380px]">
              {workInfo.map((item) => (
                <div
                  key={item.label}
                  className="flex min-h-[68px] items-center gap-4 rounded-2xl p-3"
                >
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border-2 border-black/12 bg-white text-[#111827]">
                    {item.icon}
                  </div>
                  <div className="min-w-0">
                    <p className="text-[12px] font-medium leading-[18px] text-[#77818C]">
                      {item.label}
                    </p>
                    <p className="text-[16px] font-bold leading-5 tracking-[-0.096px] text-black/90">
                      {item.value}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* legacy blocks removed */}
      </div>
    </div>
  );
}
