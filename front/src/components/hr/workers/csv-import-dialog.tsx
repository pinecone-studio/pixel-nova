"use client";

import { useRef, useState, useCallback } from "react";
import { BiUpload } from "react-icons/bi";
import { FiDownload, FiAlertCircle } from "react-icons/fi";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

export interface CsvEmployeeRow {
  employeeCode: string;
  firstName: string;
  lastName: string;
  email: string;
  department: string;
  branch: string;
  jobTitle: string;
  level: string;
  hireDate: string;
  status: string;
}

interface CsvImportDialogProps {
  open: boolean;
  onClose: () => void;
  onImport: (employees: CsvEmployeeRow[]) => Promise<void>;
  importing: boolean;
}

const HEADER_MAP: Record<string, keyof CsvEmployeeRow> = {
  employeecode: "employeeCode",
  "ажилтны код": "employeeCode",
  firstname: "firstName",
  нэр: "firstName",
  lastname: "lastName",
  овог: "lastName",
  email: "email",
  имэйл: "email",
  department: "department",
  хэлтэс: "department",
  branch: "branch",
  салбар: "branch",
  jobtitle: "jobTitle",
  "албан тушаал": "jobTitle",
  level: "level",
  түвшин: "level",
  hiredate: "hireDate",
  "орсон огноо": "hireDate",
  status: "status",
  төлөв: "status",
};

const EMPLOYEE_CODE_PATTERN = /^EMP-\d{4}$/;

const SAMPLE_CSV = `employeeCode,firstName,lastName,email,department,branch,jobTitle,level,hireDate,status
EMP-0001,Бат,Дорж,bat@gmail.com,Engineering,Ulaanbaatar,Developer,Junior,2024-01-15,Ирсэн
EMP-0002,Сараа,Болд,saraa@gmail.com,HR,Ulaanbaatar,Recruiter,Mid,2024-02-01,Ирсэн`;

function parseCsvLine(line: string): string[] {
  const fields: string[] = [];
  let current = "";
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const ch = line[i];
    if (inQuotes) {
      if (ch === '"') {
        if (i + 1 < line.length && line[i + 1] === '"') {
          current += '"';
          i++;
        } else {
          inQuotes = false;
        }
      } else {
        current += ch;
      }
    } else {
      if (ch === '"') {
        inQuotes = true;
      } else if (ch === ",") {
        fields.push(current.trim());
        current = "";
      } else {
        current += ch;
      }
    }
  }
  fields.push(current.trim());
  return fields;
}

function parseCsv(text: string): CsvEmployeeRow[] {
  const lines = text
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter(Boolean);
  if (lines.length < 2) return [];

  const headerFields = parseCsvLine(lines[0]);
  const columnKeys = headerFields.map(
    (h) => HEADER_MAP[h.toLowerCase().trim()] ?? null,
  );

  const rows: CsvEmployeeRow[] = [];

  for (let i = 1; i < lines.length; i++) {
    const values = parseCsvLine(lines[i]);
    const row: Record<string, string> = {
      employeeCode: "",
      firstName: "",
      lastName: "",
      email: "",
      department: "",
      branch: "",
      jobTitle: "",
      level: "",
      hireDate: "",
      status: "",
    };

    for (let j = 0; j < columnKeys.length; j++) {
      const key = columnKeys[j];
      if (key) {
        row[key] = values[j] ?? "";
      }
    }

    rows.push(row as unknown as CsvEmployeeRow);
  }

  return rows;
}

function validateRow(row: CsvEmployeeRow): string[] {
  const errors: string[] = [];
  if (!row.employeeCode.trim()) errors.push("Ажилтны код хоосон");
  else if (!EMPLOYEE_CODE_PATTERN.test(row.employeeCode.trim()))
    errors.push("EMP-XXXX формат биш");
  if (!row.firstName.trim()) errors.push("Нэр хоосон");
  if (!row.lastName.trim()) errors.push("Овог хоосон");
  return errors;
}

