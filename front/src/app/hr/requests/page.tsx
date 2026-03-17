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
              ? "border-[#00CC99]/60 bg-[#00CC99]/15 text-[#9BEBD7]"
              : "border-white/10 bg-white/5 text-slate-400 hover:text-white"
          }`}
        >
          Чөлөөний хүсэлт
        </button>
        <button
          onClick={() => setTab("contract")}
          className={`rounded-full border px-4 py-1.5 text-sm font-medium transition-colors ${
            tab === "contract"
              ? "border-[#00CC99]/60 bg-[#00CC99]/15 text-[#9BEBD7]"
              : "border-white/10 bg-white/5 text-slate-400 hover:text-white"
          }`}
        >
          Гэрээний хүсэлт
        </button>
      </div>

      {tab === "leave" ? <RequestsComponent /> : <ContractRequestsComponent />}
    </div>
  );
}
