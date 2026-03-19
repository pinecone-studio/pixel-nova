"use client";

import { useState } from "react";

import { ContractRequestsComponent } from "@/components/contractRequestsComponent";
import RequestsComponent from "@/components/requestsComponent";

type RequestTab = "employee" | "contract";

const tabs: Array<{ id: RequestTab; label: string; description: string }> = [
  {
    id: "employee",
    label: "Ажилтны хүсэлтүүд",
    description: "Employee талаас илгээсэн чөлөө, томилолт, тойрох хуудасны хүсэлтүүд",
  },
  {
    id: "contract",
    label: "Гэрээний хүсэлтүүд",
    description: "Гарын үсэг болон гэрээ баталгаажуулалтын хүсэлтүүд",
  },
];

export default function HrRequestsPage() {
  const [activeTab, setActiveTab] = useState<RequestTab>("employee");

  return (
    <div className="flex flex-col gap-6">
      <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-[0_1px_2px_rgba(15,23,42,0.06)]">
        <div className="flex flex-wrap items-center gap-2">
          {tabs.map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                className={`rounded-full border px-4 py-2 text-sm font-medium transition-colors ${
                  isActive
                    ? "border-slate-900 bg-slate-900 text-white"
                    : "border-slate-200 bg-white text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                }`}
              >
                {tab.label}
              </button>
            );
          })}
        </div>
        <p className="mt-3 text-sm text-slate-500">
          {tabs.find((tab) => tab.id === activeTab)?.description}
        </p>
      </div>

      {activeTab === "employee" ? <RequestsComponent /> : <ContractRequestsComponent />}
    </div>
  );
}
