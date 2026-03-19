"use client";

import { useEffect, useMemo, useState } from "react";
import { createPortal } from "react-dom";
import { useQuery } from "@apollo/client/react";
import { FiSearch } from "react-icons/fi";

import { GET_EMPLOYEES } from "@/graphql/queries/employees";
import { buildGraphQLHeaders } from "@/lib/apollo-client";
import {
  TEMPLATE_REGISTRY,
  getMissingFields,
  getTemplatesByPhase,
} from "@/lib/templateConfig";
import type { TemplateInfo } from "@/lib/templateConfig";
import type { Employee } from "@/lib/types";

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

  const [previewTemplate, setPreviewTemplate] = useState<TemplateInfo | null>(
    null,
  );
  const [search, setSearch] = useState("");
  const { setBlurred } = useHrOverlay();

  useEffect(() => {
    setBlurred(Boolean(previewTemplate));
    return () => setBlurred(false);
  }, [previewTemplate, setBlurred]);

  const filteredByPhase = useMemo(() => {
    const query = search.toLowerCase();

    return PHASES.map((phase) => {
      let templates = getTemplatesByPhase(phase);
      if (query) {
        templates = templates.filter(
          (template) =>
            template.label.toLowerCase().includes(query) ||
            template.id.toLowerCase().includes(query) ||
            template.tokens.some(
              (token) =>
                token.key.includes(query) ||
                token.label.toLowerCase().includes(query),
            ),
        );
      }

      return { phase, templates };
    });
  }, [search]);

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

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-[20px] font-bold text-[#121316]">Загварууд</h2>
          <p className="text-[14px] text-[#3f4145]">
            Баримт бичгийн загвар, токен, шаардлагатай талбаруудыг удирдах
          </p>
        </div>

        <div className="relative">
          <div className="pointer-events-none absolute inset-y-0 left-3 flex items-center">
            <FiSearch className="h-4 w-4 text-[#77818c]" />
          </div>
          <input
            type="text"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Загвар хайх..."
            className="h-9 w-full rounded-[10px] border border-black/12 bg-white pl-9 pr-3 text-[14px] text-[#121316] placeholder:text-[#77818c] outline-none transition-colors focus:border-[#121316]/30 sm:w-56"
          />
        </div>
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
          }`}
        >
          <p
            className={`text-[24px] font-bold ${
              employeesWithIssues > 0 ? "text-amber-700" : "text-emerald-700"
            }`}
          >
            {employeesWithIssues}
          </p>
          <p
            className={`text-[13px] ${
              employeesWithIssues > 0 ? "text-amber-600" : "text-emerald-600"
            }`}
          >
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
