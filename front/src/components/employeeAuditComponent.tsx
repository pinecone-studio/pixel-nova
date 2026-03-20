"use client";

import { useLazyQuery, useMutation, useQuery } from "@apollo/client/react";
import { createPortal } from "react-dom";
import { useMemo, useRef, useState, useEffect } from "react";
import { BiChevronDown, BiChevronRight, BiSearch, BiX } from "react-icons/bi";
import { FiFileText, FiCheckCircle, FiEye } from "react-icons/fi";

import { useEmployeeDocuments } from "@/components/pages/employee/useEmployeeDocuments";
import { useEmployeeSession } from "@/components/pages/employee/useEmployeeSession";
import { GET_AUDIT_LOGS } from "@/graphql/queries/audit-logs";
import { GET_DOCUMENT_CONTENT } from "@/graphql/queries";
import { GET_SIGNATURE_STATUS } from "@/graphql/queries/contract-requests";
import { EMPLOYEE_SIGN_DOCUMENT } from "@/graphql/mutations/documents";
import { buildGraphQLHeaders } from "@/lib/apollo-client";
import type {
  AuditLog,
  Document,
  DocumentContent,
  Employee,
} from "@/lib/types";
import { FilesPreviewModal } from "@/components/pages/employee/files/FilesPreviewModal";
import { buildDataUrl } from "@/components/pages/employee/files/filesUtils";

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const ACTION_LABELS: Record<string, string> = {
  add_employee: "Шинэ ажилтан авах",
  promote_employee: "Тушаал дэвшүүлэх",
  change_position: "Албан тушаал солих",
  offboard_employee: "Ажлаас чөлөөлөх",
};

const PHASE_LABELS: Record<string, string> = {
  onboarding: "Ажилд орох",
  working: "Ажиллах",
  offboarding: "Ажлаас гарах",
};

type FilterAction =
  | ""
  | "add_employee"
  | "promote_employee"
  | "change_position"
  | "offboard_employee";
type AuditTab = "newEmployee" | "documentReview";

function getDocumentSigningSummary(
  log: AuditLog,
  documentsById: Map<string, Document>,
) {
  const documents = log.documentIds
    .map((documentId) => documentsById.get(documentId))
    .filter((document): document is Document => Boolean(document));
  const total = Math.max(log.documentIds.length, 1);
  const hrSignedCount = documents.filter((document) =>
    Boolean(document.hrSigned),
  ).length;
  const employeeSignedCount = documents.filter((document) =>
    Boolean(document.employeeSigned),
  ).length;
  const unsignedCount = Math.max(total - hrSignedCount, 0);
  const allHrSigned =
    log.hrSignedAll ??
    (log.documentIds.length > 0 && hrSignedCount === log.documentIds.length);
  const allEmployeeSigned =
    Boolean(log.employeeSigned) ||
    (documents.length > 0 && employeeSignedCount === documents.length);

  return {
    total,
    unsignedCount,
    allHrSigned,
    allEmployeeSigned,
  };
}

function getDocumentStatus(document: Document) {
  const hrSigned = Boolean(document.hrSigned);
  const employeeSigned = Boolean(document.employeeSigned);

  if (hrSigned && employeeSigned) {
    return {
      label: "Баталгаажсан",
      className: "border-emerald-200 bg-emerald-50 text-emerald-700",
    };
  }

  if (hrSigned) {
    return {
      label: "Ажилтан хүлээгдэж байна",
      className: "border-amber-200 bg-amber-50 text-amber-700",
    };
  }

  return {
    label: "HR хүлээгдэж байна",
    className: "border-slate-200 bg-slate-50 text-slate-500",
  };
}

// ---------------------------------------------------------------------------
// Status badge
// ---------------------------------------------------------------------------

function AuditStatusBadge({ log }: { log: AuditLog }) {
  if (!log.documentsGenerated) {
    return (
      <span className="rounded-full border border-[#FF8A80] bg-white px-3 py-1 text-[12px] font-medium text-[#FF3B30]">
        Алдаатай
      </span>
    );
  }
  if (log.employeeSigned) {
    return (
      <span className="rounded-full border border-[#86EFAC] bg-white px-3 py-1 text-[12px] font-medium text-[#22C55E]">
        Амжилттай
      </span>
    );
  }
  if (log.incompleteFields.length > 0) {
    return (
      <span className="rounded-full border border-[#FDE68A] bg-white px-3 py-1 text-[12px] font-medium text-[#D97706]">
        Хэсэгчлэн
      </span>
    );
  }
  return (
    <span className="rounded-full border border-[#86EFAC] bg-white px-3 py-1 text-[12px] font-medium text-[#22C55E]">
      Амжилттай
    </span>
  );
}

// ---------------------------------------------------------------------------
// Document status badge
// ---------------------------------------------------------------------------

function DocumentAuditStatusBadge({
  log,
  documentsById,
}: {
  log: AuditLog;
  documentsById: Map<string, Document>;
}) {
  const summary = getDocumentSigningSummary(log, documentsById);

  if (!log.documentsGenerated) {
    return (
      <span className="rounded-full border border-[#FF8A80] bg-white px-3 py-1 text-[12px] font-medium text-[#FF3B30]">
        Алдаатай
      </span>
    );
  }

  if (summary.allHrSigned && summary.allEmployeeSigned) {
    return (
      <span className="rounded-full border border-[#86EFAC] bg-white px-3 py-1 text-[12px] font-medium text-[#22C55E]">
        Баталгаажсан
      </span>
    );
  }

  if (!summary.allHrSigned) {
    return (
      <span className="rounded-full border border-[#FDE68A] bg-white px-3 py-1 text-[12px] font-medium text-[#D97706]">
        {summary.unsignedCount} дутуу
      </span>
    );
  }

  return (
    <span className="rounded-full border border-[#FDE68A] bg-white px-3 py-1 text-[12px] font-medium text-[#D97706]">
      Ажилтан хүлээгдэж байна
    </span>
  );
}

// ---------------------------------------------------------------------------
// Detail modal
// ---------------------------------------------------------------------------

