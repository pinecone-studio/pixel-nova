"use client";

import { useQuery } from "@apollo/client/react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useEffect, useSyncExternalStore } from "react";

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
import { GET_ME } from "@/graphql/queries";
import { buildGraphQLHeaders } from "@/lib/apollo-client";
import { formatBranch, formatDepartment, formatLevel } from "@/lib/labels";
import type { Employee } from "@/lib/types";

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
  const authToken = useSyncExternalStore(
    () => () => {},
    () => window.localStorage.getItem(TOKEN_STORAGE_KEY) ?? "",
    () => "",
  );

  const { data, loading, error } = useQuery<{ me: Employee | null }>(GET_ME, {
    skip: !authToken,
    context: {
      headers: buildGraphQLHeaders({ authToken }),
    },
    fetchPolicy: "network-only",
  });

  const employee = data?.me ?? null;
  useEffect(() => {
    if (!authToken) {
      router.replace("/auth/employee");
      return;
    }

    if (!loading && !employee) {
      window.localStorage.removeItem(TOKEN_STORAGE_KEY);
      router.replace("/auth/employee");
    }
  }, [authToken, employee, loading, router]);

  if (!authToken) {
    return null;
  }

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-black text-white">
        <div className="flex items-center gap-3 text-sm text-white/70">
          <span className="h-5 w-5 animate-spin rounded-full border-2 border-white/20 border-t-white" />
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
      label: "Гарын үсэг харах",
      value: employee?.jobTitle ?? "Мэдээлэлгүй",
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

    // {
    //   icon: <Senior />,
    //   label: "Зэрэглэл",
    //   value: employee?.level ? formatLevel(employee.level) : "Мэдээлэлгүй",
    // },
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
    <div className="min-h-screen bg-black pb-[199px] pt-[33px] font-sans text-white">
      <div className="mx-auto w-full max-w-[1056px]">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white">Профайл</h1>
          <p className="mt-1 text-gray-400">
            Таны хувийн болон ажлын мэдээлэл.
          </p>
        </div>

        <div className="mb-8 rounded-2xl border border-gray-800 bg-linear-to-r from-gray-900 to-teal-950 p-6">
          <div className="flex items-center gap-5">
            {employee?.imageUrl ? (
              <Image
                src={employee.imageUrl}
                alt="Профайл"
                width={112}
                height={112}
                className="h-20 w-20 rounded-full border-2 border-teal-500 object-cover"
                unoptimized
              />
            ) : (
              <div className="flex h-20 w-20 items-center justify-center rounded-full border-2 border-teal-500 bg-teal-950 text-xl font-semibold text-teal-200">
                {getInitials(employee)}
              </div>
            )}
            <div>
              <h2 className="text-2xl font-bold text-white">{displayName}</h2>
              <p className="mb-3 text-sm text-gray-400">{displayNameEng}</p>
              <div className="flex flex-wrap gap-2">
                <span className="flex items-center gap-1 rounded-full border border-teal-600 px-3 py-1 text-xs text-teal-400">
                  <Senior />
                  {employee?.level
                    ? formatLevel(employee.level)
                    : "Мэдээлэлгүй"}
                </span>
                <span className="flex items-center gap-1 rounded-full border border-gray-700 px-3 py-1 text-xs text-white">
                  <Engineering />
                  {employee?.department
                    ? formatDepartment(employee.department)
                    : "Мэдээлэлгүй"}
                </span>
                <span className="flex items-center gap-1 rounded-full border border-teal-600 px-3 py-1 text-xs text-teal-400">
                  <Idevhtei />
                  {employee?.status ?? "Мэдээлэлгүй"}
                </span>
              </div>
              {error ? (
                <p className="mt-3 text-sm text-red-400">{error.message}</p>
              ) : null}
            </div>
          </div>
        </div>

        <div className="mb-8 grid min-h-[479px] grid-cols-1 gap-14 md:grid-cols-2">
          <div className="h-full rounded-2xl border border-gray-800 bg-gray-900 p-6">
            <h3 className="mb-5 text-lg font-semibold text-white">
              Ажлын мэдээлэл
            </h3>
            <div className="border border-gray-800" />
            <div className="mt-5">
              {workInfo.map((item) => (
                <div
                  key={item.label}
                  className="flex h-[68px] items-center gap-3">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-teal-900/50 text-sm">
                    {item.icon}
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">{item.label}</p>
                    <p className="text-sm font-medium text-white">
                      {item.value}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="relative h-full rounded-2xl border border-gray-800 bg-gray-900 p-6">
            <h3 className="mb-5 text-lg font-semibold text-white">
              Хувийн мэдээлэл
            </h3>
            <div className="border border-gray-800" />
            <div className="mt-5">
              {personalInfo.map((item) => (
                <div
                  key={item.label}
                  className="flex h-[68px] items-center gap-3">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-teal-900/50 text-sm">
                    {item.icon}
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">{item.label}</p>
                    <p className="text-sm font-medium text-white">
                      {item.value}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
