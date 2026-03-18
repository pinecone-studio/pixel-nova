"use client";

import { useQuery } from "@apollo/client/react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

import { buildGraphQLHeaders } from "@/lib/apollo-client";
import { GET_ME } from "@/graphql/queries";
import type { Employee } from "@/lib/types";
import { formatBranch, formatDepartment, formatLevel } from "@/lib/labels";

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
      window.localStorage.removeItem(TOKEN_STORAGE_KEY);
      router.replace("/auth/employee");
    }
  }, [employee, hydrated, loading, router]);

  if (!hydrated || !authToken) {
    return null;
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F5F7FB] text-[#111827] flex items-center justify-center">
        <div className="flex items-center gap-3 text-sm text-[#6B7280]">
          <span className="h-5 w-5 animate-spin rounded-full border-2 border-[#D1D5DB] border-t-[#111827]" />
          Профайл ачаалж байна...
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

  const workInfo = [
    {
      icon: <EmployeeCode />,
      label: "Ажилтны код",
      value: employee?.employeeCode ?? "Мэдээлэлгүй",
    },
    {
      icon: <Signature />,
      label: "Гарын үсэг",
      value: employee?.firstName ? formatLevel(employee.level) : "Мэдээлэлгүй",
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

  const personalInfo = [
    {
      icon: <AlbanTushaal />,
      label: "Албан тушаал",
      value: employee?.department ?? "Мэдээлэлгүй",
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
    <div className="min-h-screen bg-[#F5F7FB] text-[#111827] pt-[32px] pb-30 font-sans">
      <div className="mx-auto w-[1056px] max-w-full">
        <div className="flex h-[62px] w-[1056px] flex-col gap-2">
          <h1 className="h-[30px] text-3xl font-bold text-[#111827]">
            Профайл
          </h1>
          <p className="h-[24px] text-[#6B7280]">
            Таны хувийн болон ажлын мэдээлэл.
          </p>
        </div>

        <div className="mt-[32px] flex h-[168px] w-[1056px] items-center rounded-2xl border border-[#E5E7EB] bg-white p-6">
          <div className="flex items-center gap-6">
            {employee?.imageUrl ? (
              <Image
                src={employee.imageUrl}
                alt="Профайл"
                width={112}
                height={112}
                className="h-28 w-28 rounded-full border-2 border-[#E5E7EB] object-cover"
                unoptimized
              />
            ) : (
              <div className="flex h-28 w-28 items-center justify-center rounded-full border-2 border-[#E5E7EB] bg-[#F3F4F6] text-xl font-semibold text-[#111827]">
                {getInitials(employee)}
              </div>
            )}
            <div className="h-[100px] w-[840px]">
              <h2 className="h-[30px] text-2xl font-bold text-[#111827]">
                {displayName}
              </h2>
              <p className="h-[24px] text-sm text-[#6B7280]">
                {displayNameEng}
              </p>
              <div className="flex items-end gap-2 flex-wrap">
                <span className="flex h-[38px] items-center gap-1 rounded-full border border-[#E5E7EB] bg-[#F8FAFC] px-3 text-xs text-[#111827]">
                  <Senior />{" "}
                  {employee?.department
                    ? formatLevel(employee.department)
                    : "Мэдээлэлгүй"}
                </span>
                <span className="flex h-[38px] items-center gap-1 rounded-full border border-[#E5E7EB] bg-[#F8FAFC] px-3 text-xs text-[#111827]">
                  <Engineering />{" "}
                  {employee?.department
                    ? formatDepartment(employee.department)
                    : "Мэдээлэлгүй"}
                </span>
                <span className="flex h-[38px] items-center gap-1 rounded-full border border-[#E5E7EB] bg-[#F8FAFC] px-3 text-xs text-[#111827]">
                  <Idevhtei /> {"Идэвхтэй"}
                </span>
              </div>
              {error ? (
                <p className="mt-3 text-sm text-red-400">{error.message}</p>
              ) : null}
            </div>
          </div>
        </div>

        <div className="mt-[32px] flex h-[475px] w-[1056px] justify-between">
          <div className="flex w-[500px] flex-col justify-evenly rounded-2xl border border-[#E5E7EB] bg-white p-6">
            <div className="flex h-[45px] items-center">
              <h3 className="flex h-[24px] items-center text-lg font-semibold text-[#111827]">
                Хувийн мэдээлэл
              </h3>
            </div>
            <div className="h-[356px] flex flex-col justify-between">
              {workInfo.map((item) => (
                <div
                  key={item.label}
                  className="flex h-[68px] w-[450px] items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[#F3F4F6] text-sm text-[#111827]">
                      {item.icon}
                    </div>
                    <div>
                      <p className="text-xs text-[#6B7280]">{item.label}</p>
                      <p className="text-sm font-medium text-[#111827]">
                        {item.value}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="flex w-[500px] flex-col justify-evenly rounded-2xl border border-[#E5E7EB] bg-white p-6">
            <div className="flex h-[45px] items-center">
              <h3 className="flex h-[24px] items-center text-lg font-semibold text-[#111827]">
                Ажлын мэдээлэл
              </h3>
            </div>
            <div className="h-[356px] flex flex-col justify-between">
              {personalInfo.map((item) => (
                <div
                  key={item.label}
                  className="flex h-[68px] w-[450px] items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[#F3F4F6] text-sm text-[#111827]">
                      {item.icon}
                    </div>
                    <div>
                      <p className="text-xs text-[#6B7280]">{item.label}</p>
                      <p className="text-sm font-medium text-[#111827]">
                        {item.value}
                      </p>
                    </div>
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
