"use client";

import { useLazyQuery, useMutation, useQuery } from "@apollo/client/react";
import { useMemo, useRef, useState, useEffect } from "react";
import { BiChevronRight, BiSearch, BiX } from "react-icons/bi";
import { FiFileText, FiCheckCircle, FiEye } from "react-icons/fi";

import { useEmployeeDocuments } from "@/components/pages/employee/useEmployeeDocuments";
import { useEmployeeSession } from "@/components/pages/employee/useEmployeeSession";
import { GET_AUDIT_LOGS } from "@/graphql/queries/audit-logs";
import { GET_DOCUMENT_CONTENT } from "@/graphql/queries";
import { GET_SIGNATURE_STATUS } from "@/graphql/queries/contract-requests";
import { SIGN_AUDIT_LOG } from "@/graphql/mutations/audit";
import { buildGraphQLHeaders } from "@/lib/apollo-client";
import type { AuditLog, Document, DocumentContent } from "@/lib/types";
import { FilesPreviewModal } from "@/components/pages/employee/files/FilesPreviewModal";
import { buildDataUrl } from "@/components/pages/employee/files/filesUtils";

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const ACTION_LABELS: Record<string, string> = {
  add_employee: "Шинэ ажилтан авах",
  promote_employee: "Тушаал дэвшүүлэх",
  change_position: "Албан тушаал солих",
};

const PHASE_LABELS: Record<string, string> = {
  onboarding: "Ажилд орох",
  working: "Ажиллах",
};

type FilterAction = "" | "add_employee" | "promote_employee" | "change_position";

// ---------------------------------------------------------------------------
// Status badge
// ---------------------------------------------------------------------------

function AuditStatusBadge({ log }: { log: AuditLog }) {
  if (log.employeeSigned) {
    return (
      <span className="rounded-full border border-[#86EFAC] bg-white px-3 py-1 text-[12px] font-medium text-[#22C55E]">
        Амжилттай
      </span>
    );
  }
  if (log.notificationError) {
    return (
      <span className="rounded-full border border-[#FF8A80] bg-white px-3 py-1 text-[12px] font-medium text-[#FF3B30]">
        Алдаатай
      </span>
    );
  }
  if (log.documentsGenerated && log.recipientsNotified) {
    return (
      <span className="rounded-full border border-[#86EFAC] bg-white px-3 py-1 text-[12px] font-medium text-[#22C55E]">
        Амжилттай
      </span>
    );
  }
  return (
    <span className="rounded-full border border-[#FDE68A] bg-white px-3 py-1 text-[12px] font-medium text-[#D97706]">
      Хэсэгчлэн
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
            ) : log.notificationError ? (
              <span className="text-[#FF3B30] font-medium">Алдаа</span>
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

          {/* Error */}
          {log.notificationError && (
            <div className="rounded-xl border border-[#FF8A80] bg-[#FFF1F1] px-4 py-3 text-[13px] text-[#FF3B30]">
              {log.notificationError}
            </div>
          )}

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
              className="mr-3 rounded-2xl border border-[#D0D5DD] px-6 py-3 text-[15px] font-medium text-[#101828] transition hover:bg-[#F2F4F7] disabled:opacity-50"
            >
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
  onOpen,
}: {
  log: AuditLog;
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
        <AuditStatusBadge log={log} />
        <span className="text-[13px] text-[#98A2B3]">{dateStr}</span>
        <BiChevronRight className="h-6 w-6 text-[#98A2B3]" />
      </div>
    </button>
  );
}

// ---------------------------------------------------------------------------
// Main component
// ---------------------------------------------------------------------------

