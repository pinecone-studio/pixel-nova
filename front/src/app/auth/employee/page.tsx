"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { loginWithCode } from "@/lib/api";
import { BiArrowBack, BiUser } from "react-icons/bi";

const TOKEN_STORAGE_KEY = "epas_auth_token";

export default function EmployeeAuthPage() {
  const router = useRouter();
  const [employeeCode, setEmployeeCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const code = employeeCode.trim().toUpperCase();
    if (!code) return;

    setLoading(true);
    setError(null);

    try {
      const session = await loginWithCode(code);
      localStorage.setItem(TOKEN_STORAGE_KEY, session.token);
      localStorage.setItem("epas_employee_code", code);
      router.push("/employee");
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Login failed.";
      if (
        msg.toLowerCase().includes("fetch") ||
        msg.toLowerCase().includes("network") ||
        msg.toLowerCase().includes("failed")
      ) {
        setError("Could not reach the backend. Please verify the deployed API is running.");
      } else {
        setError(msg);
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-[#0A0A0F] flex items-center justify-center px-4">
      <div className="w-full max-w-sm flex flex-col gap-8">
        <div className="flex flex-col items-center gap-3">
          <div className="w-14 h-14 rounded-2xl bg-[#00CC99]/10 border border-[#00CC99]/20 flex items-center justify-center">
            <BiUser className="w-7 h-7 text-[#00CC99]" />
          </div>
          <div className="text-center">
            <h1 className="text-white text-2xl font-bold">Employee sign in</h1>
            <p className="text-[#4A4A6A] text-sm mt-1">
              Enter your employee code to continue
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <label className="text-white/70 text-sm font-medium">
              Employee code
            </label>
            <input
              type="text"
              value={employeeCode}
              onChange={(e) => setEmployeeCode(e.target.value)}
              placeholder="Example: EMP-0042"
              autoFocus
              className="w-full h-11 px-4 rounded-xl bg-[#0d0d1a] border border-[#1a1a30] text-white placeholder:text-[#4A4A6A] focus:outline-none focus:border-[#00CC99]/50 transition-colors text-sm"
            />
          </div>

          {error && (
            <div className="px-4 py-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading || !employeeCode.trim()}
            className="w-full h-11 rounded-xl bg-[#00CC99] hover:bg-[#00b386] disabled:opacity-50 disabled:cursor-not-allowed text-[#0A0A0F] font-semibold text-sm transition-colors flex items-center justify-center gap-2"
          >
            {loading ? (
              <span className="w-4 h-4 border-2 border-[#0A0A0F]/30 border-t-[#0A0A0F] rounded-full animate-spin" />
            ) : null}
            {loading ? "Signing in..." : "Enter"}
          </button>
        </form>

        <Link
          href="/"
          className="flex items-center justify-center gap-1.5 text-[#4A4A6A] hover:text-white text-sm transition-colors"
        >
          <BiArrowBack className="w-4 h-4" />
          Back
        </Link>
      </div>
    </div>
  );
}
