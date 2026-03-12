"use client";
import { VscPreview } from "react-icons/vsc";
import { DocumentIcon } from "./icons";
import { BiDownload, BiX } from "react-icons/bi";
import { useState } from "react";

type ContractPreviewProps = {
  onPreview?: () => void;
};

export const ContractPreview = ({ onPreview }: ContractPreviewProps) => {
  const [previewOpen, setPreviewOpen] = useState(false);
  const mockContractHtml = `<!doctype html>
      <html lang="mn">
        <head>
          <meta charset="UTF-8" />
          <meta name="viewport" content="width=device-width, initial-scale=1.0" />
          <title>Хөдөлмөрийн гэрээ</title>
          <style>
            * { box-sizing: border-box; }
            body {
              margin: 0;
              padding: 24px 28px 36px;
              font-family: "Times New Roman", Times, serif;
              color: #111;
              background: #fff;
              font-size: 12pt;
            }
            .doc-title {
              text-align: center;
              font-size: 14pt;
              font-weight: bold;
              letter-spacing: 1px;
              margin-bottom: 14px;
              text-transform: uppercase;
            }
            .doc-meta {
              display: flex;
              justify-content: space-between;
              font-size: 11.5pt;
              border-bottom: 1px solid #000;
              padding-bottom: 8px;
              margin-bottom: 12px;
            }
            p { margin: 0 0 8px; line-height: 1.75; text-align: justify; }
            .sec-title {
              text-align: center;
              font-size: 12.5pt;
              font-weight: bold;
              margin: 14px 0 8px;
            }
            .d {
              display: inline-block;
              border-bottom: 1px solid #000;
              min-width: 120px;
              padding: 0 6px 1px;
            }
          </style>
        </head>
        <body>
          <div class="doc-title">Хөдөлмөрийн гэрээ</div>
          <div class="doc-meta">
            <span>2025 оны 03 сарын 12-ны өдөр</span>
            <span>№ HG-2025-014</span>
            <span>Улаанбаатар хот</span>
          </div>
          <p>
            Энэхүү гэрээг <span class="d">Пайнквест ХХК</span> болон
            <span class="d">Базар Сүндүй</span> нар байгууллаа.
          </p>
          <div class="sec-title">1. Нийтлэг үндэслэл</div>
          <p>
            Ажилтан нь <span class="d">Программ хангамжийн инженер</span> албан тушаалд
            ажиллана.
          </p>
          <div class="sec-title">2. Хөдөлмөрийн гэрээний хугацаа</div>
          <p>Гэрээний хүчинтэй хугацаа: <span class="d">Хугацаагүй</span>.</p>
          <div class="sec-title">3. Цалин хөлс</div>
          <p>Сарын үндсэн цалин: <span class="d">3,500,000₮</span>.</p>
        </body>
      </html>`;

  return (
    <div className="w-80 bg-[#111318] rounded-xl border border-white/10 p-4 shadow-xl shadow-black/40">
      <div className="flex gap-3 mb-4">
        <div className="shrink-0 w-11 h-11 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center text-slate-400">
          <DocumentIcon />
        </div>

        <div className="flex flex-col justify-center min-w-0">
          <p className="text-white text-sm font-semibold leading-tight truncate">
            Хөдөлмөрийн гэрээ
          </p>
          <p className="text-slate-500 text-xs mt-0.5 truncate">
            01_employment_contract.pdf
          </p>
          <p className="text-slate-600 text-xs mt-0.5">2024.02.24</p>
        </div>
      </div>

      <div className="flex gap-2">
        <button
          type="button"
          onClick={() => setPreviewOpen(true)}
          className="flex-1 flex items-center justify-center gap-1.5 h-8 rounded-lg text-xs font-medium text-slate-300 bg-white/5 border border-white/10 hover:bg-white/10 hover:text-white hover:border-white/20 transition-all duration-150 cursor-pointer "
        >
          <VscPreview className="text-sm" />
          Харах
        </button>

        <button
          type="button"
          className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-300 bg-white/5 border border-white/10 hover:bg-white/10 hover:text-white hover:border-white/20 transition-all duration-150 cursor-pointer "
        >
          <BiDownload className="text-sm" />
        </button>
      </div>
      {previewOpen && (
        <div className="fixed inset-0 z-60 flex items-center justify-center">
          <button
            type="button"
            aria-label="Preview close overlay"
            className="absolute inset-0 bg-black/70"
            onClick={() => setPreviewOpen(false)}
          />
          <div className="relative w-225 max-w-[92vw] h-[82vh] bg-[#111318] border border-white/10 rounded-2xl shadow-2xl shadow-black/60 overflow-hidden">
            <div className="flex items-center justify-between px-5 py-4 border-b border-white/10">
              <div className="flex flex-col">
                <p className="text-white text-sm font-semibold">
                  Хөдөлмөрийн гэрээ
                </p>
                <p className="text-slate-500 text-xs mt-0.5">
                  01_employment_contract.pdf
                </p>
              </div>
              <button
                type="button"
                onClick={() => setPreviewOpen(false)}
                className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
              >
                <BiX className="text-lg" />
              </button>
            </div>
            <div className="h-full bg-[#0a0b0f] p-6">
              <iframe
                title="Mock contract preview"
                className="w-full h-full rounded-xl border border-white/10 bg-white"
                srcDoc={mockContractHtml}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
