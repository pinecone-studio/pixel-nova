"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { BiBriefcase, BiArrowBack } from "react-icons/bi";

const HR_CODE = "HR2025";

export default function HrAuthPage() {
  const router = useRouter();
  const [code, setCode] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    setTimeout(() => {
      if (code.trim() === HR_CODE) {
        localStorage.setItem("hr_authenticated", "true");
        router.push("/hr");
      } else {
        setError("Код буруу байна. Дахин оролдоно уу.");
        setLoading(false);
      }
    }, 400);
  }

  return (
    <div className="min-h-screen bg-[#060d0c] flex items-center justify-center px-4">
      <div className="w-full max-w-sm flex flex-col gap-8">
        {/* Header */}
        <div className="flex flex-col items-center gap-3">
          <div className="w-14 h-14 rounded-2xl bg-[#0ad4b1]/10 border border-[#0ad4b1]/20 flex items-center justify-center">
            <BiBriefcase className="w-7 h-7 text-[#0ad4b1]" />
          </div>
          <div className="text-center">
            <h1 className="text-white text-2xl font-bold">HR нэвтрэх</h1>
            <p className="text-slate-500 text-sm mt-1">
              HR-ийн нийтлэг нэвтрэх кодыг оруулна уу
            </p>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <label className="text-white/70 text-sm font-medium">
              HR код
            </label>
            <input
              type="password"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              placeholder="••••••"
              autoFocus
              className="w-full h-11 px-4 rounded-xl bg-[#0a0f0e] border border-white/8 text-white placeholder:text-slate-600 focus:outline-none focus:border-[#0ad4b1]/50 transition-colors text-sm"
            />
            <p className="text-slate-600 text-xs">
              HR-ийн бүх гишүүд нэг нийтлэг кодоор нэвтэрнэ
            </p>
          </div>

          {error && (
            <div className="px-4 py-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading || !code.trim()}
            className="w-full h-11 rounded-xl bg-[#0ad4b1] hover:bg-[#12e6c0] disabled:opacity-50 disabled:cursor-not-allowed text-[#060d0c] font-semibold text-sm transition-colors flex items-center justify-center gap-2"
          >
            {loading ? (
              <span className="w-4 h-4 border-2 border-[#060d0c]/30 border-t-[#060d0c] rounded-full animate-spin" />
            ) : null}
            {loading ? "Шалгаж байна..." : "Нэвтрэх"}
          </button>
        </form>

        {/* Back */}
        <Link
          href="/"
          className="flex items-center justify-center gap-1.5 text-slate-600 hover:text-white text-sm transition-colors"
        >
          <BiArrowBack className="w-4 h-4" />
          Буцах
        </Link>
      </div>
    </div>
  );
}