function downloadSampleCsv() {
  const blob = new Blob([SAMPLE_CSV], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "ажилтан_загвар.csv";
  a.click();
  URL.revokeObjectURL(url);
}

export function CsvImportDialog({
  open,
  onClose,
  onImport,
  importing,
}: CsvImportDialogProps) {
  const fileRef = useRef<HTMLInputElement>(null);
  const [dragging, setDragging] = useState(false);
  const [fileName, setFileName] = useState<string | null>(null);
  const [rows, setRows] = useState<CsvEmployeeRow[]>([]);
  const [rowErrors, setRowErrors] = useState<Map<number, string[]>>(new Map());

  const processFile = useCallback((file: File) => {
    setFileName(file.name);
    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target?.result as string;
      const parsed = parseCsv(text);
      setRows(parsed);

      const errMap = new Map<number, string[]>();
      parsed.forEach((row, idx) => {
        const errs = validateRow(row);
        if (errs.length > 0) errMap.set(idx, errs);
      });
      setRowErrors(errMap);
    };
    reader.readAsText(file);
  }, []);

  function handleReset() {
    setFileName(null);
    setRows([]);
    setRowErrors(new Map());
    if (fileRef.current) fileRef.current.value = "";
  }

  function handleClose() {
    handleReset();
    onClose();
  }

  const errorCount = rowErrors.size;
  const validRows = rows.filter((_, idx) => !rowErrors.has(idx));
  const previewRows = rows.slice(0, 5);

  return (
    <Dialog
      open={open}
      onOpenChange={(isOpen) => {
        if (!isOpen) handleClose();
      }}
    >
      <DialogContent
        style={{ width: 680, maxWidth: 680 }}
        className="bg-white border border-slate-200 rounded-3xl p-7 flex flex-col gap-4 max-h-[calc(100vh-2rem)] overflow-hidden [&>button]:text-slate-400 [&>button]:hover:text-slate-700 [&>button]:transition-colors"
      >
        <DialogHeader className="shrink-0">
          <DialogTitle className="text-slate-900 text-xl font-bold">
            CSV файлаас ажилтан нэмэх
          </DialogTitle>
        </DialogHeader>

        {rows.length === 0 ? (
          <>
            <input
              ref={fileRef}
              type="file"
              className="hidden"
              accept=".csv"
              onChange={(e) => {
                const f = e.target.files?.[0];
                if (f) processFile(f);
              }}
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
                const f = e.dataTransfer.files?.[0];
                if (f && f.name.endsWith(".csv")) processFile(f);
              }}
              onClick={() => fileRef.current?.click()}
              className={`flex-1 min-h-[200px] rounded-2xl border-2 border-dashed flex flex-col items-center justify-center gap-2 cursor-pointer transition-colors ${
                dragging
                  ? "border-emerald-400/60 bg-emerald-50"
                  : "border-slate-200 hover:border-slate-300"
              }`}
            >
              <BiUpload className="h-6 w-6 text-slate-400" />
              <p className="text-slate-900 text-sm font-semibold">
                CSV файл чирж оруулах
              </p>
              <p className="text-slate-400 text-xs">
                Зөвхөн .csv файл дэмжинэ
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
                Файл сонгох
              </Button>
            </div>

            <div className="flex items-center justify-between shrink-0">
              <Button
                variant="outline"
                size="sm"
                onClick={downloadSampleCsv}
                className="cursor-pointer rounded-xl border-slate-200 bg-white text-slate-600 hover:bg-slate-50 hover:text-slate-900 hover:border-slate-300 flex items-center gap-1.5"
              >
                <FiDownload className="h-3.5 w-3.5" />
                Загвар CSV татах
              </Button>
              <Button
                onClick={handleClose}
                className="px-6 py-2.5 h-auto rounded-2xl border-slate-200 bg-white cursor-pointer text-slate-600 hover:bg-slate-50 hover:text-slate-900 hover:border-slate-300"
              >
                Хаах
              </Button>
            </div>
          </>
        ) : (
          <>
            <div className="flex items-center justify-between shrink-0">
              <div className="flex items-center gap-3">
                <p className="text-sm text-slate-700">
                  <span className="font-semibold">{fileName}</span>
                  {" — "}
                  <span className="text-slate-500">
                    {rows.length} мөр уншигдлаа
                  </span>
                </p>
                {errorCount > 0 && (
                  <span className="inline-flex items-center gap-1 rounded-full bg-red-50 border border-red-200 px-2.5 py-0.5 text-xs font-medium text-red-600">
                    <FiAlertCircle className="h-3 w-3" />
                    {errorCount} алдаатай
                  </span>
                )}
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={handleReset}
                className="cursor-pointer rounded-xl border-slate-200 bg-white text-slate-600 hover:bg-slate-50 hover:text-slate-900 hover:border-slate-300 text-xs"
              >
                Дахин сонгох
              </Button>
            </div>

            <div className="flex-1 min-h-0 overflow-auto rounded-xl border border-slate-200">
              <table className="w-full text-xs">
                <thead>
                  <tr className="bg-slate-50 text-slate-500 text-left">
                    <th className="px-3 py-2 font-medium">Код</th>
                    <th className="px-3 py-2 font-medium">Нэр</th>
                    <th className="px-3 py-2 font-medium">Овог</th>
                    <th className="px-3 py-2 font-medium">Имэйл</th>
                    <th className="px-3 py-2 font-medium">Хэлтэс</th>
                    <th className="px-3 py-2 font-medium">Албан тушаал</th>
                    <th className="px-3 py-2 font-medium">Төлөв</th>
                  </tr>
                </thead>
                <tbody>
                  {previewRows.map((row, idx) => {
                    const errs = rowErrors.get(idx);
                    const hasError = !!errs;
                    return (
                      <tr
                        key={idx}
                        className={`border-t border-slate-100 ${hasError ? "bg-red-50/60" : "hover:bg-slate-50/50"}`}
                        title={hasError ? errs.join(", ") : undefined}
                      >
                        <td
                          className={`px-3 py-2 ${hasError ? "text-red-600 font-medium" : "text-slate-700"}`}
                        >
                          {row.employeeCode || "—"}
                        </td>
                        <td
                          className={`px-3 py-2 ${!row.firstName.trim() && hasError ? "text-red-500" : "text-slate-700"}`}
                        >
                          {row.firstName || "—"}
                        </td>
                        <td
                          className={`px-3 py-2 ${!row.lastName.trim() && hasError ? "text-red-500" : "text-slate-700"}`}
                        >
                          {row.lastName || "—"}
                        </td>
                        <td className="px-3 py-2 text-slate-500">
                          {row.email || "—"}
                        </td>
                        <td className="px-3 py-2 text-slate-500">
                          {row.department || "—"}
                        </td>
                        <td className="px-3 py-2 text-slate-500">
                          {row.jobTitle || "—"}
                        </td>
                        <td className="px-3 py-2 text-slate-500">
                          {row.status || "—"}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
              {rows.length > 5 && (
                <div className="px-3 py-2 text-xs text-slate-400 border-t border-slate-100 bg-slate-50/50">
                  ... нийт {rows.length} мөрөөс {rows.length - 5} мөр нуугдсан
                </div>
              )}
            </div>

            <div className="flex items-center justify-between shrink-0">
              <Button
                variant="outline"
                size="sm"
                onClick={downloadSampleCsv}
                className="cursor-pointer rounded-xl border-slate-200 bg-white text-slate-600 hover:bg-slate-50 hover:text-slate-900 hover:border-slate-300 flex items-center gap-1.5"
              >
                <FiDownload className="h-3.5 w-3.5" />
                Загвар CSV татах
              </Button>
              <div className="flex items-center gap-3">
                <Button
                  onClick={handleClose}
                  className="px-6 py-2.5 h-auto rounded-2xl border-slate-200 bg-white cursor-pointer text-slate-600 hover:bg-slate-50 hover:text-slate-900 hover:border-slate-300"
                >
                  Татгалзах
                </Button>
                <Button
                  onClick={() => void onImport(validRows)}
                  disabled={importing || validRows.length === 0}
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
                  {importing
                    ? "Нэмж байна..."
                    : `Бүгдийг нэмэх (${validRows.length})`}
                </Button>
              </div>
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}

export type { CsvImportDialogProps };
