"use client";

import { useEffect, useMemo, useState } from "react";
import { createPortal } from "react-dom";
import { useQuery } from "@apollo/client/react";

import { GET_EMPLOYEES } from "@/graphql/queries/employees";
import { GET_CONTRACT_REQUESTS } from "@/graphql/queries/contract-requests";
import { buildGraphQLHeaders } from "@/lib/apollo-client";
import {
  TEMPLATE_REGISTRY,
  getMissingFields,
  getTemplatesByPhase,
} from "@/lib/templateConfig";
import type { TemplateInfo } from "@/lib/templateConfig";
import type { ContractRequest, Employee } from "@/lib/types";

import { PhaseSection } from "./PhaseSection";
import { TemplatePreviewModal } from "./TemplatePreviewModal";
import { PHASES, getEmployeeDocumentProfile } from "./template-manager-shared";
import { useHrOverlay } from "../overlay-context";

export default function TemplateManager() {
  const { data: employeeData } = useQuery<{ employees: Employee[] }>(
    GET_EMPLOYEES,
    { context: { headers: buildGraphQLHeaders({ actorRole: "hr" }) } },
  );
  const employees = useMemo(
    () => employeeData?.employees ?? [],
    [employeeData?.employees],
  );

  const { data: approvedData, loading: approvedLoading } = useQuery<{
    contractRequests: ContractRequest[];
  }>(GET_CONTRACT_REQUESTS, {
    variables: { status: "approved" },
    context: { headers: buildGraphQLHeaders({ actorRole: "hr" }) },
  });

  const [previewTemplate, setPreviewTemplate] = useState<TemplateInfo | null>(
    null,
  );
  const [activePhase, setActivePhase] = useState<
    "all" | (typeof PHASES)[number]
  >("all");
  const { setBlurred } = useHrOverlay();

  useEffect(() => {
    setBlurred(Boolean(previewTemplate));
    return () => setBlurred(false);
  }, [previewTemplate, setBlurred]);

  const filteredByPhase = useMemo(() => {
    const phases =
      activePhase === "all"
        ? PHASES
        : ([activePhase] as unknown as typeof PHASES);
    return phases.map((phase) => ({
      phase,
      templates: getTemplatesByPhase(phase),
    }));
  }, [activePhase]);

  const totalTemplates = TEMPLATE_REGISTRY.length;
  const totalTokens = new Set(
    TEMPLATE_REGISTRY.flatMap((template) =>
      template.tokens.map((token) => token.key),
    ),
  ).size;

  const employeesWithIssues = useMemo(() => {
    const employeeIds = new Set<string>();

    for (const template of TEMPLATE_REGISTRY) {
      for (const employee of employees) {
        const missing = getMissingFields(
          template.id,
          getEmployeeDocumentProfile(employee.documentProfile),
        );
        if (missing.length > 0) {
          employeeIds.add(employee.id);
        }
      }
    }

    return employeeIds.size;
  }, [employees]);

  const templateLabelMap = useMemo(() => {
    const map = new Map<string, string>();
    for (const template of TEMPLATE_REGISTRY) {
      map.set(template.id, template.label);
    }
    return map;
  }, []);

  const approvedContracts = useMemo(() => {
    const rows = approvedData?.contractRequests ?? [];
    return [...rows].sort((a, b) => {
      const aTime = new Date(a.decidedAt ?? a.updatedAt).getTime();
      const bTime = new Date(b.decidedAt ?? b.updatedAt).getTime();
      return bTime - aTime;
    });
  }, [approvedData]);

  function formatDate(value: string) {
    return new Date(value).toLocaleDateString("mn-MN", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    });
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-[20px] font-bold text-[#121316]">Загварууд</h2>
          <p className="text-[14px] text-[#3f4145]">
            Баримт бичгийн загвар, токен, шаардлагатай талбаруудыг удирдах
          </p>
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        {[
          { key: "all", label: "Бүгд" },
          { key: "onboarding", label: "Ажилд орох" },
          { key: "working", label: "Ажиллах" },
          { key: "offboarding", label: "Ажлаас гарах" },
        ].map((button) => {
          const isActive = activePhase === button.key;
          return (
            <button
              key={button.key}
              type="button"
              onClick={() =>
                setActivePhase(button.key as "all" | (typeof PHASES)[number])
              }
              className={`rounded-full border px-4 py-2 text-[12px] font-semibold transition-colors ${
                isActive
                  ? "border-[#121316] bg-[#121316] text-white"
                  : "border-black/12 bg-white text-[#3f4145] hover:bg-[#f5f5f5]"
              }`}>
              {button.label}
            </button>
          );
        })}
      </div>

      <div className="grid grid-cols-3 gap-3">
        <div className="rounded-[16px] border border-black/12 bg-white px-4 py-3">
          <p className="text-[24px] font-bold text-[#121316]">
            {totalTemplates}
          </p>
          <p className="text-[13px] text-[#3f4145]">Нийт загвар</p>
        </div>
        <div className="rounded-[16px] border border-black/12 bg-white px-4 py-3">
          <p className="text-[24px] font-bold text-[#121316]">{totalTokens}</p>
          <p className="text-[13px] text-[#3f4145]">Өвөрмөц токен</p>
        </div>
        <div
          className={`rounded-[16px] border px-4 py-3 ${
            employeesWithIssues > 0
              ? "border-amber-200 bg-amber-50"
              : "border-emerald-200 bg-emerald-50"
          }`}>
          <p
            className={`text-[24px] font-bold ${
              employeesWithIssues > 0 ? "text-amber-700" : "text-emerald-700"
            }`}>
            {employeesWithIssues}
          </p>
          <p
            className={`text-[13px] ${
              employeesWithIssues > 0 ? "text-amber-600" : "text-emerald-600"
            }`}>
            Дутуу мэдээлэлтэй ажилтан
          </p>
        </div>
      </div>

      <div className="flex flex-wrap gap-3">
        <div className="flex items-center gap-1.5 text-[12px]">
          <span className="inline-block h-3 w-3 rounded-full border border-blue-200 bg-blue-50" />
          <span className="text-[#3f4145]">Ажилтны мэдээлэл</span>
        </div>
        <div className="flex items-center gap-1.5 text-[12px]">
          <span className="inline-block h-3 w-3 rounded-full border border-purple-200 bg-purple-50" />
          <span className="text-[#3f4145]">Гэрээний профайл</span>
        </div>
        <div className="flex items-center gap-1.5 text-[12px]">
          <span className="inline-block h-3 w-3 rounded-full border border-slate-200 bg-slate-50" />
          <span className="text-[#3f4145]">Автомат тооцоолол</span>
        </div>
      </div>

      <div className="rounded-[16px] border border-black/10 bg-white p-5">
        <div className="flex items-center justify-between gap-3">
          <div>
            <h3 className="text-[16px] font-semibold text-[#121316]">
              Амжилттай гэрээнүүд
            </h3>
            <p className="text-[12px] text-[#77818c]">
              HR баталсан гэрээний хүсэлтүүд
            </p>
          </div>
          <span className="rounded-full border border-emerald-200 bg-emerald-50 px-2.5 py-1 text-[12px] font-medium text-emerald-700">
            {approvedContracts.length}
          </span>
        </div>

        <div className="mt-4 flex flex-col gap-3">
          {approvedLoading ? (
            <div className="rounded-[12px] border border-dashed border-black/10 px-4 py-3 text-[13px] text-[#77818c]">
              Ачаалж байна...
            </div>
          ) : approvedContracts.length === 0 ? (
            <div className="rounded-[12px] border border-dashed border-black/10 px-4 py-3 text-[13px] text-[#77818c]">
              Одоогоор баталгаажсан гэрээ алга байна.
            </div>
          ) : (
            approvedContracts.map((row) => {
              const templateLabels = row.templateIds
                .map((id) => templateLabelMap.get(id) ?? id)
                .join(", ");
              const decidedAt = row.decidedAt ?? row.updatedAt;
              return (
                <div
                  key={row.id}
                  className="flex flex-col gap-2 rounded-[12px] border border-black/10 bg-slate-50/60 px-4 py-3">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div className="flex flex-col">
                      <span className="text-[14px] font-semibold text-[#121316]">
                        {row.employee.lastName} {row.employee.firstName}
                      </span>
                      <span className="text-[12px] text-[#77818c]">
                        {row.employee.employeeCode} • {row.employee.department}
                      </span>
                    </div>
                    <span className="rounded-full border border-emerald-200 bg-white px-2.5 py-1 text-[12px] font-medium text-emerald-700">
                      Баталгаажсан
                    </span>
                  </div>

                  <div className="text-[12px] text-[#3f4145]">
                    Гэрээ: {templateLabels || "Тодорхойгүй"}
                  </div>
                  <div className="text-[12px] text-[#77818c]">
                    Баталсан огноо: {formatDate(decidedAt)}
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      <div className="flex flex-col gap-8">
        {filteredByPhase.map(({ phase, templates }) =>
          templates.length > 0 ? (
            <PhaseSection
              key={phase}
              phase={phase}
              templates={templates}
              employees={employees}
              onPreview={setPreviewTemplate}
            />
          ) : null,
        )}
      </div>

      {typeof document !== "undefined" && previewTemplate
        ? createPortal(
            <TemplatePreviewModal
              template={previewTemplate}
              onClose={() => setPreviewTemplate(null)}
            />,
            document.body,
          )
        : null}
    </div>
  );
}
