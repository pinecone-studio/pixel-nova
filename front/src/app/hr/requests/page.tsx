"use client";

import { useState } from "react";

import { ContractRequestsComponent } from "@/components/contractRequestsComponent";
import { RequestsComponent } from "@/components/requestsComponent";

export default function HrRequestsPage() {
  const [tab, setTab] = useState<"leave" | "contract">("leave");

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center gap-3">
        <button
          onClick={() => setTab("leave")}
          className={`rounded-full border px-4 py-1.5 text-sm font-medium transition-colors ${
            tab === "leave"
              ? "border-emerald-200 bg-emerald-50 text-emerald-600"
              : "border-slate-200 bg-white text-slate-500 hover:text-slate-700"
          }`}
        >
          Чөлөөний хүсэлт
        </button>
        <button
          onClick={() => setTab("contract")}
          className={`rounded-full border px-4 py-1.5 text-sm font-medium transition-colors ${
            tab === "contract"
              ? "border-emerald-200 bg-emerald-50 text-emerald-600"
              : "border-slate-200 bg-white text-slate-500 hover:text-slate-700"
          }`}
        >
          Гэрээний хүсэлт
        </button>
      </div>

      {tab === "leave" ? <RequestsComponent /> : <ContractRequestsComponent />}
    </div>
  );
}
