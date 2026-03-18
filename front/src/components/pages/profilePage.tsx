"use client";

import {
  AjildOrson,
  Ajillasan,
  AjiltniiCode,
  AlbanTushaal,
  Email,
  Github,
  Heltes,
  Salbar,
  Senior,
  TursunUdur,
} from "@/components/icons";
import { formatBranch, formatDepartment, formatLevel } from "@/lib/labels";

import { useEmployeeSession } from "./employee/useEmployeeSession";
import { ProfileAdditionalInfo } from "./profile/ProfileAdditionalInfo";
import { ProfileHero } from "./profile/ProfileHero";
import { ProfileInfoCard } from "./profile/ProfileInfoCard";
import type { ProfileInfoItem } from "./profile/profileTypes";
import { formatHireDate, getTenure } from "./profile/profileUtils";

export default function ProfilePage() {
  const { authToken, employee, loading, errorMessage } = useEmployeeSession();

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

  const workInfo: ProfileInfoItem[] = [
    {
      icon: <AlbanTushaal />,
      label: "Албан тушаал",
      value: employee?.jobTitle ?? "Мэдээлэлгүй",
    },
    {
      icon: <Senior />,
      label: "Зэрэглэл",
      value: employee?.level ? formatLevel(employee.level) : "Мэдээлэлгүй",
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

  const personalInfo: ProfileInfoItem[] = [
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

        <ProfileHero employee={employee} errorMessage={errorMessage} />

        <div className="mb-8 grid min-h-[479px] grid-cols-1 gap-14 md:grid-cols-2">
          <ProfileInfoCard title="Ажлын мэдээлэл" items={workInfo} />
          <ProfileInfoCard title="Хувийн мэдээлэл" items={personalInfo} />
        </div>

        <ProfileAdditionalInfo employee={employee} />
      </div>
    </div>
  );
}
