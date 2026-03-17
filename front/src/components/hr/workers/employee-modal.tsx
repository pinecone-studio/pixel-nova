"use client";

import { useRef, useState } from "react";
import { BiUpload } from "react-icons/bi";

import type { Employee } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

import {
  DEPARTMENTS,
  employeeToForm,
  type EmployeeFormState,
  type ModalMode,
} from "./shared";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const EMPLOYEE_CODE_PATTERN = /^EMP-\d{4}$/;
const GMAIL_PATTERN = /^[^\s@]+@gmail\.com$/i;

export function EmployeeModal({
  mode,
  employee,
  saving,
  onClose,
  onSave,
}: {
  mode: ModalMode;
  employee?: Employee | null;
  saving: boolean;
  onClose: () => void;
  onSave: (value: EmployeeFormState) => Promise<void>;
}) {
  const fileRef = useRef<HTMLInputElement>(null);
  const [file, setFile] = useState<File | null>(null);
  const [dragging, setDragging] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  function normalizeEmployeeCode(value: string) {
    const trimmed = value.trim().toUpperCase().replace(/\s+/g, "");
    if (/^EMP\d{4}$/.test(trimmed)) {
      return `EMP-${trimmed.slice(3)}`;
    }
    return trimmed;
  }

  const [form, setForm] = useState<EmployeeFormState>(() => {
    const initial = employeeToForm(employee);
    return {
      ...initial,
      employeeCode: normalizeEmployeeCode(initial.employeeCode ?? ""),
    };
  });

  function updateField<K extends keyof EmployeeFormState>(
    key: K,
    value: EmployeeFormState[K],
  ) {
    const nextValue =
      key === "employeeCode" && typeof value === "string"
        ? normalizeEmployeeCode(value)
        : value;

    setForm((prev) => ({ ...prev, [key]: nextValue }));
    setErrors((prev) => {
      if (!prev[key as string]) return prev;
      const next = { ...prev };
      delete next[key as string];
      return next;
    });
  }

  function validate() {
    const next: Record<string, string> = {};
    if (!form.employeeCode.trim()) {
      next.employeeCode = "Ажилтны код заавал оруулна уу.";
    } else if (!EMPLOYEE_CODE_PATTERN.test(form.employeeCode.trim())) {
      next.employeeCode = "EMP-0000 форматтай код оруулна уу.";
    }
    if (!form.lastName.trim()) next.lastName = "Овгоо заавал оруулна уу.";
    if (!form.firstName.trim()) next.firstName = "Нэрээ заавал оруулна уу.";
    if (!form.email.trim()) {
      next.email = "Имэйлээ заавал оруулна уу.";
    } else if (mode === "add" && !GMAIL_PATTERN.test(form.email.trim())) {
      next.email = "Зөвхөн @gmail.com төгсгөлтэй имэйл оруулна уу.";
    }
    if (!form.department.trim()) next.department = "Хэлтэс заавал сонгоно уу.";
    if (!form.jobTitle.trim()) next.jobTitle = "Албан тушаал заавал оруулна уу.";
    return next;
  }

  async function handleSubmit() {
    const next = validate();
    setErrors(next);
    if (Object.keys(next).length > 0) return;
    await onSave(form);
  }

  return (
    <Dialog
      open
      onOpenChange={(open) => {
        if (!open) onClose();
      }}
    >
      <DialogContent
        style={{ width: 500, maxWidth: 500 }}
        className="bg-white border border-slate-200 rounded-3xl p-7 flex flex-col gap-4 max-h-[calc(100vh-2rem)] overflow-hidden [&>button]:text-slate-400 [&>button]:hover:text-slate-700 [&>button]:transition-colors"
      >
        <DialogHeader className="shrink-0">
          <DialogTitle className="text-slate-900 text-xl font-bold">
            {mode === "add" ? "Шинэ ажилтан нэмэх" : "Ажилтны мэдээлэл засах"}
          </DialogTitle>
        </DialogHeader>

        <div className="flex flex-col gap-1.5 shrink-0">
          <Label className="text-slate-700 text-sm font-medium">Ажилтны код</Label>
          <Input
            value={form.employeeCode}
            onChange={(e) => updateField("employeeCode", e.target.value)}
            placeholder="EMP-0001"
            className="bg-white border-slate-200 rounded-2xl px-4 py-3 h-auto text-slate-700 text-sm placeholder:text-slate-400 focus-visible:ring-0 focus-visible:border-slate-300 transition-colors"
          />
          {errors.employeeCode ? (
            <p className="text-xs text-red-400">{errors.employeeCode}</p>
          ) : null}
        </div>

        <div className="grid grid-cols-2 gap-4 shrink-0">
          <div className="flex flex-col gap-1.5">
            <Label className="text-slate-700 text-sm font-medium">Овог</Label>
            <Input
              value={form.lastName}
              onChange={(e) => updateField("lastName", e.target.value)}
              placeholder="Дорж"
              className="bg-white border-slate-200 rounded-2xl px-4 py-3 h-auto text-slate-700 text-sm placeholder:text-slate-400 focus-visible:ring-0 focus-visible:border-slate-300 transition-colors"
            />
            {errors.lastName ? (
              <p className="text-xs text-red-400">{errors.lastName}</p>
            ) : null}
          </div>
          <div className="flex flex-col gap-1.5">
            <Label className="text-slate-700 text-sm font-medium">Нэр</Label>
            <Input
              value={form.firstName}
              onChange={(e) => updateField("firstName", e.target.value)}
              placeholder="Дуламрагчаа"
              className="bg-white border-slate-200 rounded-2xl px-4 py-3 h-auto text-slate-700 text-sm placeholder:text-slate-400 focus-visible:ring-0 focus-visible:border-slate-300 transition-colors"
            />
            {errors.firstName ? (
              <p className="text-xs text-red-400">{errors.firstName}</p>
            ) : null}
          </div>
        </div>

        <div className="flex flex-col gap-1.5 shrink-0">
          <Label className="text-slate-700 text-sm font-medium">Имэйл</Label>
          <Input
            value={form.email}
            onChange={(e) => updateField("email", e.target.value)}
            placeholder="Dorj@company.com"
            className="bg-white border-slate-200 rounded-2xl px-4 py-3 h-auto text-slate-700 text-sm placeholder:text-slate-400 focus-visible:ring-0 focus-visible:border-slate-300 transition-colors"
          />
          {errors.email ? (
            <p className="text-xs text-red-400">{errors.email}</p>
          ) : null}
        </div>

        <div className="grid grid-cols-2 gap-4 shrink-0">
          <div className="flex flex-col gap-1.5">
            <Label className="text-slate-700 text-sm font-medium">Хэлтэс</Label>
            <Select
              value={form.department}
              onValueChange={(value: string) => updateField("department", value)}
              // className="h-11.5 rounded-2xl border border-slate-700/60 bg-transparent px-4 py-3 text-sm text-slate-300 outline-none transition-colors focus:border-slate-500"
            >
              <SelectTrigger className="bg-white cursor-pointer border-slate-200 rounded-2xl px-4 py-3 h-auto text-slate-600 text-sm focus:ring-0 focus:border-slate-300 [&>svg]:text-slate-400">
                <SelectValue placeholder="Хэлтэс сонгох" />
              </SelectTrigger>
              <SelectContent className="bg-white border-slate-200 rounded-xl">
                {DEPARTMENTS.map((department) => (
                  <SelectItem
                    key={department}
                    value={department}
                    className="text-slate-700 focus:bg-slate-100 focus:text-slate-900 cursor-pointer rounded-lg"
                  >
                    {department}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.department ? (
              <p className="text-xs text-red-400">{errors.department}</p>
            ) : null}
          </div>
          <div className="flex flex-col gap-1.5">
            <Label className="text-slate-700 text-sm font-medium">Албан тушаал</Label>
            <Input
              value={form.jobTitle}
              onChange={(e) => updateField("jobTitle", e.target.value)}
              placeholder="Junior Engineer"
              className="bg-white border-slate-200 rounded-2xl px-4 py-3 h-auto text-slate-700 text-sm placeholder:text-slate-400 focus-visible:ring-0 focus-visible:border-slate-300 transition-colors"
            />
            {errors.jobTitle ? (
              <p className="text-xs text-red-400">{errors.jobTitle}</p>
            ) : null}
          </div>
        </div>

        <div className="flex flex-col gap-1.5 flex-1 min-h-0">
          <Label className="text-slate-700 text-sm font-medium shrink-0">
            Файл хавсаргах
          </Label>
          <input
            ref={fileRef}
            type="file"
            className="hidden"
            accept=".jpg,.jpeg,.png,.pdf,.mp4"
            onChange={(e) => setFile(e.target.files?.[0] ?? null)}
          />
          <div
            onDragOver={(e) => {
              e.preventDefault();
              setDragging(true);
            }}
            onDragLeave={() => setDragging(false)}
            onDrop={(e) => {
              e.preventDefault();
              setDragging(false);
              const nextFile = e.dataTransfer.files?.[0];
              if (nextFile) setFile(nextFile);
            }}
            onClick={() => fileRef.current?.click()}
            className={`flex-1 rounded-2xl border-2 border-dashed flex flex-col items-center justify-center gap-2 cursor-pointer transition-colors ${
              dragging
                ? "border-emerald-400/60 bg-emerald-50"
                : "border-slate-200 hover:border-slate-300"
            }`}
          >
            <BiUpload className="h-6 w-6 text-slate-400" />
            {file ? (
              <p className="text-emerald-600 text-sm font-semibold px-4 text-center">
                {file.name}
              </p>
            ) : (
              <>
                <p className="text-slate-900 text-sm font-semibold">
                  Файл хавсаргах (Заавал биш)
                </p>
                <p className="text-slate-400 text-xs">
                  JPEG, PNG, PDG, and MP4 formats, up to 50MB
                </p>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    fileRef.current?.click();
                  }}
                  className="mt-1 cursor-pointer rounded-xl border-slate-200 bg-white text-slate-600 hover:bg-slate-50 hover:text-slate-900 hover:border-slate-300"
                >
                  Оруулах
                </Button>
              </>
            )}
          </div>
        </div>

        <div className="flex items-center justify-end gap-3">
          <Button
            onClick={onClose}
            className="px-6 py-2.5 h-auto rounded-2xl border-slate-200 bg-white cursor-pointer text-slate-600 hover:bg-slate-50 hover:text-slate-900 hover:border-slate-300"
          >
            Татгалзах
          </Button>
          <Button
            onClick={() => void handleSubmit()}
            disabled={saving}
            className="flex items-center gap-2 px-6 py-2.5 cursor-pointer h-auto rounded-2xl bg-slate-900 hover:bg-slate-800 disabled:opacity-60 text-white font-semibold shadow-lg"
          >
            <svg width="14" height="14" fill="none" viewBox="0 0 24 24">
              <path
                d="M12 5v14M5 12h14"
                stroke="currentColor"
                strokeWidth="2.4"
                strokeLinecap="round"
              />
            </svg>
            {saving ? "Хадгалж байна..." : mode === "add" ? "Нэмэх" : "Хадгалах"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
