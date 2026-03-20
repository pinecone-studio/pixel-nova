"use client";

import { useMutation } from "@apollo/client/react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { BiUser } from "react-icons/bi";

import { AuthShell } from "@/components/auth/AuthShell";
import { Button } from "@/components/ui/button";
import { LOGIN_WITH_CODE } from "@/graphql/mutations";
import { notifyAuthStateChanged } from "@/lib/auth-events";
import type { AuthSession } from "@/lib/types";

const TOKEN_STORAGE_KEY = "epas_auth_token";

export default function EmployeeAuthPage() {
  const router = useRouter();
  const [employeeCode, setEmployeeCode] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loginWithCode, { loading }] = useMutation<{
    loginWithCode: AuthSession;
  }>(LOGIN_WITH_CODE);

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    const code = employeeCode.trim().toUpperCase();
    if (!code) return;

    setError(null);

    try {
      const result = await loginWithCode({
        variables: { employeeCode: code },
      });

      const session = result.data?.loginWithCode;
      if (!session) {
        throw new Error("Нэвтрэх мэдээлэл ирсэнгүй.");
      }

      localStorage.setItem(TOKEN_STORAGE_KEY, session.token);
      localStorage.setItem("epas_employee_code", code);
      notifyAuthStateChanged();
      router.push("/employee");
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Нэвтрэхэд алдаа гарлаа.";

      if (
        message.toLowerCase().includes("fetch") ||
        message.toLowerCase().includes("network") ||
        message.toLowerCase().includes("failed")
      ) {
        setError(
          "Backend-т холбогдож чадсангүй. API ажиллаж байгаа эсэхийг шалгана уу.",
        );
      } else {
        setError(message);
      }
    }
  }

  return (
    <AuthShell
      accentLabel="Ажилтны нэвтрэх"
      title="Ажилтны нэвтрэх"
      description="Ажилтны кодоо оруулаад өөрийн профайл, баримт бичиг, аудитын түүх рүү орно."
      icon={<BiUser className="h-7 w-7" />}
      sideTitle="Ажилтны орчин"
      sideDescription="Ажилтан өөрийн материал руу илүү шууд, вэбийн бусад хуудсуудтай ижил хэмнэлээр нэвтрэхээр шинэчилсэн."
      sideBadges={["Баримтууд", "Профайл", "Аудитын түүх"]}
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <label
            htmlFor="employee-code"
            className="block text-sm font-medium text-[#111827]"
          >
            Ажилтны код
          </label>
          <input
            id="employee-code"
            type="text"
            value={employeeCode}
            onChange={(event) => setEmployeeCode(event.target.value)}
            placeholder="Жишээ: EMP-0042"
            autoFocus
            className="h-12 w-full rounded-2xl border border-black/10 bg-[#F8FAFC] px-4 text-sm text-[#111827] outline-none transition-colors placeholder:text-[#77818C] focus:border-[#00C0A8] focus:bg-white"
          />
          <p className="text-xs leading-5 text-[rgba(63,65,69,0.72)]">
            Кодыг том, жижиг үсэг ялгахгүйгээр шалгана.
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
          disabled={loading || !employeeCode.trim()}
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
