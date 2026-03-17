"use client";

import { useRef, useState } from "react";
import { Upload } from "lucide-react";

import type { Employee } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import {
  DEPARTMENTS,
  employeeToForm,
  type EmployeeFormState,
  type ModalMode,
} from "./shared";

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
  const [form, setForm] = useState<EmployeeFormState>(() =>
    employeeToForm(employee),
  );
  const [errors, setErrors] = useState<Record<string, string>>({});

  function updateField<K extends keyof EmployeeFormState>(
    key: K,
    value: EmployeeFormState[K],
  ) {
    setForm((prev) => ({ ...prev, [key]: value }));
    setErrors((prev) => {
      if (!prev[key as string]) return prev;
      const next = { ...prev };
      delete next[key as string];
      return next;
    });
  }

  function validate() {
    const next: Record<string, string> = {};
    if (!form.lastName.trim()) next.lastName = "Овгоо заавал оруулна уу.";
    if (!form.firstName.trim()) next.firstName = "Нэрээ заавал оруулна уу.";
    if (!form.email.trim()) next.email = "Имэйлээ заавал оруулна уу.";
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
        className="bg-[#0d1117] border border-slate-700/50 rounded-3xl p-7 flex flex-col gap-4 max-h-[calc(100vh-2rem)] overflow-hidden [&>button]:text-slate-400 [&>button]:hover:text-white [&>button]:transition-colors"
      >
        <DialogHeader className="shrink-0">
          <DialogTitle className="text-white text-xl font-bold">
            {mode === "add" ? "Шинэ ажилтан нэмэх" : "Ажилтны мэдээлэл засах"}
          </DialogTitle>
        </DialogHeader>

        <div className="grid grid-cols-2 gap-4 shrink-0">
          <div className="flex flex-col gap-1.5">
            <Label className="text-white text-sm font-medium">Овог</Label>
            <Input
              value={form.lastName}
              onChange={(e) => updateField("lastName", e.target.value)}
              placeholder="Дорж"
              className="bg-transparent border-slate-700/60 rounded-2xl px-4 py-3 h-auto text-slate-300 text-sm placeholder:text-slate-600 focus-visible:ring-0 focus-visible:border-slate-500 transition-colors"
            />
            {errors.lastName ? (
              <p className="text-xs text-red-400">{errors.lastName}</p>
            ) : null}
          </div>
          <div className="flex flex-col gap-1.5">
            <Label className="text-white text-sm font-medium">Нэр</Label>
            <Input
              value={form.firstName}
              onChange={(e) => updateField("firstName", e.target.value)}
              placeholder="Дуламрагчаа"
              className="bg-transparent border-slate-700/60 rounded-2xl px-4 py-3 h-auto text-slate-300 text-sm placeholder:text-slate-600 focus-visible:ring-0 focus-visible:border-slate-500 transition-colors"
            />
            {errors.firstName ? (
              <p className="text-xs text-red-400">{errors.firstName}</p>
            ) : null}
          </div>
        </div>

        <div className="flex flex-col gap-1.5 shrink-0">
          <Label className="text-white text-sm font-medium">Имэйл</Label>
          <Input
            value={form.email}
            onChange={(e) => updateField("email", e.target.value)}
            placeholder="Dorj@company.com"
            className="bg-transparent border-slate-700/60 rounded-2xl px-4 py-3 h-auto text-slate-300 text-sm placeholder:text-slate-600 focus-visible:ring-0 focus-visible:border-slate-500 transition-colors"
          />
          {errors.email ? (
            <p className="text-xs text-red-400">{errors.email}</p>
          ) : null}
        </div>

        <div className="grid grid-cols-2 gap-4 shrink-0">
          <div className="flex flex-col gap-1.5">
            <Label className="text-white text-sm font-medium">Хэлтэс</Label>
            <Select
              value={form.department}
              onValueChange={(value) => updateField("department", value)}
            >
              <SelectTrigger className="bg-transparent cursor-pointer border-slate-700/60 rounded-2xl px-4 py-3 h-auto text-slate-300 text-sm focus:ring-0 focus:border-slate-500 [&>svg]:text-slate-400">
                <SelectValue placeholder="Хэлтэс сонгох" />
              </SelectTrigger>
              <SelectContent className="bg-[#0d1117] border-slate-700/60 rounded-xl">
                {DEPARTMENTS.map((department) => (
                  <SelectItem
                    key={department}
                    value={department}
                    className="text-slate-300 focus:bg-slate-800 focus:text-white cursor-pointer rounded-lg"
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
            <Label className="text-white text-sm font-medium">Албан тушаал</Label>
            <Input
              value={form.jobTitle}
              onChange={(e) => updateField("jobTitle", e.target.value)}
              placeholder="Junior Engineer"
              className="bg-transparent border-slate-700/60 rounded-2xl px-4 py-3 h-auto text-slate-300 text-sm placeholder:text-slate-600 focus-visible:ring-0 focus-visible:border-slate-500 transition-colors"
            />
            {errors.jobTitle ? (
              <p className="text-xs text-red-400">{errors.jobTitle}</p>
            ) : null}
          </div>
        </div>

        <div className="flex flex-col gap-1.5 flex-1 min-h-0">
          <Label className="text-white text-sm font-medium shrink-0">
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
                ? "border-emerald-500/60 bg-emerald-500/5"
                : "border-slate-700/50 hover:border-slate-600/60"
            }`}
          >
            <Upload />
            {file ? (
              <p className="text-emerald-400 text-sm font-semibold px-4 text-center">
                {file.name}
              </p>
            ) : (
              <>
                <p className="text-white text-sm font-semibold">
                  Файл хавсаргах (Заавал биш)
                </p>
                <p className="text-muted-foreground text-xs">
                  JPEG, PNG, PDG, and MP4 formats, up to 50MB
                </p>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    fileRef.current?.click();
                  }}
                  className="mt-1 cursor-pointer rounded-xl border-slate-600/60 bg-transparent text-slate-300 hover:bg-slate-800/50 hover:text-white hover:border-slate-500"
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
            className="px-6 py-2.5 h-auto rounded-2xl border-slate-600/50 bg-transparent cursor-pointer text-slate-300 hover:bg-slate-800/40 hover:text-white hover:border-slate-500"
          >
            Татгалзах
          </Button>
          <Button
            onClick={() => void handleSubmit()}
            disabled={saving}
            className="flex items-center gap-2 px-6 py-2.5 cursor-pointer h-auto rounded-2xl bg-emerald-500 hover:bg-emerald-400 disabled:opacity-60 text-black font-bold shadow-lg shadow-emerald-500/20"
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
