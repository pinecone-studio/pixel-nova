"use client";

import Link from "next/link";
import { BiUser, BiBriefcase } from "react-icons/bi";

export default function RoleSelectPage() {
  return (
    <div className="min-h-screen bg-[#0A0A0F] flex items-center justify-center px-4">
      <div className="w-full max-w-lg flex flex-col items-center gap-10">
        {/* Logo / Branding */}
        <div className="flex flex-col items-center gap-3">
          <div className="w-16 h-16 rounded-2xl bg-[#00CC99]/15 border border-[#00CC99]/30 flex items-center justify-center">
            <span className="text-[#00CC99] text-2xl font-bold">E</span>
          </div>
          <h1 className="text-white text-3xl font-bold tracking-tight">EPAS</h1>
          <p className="text-[#4A4A6A] text-sm text-center max-w-xs">
            Ажилтны баримт бичгийн автоматжуулалтын систем
          </p>
        </div>

        {/* Role Selection */}
        <div className="w-full flex flex-col gap-4">
          <p className="text-center text-white/60 text-sm">
            Хэрхэн нэвтрэх вэ?
          </p>

          <div className="grid grid-cols-2 gap-4">
            {/* HR Button */}
            <Link
              href="/auth/hr"
              className="group flex flex-col items-center gap-4 rounded-2xl border border-[#1a1a30] bg-[#0d0d1a] p-8 hover:border-[#00CC99]/40 hover:bg-[#0d1a14] transition-all duration-200"
            >
              <div className="w-16 h-16 rounded-2xl bg-[#00CC99]/10 border border-[#00CC99]/20 flex items-center justify-center group-hover:bg-[#00CC99]/20 transition-colors">
                <BiBriefcase className="w-8 h-8 text-[#00CC99]" />
              </div>
              <div className="text-center">
                <p className="text-white text-lg font-semibold">HR</p>
                <p className="text-[#4A4A6A] text-xs mt-1">
                  Хүний нөөцийн удирдлага
                </p>
              </div>
            </Link>

            {/* Employee Button */}
            <Link
              href="/auth/employee"
              className="group flex flex-col items-center gap-4 rounded-2xl border border-[#1a1a30] bg-[#0d0d1a] p-8 hover:border-[#00CC99]/40 hover:bg-[#0d1a14] transition-all duration-200"
            >
              <div className="w-16 h-16 rounded-2xl bg-[#00CC99]/10 border border-[#00CC99]/20 flex items-center justify-center group-hover:bg-[#00CC99]/20 transition-colors">
                <BiUser className="w-8 h-8 text-[#00CC99]" />
              </div>
              <div className="text-center">
                <p className="text-white text-lg font-semibold">Ажилтан</p>
                <p className="text-[#4A4A6A] text-xs mt-1">
                  Миний баримт бичгүүд
                </p>
              </div>
            </Link>
          </div>
        </div>

        {/* Footer */}
        <p className="text-[#4A4A6A] text-xs">© 2025 EPAS — 6-р баг</p>
      </div>
    </div>
  );
}
