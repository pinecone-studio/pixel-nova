"use client";

import { useMutation } from "@apollo/client/react";
import { useRouter } from "next/navigation";
import { useState } from "react";

import { LOGIN_WITH_CODE } from "@/graphql/mutations";
import { notifyAuthStateChanged } from "@/lib/auth-events";
import { resolveApiUrl } from "@/lib/apollo-client";
import type { AuthSession } from "@/lib/types";

import { EmployeeAuthForm } from "./employee/EmployeeAuthForm";

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
          `Backend-т холбогдож чадсангүй. API endpoint: ${resolveApiUrl()}`,
        );
      } else {
        setError(message);
      }
    }
  }

  return (
    <EmployeeAuthForm
      employeeCode={employeeCode}
      error={error}
      loading={loading}
      onEmployeeCodeChange={setEmployeeCode}
      onSubmit={handleSubmit}
    />
  );
}
