"use client";

import { useEffect, useState, useMemo } from "react";
import { useLazyQuery } from "@apollo/client/react";
import { FiX, FiEye, FiCode, FiCopy, FiCheck } from "react-icons/fi";

import { GET_CONTRACT_TEMPLATE } from "@/graphql/queries/documents";
import { buildGraphQLHeaders } from "@/lib/apollo-client";
import type { TemplateInfo } from "@/lib/templateConfig";
import { SOURCE_LABELS } from "@/lib/templateConfig";
import type { DocumentContent } from "@/lib/types";

type TabKey = "preview" | "html" | "tokens";

export function TemplatePreviewModal({
  template,
  onClose,
}: {
  template: TemplateInfo;
  onClose: () => void;
}) {
  const [fetchTemplate, { data, loading }] = useLazyQuery<{
    contractTemplate: DocumentContent;
  }>(GET_CONTRACT_TEMPLATE);

  const [activeTab, setActiveTab] = useState<TabKey>("preview");
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    fetchTemplate({
      variables: { templateId: template.id },
      context: { headers: buildGraphQLHeaders({ actorRole: "hr" }) },
    });
  }, [fetchTemplate, template.id]);

  // Extract tokens found in the HTML
  const htmlContent = data?.contractTemplate?.content ?? "";
  const foundTokens = useMemo(() => {
    const regex = /\{\{\{?\s*([a-zA-Z0-9_]+)\s*\}?\}\}/g;
    const tokens = new Set<string>();
    let match: RegExpExecArray | null;
    while ((match = regex.exec(htmlContent)) !== null) {
      tokens.add(match[1]);
    }
    return Array.from(tokens);
  }, [htmlContent]);

  const handleCopyHtml = async () => {
    if (!htmlContent) return;
    await navigator.clipboard.writeText(htmlContent);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const tabs: Array<{ key: TabKey; label: string; icon: React.ReactNode }> = [
    { key: "preview", label: "Урьдчилж харах", icon: <FiEye className="h-3.5 w-3.5" /> },
    { key: "html", label: "HTML код", icon: <FiCode className="h-3.5 w-3.5" /> },
    { key: "tokens", label: `Токенууд (${template.tokens.length})`, icon: <FiCode className="h-3.5 w-3.5" /> },
  ];

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 p-4">
      <div className="flex h-[82vh] w-[920px] max-w-[95vw] flex-col overflow-hidden rounded-[24px] border border-black/12 bg-white shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-black/12 px-6 py-4">
          <div>
            <h3 className="text-[16px] font-semibold text-[#121316]">
              {template.label}
            </h3>
            <p className="text-[13px] text-[#3f4145]">{template.filename}</p>
          </div>
          <button
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-[10px] text-[#77818c] transition-colors hover:bg-[#f5f5f5] hover:text-[#121316]"
          >
            <FiX className="h-5 w-5" />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex items-center gap-1 border-b border-black/12 px-6">
          {tabs.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`flex items-center gap-1.5 border-b-2 px-3 py-2.5 text-[13px] font-medium transition-colors ${
                activeTab === tab.key
                  ? "border-[#121316] text-[#121316]"
                  : "border-transparent text-[#77818c] hover:text-[#3f4145]"
              }`}
            >
              {tab.icon}
              {tab.label}
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="flex-1 overflow-hidden">
          {loading ? (
            <div className="flex h-full items-center justify-center">
              <div className="flex flex-col items-center gap-3">
                <div className="h-8 w-8 animate-spin rounded-full border-2 border-slate-200 border-t-slate-600" />
                <p className="text-[13px] text-[#77818c]">
                  Загвар ачааллаж байна...
                </p>
              </div>
            </div>
          ) : !data?.contractTemplate ? (
            <div className="flex h-full items-center justify-center text-[14px] text-[#77818c]">
              Загвар олдсонгүй
            </div>
          ) : activeTab === "preview" ? (
            /* Preview tab */
            <iframe
              srcDoc={htmlContent}
              className="h-full w-full border-0"
              title={template.label}
              sandbox="allow-same-origin"
            />
          ) : activeTab === "html" ? (
            /* HTML code tab */
            <div className="flex h-full flex-col">
              <div className="flex items-center justify-between border-b border-black/6 px-4 py-2">
                <div className="flex items-center gap-2 text-[12px] text-[#77818c]">
                  <span>{htmlContent.length.toLocaleString()} тэмдэгт</span>
                  <span className="text-black/20">|</span>
                  <span>{foundTokens.length} токен олдсон</span>
                </div>
                <button
                  onClick={handleCopyHtml}
                  className="flex items-center gap-1.5 rounded-[8px] border border-black/12 px-2.5 py-1.5 text-[12px] font-medium text-[#3f4145] transition-colors hover:bg-[#f5f5f5]"
                >
                  {copied ? (
                    <>
                      <FiCheck className="h-3.5 w-3.5 text-emerald-500" />
                      Хуулсан
                    </>
                  ) : (
                    <>
                      <FiCopy className="h-3.5 w-3.5" />
                      Хуулах
                    </>
                  )}
                </button>
              </div>
              <div className="flex-1 overflow-auto bg-[#1e1e2e] p-4">
                <pre className="text-[13px] leading-relaxed text-[#cdd6f4] font-mono whitespace-pre-wrap break-all">
                  {htmlContent}
                </pre>
              </div>
            </div>
          ) : (
            /* Tokens tab — field mapping viewer */
            <div className="flex-1 overflow-auto p-6">
              <div className="mb-4 rounded-[12px] border border-blue-200 bg-blue-50 px-4 py-3 text-[13px] text-blue-700">
                Загвар дахь <strong>{`{{token_name}}`}</strong> токенууд автоматаар ажилтны мэдээллээр солигдоно.
              </div>

              <div className="overflow-hidden rounded-[16px] border border-black/12 bg-white">
                {/* Header */}
                <div className="grid grid-cols-[1fr_1fr_1fr_auto] items-center border-b border-black/12 bg-[#fafafa] px-4 py-2.5 text-[12px] font-semibold text-[#3f4145]">
                  <span>Токен</span>
                  <span>Монгол нэр</span>
                  <span>Эх үүсвэр</span>
                  <span className="w-20 text-center">Загварт бий</span>
                </div>

                {/* Token rows */}
                {template.tokens.map((token) => {
                  const isInHtml = foundTokens.includes(token.key);
                  const isRequired = template.requiredFields.includes(token.key);

                  return (
                    <div
                      key={token.key}
                      className="grid grid-cols-[1fr_1fr_1fr_auto] items-center border-b border-black/6 px-4 py-2.5 text-[13px] last:border-0 hover:bg-[#fafafa]"
                    >
                      <div className="flex items-center gap-1.5">
                        <code className="rounded bg-slate-100 px-1.5 py-0.5 text-[12px] font-mono text-slate-700">
                          {`{{${token.key}}}`}
                        </code>
                        {isRequired && (
                          <span className="rounded-full bg-red-100 px-1.5 py-0.5 text-[10px] font-medium text-red-600">
                            заавал
                          </span>
                        )}
                      </div>
                      <span className="text-[#121316]">{token.label}</span>
                      <span className={`text-[12px] ${
                        token.source === "employee"
                          ? "text-blue-600"
                          : token.source === "documentProfile"
                            ? "text-purple-600"
                            : "text-slate-500"
                      }`}>
                        {SOURCE_LABELS[token.source]}
                      </span>
                      <div className="flex w-20 items-center justify-center">
                        {isInHtml ? (
                          <span className="flex h-5 w-5 items-center justify-center rounded-full bg-emerald-100 text-emerald-600">
                            <FiCheck className="h-3 w-3" />
                          </span>
                        ) : (
                          <span className="flex h-5 w-5 items-center justify-center rounded-full bg-slate-100 text-slate-400">
                            –
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })}

                {/* Unregistered tokens found in HTML */}
                {foundTokens
                  .filter((key) => !template.tokens.some((t) => t.key === key))
                  .map((key) => (
                    <div
                      key={key}
                      className="grid grid-cols-[1fr_1fr_1fr_auto] items-center border-b border-black/6 px-4 py-2.5 text-[13px] last:border-0 bg-amber-50/50"
                    >
                      <div className="flex items-center gap-1.5">
                        <code className="rounded bg-amber-100 px-1.5 py-0.5 text-[12px] font-mono text-amber-700">
                          {`{{${key}}}`}
                        </code>
                        <span className="rounded-full bg-amber-100 px-1.5 py-0.5 text-[10px] font-medium text-amber-600">
                          бүртгэлгүй
                        </span>
                      </div>
                      <span className="text-[#77818c]">—</span>
                      <span className="text-[12px] text-[#77818c]">Тодорхойгүй</span>
                      <div className="flex w-20 items-center justify-center">
                        <span className="flex h-5 w-5 items-center justify-center rounded-full bg-amber-100 text-amber-600">
                          <FiCheck className="h-3 w-3" />
                        </span>
                      </div>
                    </div>
                  ))}
              </div>

              {/* Example */}
              <div className="mt-4 rounded-[12px] border border-black/12 bg-[#fafafa] px-4 py-3">
                <p className="mb-2 text-[12px] font-semibold text-[#3f4145]">Жишээ утга</p>
                <div className="flex flex-wrap gap-2">
                  {template.tokens.slice(0, 6).map((token) => (
                    <div key={token.key} className="flex items-center gap-1 text-[12px]">
                      <code className="rounded bg-white px-1 py-0.5 text-[11px] font-mono text-slate-500 border border-black/6">
                        {token.key}
                      </code>
                      <span className="text-[#77818c]">→</span>
                      <span className="text-[#121316] font-medium">{token.example}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
