"use client";

import { ContractPreview } from "@/components/contractPreview";
import { FactIcon } from "@/components/icons";
import type { Document } from "@/lib/types";

export function EmployeeDocumentsSection({
  documents,
  authToken,
}: {
  documents: Document[];
  authToken: string;
}) {
  const recentDocuments = [...documents]
    .sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
    )
    .slice(0, 5);

  return (
    <section className="mx-auto flex w-full max-w-[1056px] flex-col gap-6">
      <div className="flex items-center gap-4">
        <h2 className="text-[24px] font-semibold tracking-[-0.02em] text-white">
          Бичиг Баримтууд
        </h2>
        <span className="rounded-full border border-[#233246] bg-[#162130] px-4 py-1 text-[14px] font-medium text-[#94A3B8]">
          {recentDocuments.length} баримт
        </span>
      </div>

      <div className="flex flex-col divide-y divide-white/10 rounded-xl border border-white/5 bg-[#0B0E14]/40">
        {recentDocuments.length > 0 ? (
          recentDocuments.map((document) => (
            <ContractPreview
              key={document.id}
              document={document}
              authToken={authToken}
            />
          ))
        ) : (
          <div className="flex flex-col items-center justify-center gap-3 py-10 text-center">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-[18px] border border-[#24374F] bg-[#132131]">
              <FactIcon />
            </div>
            <div className="flex flex-col items-center gap-1">
              <h3 className="text-[13px] font-semibold text-[#E7EDF5]">
                Баримт олдсонгүй
              </h3>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
