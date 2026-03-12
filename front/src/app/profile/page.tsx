"use client";

import { useState } from "react";
import { AjildOrson, Ajillasan, AjiltniiCode, AlbanTushaal, CompanyTsalin, Email, Engineering, EntraID, Github, Heltes, Idevhtei, KPI,  Salbar, Senior, TursunUdur } from "../components/icons";

export default function Profile() {
  const [hrMessage, setHrMessage] = useState(false);

  return (
    <div className="min-h-screen bg-black text-white p-8 font-sans">
      <div className="max-w-4xl mx-auto">

        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white">Профайл</h1>
          <p className="text-gray-400 mt-1">Таны хувийн болон ажлын мэдээлэл.</p>
        </div>

        {/* Profile Card */}
        <div className="bg-gradient-to-r from-gray-900 to-teal-950 rounded-2xl p-6 mb-6 border border-gray-800">
          <div className="flex items-center gap-5">
            <img
              src="https://i.pravatar.cc/100?img=11"
              alt="Profile"
              className="w-20 h-20 rounded-full object-cover border-2 border-teal-500"
            />
            <div>
              <h2 className="text-2xl font-bold text-white">Д. Бат-Эрдэнэ</h2>
              <p className="text-gray-400 text-sm mb-3">D. Bat-Erdene</p>
              <div className="flex gap-2 flex-wrap">
                <span className="flex items-center gap-1 text-xs border border-teal-600 text-teal-400 px-3 py-1 rounded-full">
                  <span><Senior /></span> Senior Engineer
                </span>
                <span className="flex items-center gap-1 text-xs border border-gray-700 text-white px-3 py-1 rounded-full">
                  <span><Engineering /></span> Engineering
                </span>
                <span className="flex items-center gap-1 text-xs border border-teal-600 text-teal-400 px-3 py-1 rounded-full">
                  <span><Idevhtei /></span> Идэвхтэй
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Two Column Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">

          {/* Ажлын мэдээлэл */}
          <div className="bg-gray-900 rounded-2xl p-6 border border-gray-800">
            <h3 className="text-white font-semibold text-lg mb-5">Ажлын мэдээлэл</h3>
            <div className="border border-gray-800 w-100  " ></div>
            <div className="space-y-4 mt-5 ">
              {[
                { icon: <AlbanTushaal />, label: "Албан тушаал", value: "Senior Engineer" },
                { icon: <Heltes />, label: "Хэлтэс", value: "Engineering" },
                { icon: <Salbar />, label: "Салбар", value: "Ulaanbaatar HQ" },
                { icon: <AjildOrson />, label: "Ажилд орсон", value: "2024 оны 2 сарын 24" },
                { icon: <Ajillasan />, label: "Ажилласан хугацаа", value: "2 жил 1 сар" },
              ].map((item) => (
                <div key={item.label} className="flex items-start gap-3">
                  <div className="w-9 h-9 bg-teal-900/50 rounded-lg flex items-center justify-center text-sm flex-shrink-0">
                    {item.icon}
                  </div>
                  <div>
                    <p className="text-gray-500 text-xs">{item.label}</p>
                    <p className="text-white font-medium text-sm">{item.value}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Хувийн мэдээлэл */}
          <div className="bg-gray-900 rounded-2xl p-6 border border-gray-800 relative">
            <h3 className="text-white font-semibold text-lg mb-5">Хувийн мэдээлэл</h3>
             <div className="border border-gray-800 w-100  " ></div>
            <div className="space-y-4 mt-5 ">
              {[
                { icon: <AjiltniiCode />, label: "Ажилтны код", value: "EMP-0042" },
                { icon: <Email />, label: "Имэйл", value: "bat-erdene.dorj@company.mn" },
                { icon: <TursunUdur />, label: "Төрсөн өдөр", value: "03 сарын 15" },
                { icon: <Github/>, label: "GitHub", value: "@baterdene" },
              ].map((item) => (
                <div key={item.label} className="flex items-start gap-3">
                  <div className="w-9 h-9 bg-teal-900/50 rounded-lg flex items-center justify-center text-sm flex-shrink-0">
                    {item.icon}
                  </div>
                  <div>
                    <p className="text-gray-500 text-xs">{item.label}</p>
                    <p className="text-white font-medium text-sm">{item.value}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* HR Message Toggle */}
            <div className="absolute bottom-5 right-5 flex items-center gap-2">
             
              
            </div>
          </div>
        </div>

        {/* Нэмэлт мэдээлэл */}
        <div className="bg-gray-900 rounded-2xl p-6 border border-gray-800">
          <h3 className="text-white font-semibold text-lg">Нэмэлт мэдээлэл</h3>
          <p className="text-gray-500 text-sm mb-5">Таны гэрээний болон бусад мэдээлэл</p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">

            <div className="bg-gray-800 rounded-xl p-4 border border-gray-700">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-8 h-8 bg-teal-900/50 rounded-lg flex items-center justify-center text-sm"><KPI /></div>
                <span className="text-gray-300 text-xs font-semibold uppercase tracking-wider">KPI Тооцоо</span>
              </div>
              <span className="text-xs bg-teal-900 text-teal-400 px-2 py-0.5 rounded-full">Тийм</span>
            </div>

            <div className="bg-gray-800 rounded-xl p-4 border border-gray-700">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-8 h-8 bg-teal-900/50 rounded-lg flex items-center justify-center text-sm"><CompanyTsalin/>  </div>
                <span className="text-gray-300 text-xs font-semibold uppercase tracking-wider">Компанийн цалин</span>
              </div>
              <span className="text-xs bg-teal-900 text-teal-400 px-2 py-0.5 rounded-full">Тийм</span>
            </div>

            <div className="bg-gray-800 rounded-xl p-4 border border-gray-700">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-8 h-8 bg-teal-900/50 rounded-lg flex items-center justify-center text-sm"><EntraID/></div>
                <span className="text-gray-300 text-xs font-semibold uppercase tracking-wider">Entra ID</span>
              </div>
              <span className="text-xs text-gray-500">entra-001</span>
            </div>

          </div>
        </div>

      </div>
    </div>
  );
}