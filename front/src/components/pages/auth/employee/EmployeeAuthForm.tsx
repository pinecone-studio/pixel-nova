"use client";

import Link from "next/link";
import { BiArrowBack, BiUser } from "react-icons/bi";

export function EmployeeAuthForm({
  employeeCode,
  error,
  loading,
  onEmployeeCodeChange,
  onSubmit,
}: {
  employeeCode: string;
  error: string | null;
  loading: boolean;
  onEmployeeCodeChange: (value: string) => void;
  onSubmit: (event: React.FormEvent) => void;
}) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-[#0A0A0F] px-4">
      <div className="flex w-full max-w-sm flex-col gap-8">
        <div className="flex flex-col items-center gap-3">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl border border-[#00CC99]/20 bg-[#00CC99]/10">
            <BiUser className="h-7 w-7 text-[#00CC99]" />
          </div>
          <div className="text-center">
            <h1 className="text-2xl font-bold text-white">Ажилтны нэвтрэх</h1>
            <p className="mt-1 text-sm text-[#4A4A6A]">
              Ажилтны кодоо оруулаад үргэлжлүүлнэ үү
            </p>
          </div>
        </div>

        <form onSubmit={onSubmit} className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-white/70">
              Ажилтны код
            </label>
            <input
              type="text"
              value={employeeCode}
              onChange={(event) => onEmployeeCodeChange(event.target.value)}
              placeholder="Жишээ: EMP-0042"
              autoFocus
              className="h-11 w-full rounded-xl border border-[#1a1a30] bg-[#0d0d1a] px-4 text-sm text-white transition-colors placeholder:text-[#4A4A6A] focus:border-[#00CC99]/50 focus:outline-none"
            />
          </div>

          {error ? (
            <div className="rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-400">
              {error}
            </div>
          ) : null}

          <button
            type="submit"
            disabled={loading || !employeeCode.trim()}
            className="flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-[#00CC99] text-sm font-semibold text-[#0A0A0F] transition-colors hover:bg-[#00b386] disabled:cursor-not-allowed disabled:opacity-50"
          >
            {loading ? (
              <span className="h-4 w-4 animate-spin rounded-full border-2 border-[#0A0A0F]/30 border-t-[#0A0A0F]" />
            ) : null}
            {loading ? "Шалгаж байна..." : "Нэвтрэх"}
          </button>
        </form>

        <Link
          href="/"
          className="flex items-center justify-center gap-1.5 text-sm text-[#4A4A6A] transition-colors hover:text-white"
        >
          <BiArrowBack className="h-4 w-4" />
          Буцах
        </Link>
      </div>
    </div>
  );
}
