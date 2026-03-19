"use client";

import { PHASE_LABELS } from "@/lib/templateConfig";
import type { TemplateInfo } from "@/lib/templateConfig";
import type { Employee } from "@/lib/types";

import { PHASE_ICONS } from "./template-manager-shared";
import { TemplateCard } from "./TemplateCard";

export function PhaseSection({
  phase,
  templates,
  employees,
  onPreview,
}: {
  phase: string;
  templates: TemplateInfo[];
  employees: Employee[];
  onPreview: (template: TemplateInfo) => void;
}) {
  return (
    <div>
      <div className="mb-3 flex items-center gap-2.5">
        <div className="flex h-8 w-8 items-center justify-center rounded-[10px] border border-black/12 bg-white">
          {PHASE_ICONS[phase]}
        </div>
        <h3 className="text-[15px] font-semibold text-[#121316]">
          {PHASE_LABELS[phase]}
        </h3>
        <span className="rounded-full border border-black/12 px-2 py-0.5 text-[12px] text-[#3f4145]">
          {templates.length}
        </span>
      </div>

      <div className="flex flex-col gap-3">
        {templates.map((template) => (
          <TemplateCard
            key={template.id}
            template={template}
            employees={employees}
            onPreview={onPreview}
          />
        ))}
      </div>
    </div>
  );
}
