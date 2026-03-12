"use client";

import { useState } from "react";
import Image from "next/image";
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

export default function Profile() {
  const [hrMessage, setHrMessage] = useState(false);

  return (
    <div className="min-h-screen bg-black text-white pt-[33px] pb-[199px] font-sans">
      <div className="mx-auto w-full max-w-[1056px]">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white">Профайл</h1>
          <p className="text-gray-400 mt-1">
            Таны хувийн болон ажлын мэдээлэл.
          </p>
        </div>

        {/* Profile Card */}
        <div className="bg-gradient-to-r from-gray-900 to-teal-950 rounded-2xl p-6 mb-[32px] border border-gray-800">
          <div className="flex items-center gap-5">
            <Image
              src="https://i.pravatar.cc/100?img=11"
              alt="Profile"
              width={112}
              height={112}
              className="w-20 h-20 rounded-full object-cover border-2 border-teal-500"
            />
            <div>
              <h2 className="text-2xl font-bold text-white">Д. Бат-Эрдэнэ</h2>
              <p className="text-gray-400 text-sm mb-3">D. Bat-Erdene</p>
              <div className="flex gap-2 flex-wrap">
                <span className="flex items-center gap-1 text-xs border border-teal-600 text-teal-400 px-3 py-1 rounded-full">
                  <span>
                    <Senior />
                  </span>{" "}
                  Senior Engineer
                </span>
                <span className="flex items-center gap-1 text-xs border border-gray-700 text-white px-3 py-1 rounded-full">
                  <span>
                    <Engineering />
                  </span>{" "}
                  Engineering
                </span>
                <span className="flex items-center gap-1 text-xs border border-teal-600 text-teal-400 px-3 py-1 rounded-full">
                  <span>
                    <Idevhtei />
                  </span>{" "}
                  Идэвхтэй
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Two Column Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-[56px] mb-[32px] min-h-[479px]">
          {/* Ажлын мэдээлэл */}
          <div className="bg-gray-900 rounded-2xl p-6 border border-gray-800 h-full">
            <h3 className="text-white font-semibold text-lg mb-5">
              Ажлын мэдээлэл
            </h3>
            <div className="border border-gray-800 w-100  "></div>
            <div className="mt-5">
              {[
                {
                  icon: <AlbanTushaal />,
                  label: "Албан тушаал",
                  value: "Senior Engineer",
                },
                { icon: <Heltes />, label: "Хэлтэс", value: "Engineering" },
                { icon: <Salbar />, label: "Салбар", value: "Ulaanbaatar HQ" },
                {
                  icon: <AjildOrson />,
                  label: "Ажилд орсон",
                  value: "2024 оны 2 сарын 24",
                },
                {
                  icon: <Ajillasan />,
                  label: "Ажилласан хугацаа",
                  value: "2 жил 1 сар",
                },
              ].map((item) => (
                <div
                  key={item.label}
                  className="flex items-center gap-3 h-[68px]"
                >
                  <div className="w-9 h-9 bg-teal-900/50 rounded-lg flex items-center justify-center text-sm flex-shrink-0">
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

          {/* Хувийн мэдээлэл */}
          <div className="bg-gray-900 rounded-2xl p-6 border border-gray-800 relative h-full">
            <h3 className="text-white font-semibold text-lg mb-5">
              Хувийн мэдээлэл
            </h3>
            <div className="border border-gray-800 w-100  "></div>
            <div className="mt-5">
              {[
                {
                  icon: <AjiltniiCode />,
                  label: "Ажилтны код",
                  value: "EMP-0042",
                },
                {
                  icon: <Email />,
                  label: "Имэйл",
                  value: "bat-erdene.dorj@company.mn",
                },
                {
                  icon: <TursunUdur />,
                  label: "Төрсөн өдөр",
                  value: "03 сарын 15",
                },
                { icon: <Github />, label: "GitHub", value: "@baterdene" },
              ].map((item) => (
                <div
                  key={item.label}
                  className="flex items-center gap-3 h-[68px]"
                >
                  <div className="w-9 h-9 bg-teal-900/50 rounded-lg flex items-center justify-center text-sm flex-shrink-0">
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

            {/* HR Message Toggle */}
            <div className="absolute bottom-5 right-5 flex items-center gap-2">
              <span className="text-xs text-gray-400 flex items-center gap-1">
                <span className="text-base">📌</span> HR Мессеж
              </span>
              <button
                onClick={() => setHrMessage(!hrMessage)}
                className={`w-10 h-5 rounded-full transition-colors duration-200 relative ${
                  hrMessage ? "bg-teal-500" : "bg-gray-600"
                }`}
              >
                <span
                  className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform duration-200 ${
                    hrMessage ? "translate-x-5" : "translate-x-0.5"
                  }`}
                />
              </button>
            </div>
          </div>
        </div>

        {/* Нэмэлт мэдээлэл */}
        <div className="bg-gray-900 rounded-2xl border border-gray-800 overflow-hidden">
          <div className="h-[83px] flex flex-col pt-[17px] px-[25px]">
            <h3 className="text-white font-semibold text-lg h-[28px]">
              Нэмэлт мэдээлэл
            </h3>
            <p className="text-gray-500 text-4 mt-sm h-[28px] flex items-center h-[20px]">
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
                    KPI Тооцоо
                  </span>
                </div>
                <span className="mt-auto text-xs bg-teal-900 text-teal-400 px-2 py-0.5 rounded-full w-fit">
                  Тийм
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
                  Тийм
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
                <span className="mt-4 text-xs text-gray-500">entra-001</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
