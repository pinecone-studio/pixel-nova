"use client";

import { BiX } from "react-icons/bi";
import { FiEye, FiFileText } from "react-icons/fi";

import type { DocumentReview, EmployeeRequest } from "./types";

function Field({
  label,
  value,
  full = false,
}: {
  label: string;
  value: string;
  full?: boolean;
}) {
  return (
    <div className={full ? "w-full" : ""}>
      <p className="mb-2 text-sm text-[#D9E2EC]">{label}</p>
      <div className="rounded-xl border border-[#2A3545] bg-[#0C131E] px-4 py-3 text-[15px] text-[#E6EDF5]">
        {value}
      </div>
    </div>
  );
}

export function EmployeeRequestModal({
  entry,
  onClose,
}: {
  entry: EmployeeRequest;
  onClose: () => void;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/65 p-4 backdrop-blur-sm">
      <div className="w-full max-w-[612px] rounded-[28px] border border-[#1A2431] bg-[#09111C] p-7 shadow-[0_24px_80px_rgba(0,0,0,0.45)]">
        <div className="mb-8 flex items-start justify-between">
          <div>
            <p className="text-[13px] text-[#9AA7BA]">Шинэ ажилтны хүсэлт</p>
            <h2 className="mt-3 text-[20px] font-semibold text-white">
              Шинэ ажилтан
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-[#B0BAC7] transition hover:text-white"
          >
            <BiX className="h-7 w-7" />
          </button>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <Field label="Овог" value={entry.lastName} />
          <Field label="Нэр" value={entry.firstName} />
        </div>
        <div className="mt-4">
          <Field label="Имэйл" value={entry.email} full />
        </div>
        <div className="mt-4 grid grid-cols-2 gap-4">
          <Field label="Хэлтэс" value={entry.department} />
          <Field label="Албан тушаал" value={entry.role} />
        </div>

        <div className="mt-6">
          <p className="mb-3 text-sm font-medium text-white">Хавсаргасан файл</p>
          <div className="flex flex-col gap-3">
            {entry.files.map((file) => (
              <div
                key={file.id}
                className="flex items-center justify-between rounded-2xl border border-[#1A2431] bg-[#121A25] px-3 py-3"
              >
                <div className="flex items-center gap-3">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-[#222E3E] bg-[#0D1623] text-[#7E8A9E]">
                    <FiFileText className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-[#E6EDF5]">
                      {file.title}
                    </p>
                    <p className="text-xs text-[#7E8A9E]">{file.fileName}</p>
                  </div>
                </div>
                <button
                  type="button"
                  className="rounded-full p-2 text-[#7E8A9E] transition hover:bg-white/5 hover:text-white"
                >
                  <FiEye className="h-4 w-4" />
                </button>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-8 flex justify-end gap-4">
          <button
            type="button"
            onClick={onClose}
            className="rounded-2xl border border-[#FF3B3B] px-6 py-3 text-[15px] font-medium text-[#FF3B3B] transition hover:bg-[#FF3B3B]/10"
          >
            Татгалзах
          </button>
          <button
            type="button"
            onClick={onClose}
            className="rounded-2xl bg-[#16D17A] px-6 py-3 text-[15px] font-medium text-[#05100B] transition hover:bg-[#1BE589]"
          >
            Баталгаажуулах
          </button>
        </div>
      </div>
    </div>
  );
}

export function DocumentReviewModal({
  entry,
  onClose,
}: {
  entry: DocumentReview;
  onClose: () => void;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/65 p-4 backdrop-blur-sm">
      <div className="w-full max-w-[500px] rounded-[28px] border border-[#1A2431] bg-[#09111C] px-8 py-9 shadow-[0_24px_80px_rgba(0,0,0,0.45)]">
        <div className="mb-8 flex items-start justify-between gap-4">
          <h2 className="text-[32px] font-medium leading-none text-white">
            {entry.modalTitle}
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="text-[#F3F7FB] transition hover:opacity-75"
          >
            <BiX className="h-9 w-9" />
          </button>
        </div>

        <div>
          <p className="mb-3 text-[18px] font-semibold text-white">Тайлбар</p>
          <div className="min-h-[120px] rounded-[18px] border border-[#2B3545] bg-[#0A121D] px-5 py-4 text-[18px] leading-[1.35] text-[#EEF4FA]">
            {entry.description}
          </div>
        </div>

        <div className="mt-8">
          <p className="mb-4 text-[18px] font-semibold text-white">Хавсаргасан файл</p>
          <div className="flex items-center justify-between rounded-[18px] border border-[#1A2431] bg-[#151E29] px-3.5 py-3.5">
            <div className="flex items-center gap-4">
              <div className="flex h-[56px] w-[56px] items-center justify-center rounded-[20px] border border-[#2B3545] bg-[#111A26] text-[#7E8A9E]">
                <FiFileText className="h-6 w-6" />
              </div>
              <div>
                <p className="text-[16px] font-medium text-[#EEF4FA]">
                  {entry.fileTitle}
                </p>
                <p className="mt-1 text-[14px] text-[#9BA8B9]">{entry.fileName}</p>
              </div>
            </div>
            <button
              type="button"
              className="rounded-full p-3 text-[#7E8A9E] transition hover:bg-white/5 hover:text-white"
            >
              <FiEye className="h-6 w-6" />
            </button>
          </div>
        </div>

        <div className="mt-8 flex justify-end gap-4">
          <button
            type="button"
            onClick={onClose}
            className="rounded-[18px] border border-[#FF3131] px-7 py-3 text-[16px] font-medium text-[#FF3131] transition hover:bg-[#FF3131]/10"
          >
            Татгалзах
          </button>
          <button
            type="button"
            onClick={onClose}
            className="rounded-[18px] bg-[#19D37B] px-8 py-3 text-[16px] font-medium text-[#F7FFFB] transition hover:bg-[#21E789]"
          >
            Баталгаажуулах
          </button>
        </div>
      </div>
    </div>
  );
}