function AuditDetailModal({
  log,
  documentsById,
  onClose,
  onPreview,
  onSign,
  signing,
}: {
  log: AuditLog;
  documentsById: Map<string, Document>;
  onClose: () => void;
  onPreview: (document: Document) => void;
  onSign: () => void;
  signing: boolean;
}) {
  const dateStr = new Date(log.timestamp).toLocaleString("mn-MN", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/65 p-4 backdrop-blur-sm">
      <div className="w-full max-w-[560px] rounded-[28px] border border-[#EAECF0] bg-white p-7 shadow-[0_24px_80px_rgba(0,0,0,0.18)]">
        <div className="mb-6 flex items-start justify-between">
          <div>
            <p className="text-[13px] text-[#98A2B3]">Аудит бүртгэл</p>
            <h2 className="mt-2 text-[20px] font-semibold text-[#101828]">
              {ACTION_LABELS[log.action] ?? log.action}
            </h2>
            <p className="mt-1 text-[13px] text-[#667085]">{dateStr}</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-[#101828] transition hover:opacity-70">
            <BiX className="h-7 w-7" />
          </button>
        </div>

        <div className="flex flex-col gap-5">
          {/* Phase */}
          <div className="flex items-center justify-between text-[14px]">
            <span className="text-[#667085]">Үе шат</span>
            <span className="font-medium text-[#101828]">
              {PHASE_LABELS[log.phase] ?? log.phase}
            </span>
          </div>

          {/* Documents */}
          <div>
            <p className="mb-2 text-[13px] font-medium text-[#344054]">
              Баримтууд ({log.documentIds.length})
            </p>
            {log.documentIds.length > 0 ? (
              <div className="flex flex-col gap-2">
                {log.documentIds.map((docId) => (
                  <div
                    key={docId}
                    className="flex items-center justify-between gap-3 rounded-2xl border border-[#EAECF0] bg-white px-3 py-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-[#D0D5DD] bg-[#F9FAFB] text-[#667085]">
                      <FiFileText className="h-4 w-4" />
                    </div>
                    <span className="truncate text-[13px] text-[#101828] flex-1">
                      {documentsById.get(docId)?.documentName ?? docId}
                    </span>
                    <button
                      type="button"
                      onClick={() => {
                        const doc = documentsById.get(docId);
                        if (doc) onPreview(doc);
                      }}
                      disabled={!documentsById.get(docId)}
                      className="flex h-8 w-8 items-center justify-center rounded-[10px] text-[#667085] transition-colors hover:bg-[#f5f5f5] hover:text-[#101828] disabled:cursor-not-allowed disabled:opacity-50"
                      aria-label="Урьдчилж харах">
                      <FiEye className="h-4 w-4" />
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-[13px] text-[#98A2B3]">Баримт үүсээгүй</p>
            )}
          </div>

          {/* Email status */}
          <div className="flex items-center justify-between text-[14px]">
            <span className="text-[#667085]">Имэйл мэдэгдэл</span>
            {log.recipientsNotified ? (
              <span className="text-[#22C55E] font-medium">
                Илгээсэн ({log.recipientEmails.length})
              </span>
            ) : log.documentsGenerated ? (
              <span className="text-[#667085] font-medium">
                Илгээхээр бэлтгэсэн
              </span>
            ) : (
              <span className="text-[#98A2B3]">Илгээгээгүй</span>
            )}
          </div>

          <div className="flex items-center justify-between text-[14px]">
            <span className="text-[#667085]">Гарын үсэг</span>
            {log.employeeSigned ? (
              <span className="text-[#22C55E] font-medium">Зурсан</span>
            ) : (
              <span className="text-[#98A2B3]">Зураагүй</span>
            )}
          </div>

          {/* Incomplete fields */}
          {log.incompleteFields.length > 0 && (
            <div>
              <p className="mb-2 text-[13px] font-medium text-[#344054]">
                Дутуу талбарууд
              </p>
              <div className="flex flex-wrap gap-1.5">
                {log.incompleteFields.map((field) => (
                  <span
                    key={field}
                    className="rounded-full border border-[#FDE68A] bg-[#FFFBEB] px-2.5 py-1 text-[11px] text-[#D97706]">
                    {field}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="mt-7 flex justify-end">
          {!log.employeeSigned ? (
            <button
              type="button"
              onClick={onSign}
              disabled={signing}
              className="mr-3 rounded-2xl border border-[#D0D5DD] px-6 py-3 text-[15px] font-medium text-[#101828] transition hover:bg-[#F2F4F7] disabled:opacity-50">
              {signing ? "Илгээж байна..." : "Гарын үсэг зурах"}
            </button>
          ) : null}
          <button
            type="button"
            onClick={onClose}
            className="rounded-2xl bg-[#101828] px-6 py-3 text-[15px] font-medium text-white transition hover:bg-[#1D2939]">
            Хаах
          </button>
        </div>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Audit row
// ---------------------------------------------------------------------------

function AuditRow({
  log,
  documentsById,
  onOpen,
}: {
  log: AuditLog;
  documentsById: Map<string, Document>;
  onOpen: (log: AuditLog) => void;
}) {
  const dateStr = new Date(log.timestamp).toLocaleDateString("mn-MN", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });

  return (
    <button
      type="button"
      onClick={() => onOpen(log)}
      className="flex w-full items-center justify-between rounded-[20px] border border-[#EAECF0] bg-white px-5 py-5 text-left transition hover:border-[#D0D5DD] hover:bg-[#FCFCFD]">
      <div className="flex items-center gap-4">
        <div
          className={`flex h-12 w-12 items-center justify-center rounded-2xl border ${
            log.documentsGenerated
              ? "border-[#B7EAC7] bg-[#F0FDF4] text-[#22C55E]"
              : "border-[#FDE68A] bg-[#FFFBEB] text-[#D97706]"
          }`}>
          {log.documentsGenerated ? (
            <FiCheckCircle className="h-5 w-5" />
          ) : (
            <FiFileText className="h-5 w-5" />
          )}
        </div>
        <div>
          <p className="text-[16px] font-semibold text-[#101828]">
            {ACTION_LABELS[log.action] ?? log.action}
          </p>
          <div className="mt-1 flex items-center gap-2 text-[13px] text-[#98A2B3]">
            <span>{PHASE_LABELS[log.phase] ?? log.phase}</span>
            <span>·</span>
            <span>{log.documentIds.length} баримт</span>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-4">
        <DocumentAuditStatusBadge log={log} documentsById={documentsById} />
        <span className="text-[13px] text-[#98A2B3]">{dateStr}</span>
        <BiChevronRight className="h-6 w-6 text-[#98A2B3]" />
      </div>
    </button>
  );
}

function EmployeeRequestListRow({
  log,
  employee,
  onOpen,
}: {
  log: AuditLog;
  employee: Employee | null;
  onOpen: (log: AuditLog) => void;
}) {
  const displayName = employee
    ? `${employee.lastName} ${employee.firstName}`
    : (ACTION_LABELS[log.action] ?? log.action);

  return (
    <button
      type="button"
      onClick={() => onOpen(log)}
      className="group flex w-full items-center justify-between rounded-[20px] border border-[#EAECF0] bg-white px-5 py-5 text-left transition-colors">
      <div className="flex items-center gap-4">
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-[#86EFAC] bg-[#F0FDF4] text-[#22C55E]">
          <FiCheckCircle className="h-5 w-5" />
        </div>
        <div>
          <p className="text-[16px] font-semibold text-[#101828]">
            {displayName}
          </p>
          <div className="mt-1 flex items-center gap-2 text-[13px] text-[#98A2B3]">
            <FiFileText className="h-3.5 w-3.5" />
            <span>{log.documentIds.length} баримт хавсаргасан</span>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-5">
        <span
          className={`rounded-full border px-4 py-1.5 text-[13px] font-medium ${
            log.employeeSigned
              ? "border-[#86EFAC] bg-white text-[#22C55E]"
              : "border-[#FF8A80] bg-white text-[#FF3B30]"
          }`}>
          {log.employeeSigned ? "Ажилтан нэмсэн" : "Ажилтан нэмэх"}
        </span>
        <FiEye className="h-5 w-5 text-[#98A2B3]" />
        <BiChevronRight className="h-5 w-5 text-[#98A2B3]" />
      </div>
    </button>
  );
}

function NewEmployeeAuditDetailModal({
  log,
  employee,
  documentsById,
  onClose,
  onPreview,
  onOpenSignature,
}: {
  log: AuditLog;
  employee?: Employee | null;
  documentsById: Map<string, Document>;
  onClose: () => void;
  onPreview: (document: Document) => void;
  onOpenSignature: (document: Document) => void;
}) {
  const files = log.documentIds
    .map((documentId) => documentsById.get(documentId))
    .filter((document): document is Document => Boolean(document));
  const signableDocument =
    files.find((document) => !document.employeeSigned) ?? files[0] ?? null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/65 p-4 backdrop-blur-sm">
      <button
        type="button"
        aria-label="Close detail overlay"
        className="absolute inset-0"
        onClick={onClose}
      />
      <div className="relative z-10 w-full max-w-[500px] rounded-[24px] border border-[#EAECF0] bg-white px-6 py-6 shadow-[0_24px_80px_rgba(0,0,0,0.18)]">
        <div className="mx-auto w-full max-w-[452px]">
          <div className="mb-6 flex items-start justify-between">
            <h2 className="text-[20px] font-semibold text-[#101828]">
              Шинэ ажилтан
            </h2>
            <button
              type="button"
              onClick={onClose}
              className="text-[#101828] transition hover:opacity-70">
              <BiX className="h-7 w-7" />
            </button>
          </div>

          <div className="grid grid-cols-2 gap-x-5 gap-y-4">
            <div>
              <p className="mb-1.5 text-[14px] leading-5 text-[#101828]">
                Овог
              </p>
              <div className="rounded-[12px] border border-[#D0D5DD] px-3 py-2.5 text-[15px] leading-6 text-[#101828]">
                {employee?.lastName ?? "Мэдээлэлгүй"}
              </div>
            </div>
            <div>
              <p className="mb-1.5 text-[14px] leading-5 text-[#101828]">Нэр</p>
              <div className="rounded-[12px] border border-[#D0D5DD] px-3 py-2.5 text-[15px] leading-6 text-[#101828]">
                {employee?.firstName ?? "Мэдээлэлгүй"}
              </div>
            </div>
          </div>

          <div className="mt-4">
            <p className="mb-1.5 text-[14px] leading-5 text-[#101828]">Имэйл</p>
            <div className="rounded-[12px] border border-[#D0D5DD] px-3 py-2.5 text-[15px] leading-6 text-[#101828]">
              {employee?.email ?? "Мэдээлэлгүй"}
            </div>
          </div>

          <div className="mt-4 grid grid-cols-2 gap-x-5 gap-y-4">
            <div>
              <p className="mb-1.5 text-[14px] leading-5 text-[#101828]">
                Хэлтэс
              </p>
              <div className="rounded-[12px] border border-[#D0D5DD] px-3 py-2.5 text-[15px] leading-6 text-[#101828]">
                {employee?.department ?? "Мэдээлэлгүй"}
              </div>
            </div>
            <div>
              <p className="mb-1.5 text-[14px] leading-5 text-[#101828]">
                Албан тушаал
              </p>
              <div className="rounded-[12px] border border-[#D0D5DD] px-3 py-2.5 text-[15px] leading-6 text-[#101828]">
                {employee?.jobTitle ?? "Мэдээлэлгүй"}
              </div>
            </div>
          </div>

          <div className="mt-4">
            <p className="mb-2 text-[14px] leading-5 text-[#101828]">
              Хавсаргасан файл
            </p>
            <div className="flex flex-col gap-2.5">
              {files.map((document) => (
                <div
                  key={document.id}
                  className="flex items-center justify-between rounded-[16px] border border-[#D0D5DD] bg-white px-3 py-2.5">
                  <div className="flex min-w-0 items-center gap-4">
                    <div className="flex h-[48px] w-[48px] shrink-0 items-center justify-center rounded-[16px] border border-[#D0D5DD] bg-white text-[#667085]">
                      <FiFileText className="h-5 w-5" />
                    </div>
                    <div className="min-w-0">
                      <p className="truncate text-[14px] font-medium leading-5 text-[#101828]">
                        {document.documentName.replace(/\.pdf$/i, "")}
                      </p>
                      <p className="mt-0.5 truncate text-[12px] leading-5 text-[#98A2B3]">
                        {document.documentName}
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => onPreview(document)}
                    className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-[#667085] transition hover:bg-[#F3F4F6] hover:text-[#101828]">
                    <FiEye className="h-4.5 w-4.5" />
                  </button>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-3 flex items-center justify-between">
            <div className="text-[14px] leading-5 text-[#101828]">
              Гарын үсэг
            </div>
            <div className="text-[14px] leading-5 text-[#98A2B3]">
              {log.employeeSigned ? "Зурсан" : "Зураагүй"}
            </div>
          </div>

          <div className="mt-10 flex justify-end gap-3">
            <button
              type="button"
              onClick={() => {
                if (signableDocument) {
                  onOpenSignature(signableDocument);
                }
              }}
              disabled={!signableDocument}
              className="rounded-[16px] border border-[#D0D5DD] px-6 py-2.5 text-[14px] font-medium text-[#101828] disabled:opacity-50">
              Гарын үсэг зурах
            </button>
            <button
              type="button"
              onClick={onClose}
              className="rounded-[16px] bg-[#101828] px-6 py-2.5 text-[14px] font-medium text-white">
              Баталгаажуулах
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function DocumentReviewRow({
  document,
  onOpen,
}: {
  document: Document;
  onOpen: (document: Document) => void;
}) {
  const title = document.documentName
    .replace(/\.pdf$/i, "")
    .replace(/[_-]+/g, " ")
    .trim();
  const isNewDocument = !document.employeeSigned;

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={() => onOpen(document)}
      onKeyDown={(event) => {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          onOpen(document);
        }
      }}
      className="group flex w-full cursor-pointer items-center justify-between rounded-[20px] border border-[#EAECF0] bg-white px-5 py-5 text-left transition-colors">
      <div className="flex items-center gap-4">
        <div className="flex h-14 w-14 items-center justify-center rounded-[18px] border border-[#98C1FF] bg-white text-[#3B82F6]">
          <FiFileText className="h-6 w-6" />
        </div>
        <div>
          <p className="text-[16px] font-medium text-[#101828]">{title}</p>
          <p className="mt-1 text-[14px] text-[#98A2B3]">
            {document.documentName}
          </p>
        </div>
      </div>

      <div className="flex items-center gap-5">
        <span
          className={`rounded-full border px-4 py-1.5 text-[13px] font-medium ${
            isNewDocument
              ? "border-[#FF8A80] bg-white text-[#FF3B30]"
              : "border-[#86EFAC] bg-white text-[#22C55E]"
          }`}>
          {isNewDocument ? "Шинэ баримт" : "Шинэчлэлт"}
        </span>
        <button
          type="button"
          onClick={(event) => {
            event.stopPropagation();
            onOpen(document);
          }}
          className="flex h-8 w-8 items-center justify-center rounded-[10px] text-[#98A2B3] transition hover:bg-[#F3F4F6] hover:text-[#101828]"
          aria-label="Урьдчилж харах">
          <FiEye className="h-5 w-5" />
        </button>
        <button
          type="button"
          onClick={(event) => {
            event.stopPropagation();
          }}
          className="flex h-8 w-8 items-center justify-center rounded-[10px] text-[#98A2B3] transition hover:bg-[#F3F4F6] hover:text-[#101828]"
          aria-label="Татах">
          <FiFileText className="h-5 w-5" />
        </button>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Main component
// ---------------------------------------------------------------------------

function DocumentAuditDetailModal({
  log,
  employee,
  documentsById,
  onClose,
  onPreview,
  onSignDocument,
}: {
  log: AuditLog;
  employee?: Employee | null;
  documentsById: Map<string, Document>;
  onClose: () => void;
  onPreview: (document: Document) => void;
  onSignDocument: (document: Document) => void;
}) {
  const empName = employee
    ? `${employee.lastName} ${employee.firstName}`
    : log.employeeId;
  const dateStr = new Date(log.timestamp).toLocaleDateString("mn-MN", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });

  const modal = (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/65 p-4 backdrop-blur-sm">
      <button
        type="button"
        aria-label="Close detail overlay"
        className="absolute inset-0"
        onClick={onClose}
      />
      <div className="relative z-10 w-full max-w-[500px] rounded-[24px] border border-[#EAECF0] bg-white px-6 py-5 shadow-[0_24px_80px_rgba(0,0,0,0.18)]">
        <div className="mb-5 flex items-start justify-between">
          <div>
            <h2 className="text-[20px] font-semibold text-[#101828]">
              Шинэ баримт
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-[#101828] transition hover:opacity-70">
            <BiX className="h-7 w-7" />
          </button>
        </div>

        <div className="flex flex-col gap-4">
          <div>
            <p className="mb-2 text-[14px] text-[#101828]">Тайлбар</p>
            <div className="min-h-[114px] rounded-[14px] border border-[#D0D5DD] px-4 py-3 text-[14px] leading-8 text-[#667085]">
              {empName} · {dateStr}
            </div>
          </div>
          <div>
            <p className="mb-2 text-[14px] text-[#101828]">Хавсаргасан файл</p>
            {log.documentIds.length > 0 ? (
              <div className="flex flex-col gap-2">
                {log.documentIds.map((docId) => {
                  const document = documentsById.get(docId);
                  const status = document ? getDocumentStatus(document) : null;
                  return (
                    <div
                      key={docId}
                      className="flex items-center justify-between gap-3 rounded-[16px] border border-[#D0D5DD] bg-white px-3 py-2.5">
                      <div className="flex items-center gap-4 min-w-0 flex-1">
                        <div className="flex h-[48px] w-[48px] items-center justify-center rounded-[16px] border border-[#D0D5DD] bg-white text-[#667085]">
                          <FiFileText className="h-5 w-5" />
                        </div>
                        <div className="min-w-0">
                          <p className="truncate text-[14px] font-medium leading-5 text-[#101828]">
                            {(document?.documentName ?? docId).replace(
                              /\.pdf$/i,
                              "",
                            )}
                          </p>
                          <p className="mt-0.5 text-[12px] text-[#98A2B3]">
                            {document?.documentName ?? docId}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-1.5">
                        {status ? (
                          <span
                            className={`mr-2 inline-flex w-fit rounded-full border px-3 py-1 text-[11px] font-medium ${status.className}`}>
                            {status.label}
                          </span>
                        ) : null}
                        <button
                          type="button"
                          onClick={() => {
                            if (document) onPreview(document);
                          }}
                          disabled={!document}
                          className="flex h-8 w-8 items-center justify-center rounded-[10px] text-[#667085] transition-colors hover:bg-[#f5f5f5] hover:text-[#101828] disabled:cursor-not-allowed disabled:opacity-50"
                          aria-label="Үр дүнг харах">
                          <FiEye className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <p className="text-[13px] text-[#98A2B3]">Баримт үүсээгүй</p>
            )}
          </div>
        </div>

        <div className="mt-6 flex justify-end gap-4">
          <button
            type="button"
            onClick={onClose}
            className="rounded-[16px] border border-[#FF8A80] px-5 py-2.5 text-[14px] font-medium text-[#FF3B30]">
            Татгалзах
          </button>
          <button
            type="button"
            onClick={() => {
              const firstUnsigned = log.documentIds
                .map((docId) => documentsById.get(docId))
                .find(
                  (document): document is Document =>
                    Boolean(document) &&
                    Boolean(document!.hrSigned) &&
                    !Boolean(document!.employeeSigned),
                );
              if (firstUnsigned) {
                onSignDocument(firstUnsigned);
              } else {
                onClose();
              }
            }}
            className="rounded-[16px] bg-[#101828] px-5 py-2.5 text-[14px] font-medium text-white transition hover:bg-[#1D2939]">
            Баталгаажуулах
          </button>
        </div>
      </div>
    </div>
  );

  return typeof document !== "undefined"
    ? createPortal(modal, document.body)
    : modal;
}

export function EmployeeAuditComponent() {
  const { authToken, employee, loading: sessionLoading } = useEmployeeSession();
  const [search, setSearch] = useState("");
  const [activeTab, setActiveTab] = useState<AuditTab>("newEmployee");
  const [filterAction, setFilterAction] = useState<FilterAction>("");
  const [filterOpen, setFilterOpen] = useState(false);
  const [detailLog, setDetailLog] = useState<AuditLog | null>(null);
  const [previewDoc, setPreviewDoc] = useState<Document | null>(null);
  const [previewError, setPreviewError] = useState<string | null>(null);
  const [signatureOpen, setSignatureOpen] = useState(false);
  const [signatureMode, setSignatureMode] = useState<"reuse" | "redraw">(
    "reuse",
  );
  const [signatureData, setSignatureData] = useState("");
  const [passcode, setPasscode] = useState("");
  const [usePasscode, setUsePasscode] = useState(false);
  const [signatureError, setSignatureError] = useState<string | null>(null);
  const [signatureTargetDocument, setSignatureTargetDocument] =
    useState<Document | null>(null);
  const [selectedDocument, setSelectedDocument] = useState<Document | null>(
    null,
  );
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const drawingRef = useRef(false);
  const filterRef = useRef<HTMLDivElement | null>(null);

  const [loadContent, { data: previewData, loading: previewLoading }] =
    useLazyQuery<{ documentContent: DocumentContent | null }>(
      GET_DOCUMENT_CONTENT,
      { fetchPolicy: "network-only" },
    );

  const previewContent = previewData?.documentContent ?? null;
  const previewUrl = useMemo(
    () => (previewContent ? buildDataUrl(previewContent) : null),
    [previewContent],
  );

  async function handlePreviewDocument(document: Document) {
    if (!authToken) return;
    setPreviewDoc(document);
    setPreviewError(null);
    try {
      const result = await loadContent({
        variables: { documentId: document.id },
        context: { headers: buildGraphQLHeaders({ authToken }) },
      });
      if (!result.data?.documentContent) {
        setPreviewError("Баримтын агуулга олдсонгүй.");
      }
    } catch (err) {
      setPreviewError(
        err instanceof Error ? err.message : "Баримтыг нээж чадсангүй.",
      );
    }
  }

  const { data, loading, error, refetch } = useQuery<{ auditLogs: AuditLog[] }>(
    GET_AUDIT_LOGS,
    {
      skip: !authToken || !employee,
      context: {
        headers: buildGraphQLHeaders({ authToken }),
      },
      variables: {
        action: filterAction || undefined,
      },
      fetchPolicy: "network-only",
    },
  );

  const { data: signatureStatusData, refetch: refetchSignatureStatus } =
    useQuery<{
      mySignatureStatus: {
        hasSignature: boolean;
        hasPasscode: boolean;
        updatedAt?: string | null;
      };
    }>(GET_SIGNATURE_STATUS, {
      skip: !authToken,
      context: { headers: buildGraphQLHeaders({ authToken }) },
      fetchPolicy: "network-only",
    });

  const [signDocument, { loading: signing }] = useMutation<{
    employeeSignDocument: {
      allSigned: boolean;
    };
  }>(EMPLOYEE_SIGN_DOCUMENT, {
    context: { headers: buildGraphQLHeaders({ authToken }) },
  });

  const signatureStatus = signatureStatusData?.mySignatureStatus ?? null;
  const hasSignature = signatureStatus?.hasSignature ?? false;
  const hasPasscode = signatureStatus?.hasPasscode ?? false;

  useEffect(() => {
    if (!signatureOpen || signatureMode !== "redraw") return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const ratio = window.devicePixelRatio || 1;
    canvas.width = rect.width * ratio;
    canvas.height = rect.height * ratio;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.scale(ratio, ratio);
    ctx.lineWidth = 2;
    ctx.lineCap = "round";
    ctx.strokeStyle = "#0B0E14";
  }, [signatureOpen, signatureMode]);

  useEffect(() => {
    function handlePointerDown(event: MouseEvent) {
      if (!filterRef.current?.contains(event.target as Node)) {
        setFilterOpen(false);
      }
    }

    document.addEventListener("mousedown", handlePointerDown);
    return () => document.removeEventListener("mousedown", handlePointerDown);
  }, []);

  function clearSignature() {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    setSignatureData("");
  }

  function getCanvasPoint(e: React.PointerEvent<HTMLCanvasElement>) {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();
    return { x: e.clientX - rect.left, y: e.clientY - rect.top };
  }

  function handlePointerDown(e: React.PointerEvent<HTMLCanvasElement>) {
    if (signatureMode !== "redraw") return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    drawingRef.current = true;
    const { x, y } = getCanvasPoint(e);
    ctx.beginPath();
    ctx.moveTo(x, y);
  }

  function handlePointerMove(e: React.PointerEvent<HTMLCanvasElement>) {
    if (!drawingRef.current || signatureMode !== "redraw") return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const { x, y } = getCanvasPoint(e);
    ctx.lineTo(x, y);
    ctx.stroke();
  }

  function handlePointerUp() {
    if (!drawingRef.current || signatureMode !== "redraw") return;
    drawingRef.current = false;
    const canvas = canvasRef.current;
    if (!canvas) return;
    setSignatureData(canvas.toDataURL("image/png"));
  }

  function openSignatureModal(document: Document) {
    setSignatureTargetDocument(document);
    setSignatureOpen(true);
    setSignatureError(null);
    setSignatureMode(hasSignature ? "reuse" : "redraw");
    setSignatureData("");
    setPasscode("");
    setUsePasscode(false);
  }

  async function handleSaveSignature() {
    if (!signatureTargetDocument) return;
    setSignatureError(null);

    if (signatureMode === "reuse") {
      if (hasPasscode && passcode.length !== 4) {
        setSignatureError("4 оронтой кодоо бүрэн оруулна уу.");
        return;
      }
    } else {
      if (!signatureData) {
        setSignatureError("Гарын үсгээ зурна уу.");
        return;
      }
      if (usePasscode && passcode.length !== 4) {
        setSignatureError("4 оронтой кодоо бүрэн оруулна уу.");
        return;
      }
    }

    try {
      const result = await signDocument({
        variables: {
          documentId: signatureTargetDocument.id,
          signatureMode,
          signatureData: signatureMode === "redraw" ? signatureData : null,
          passcode:
            signatureMode === "reuse"
              ? passcode || null
              : usePasscode
                ? passcode
                : null,
        },
      });
      const allSigned = result.data?.employeeSignDocument?.allSigned ?? false;
      await refetchSignatureStatus();
      await refetch();
      await refetchDocuments();
      setSignatureOpen(false);
      setSignatureTargetDocument(null);
      if (allSigned) {
        setPreviewError(null);
      }
    } catch (err) {
      setSignatureError(
        err instanceof Error ? err.message : "Алдаа гарлаа. Дахин оролдоно уу.",
      );
    }
  }
  const {
    documents,
    loading: documentsLoading,
    refetch: refetchDocuments,
  } = useEmployeeDocuments({
    authToken,
    employeeId: employee?.id,
  });

  const documentsById = useMemo(
    () => new Map(documents.map((document) => [document.id, document])),
    [documents],
  );

  const auditLogs = useMemo(() => {
    let logs = data?.auditLogs ?? [];

    logs = logs.filter((log) =>
      activeTab === "newEmployee"
        ? log.action === "add_employee"
        : log.action === "promote_employee" ||
          log.action === "change_position" ||
          log.action === "offboard_employee",
    );

    if (filterAction) {
      logs = logs.filter((log) => log.action === filterAction);
    }

    if (search) {
      const q = search.toLowerCase();
      logs = logs.filter((log) => {
        const actionLabel = ACTION_LABELS[log.action] ?? log.action;
        const phaseLabel = PHASE_LABELS[log.phase] ?? log.phase;
        return (
          actionLabel.toLowerCase().includes(q) ||
          phaseLabel.toLowerCase().includes(q) ||
          log.action.toLowerCase().includes(q)
        );
      });
    }

    return [...logs].sort((a, b) => b.timestamp.localeCompare(a.timestamp));
  }, [activeTab, data, filterAction, search]);

  const documentReviewItems = useMemo(() => {
    let items = [...documents].filter(
      (document) =>
        document.action === "promote_employee" ||
        document.action === "change_position" ||
        document.action === "offboard_employee",
    );

    if (filterAction) {
      items = items.filter((document) => document.action === filterAction);
    }

    if (search) {
      const q = search.toLowerCase();
      items = items.filter((document) =>
        document.documentName.toLowerCase().includes(q),
      );
    }

    return items.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  }, [documents, filterAction, search]);

  const counts = useMemo(() => {
    const all = data?.auditLogs ?? [];
    const newEmployeeLogs = all.filter((log) => log.action === "add_employee");
    const documentReviewLogs = all.filter(
      (log) =>
        log.action === "promote_employee" ||
        log.action === "change_position" ||
        log.action === "offboard_employee",
    );

    return {
      newEmployee: newEmployeeLogs.length,
      documentReview: documentReviewItems.length || documentReviewLogs.length,
    };
  }, [data, documentReviewItems.length]);

  const isLoading = sessionLoading || loading || documentsLoading;
  const actionOptions: Array<{ value: FilterAction; label: string }> =
    activeTab === "newEmployee"
      ? [
          { value: "", label: "Бүгд" },
          { value: "add_employee", label: "Шинэ ажилтан авах" },
        ]
      : [
          { value: "", label: "Бүгд" },
          { value: "promote_employee", label: "Тушаал дэвшүүлэх" },
          { value: "change_position", label: "Албан тушаал солих" },
          { value: "offboard_employee", label: "Ажлаас чөлөөлөх" },
        ];
  const activeActionLabel =
    actionOptions.find((option) => option.value === filterAction)?.label ??
    "Бүгд";
  const selectedDocumentLog = useMemo(() => {
    if (!selectedDocument) return null;
    return (
      auditLogs.find((log) => log.documentIds.includes(selectedDocument.id)) ??
      null
    );
  }, [auditLogs, selectedDocument]);

  return (
    <div className="min-h-screen bg-white px-6 py-8 text-[#101828]">
      {detailLog &&
        (activeTab === "newEmployee" ? (
          <NewEmployeeAuditDetailModal
            log={detailLog}
            employee={employee}
            documentsById={documentsById}
            onClose={() => setDetailLog(null)}
            onPreview={(document) => {
              void handlePreviewDocument(document);
            }}
            onOpenSignature={(document) => {
              setDetailLog(null);
              openSignatureModal(document);
            }}
          />
        ) : (
          <DocumentAuditDetailModal
            log={detailLog}
            employee={employee}
            documentsById={documentsById}
            onClose={() => setDetailLog(null)}
            onPreview={handlePreviewDocument}
            onSignDocument={(document) => {
              void handlePreviewDocument(document);
              openSignatureModal(document);
            }}
          />
        ))}

      {selectedDocument && selectedDocumentLog ? (
        <DocumentAuditDetailModal
          log={selectedDocumentLog}
          employee={employee}
          documentsById={documentsById}
          onClose={() => setSelectedDocument(null)}
          onPreview={handlePreviewDocument}
          onSignDocument={(document) => {
            void handlePreviewDocument(document);
            openSignatureModal(document);
          }}
        />
      ) : null}

      {previewDoc ? (
        <FilesPreviewModal
          document={previewDoc}
          content={previewContent}
          previewUrl={previewUrl}
          loading={previewLoading}
          error={previewError}
          onClose={() => setPreviewDoc(null)}
        />
      ) : null}

      {signatureOpen ? (
        <div className="fixed inset-0 z-[120] flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <button
            type="button"
            aria-label="Close signature modal"
            className="absolute inset-0"
            onClick={() => {
              setSignatureOpen(false);
              setSignatureTargetDocument(null);
            }}
          />
          <div
            className={`relative w-[505px] max-w-[92vw] rounded-[24px] border border-[#EAECF0] bg-white px-7 py-6 shadow-[0_24px_80px_rgba(0,0,0,0.18)] ${
              signatureMode === "redraw" ? "min-h-[553px]" : "min-h-[327px]"
            }`}>
            <div className="mb-7 flex items-start justify-between">
              <div>
                <h3 className="text-[18px] font-semibold text-[#101828]">
                  Гарын үсэг баталгаажуулах
                </h3>
              </div>
              <button
                type="button"
                onClick={() => {
                  setSignatureOpen(false);
                  setSignatureTargetDocument(null);
                }}
                className="text-[#101828] transition hover:opacity-70">
                <BiX className="h-6 w-6" />
              </button>
            </div>

            {hasSignature ? (
              <div className="mb-5 flex gap-10">
                <label className="flex cursor-pointer items-center gap-3 text-[14px] text-[#101828]">
                  <input
                    type="radio"
                    checked={signatureMode === "reuse"}
                    onChange={() => setSignatureMode("reuse")}
                    className="sr-only"
                  />
                  <span
                    className={`flex h-6 w-6 items-center justify-center rounded-full border ${
                      signatureMode === "reuse"
                        ? "border-[#2F80FF]"
                        : "border-[#98A2B3]"
                    }`}>
                    <span
                      className={`h-3 w-3 rounded-full ${
                        signatureMode === "reuse"
                          ? "bg-[#2F80FF]"
                          : "bg-transparent"
                      }`}
                    />
                  </span>
                  Өмнөх гарын үсэг ашиглах
                </label>
                <label className="flex cursor-pointer items-center gap-3 text-[14px] text-[#101828]">
                  <input
                    type="radio"
                    checked={signatureMode === "redraw"}
                    onChange={() => setSignatureMode("redraw")}
                    className="sr-only"
                  />
                  <span
                    className={`flex h-6 w-6 items-center justify-center rounded-full border ${
                      signatureMode === "redraw"
                        ? "border-[#2F80FF]"
                        : "border-[#98A2B3]"
                    }`}>
                    <span
                      className={`h-3 w-3 rounded-full ${
                        signatureMode === "redraw"
                          ? "bg-[#2F80FF]"
                          : "bg-transparent"
                      }`}
                    />
                  </span>
                  Дахин зурах
                </label>
              </div>
            ) : null}

            {signatureMode === "redraw" ? (
              <div className="mb-4">
                <div className="mb-3 mt-2 flex items-center justify-between">
                  <p className="text-[14px] text-[#667085]">
                    Гарын үсгээ зурна уу
                  </p>
                  <button
                    type="button"
                    onClick={clearSignature}
                    className="text-[12px] text-[#667085] hover:text-[#101828]">
                    Арилгах
                  </button>
                </div>
                <div className="h-[222px] w-full rounded-[14px] border border-[#D0D5DD] bg-white">
                  <canvas
                    ref={canvasRef}
                    className="h-full w-full"
                    onPointerDown={handlePointerDown}
                    onPointerMove={handlePointerMove}
                    onPointerUp={handlePointerUp}
                    onPointerLeave={handlePointerUp}
                  />
                </div>
                <label className="mt-6 flex cursor-pointer items-center gap-3 text-[14px] text-[#344054]">
                  <input
                    type="checkbox"
                    checked={usePasscode}
                    onChange={(e) => setUsePasscode(e.target.checked)}
                    className="sr-only"
                  />
                  <span
                    className={`flex h-7 w-7 items-center justify-center rounded-[10px] border transition-colors ${
                      usePasscode
                        ? "border-[#98A2B3] bg-white text-[#344054]"
                        : "border-[#98A2B3] bg-white text-transparent"
                    }`}>
                    <span className="text-[15px] leading-none">✓</span>
                  </span>
                  4 оронтой код хадгалах
                </label>
                {usePasscode ? (
                  <input
                    value={passcode}
                    onChange={(e) => setPasscode(e.target.value)}
                    placeholder="0000"
                    className="mt-4 h-11 w-full rounded-[12px] border border-[#D0D5DD] px-4 text-[14px] text-[#101828] outline-none placeholder:text-[#98A2B3]"
                    maxLength={4}
                  />
                ) : null}
              </div>
            ) : (
              <div className="mb-4 mt-2">
                {hasPasscode ? (
                  <input
                    value={passcode}
                    onChange={(e) => setPasscode(e.target.value)}
                    placeholder="4 оронтой код"
                    className="h-11 w-full rounded-[12px] border border-[#D0D5DD] px-4 text-[14px] text-[#101828] outline-none placeholder:text-[#98A2B3]"
                    maxLength={4}
                  />
                ) : (
                  <p className="text-[14px] text-[#667085]">
                    Өмнөх гарын үсгийг ашиглана.
                  </p>
                )}
              </div>
            )}

            {signatureError ? (
              <div className="mb-3 rounded-xl border border-[#FF8A80] bg-[#FFF1F1] px-4 py-3 text-[13px] text-[#FF3B30]">
                {signatureError}
              </div>
            ) : null}

            <div
              className={`${signatureMode === "redraw" ? "mt-8" : "mt-10"} flex justify-end gap-3`}>
              <button
                type="button"
                onClick={() => {
                  setSignatureOpen(false);
                  setSignatureTargetDocument(null);
                }}
                className="rounded-[14px] border border-[#D0D5DD] px-5 py-2.5 text-[14px] text-[#344054]">
                Болих
              </button>
              <button
                type="button"
                onClick={handleSaveSignature}
                disabled={signing}
                className="rounded-[14px] bg-[#101828] px-5 py-2.5 text-[14px] font-medium text-white disabled:opacity-50">
                {signing ? "Илгээж байна..." : "Баталгаажуулах"}
              </button>
            </div>
          </div>
        </div>
      ) : null}

      <div className="mx-auto flex w-full max-w-[1061px] flex-col gap-8">
        {/* Header */}
        <div className="flex w-full flex-col gap-1.5">
          <h1 className="text-[34px] font-semibold leading-[1.1] tracking-[-0.03em] text-[#101828]">
            Аудит хүсэлтүүд
          </h1>
          <p className="text-[16px] text-[#667085]">
            Хүний нөөцийн ажилчдаас илгээсэн хүсэлтүүд
          </p>
        </div>

        <div className="flex w-full flex-col gap-4 lg:flex-row lg:items-center">
          <button
            type="button"
            onClick={() => {
              setActiveTab("newEmployee");
              setFilterAction("");
            }}
            className={`group relative flex h-[120px] min-w-0 flex-1 items-center overflow-hidden rounded-[26px] border px-8 text-left transition-all duration-300 ${
              activeTab === "newEmployee"
                ? "border-[#86EFAC] bg-white"
                : "border-[#D0D5DD] bg-white hover:border-[#B7EAC7] hover:bg-[#FBFFFC]"
            }`}>
            <div className="flex min-w-0 items-center gap-5">
              <div className="flex h-16 w-16 items-center justify-center rounded-[20px] border border-[#86EFAC] bg-white text-[#22C55E] shadow-[0_10px_24px_rgba(34,197,94,0.10)]">
                <FiCheckCircle className="h-8 w-8" />
              </div>
              <div className="flex min-w-0 items-end gap-3">
                <span className="text-[46px] font-semibold leading-none text-[#3F4145]">
                  {counts.newEmployee}
                </span>
                <span className="truncate pb-1 text-[14px] text-[#667085]">
                  Шинэ ажилтны хүсэлт
                </span>
              </div>
            </div>
          </button>

          <button
            type="button"
            onClick={() => {
              setActiveTab("documentReview");
              setFilterAction("");
            }}
            className={`group relative flex h-[120px] min-w-0 flex-1 items-center overflow-hidden rounded-[26px] border px-8 text-left transition-all duration-300 ${
              activeTab === "documentReview"
                ? "border-[#98C1FF] bg-white"
                : "border-[#D0D5DD] bg-white hover:border-[#B8D4FF] hover:bg-[#FBFDFF]"
            }`}>
            <div className="flex min-w-0 items-center gap-5">
              <div className="flex h-16 w-16 items-center justify-center rounded-[20px] border border-[#98C1FF] bg-white text-[#3B82F6] shadow-[0_10px_24px_rgba(47,123,255,0.10)]">
                <FiFileText className="h-8 w-8" />
              </div>
              <div className="flex min-w-0 items-end gap-3">
                <span className="text-[46px] font-semibold leading-none text-[#3F4145]">
                  {counts.documentReview}
                </span>
                <span className="truncate pb-1 text-[14px] text-[#667085]">
                  Баримт бичиг баталгаажуулах
                </span>
              </div>
            </div>
          </button>
        </div>

        {/* Search + Filter */}
        <div className="flex w-full items-center gap-3">
          <div className="flex h-[44px] flex-1 items-center gap-3 rounded-[12px] border border-[#D0D5DD] bg-white px-4">
            <BiSearch className="h-5 w-5 text-[#667085]" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-transparent text-[15px] text-[#101828] outline-none placeholder:text-[#98A2B3]"
              placeholder="Хайх..."
            />
          </div>
          <div ref={filterRef} className="relative w-[220px]">
            <button
              type="button"
              onClick={() => setFilterOpen((prev) => !prev)}
              className="flex h-[44px] w-full items-center justify-between rounded-[12px] border border-[#D0D5DD] bg-white px-4 text-[15px] text-[#667085] outline-none">
              <span>{activeActionLabel}</span>
              <BiChevronDown
                className={`h-4 w-4 text-[#667085] transition-transform ${
                  filterOpen ? "rotate-180" : ""
                }`}
              />
            </button>
            {filterOpen ? (
              <div className="absolute right-0 z-10 mt-2 w-full rounded-[12px] border border-[#E5E7EB] bg-white p-1 shadow-[0_16px_40px_rgba(15,23,42,0.12)]">
                {actionOptions.map((option) => {
                  const active = option.value === filterAction;
                  return (
                    <button
                      key={option.label}
                      type="button"
                      onClick={() => {
                        setFilterAction(option.value);
                        setFilterOpen(false);
                      }}
                      className={`flex w-full rounded-[10px] bg-white px-3 py-2 text-left text-[14px] transition-colors ${
                        active
                          ? "bg-[#F3F4F6] text-[#111827]"
                          : "text-[#344054] hover:bg-[#F3F4F6] hover:text-[#111827]"
                      }`}>
                      {option.label}
                    </button>
                  );
                })}
              </div>
            ) : null}
          </div>
        </div>

        {/* Error */}
        {error && (
          <div className="rounded-2xl border border-red-200 bg-red-50 px-5 py-4 text-sm text-red-500">
            {error.message}
          </div>
        )}

        {/* List */}
        <div className="flex items-center gap-4">
          <h2 className="text-[22px] font-semibold text-[#101828]">
            {activeTab === "newEmployee"
              ? "Шинэ Ажилтан"
              : "Баримт бичиг баталгаажуулах"}
          </h2>
          <span className="rounded-full border border-[#D0D5DD] bg-[#F9FAFB] px-3 py-1 text-xs text-[#98A2B3]">
            {activeTab === "newEmployee"
              ? `${auditLogs.length} хүсэлт`
              : `${documentReviewItems.length} хүсэлт`}
          </span>
        </div>

        {isLoading ? (
          <div className="flex flex-col gap-4">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="h-[82px] rounded-[20px] border border-[#EAECF0] bg-[#F9FAFB] skeleton"
              />
            ))}
          </div>
        ) : activeTab === "newEmployee" && auditLogs.length === 0 ? (
          <div className="py-16 text-center text-[#98A2B3] text-[15px]">
            Аудит бүртгэл олдсонгүй
          </div>
        ) : activeTab === "documentReview" &&
          documentReviewItems.length === 0 ? (
          <div className="py-16 text-center text-[#98A2B3] text-[15px]">
            Баримт бичиг олдсонгүй
          </div>
        ) : (
          <div className="flex flex-col gap-4">
            {activeTab === "newEmployee"
              ? auditLogs.map((log) => (
                  <EmployeeRequestListRow
                    key={log.id}
                    log={log}
                    employee={employee}
                    onOpen={setDetailLog}
                  />
                ))
              : documentReviewItems.map((document) => (
                  <DocumentReviewRow
                    key={document.id}
                    document={document}
                    onOpen={(doc) => {
                      setSelectedDocument(doc);
                    }}
                  />
                ))}
          </div>
        )}
      </div>
    </div>
  );
}
