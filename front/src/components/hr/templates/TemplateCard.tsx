"use client";

import { useMemo, useState } from "react";
import {
  FiAlertTriangle,
  FiChevronDown,
  FiChevronRight,
  FiEye,
  FiFile,
} from "react-icons/fi";

import { getMissingFields } from "@/lib/templateConfig";
import type { TemplateInfo } from "@/lib/templateConfig";
import type { Employee } from "@/lib/types";

import { IncompleteFieldsWarning } from "./IncompleteFieldsWarning";
import { getEmployeeDocumentProfile } from "./template-manager-shared";
import { TokenBadge } from "./TokenBadge";

export function TemplateCard({
  template,
  employees,
  onPreview,
}: {
  template: TemplateInfo;
  employees: Employee[];
  onPreview: (template: TemplateInfo) => void;
}) {
  const [expanded, setExpanded] = useState(false);

  const missingCount = useMemo(() => {
    let count = 0;

    for (const employee of employees) {
      const missing = getMissingFields(
        template.id,
        getEmployeeDocumentProfile(employee.documentProfile),
      );
      if (missing.length > 0) {
        count++;
      }
    }

    return count;
  }, [employees, template.id]);

  return (
    <div className="rounded-[20px] border border-black/12 bg-white transition-shadow hover:shadow-sm">
      <div className="flex items-center justify-between px-5 py-4">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-[14px] border border-black/12 bg-[#f5f5f5]">
            <FiFile className="h-5 w-5 text-[#121316]" />
          </div>
          <div>
            <h4 className="text-[14px] font-semibold text-[#121316]">
              {template.label}
            </h4>
            <p className="text-[12px] text-[#3f4145]">
              {template.filename} · {template.tokens.length} token
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {missingCount > 0 && (
            <span className="flex items-center gap-1 rounded-full border border-amber-200 bg-amber-50 px-2.5 py-1 text-[12px] font-medium text-amber-700">
              <FiAlertTriangle className="h-3 w-3" />
              {missingCount}
            </span>
          )}
          <button
            onClick={() => onPreview(template)}
            className="flex h-8 w-8 items-center justify-center rounded-[10px] text-[#77818c] transition-colors hover:bg-[#f5f5f5] hover:text-[#121316]"
            aria-label="Урьдчилж харах"
          >
            <FiEye className="h-4 w-4" />
          </button>
          <button
            onClick={() => setExpanded((current) => !current)}
            className="flex h-8 w-8 items-center justify-center rounded-[10px] text-[#77818c] transition-colors hover:bg-[#f5f5f5] hover:text-[#121316]"
          >
            {expanded ? (
              <FiChevronDown className="h-4 w-4" />
            ) : (
              <FiChevronRight className="h-4 w-4" />
            )}
          </button>
        </div>
      </div>

      {expanded && (
        <div className="border-t border-black/12 px-5 py-4">
          <div className="flex flex-col gap-4">
            <div>
              <h5 className="mb-2 text-[13px] font-semibold text-[#121316]">
                Токенууд ({template.tokens.length})
              </h5>
              <div className="flex flex-wrap gap-1.5">
                {template.tokens.map((token) => (
                  <TokenBadge key={token.key} token={token} />
                ))}
              </div>
            </div>

            <div>
              <h5 className="mb-2 text-[13px] font-semibold text-[#121316]">
                Шаардлагатай талбарууд
              </h5>
              <div className="flex flex-wrap gap-1.5">
                {template.requiredFields.map((fieldKey) => {
                  const token = template.tokens.find(
                    (item) => item.key === fieldKey,
                  );

                  return (
                    <span
                      key={fieldKey}
                      className="inline-flex items-center gap-1 rounded-[8px] border border-red-200 bg-red-50 px-2 py-1 text-[12px] font-medium text-red-700"
                    >
                      {token?.label ?? fieldKey}
                    </span>
                  );
                })}
              </div>
            </div>

            <div>
              <h5 className="mb-2 text-[13px] font-semibold text-[#121316]">
                Ажилтны бэлэн байдал
              </h5>
              <IncompleteFieldsWarning
                templateId={template.id}
                employees={employees}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
