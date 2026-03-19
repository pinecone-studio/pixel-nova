"use client";

import { useEffect, useRef, useState, type PointerEvent as ReactPointerEvent } from "react";
import { useMutation, useQuery } from "@apollo/client/react";
import { BiUpload } from "react-icons/bi";

import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { SAVE_EMPLOYER_SIGNATURE } from "@/graphql/mutations/contract-requests";
import { GET_EMPLOYER_SIGNATURE_STATUS } from "@/graphql/queries/contract-requests";
import { buildGraphQLHeaders } from "@/lib/apollo-client";
import type { Employee } from "@/lib/types";

import {
  BRANCHES,
  DEPARTMENTS,
  LEVELS,
  STATUSES,
  employeeToForm,
  type EmployeeFormState,
  type ModalMode,
} from "./shared";

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
  const signatureCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const signatureDrawingRef = useRef(false);
  const [file, setFile] = useState<File | null>(null);
  const [dragging, setDragging] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [signatureData, setSignatureData] = useState("");
  const [signaturePasscode, setSignaturePasscode] = useState("");
  const [signatureMessage, setSignatureMessage] = useState<string | null>(null);
  const [signatureError, setSignatureError] = useState<string | null>(null);

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

  const { data: signatureStatusData, loading: signatureStatusLoading, refetch: refetchSignatureStatus } =
    useQuery<{
      employerSignatureStatus: {
        hasSignature: boolean;
        hasPasscode: boolean;
        updatedAt?: string | null;
      };
    }>(GET_EMPLOYER_SIGNATURE_STATUS, {
      context: {
        headers: buildGraphQLHeaders({ actorRole: "hr" }),
      },
      fetchPolicy: "network-only",
      skip: mode !== "add",
    });

  const [saveEmployerSignature, { loading: signatureSaving }] = useMutation(
    SAVE_EMPLOYER_SIGNATURE,
    {
      context: {
        headers: buildGraphQLHeaders({ actorRole: "hr" }),
      },
    },
  );

  const hasSavedEmployerSignature =
    signatureStatusData?.employerSignatureStatus?.hasSignature ?? false;

  useEffect(() => {
    if (mode !== "add" || hasSavedEmployerSignature) {
      return;
    }

    const canvas = signatureCanvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    if (!rect.width || !rect.height) return;

    const ratio = window.devicePixelRatio || 1;
    canvas.width = rect.width * ratio;
    canvas.height = rect.height * ratio;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.scale(ratio, ratio);
    ctx.lineWidth = 2;
    ctx.lineCap = "round";
    ctx.strokeStyle = "#0F172A";
  }, [mode, hasSavedEmployerSignature]);

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
    if (!form.lastName.trim()) next.lastName = "Овог заавал оруулна уу.";
    if (!form.firstName.trim()) next.firstName = "Нэрээ заавал оруулна уу.";
    if (!form.email.trim()) {
      next.email = "И-мэйлээ заавал оруулна уу.";
    } else if (mode === "add" && !GMAIL_PATTERN.test(form.email.trim())) {
      next.email = "Зөвхөн @gmail.com төгсгөлтэй и-мэйл оруулна уу.";
    }
    if (!form.department.trim()) next.department = "Хэлтэс заавал сонгоно уу.";
    if (!form.jobTitle.trim()) next.jobTitle = "Албан тушаал заавал оруулна уу.";
    return next;
  }

  async function handleSubmit() {
    const next = validate();
    if (mode === "add" && !signatureStatusLoading && !hasSavedEmployerSignature) {
      next.signature = "Эхлээд ажил олгогчийн гарын үсгээ хадгална уу.";
    }
    setErrors(next);
    if (Object.keys(next).length > 0) return;
    await onSave(form);
  }

  function getCanvasPoint(event: ReactPointerEvent<HTMLCanvasElement>) {
    const canvas = signatureCanvasRef.current!;
    const rect = canvas.getBoundingClientRect();
    return { x: event.clientX - rect.left, y: event.clientY - rect.top };
  }

  function handleSignaturePointerDown(event: ReactPointerEvent<HTMLCanvasElement>) {
    const canvas = signatureCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    signatureDrawingRef.current = true;
    const { x, y } = getCanvasPoint(event);
    ctx.beginPath();
    ctx.moveTo(x, y);
  }

  function handleSignaturePointerMove(event: ReactPointerEvent<HTMLCanvasElement>) {
    if (!signatureDrawingRef.current) return;
    const canvas = signatureCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const { x, y } = getCanvasPoint(event);
    ctx.lineTo(x, y);
    ctx.stroke();
  }

  function handleSignaturePointerUp() {
    if (!signatureDrawingRef.current) return;
    signatureDrawingRef.current = false;
    const canvas = signatureCanvasRef.current;
    if (!canvas) return;
    setSignatureData(canvas.toDataURL("image/png"));
    setSignatureError(null);
    setSignatureMessage(null);
    setErrors((prev) => {
      if (!prev.signature) return prev;
      const next = { ...prev };
      delete next.signature;
      return next;
    });
  }

  function clearSignature() {
    const canvas = signatureCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    setSignatureData("");
    setSignatureError(null);
    setSignatureMessage(null);
  }

  async function handleSaveSignature() {
    setSignatureError(null);
    setSignatureMessage(null);

    if (!signatureData) {
      setSignatureError("Гарын үсгээ зурна уу.");
      return;
    }

    if (signaturePasscode && !/^[0-9]{4}$/.test(signaturePasscode)) {
      setSignatureError("4 оронтой код оруулна уу.");
      return;
    }

    try {
      await saveEmployerSignature({
        variables: {
          signatureData,
          passcode: signaturePasscode || null,
        },
      });
      await refetchSignatureStatus();
      setSignatureMessage("Ажил олгогчийн гарын үсэг амжилттай хадгалагдлаа.");
      setSignaturePasscode("");
      setErrors((prev) => {
        if (!prev.signature) return prev;
        const next = { ...prev };
        delete next.signature;
        return next;
      });
    } catch (error) {
      setSignatureError(
        error instanceof Error
          ? error.message
          : "Гарын үсэг хадгалах үед алдаа гарлаа.",
      );
    }
  }

  return (
    <Dialog
      open
      onOpenChange={(open) => {
        if (!open) onClose();
      }}
    >
      <DialogContent
        style={{ width: 560, maxWidth: 560 }}
        className="flex max-h-[calc(100vh-2rem)] flex-col overflow-hidden rounded-3xl border border-slate-200 bg-white p-7 [&>button]:text-slate-400 [&>button]:transition-colors [&>button]:hover:text-slate-700"
      >
        <DialogHeader className="shrink-0 pb-4">
          <DialogTitle className="text-xl font-bold text-slate-900">
            {mode === "add" ? "Шинэ ажилтан нэмэх" : "Ажилтны мэдээлэл засах"}
          </DialogTitle>
        </DialogHeader>

        <div className="flex min-h-0 flex-1 flex-col gap-4 overflow-y-auto pr-1">
          {mode === "add" && !signatureStatusLoading && !hasSavedEmployerSignature ? (
            <div className="flex flex-col gap-4 rounded-3xl border border-amber-200 bg-amber-50/70 p-5">
              <div className="flex flex-col gap-1">
                <p className="text-sm font-semibold text-amber-950">
                  Эхний удаа ажилтан нэмэхийн өмнө ажил олгогчийн гарын үсгээ хадгална уу
                </p>
                <p className="text-xs text-amber-900/80">
                  Энэ гарын үсгийг onboarding баримтууд дээр автоматаар ашиглана.
                </p>
              </div>

              <div className="rounded-2xl border border-amber-200 bg-white p-3">
                <canvas
                  ref={signatureCanvasRef}
                  className="h-36 w-full cursor-crosshair rounded-xl bg-slate-50"
                  onPointerDown={handleSignaturePointerDown}
                  onPointerMove={handleSignaturePointerMove}
                  onPointerUp={handleSignaturePointerUp}
                  onPointerLeave={handleSignaturePointerUp}
                />
              </div>

              <div className="flex items-center justify-between gap-3">
                <p className="text-xs text-slate-500">Цагаан хэсэг дээр гарын үсгээ зурна уу.</p>
                <Button
                  type="button"
                  variant="outline"
                  onClick={clearSignature}
                  className="rounded-xl border-slate-200 bg-white text-slate-600 hover:border-slate-300 hover:bg-slate-50 hover:text-slate-900"
                >
                  Цэвэрлэх
                </Button>
              </div>

              <div className="flex flex-col gap-1.5">
                <Label className="text-sm font-medium text-slate-700">
                  4 оронтой код (заавал биш)
                </Label>
                <Input
                  value={signaturePasscode}
                  onChange={(e) =>
                    setSignaturePasscode(e.target.value.replace(/\D/g, "").slice(0, 4))
                  }
                  placeholder="1234"
                  inputMode="numeric"
                  maxLength={4}
                  className="h-auto rounded-2xl border-slate-200 bg-white px-4 py-3 text-sm text-slate-700 placeholder:text-slate-400 transition-colors focus-visible:border-slate-300 focus-visible:ring-0"
                />
              </div>

              {signatureMessage ? (
                <p className="text-xs text-emerald-600">{signatureMessage}</p>
              ) : null}
              {signatureError ? <p className="text-xs text-red-500">{signatureError}</p> : null}
              {errors.signature ? <p className="text-xs text-red-500">{errors.signature}</p> : null}

              <Button
                type="button"
                onClick={() => void handleSaveSignature()}
                disabled={signatureSaving || !signatureData}
                className="self-start rounded-2xl bg-slate-900 px-5 py-2.5 text-white hover:bg-slate-800 disabled:opacity-60"
              >
                {signatureSaving ? "Хадгалж байна..." : "Гарын үсэг хадгалах"}
              </Button>
            </div>
          ) : null}

          <div className="flex flex-col gap-1.5">
            <Label className="text-sm font-medium text-slate-700">Ажилтны код</Label>
            {mode === "add" ? (
              <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-400">
                Автоматаар үүснэ
              </div>
            ) : (
              <Input
                value={form.employeeCode}
                readOnly
                className="h-auto cursor-not-allowed rounded-2xl border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700 focus-visible:ring-0"
              />
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5">
              <Label className="text-sm font-medium text-slate-700">Овог</Label>
              <Input
                value={form.lastName}
                onChange={(e) => updateField("lastName", e.target.value)}
                placeholder="Дорж"
                className="h-auto rounded-2xl border-slate-200 bg-white px-4 py-3 text-sm text-slate-700 placeholder:text-slate-400 transition-colors focus-visible:border-slate-300 focus-visible:ring-0"
              />
              {errors.lastName ? <p className="text-xs text-red-400">{errors.lastName}</p> : null}
            </div>
            <div className="flex flex-col gap-1.5">
              <Label className="text-sm font-medium text-slate-700">Нэр</Label>
              <Input
                value={form.firstName}
                onChange={(e) => updateField("firstName", e.target.value)}
                placeholder="Дуламрагчаа"
                className="h-auto rounded-2xl border-slate-200 bg-white px-4 py-3 text-sm text-slate-700 placeholder:text-slate-400 transition-colors focus-visible:border-slate-300 focus-visible:ring-0"
              />
              {errors.firstName ? <p className="text-xs text-red-400">{errors.firstName}</p> : null}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5">
              <Label className="text-sm font-medium text-slate-700">Овог (англи)</Label>
              <Input
                value={form.lastNameEng}
                onChange={(e) => updateField("lastNameEng", e.target.value)}
                placeholder="Dorj"
                className="h-auto rounded-2xl border-slate-200 bg-white px-4 py-3 text-sm text-slate-700 placeholder:text-slate-400 transition-colors focus-visible:border-slate-300 focus-visible:ring-0"
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label className="text-sm font-medium text-slate-700">Нэр (англи)</Label>
              <Input
                value={form.firstNameEng}
                onChange={(e) => updateField("firstNameEng", e.target.value)}
                placeholder="Dulamragchaa"
                className="h-auto rounded-2xl border-slate-200 bg-white px-4 py-3 text-sm text-slate-700 placeholder:text-slate-400 transition-colors focus-visible:border-slate-300 focus-visible:ring-0"
              />
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <Label className="text-sm font-medium text-slate-700">И-мэйл</Label>
            <Input
              value={form.email}
              onChange={(e) => updateField("email", e.target.value)}
              placeholder="dorj@gmail.com"
              className="h-auto rounded-2xl border-slate-200 bg-white px-4 py-3 text-sm text-slate-700 placeholder:text-slate-400 transition-colors focus-visible:border-slate-300 focus-visible:ring-0"
            />
            {errors.email ? <p className="text-xs text-red-400">{errors.email}</p> : null}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5">
              <Label className="text-sm font-medium text-slate-700">Хэлтэс</Label>
              <Select value={form.department} onValueChange={(value) => updateField("department", value)}>
                <SelectTrigger className="h-auto rounded-2xl border-slate-200 bg-white px-4 py-3 text-sm text-slate-600 focus:border-slate-300 focus:ring-0 [&>svg]:text-slate-400">
                  <SelectValue placeholder="Хэлтэс сонгох" />
                </SelectTrigger>
                <SelectContent className="rounded-xl border-slate-200 bg-white">
                  {DEPARTMENTS.map((department) => (
                    <SelectItem
                      key={department}
                      value={department}
                      className="cursor-pointer rounded-lg text-slate-700 focus:bg-slate-100 focus:text-slate-900"
                    >
                      {department}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.department ? <p className="text-xs text-red-400">{errors.department}</p> : null}
            </div>
            <div className="flex flex-col gap-1.5">
              <Label className="text-sm font-medium text-slate-700">Албан тушаал</Label>
              <Input
                value={form.jobTitle}
                onChange={(e) => updateField("jobTitle", e.target.value)}
                placeholder="Junior Engineer"
                className="h-auto rounded-2xl border-slate-200 bg-white px-4 py-3 text-sm text-slate-700 placeholder:text-slate-400 transition-colors focus-visible:border-slate-300 focus-visible:ring-0"
              />
              {errors.jobTitle ? <p className="text-xs text-red-400">{errors.jobTitle}</p> : null}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5">
              <Label className="text-sm font-medium text-slate-700">Салбар</Label>
              <Select value={form.branch} onValueChange={(value) => updateField("branch", value)}>
                <SelectTrigger className="h-auto rounded-2xl border-slate-200 bg-white px-4 py-3 text-sm text-slate-600 focus:border-slate-300 focus:ring-0 [&>svg]:text-slate-400">
                  <SelectValue placeholder="Салбар сонгох" />
                </SelectTrigger>
                <SelectContent className="rounded-xl border-slate-200 bg-white">
                  {BRANCHES.map((branch) => (
                    <SelectItem
                      key={branch}
                      value={branch}
                      className="cursor-pointer rounded-lg text-slate-700 focus:bg-slate-100 focus:text-slate-900"
                    >
                      {branch}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex flex-col gap-1.5">
              <Label className="text-sm font-medium text-slate-700">Түвшин</Label>
              <Select value={form.level} onValueChange={(value) => updateField("level", value)}>
                <SelectTrigger className="h-auto rounded-2xl border-slate-200 bg-white px-4 py-3 text-sm text-slate-600 focus:border-slate-300 focus:ring-0 [&>svg]:text-slate-400">
                  <SelectValue placeholder="Түвшин сонгох" />
                </SelectTrigger>
                <SelectContent className="rounded-xl border-slate-200 bg-white">
                  {LEVELS.map((level) => (
                    <SelectItem
                      key={level}
                      value={level}
                      className="cursor-pointer rounded-lg text-slate-700 focus:bg-slate-100 focus:text-slate-900"
                    >
                      {level}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5">
              <Label className="text-sm font-medium text-slate-700">Төлөв</Label>
              <Select value={form.status} onValueChange={(value) => updateField("status", value)}>
                <SelectTrigger className="h-auto rounded-2xl border-slate-200 bg-white px-4 py-3 text-sm text-slate-600 focus:border-slate-300 focus:ring-0 [&>svg]:text-slate-400">
                  <SelectValue placeholder="Төлөв сонгох" />
                </SelectTrigger>
                <SelectContent className="rounded-xl border-slate-200 bg-white">
                  {STATUSES.map((status) => (
                    <SelectItem
                      key={status}
                      value={status}
                      className="cursor-pointer rounded-lg text-slate-700 focus:bg-slate-100 focus:text-slate-900"
                    >
                      {status}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex flex-col gap-1.5">
              <Label className="text-sm font-medium text-slate-700">Орсон огноо</Label>
              <Input
                type="date"
                value={form.hireDate}
                onChange={(e) => updateField("hireDate", e.target.value)}
                className="h-auto rounded-2xl border-slate-200 bg-white px-4 py-3 text-sm text-slate-700 transition-colors focus-visible:border-slate-300 focus-visible:ring-0"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5">
              <Label className="text-sm font-medium text-slate-700">Гарсан огноо</Label>
              <Input
                type="date"
                value={form.terminationDate}
                onChange={(e) => updateField("terminationDate", e.target.value)}
                className="h-auto rounded-2xl border-slate-200 bg-white px-4 py-3 text-sm text-slate-700 transition-colors focus-visible:border-slate-300 focus-visible:ring-0"
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label className="text-sm font-medium text-slate-700">Төрсөн өдөр (сар-өдөр)</Label>
              <Input
                value={form.birthDayAndMonth}
                onChange={(e) => updateField("birthDayAndMonth", e.target.value)}
                placeholder="03-15"
                className="h-auto rounded-2xl border-slate-200 bg-white px-4 py-3 text-sm text-slate-700 placeholder:text-slate-400 transition-colors focus-visible:border-slate-300 focus-visible:ring-0"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5">
              <Label className="text-sm font-medium text-slate-700">Entra ID</Label>
              <Input
                value={form.entraId}
                onChange={(e) => updateField("entraId", e.target.value)}
                placeholder="Azure AD ID"
                className="h-auto rounded-2xl border-slate-200 bg-white px-4 py-3 text-sm text-slate-700 placeholder:text-slate-400 transition-colors focus-visible:border-slate-300 focus-visible:ring-0"
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label className="text-sm font-medium text-slate-700">GitHub</Label>
              <Input
                value={form.github}
                onChange={(e) => updateField("github", e.target.value)}
                placeholder="username"
                className="h-auto rounded-2xl border-slate-200 bg-white px-4 py-3 text-sm text-slate-700 placeholder:text-slate-400 transition-colors focus-visible:border-slate-300 focus-visible:ring-0"
              />
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <Label className="text-sm font-medium text-slate-700">Файл хавсаргах</Label>
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
              className={`flex min-h-[120px] cursor-pointer flex-col items-center justify-center gap-2 rounded-2xl border-2 border-dashed transition-colors ${
                dragging
                  ? "border-emerald-400/60 bg-emerald-50"
                  : "border-slate-200 hover:border-slate-300"
              }`}
            >
              <BiUpload className="h-6 w-6 text-slate-400" />
              {file ? (
                <p className="px-4 text-center text-sm font-semibold text-emerald-600">
                  {file.name}
                </p>
              ) : (
                <>
                  <p className="text-sm font-semibold text-slate-900">Файл хавсаргах (заавал биш)</p>
                  <p className="text-xs text-slate-400">JPEG, PNG, PDF, MP4 - 50MB хүртэл</p>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      fileRef.current?.click();
                    }}
                    className="mt-1 cursor-pointer rounded-xl border-slate-200 bg-white text-slate-600 hover:border-slate-300 hover:bg-slate-50 hover:text-slate-900"
                  >
                    Оруулах
                  </Button>
                </>
              )}
            </div>
          </div>
        </div>

        <div className="flex shrink-0 items-center justify-end gap-3 pt-4">
          <Button
            onClick={onClose}
            className="h-auto cursor-pointer rounded-2xl border-slate-200 bg-white px-6 py-2.5 text-slate-600 hover:border-slate-300 hover:bg-slate-50 hover:text-slate-900"
          >
            Цуцлах
          </Button>
          <Button
            onClick={() => void handleSubmit()}
            disabled={saving}
            className="flex h-auto cursor-pointer items-center gap-2 rounded-2xl bg-slate-900 px-6 py-2.5 font-semibold text-white shadow-lg hover:bg-slate-800 disabled:opacity-60"
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
