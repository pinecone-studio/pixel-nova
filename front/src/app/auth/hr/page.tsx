"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { BiBriefcase } from "react-icons/bi";

import { AuthShell } from "@/components/auth/AuthShell";
import { HR_AUTH_STORAGE_KEY } from "@/components/hr/auth";
import { Button } from "@/components/ui/button";
import { notifyAuthStateChanged } from "@/lib/auth-events";

const HR_CODE = "HR2025";

export default function HrAuthPage() {
  const router = useRouter();
  const [code, setCode] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setLoading(true);
    setError(null);

    setTimeout(() => {
      if (code.trim() === HR_CODE) {
        localStorage.setItem(HR_AUTH_STORAGE_KEY, "true");
        notifyAuthStateChanged();
        router.push("/hr");
      } else {
        setError("Код буруу байна. Дахин оролдоно уу.");
        setLoading(false);
      }
    }, 400);
  }

  return (
    <AuthShell
      accentLabel="HR access"
      title="HR нэвтрэх"
      description="Нийтлэг HR кодоор нэвтрээд ажилтны бүртгэл, хүсэлт, мэдэгдэл, аудитын самбар руу орно."
      icon={<BiBriefcase className="h-7 w-7" />}
      sideTitle="HR workspace"
      sideDescription="Хүний нөөцийн багт зориулсан самбар, жагсаалт, workflow-уудын одоогийн цайвар интерфэйстэй ижил нэвтрэх дэлгэц."
      sideBadges={["Employee records", "Requests", "Notifications"]}
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <label
            htmlFor="hr-code"
            className="block text-sm font-medium text-[#111827]"
          >
            HR код
          </label>
          <input
            id="hr-code"
            type="password"
            value={code}
            onChange={(event) => setCode(event.target.value)}
            placeholder="••••••"
            autoFocus
            className="h-12 w-full rounded-2xl border border-black/10 bg-[#F8FAFC] px-4 text-sm text-[#111827] outline-none transition-colors placeholder:text-[#77818C] focus:border-[#00C0A8] focus:bg-white"
          />
          <p className="text-xs leading-5 text-[rgba(63,65,69,0.72)]">
            HR баг нийтлэг нэвтрэх код ашиглана.
          </p>
        </div>

        {error ? (
          <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
            {error}
          </div>
        ) : null}

        <Button
          type="submit"
          size="lg"
          disabled={loading || !code.trim()}
          className="h-12 w-full rounded-2xl bg-[#111827] text-white hover:bg-[#0f172a]"
        >
          {loading ? (
            <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
          ) : null}
          {loading ? "Шалгаж байна..." : "Нэвтрэх"}
        </Button>
      </form>
    </AuthShell>
  );
}