export function EmployeeAuditComponent() {
  const { authToken, employee, loading: sessionLoading } = useEmployeeSession();
  const [search, setSearch] = useState("");
  const [filterAction, setFilterAction] = useState<FilterAction>("");
  const [detailLog, setDetailLog] = useState<AuditLog | null>(null);
  const [previewDoc, setPreviewDoc] = useState<Document | null>(null);
  const [previewError, setPreviewError] = useState<string | null>(null);
  const [signatureOpen, setSignatureOpen] = useState(false);
  const [signatureMode, setSignatureMode] = useState<"reuse" | "redraw">("reuse");
  const [signatureData, setSignatureData] = useState("");
  const [passcode, setPasscode] = useState("");
  const [usePasscode, setUsePasscode] = useState(false);
  const [signatureError, setSignatureError] = useState<string | null>(null);
  const [activeSignLog, setActiveSignLog] = useState<AuditLog | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const drawingRef = useRef(false);

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

  const {
    data: signatureStatusData,
    refetch: refetchSignatureStatus,
  } = useQuery(GET_SIGNATURE_STATUS, {
    skip: !authToken,
    context: { headers: buildGraphQLHeaders({ authToken }) },
    fetchPolicy: "network-only",
  });

  const [signAuditLog, { loading: signing }] = useMutation(SIGN_AUDIT_LOG, {
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

  function openSignatureModal(log: AuditLog) {
    setActiveSignLog(log);
    setSignatureOpen(true);
    setSignatureError(null);
    setSignatureMode(hasSignature ? "reuse" : "redraw");
    setSignatureData("");
    setPasscode("");
    setUsePasscode(false);
  }

  async function handleSaveSignature() {
    if (!activeSignLog) return;
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
      await signAuditLog({
        variables: {
          auditLogId: activeSignLog.id,
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
      await refetchSignatureStatus();
      await refetch();
      setSignatureOpen(false);
      setActiveSignLog(null);
    } catch (err) {
      setSignatureError(
        err instanceof Error ? err.message : "Алдаа гарлаа. Дахин оролдоно уу.",
      );
    }
  }
  const { documents, loading: documentsLoading } = useEmployeeDocuments({
    authToken,
    employeeId: employee?.id,
  });

  const documentsById = useMemo(
    () => new Map(documents.map((document) => [document.id, document])),
    [documents],
  );

  const auditLogs = useMemo(() => {
    let logs = (data?.auditLogs ?? []).filter(
      (log) => log.action !== "offboard_employee" && log.phase !== "offboarding",
    );

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

    return [...logs].sort(
      (a, b) => b.timestamp.localeCompare(a.timestamp),
    );
  }, [data, search]);

  // Summary counts
  const counts = useMemo(() => {
    const all = data?.auditLogs ?? [];
    return {
      total: all.length,
      docs: all.reduce((sum, l) => sum + l.documentIds.length, 0),
      success: all.filter((l) => l.employeeSigned).length,
    };
  }, [data]);

  const isLoading = sessionLoading || loading || documentsLoading;

  return (
    <div className="min-h-screen bg-white px-6 py-8 text-[#101828]">
      {detailLog && (
        <AuditDetailModal
          log={detailLog}
          documentsById={documentsById}
          onClose={() => setDetailLog(null)}
          onPreview={handlePreviewDocument}
          onSign={() => openSignatureModal(detailLog)}
          signing={signing}
        />
      )}

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
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <button
            type="button"
            aria-label="Close signature modal"
            className="absolute inset-0"
            onClick={() => setSignatureOpen(false)}
          />
          <div className="relative w-[520px] max-w-[92vw] rounded-[24px] border border-[#EAECF0] bg-white p-6 shadow-[0_24px_80px_rgba(0,0,0,0.18)]">
            <div className="mb-5 flex items-start justify-between">
              <div>
                <p className="text-[13px] text-[#98A2B3]">Гарын үсэг</p>
                <h3 className="mt-2 text-[18px] font-semibold text-[#101828]">
                  Гарын үсгээ баталгаажуулах
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setSignatureOpen(false)}
                className="text-[#101828] transition hover:opacity-70"
              >
                <BiX className="h-6 w-6" />
              </button>
            </div>

            {hasSignature ? (
              <div className="mb-4 flex gap-3">
                <label className="flex items-center gap-2 text-[13px] text-[#344054]">
                  <input
                    type="radio"
                    checked={signatureMode === "reuse"}
                    onChange={() => setSignatureMode("reuse")}
                  />
                  Өмнөх гарын үсэг ашиглах
                </label>
                <label className="flex items-center gap-2 text-[13px] text-[#344054]">
                  <input
                    type="radio"
                    checked={signatureMode === "redraw"}
                    onChange={() => setSignatureMode("redraw")}
                  />
                  Дахин зурах
                </label>
              </div>
            ) : null}

            {signatureMode === "redraw" ? (
              <div className="mb-4">
                <div className="mb-2 flex items-center justify-between">
                  <p className="text-[13px] text-[#667085]">Гарын үсгээ зурна уу</p>
                  <button
                    type="button"
                    onClick={clearSignature}
                    className="text-[12px] text-[#667085] hover:text-[#101828]"
                  >
                    Арилгах
                  </button>
                </div>
                <div className="h-40 w-full rounded-2xl border border-[#D0D5DD] bg-white">
                  <canvas
                    ref={canvasRef}
                    className="h-full w-full"
                    onPointerDown={handlePointerDown}
                    onPointerMove={handlePointerMove}
                    onPointerUp={handlePointerUp}
                    onPointerLeave={handlePointerUp}
                  />
                </div>
                <label className="mt-3 flex items-center gap-2 text-[13px] text-[#344054]">
                  <input
                    type="checkbox"
                    checked={usePasscode}
                    onChange={(e) => setUsePasscode(e.target.checked)}
                  />
                  4 оронтой код хадгалах
                </label>
                {usePasscode ? (
                  <input
                    value={passcode}
                    onChange={(e) => setPasscode(e.target.value)}
                    placeholder="0000"
                    className="mt-2 h-10 w-full rounded-[10px] border border-[#D0D5DD] px-3 text-[14px] outline-none"
                    maxLength={4}
                  />
                ) : null}
              </div>
            ) : (
              <div className="mb-4">
                {hasPasscode ? (
                  <input
                    value={passcode}
                    onChange={(e) => setPasscode(e.target.value)}
                    placeholder="4 оронтой код"
                    className="h-10 w-full rounded-[10px] border border-[#D0D5DD] px-3 text-[14px] outline-none"
                    maxLength={4}
                  />
                ) : (
                  <p className="text-[13px] text-[#667085]">
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

            <div className="flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setSignatureOpen(false)}
                className="rounded-xl border border-[#D0D5DD] px-5 py-2 text-[14px] text-[#344054]"
              >
                Болих
              </button>
              <button
                type="button"
                onClick={handleSaveSignature}
                disabled={signing}
                className="rounded-xl bg-[#101828] px-5 py-2 text-[14px] font-medium text-white disabled:opacity-50"
              >
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
            Миний аудит бүртгэл
          </h1>
          <p className="text-[16px] text-[#667085]">
            {employee
              ? `${employee.lastName} ${employee.firstName} — аудит түүх`
              : "Таны баримт бичиг, мэдэгдлийн түүх"}
          </p>
        </div>

        {/* Summary cards */}
        <div className="flex w-full flex-col gap-4 lg:flex-row">
          <div className="flex h-[92px] min-w-0 flex-1 items-center gap-5 rounded-[24px] border border-[#98C1FF] bg-white px-7">
            <div className="flex h-14 w-14 items-center justify-center rounded-[18px] bg-[#2F7BFF] text-white shadow-[0_10px_30px_rgba(47,123,255,0.35)]">
              <FiFileText className="h-6 w-6" />
            </div>
            <div className="flex min-w-0 items-end gap-3">
              <span className="text-[46px] font-semibold leading-none text-[#101828]">
                {counts.total}
              </span>
              <span className="truncate pb-1 text-[14px] text-[#667085]">
                Нийт бүртгэл
              </span>
            </div>
          </div>

          <div className="flex h-[92px] min-w-0 flex-1 items-center gap-5 rounded-[24px] border border-[#86EFAC] bg-white px-7">
            <div className="flex h-14 w-14 items-center justify-center rounded-[18px] bg-[#12C95E] text-white shadow-[0_10px_30px_rgba(18,201,94,0.28)]">
              <FiCheckCircle className="h-6 w-6" />
            </div>
            <div className="flex min-w-0 items-end gap-3">
              <span className="text-[46px] font-semibold leading-none text-[#101828]">
                {counts.success}
              </span>
              <span className="truncate pb-1 text-[14px] text-[#667085]">
                Амжилттай
              </span>
            </div>
          </div>
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
          <select
            value={filterAction}
            onChange={(e) => setFilterAction(e.target.value as FilterAction)}
            className="h-[44px] w-[220px] appearance-none rounded-[12px] border border-[#D0D5DD] bg-white px-4 text-[15px] text-[#667085] outline-none">
            <option value="">Бүх үйлдэл</option>
            <option value="add_employee">Шинэ ажилтан авах</option>
            <option value="promote_employee">Тушаал дэвшүүлэх</option>
            <option value="change_position">Албан тушаал солих</option>
          </select>
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
            Аудит бүртгэлүүд
          </h2>
          <span className="rounded-full border border-[#D0D5DD] bg-[#F9FAFB] px-3 py-1 text-xs text-[#98A2B3]">
            {auditLogs.length} бүртгэл
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
        ) : auditLogs.length === 0 ? (
          <div className="py-16 text-center text-[#98A2B3] text-[15px]">
            Аудит бүртгэл олдсонгүй
          </div>
        ) : (
          <div className="flex flex-col gap-4">
            {auditLogs.map((log) => (
              <AuditRow key={log.id} log={log} onOpen={setDetailLog} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
