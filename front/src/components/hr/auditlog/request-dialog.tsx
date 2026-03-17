"use client";

import { useState } from "react";
import { FiEye, FiFileText, FiX } from "react-icons/fi";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import type { ActionConfig } from "@/lib/types";

const DEPARTMENTS = [
  "Engineering",
  "HR",
  "Sales",
  "Finance",
  "Marketing",
  "Design",
];

type Tab = "hr" | "employee";

export function AddEmployeeRequestDialog({
  action,
  open,
  onOpenChange,
}: {
  action: ActionConfig | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const [tab, setTab] = useState<Tab>("hr");
  const [lastName, setLastName] = useState("");
  const [firstName, setFirstName] = useState("");
  const [email, setEmail] = useState("");
  const [registerNo, setRegisterNo] = useState("");
  const [phone, setPhone] = useState("");
  const [branch, setBranch] = useState("");
  const [dept, setDept] = useState("Engineering");
  const [jobTitle, setJobTitle] = useState("");
  const [recipients, setRecipients] = useState<string[]>(() =>
    action?.recipients.length ? [...action.recipients] : ["hr_manager"],
  );
  const [recipientInput, setRecipientInput] = useState("");

  const documents = action?.documents ?? [];

  const addRecipient = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && recipientInput.trim()) {
      setRecipients((prev) => [...prev, recipientInput.trim()]);
      setRecipientInput("");
    }
  };

  const removeRecipient = (recipient: string) => {
    setRecipients((prev) => prev.filter((value) => value !== recipient));
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        showCloseButton
        className="bg-white border border-slate-200 rounded-[16px] flex w-full max-w-[calc(100vw-2rem)] sm:max-w-xl flex-col gap-[16px] p-[24px] max-h-[92vh] overflow-y-auto overflow-x-hidden ring-0 scrollbar-hidden">
        <DialogHeader>
          <DialogTitle className="text-slate-900 font-semibold text-[20px] leading-[24px]">
            {action?.name ?? "Шинэ ажилтан"}
          </DialogTitle>
        </DialogHeader>

        <div className="flex min-w-0 gap-[16px] shrink-0">
          <button
            onClick={() => setTab("hr")}
            className={`flex-1 py-[8px] px-[12px] rounded-[8px] text-slate-600 text-[12px] font-normal leading-[20px] transition-colors ${
              tab === "hr"
                ? "border border-slate-300 bg-slate-50"
                : "border border-slate-200"
            }`}>
            HR
          </button>
          <button
            onClick={() => setTab("employee")}
            className={`flex-1 py-[8px] px-[12px] rounded-[8px] text-slate-600 text-[12px] font-normal leading-[20px] transition-colors ${
              tab === "employee"
                ? "border border-slate-300 bg-slate-50"
                : "border border-slate-200"
            }`}>
            Ажилтан
          </button>
        </div>

        <div className="flex min-w-0 flex-col gap-[16px]">
          <div className="grid min-w-0 grid-cols-2 gap-[16px]">
            <div className="flex min-w-0 flex-col gap-[8px]">
              <label className="text-slate-700 text-[14px] font-semibold tracking-[-0.084px]">
                Овог
              </label>
              <input
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                placeholder="Дорж"
                className="border border-slate-200 rounded-[8px] px-[12px] py-[8px] bg-white text-slate-700 text-[16px] placeholder:text-slate-400 outline-none focus:border-slate-300 tracking-[-0.16px]"
              />
            </div>
            <div className="flex min-w-0 flex-col gap-[8px]">
              <label className="text-slate-700 text-[14px] font-semibold tracking-[-0.084px]">
                Нэр
              </label>
              <input
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                placeholder="Дуламрагчаа"
                className="border border-slate-200 rounded-[8px] px-[12px] py-[8px] bg-white text-slate-700 text-[16px] placeholder:text-slate-400 outline-none focus:border-slate-300 tracking-[-0.16px]"
              />
            </div>
          </div>

          <div className="flex flex-col gap-[8px]">
            <label className="text-slate-700 text-[14px] font-semibold tracking-[-0.084px]">
              Имэйл
            </label>
            <input
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="dorj@company.com"
              className="border border-slate-200 rounded-[8px] px-[12px] py-[8px] bg-white text-slate-700 text-[16px] placeholder:text-slate-400 outline-none focus:border-slate-300 tracking-[-0.16px]"
            />
          </div>

          <div className="grid min-w-0 grid-cols-2 gap-[16px]">
            <div className="flex min-w-0 flex-col gap-[8px]">
              <label className="text-slate-700 text-[14px] font-semibold tracking-[-0.084px]">
                Регистрийн дугаар
              </label>
              <input
                value={registerNo}
                onChange={(e) => setRegisterNo(e.target.value)}
                placeholder="УХ04272036"
                className="border border-slate-200 rounded-[8px] px-[12px] py-[8px] bg-white text-slate-700 text-[16px] placeholder:text-slate-400 outline-none focus:border-slate-300 tracking-[-0.16px]"
              />
            </div>
            <div className="flex min-w-0 flex-col gap-[8px]">
              <label className="text-slate-700 text-[14px] font-semibold tracking-[-0.084px]">
                Утасны дугаар
              </label>
              <input
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="99999999"
                className="border border-slate-200 rounded-[8px] px-[12px] py-[8px] bg-white text-slate-700 text-[16px] placeholder:text-slate-400 outline-none focus:border-slate-300 tracking-[-0.16px]"
              />
            </div>
          </div>

          <div className="flex flex-col gap-[8px]">
            <label className="text-slate-700 text-[14px] font-semibold tracking-[-0.084px]">
              Салбар
            </label>
            <input
              value={branch}
              onChange={(e) => setBranch(e.target.value)}
              placeholder="Гурван гол"
              className="border border-slate-200 rounded-[8px] px-[12px] py-[8px] bg-white text-slate-700 text-[16px] placeholder:text-slate-400 outline-none focus:border-slate-300 tracking-[-0.16px]"
            />
          </div>

          <div className="grid min-w-0 grid-cols-[140px_minmax(0,1fr)] gap-[16px] items-start">
            <div className="flex min-w-0 flex-col gap-[8px]">
              <label className="text-slate-700 text-[14px] font-semibold tracking-[-0.084px]">
                Хэлтэс
              </label>
              <div className="relative">
                <select
                  value={dept}
                  onChange={(e) => setDept(e.target.value)}
                  className="w-full appearance-none bg-white border border-slate-200 rounded-[8px] px-[16px] py-[8px] text-slate-700 text-[16px] outline-none pr-8 cursor-pointer">
                  {DEPARTMENTS.map((department) => (
                    <option key={department} value={department}>
                      {department}
                    </option>
                  ))}
                </select>
                <div className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2">
                  <svg width="16" height="16" fill="none" viewBox="0 0 16 16">
                    <path
                      d="M4 6l4 4 4-4"
                      stroke="rgba(100,116,139,0.8)"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                    />
                  </svg>
                </div>
              </div>
            </div>
            <div className="flex min-w-0 flex-col gap-[8px]">
              <label className="text-slate-700 text-[14px] font-semibold tracking-[-0.084px]">
                Албан тушаал
              </label>
              <input
                value={jobTitle}
                onChange={(e) => setJobTitle(e.target.value)}
                placeholder="Junior Engineer"
                className="border border-slate-200 rounded-[8px] px-[12px] py-[8px] bg-white text-slate-700 text-[16px] placeholder:text-slate-400 outline-none focus:border-slate-300 tracking-[-0.16px]"
              />
            </div>
          </div>

          <div className="flex flex-col gap-[8px]">
            <label className="text-slate-700 text-[14px] font-semibold tracking-[-0.084px]">
              Хүлээн авагчид
            </label>
            <div className="mb-1 flex min-w-0 flex-wrap gap-[6px]">
              {recipients.map((recipient) => (
                <span
                  key={recipient}
                  className="inline-flex max-w-full items-center gap-[4px] rounded-[10px] border border-slate-200 px-[9px] py-[3px] text-slate-500 text-[12px] leading-[20px] bg-slate-50">
                  {recipient}
                  <button
                    onClick={() => removeRecipient(recipient)}
                    className="text-slate-400 hover:text-slate-700 transition-colors leading-none">
                    <FiX className="h-3 w-3" />
                  </button>
                </span>
              ))}
            </div>
            <input
              value={recipientInput}
              onChange={(e) => setRecipientInput(e.target.value)}
              onKeyDown={addRecipient}
              placeholder="Хүлээн авагч нэмэх..."
              className="border border-slate-200 rounded-[8px] px-[12px] py-[8px] bg-white text-slate-600 text-[14px] placeholder:text-slate-400 outline-none focus:border-slate-300 tracking-[-0.084px]"
            />
          </div>

          <div className="flex flex-col gap-[12px]">
            <label className="text-slate-700 text-[14px] font-semibold tracking-[-0.084px]">
              Хавсаргасан файл
            </label>
            {documents.length > 0 ? (
              documents.map((doc) => (
                <div
                  key={doc.id}
                  className="bg-white flex min-w-0 items-center justify-between gap-[12px] rounded-[12px] px-[6px] py-[8px] border border-slate-200">
                  <div className="flex min-w-0 items-center gap-[16px]">
                    <div className="bg-white border border-slate-200 rounded-[16px] size-[40px] flex items-center justify-center shrink-0">
                      <FiFileText className="h-[18px] w-[18px] text-slate-500" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-slate-900 text-[14px] font-semibold leading-[20px] tracking-[-0.084px]">
                        {doc.template}
                      </p>
                      <p className="text-slate-400 text-[12px] leading-[12px] tracking-[-0.072px]">
                        {doc.template.toLowerCase().replace(/\s+/g, "_")}.pdf
                      </p>
                    </div>
                  </div>
                  <button className="text-slate-400 hover:text-slate-700 transition-colors size-[40px] flex items-center justify-center">
                    <FiEye className="h-5 w-5" />
                  </button>
                </div>
              ))
            ) : (
              <p className="text-slate-400 text-sm">Хавсаргасан файл байхгүй</p>
            )}
          </div>
        </div>

        <div className="flex items-center gap-[20px] justify-end shrink-0">
          <button
            onClick={() => onOpenChange(false)}
            className="border border-slate-200 px-[20px] py-[10px] rounded-[12px] text-slate-500 text-[16px] hover:bg-slate-50 transition-colors cursor-pointer">
            Болих
          </button>
          <button
            onClick={() => onOpenChange(false)}
            className="bg-slate-900 px-[20px] py-[10px] rounded-[12px] text-white text-[16px] hover:bg-slate-800 transition-colors cursor-pointer">
            Илгээх
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
