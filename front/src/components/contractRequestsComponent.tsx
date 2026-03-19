"use client";

import { useLazyQuery, useMutation, useQuery } from "@apollo/client/react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import {
  FiChevronDown,
  FiChevronUp,
  FiDownload,
  FiEdit3,
  FiEye,
  FiFileText,
  FiFilter,
  FiRefreshCw,
  FiSearch,
} from "react-icons/fi";

import {
  APPROVE_CONTRACT_REQUEST,
  REJECT_CONTRACT_REQUEST,
  SAVE_EMPLOYER_SIGNATURE,
} from "@/graphql/mutations";
import {
  GET_CONTRACT_REQUESTS,
  GET_DOCUMENTS,
  GET_DOCUMENT_CONTENT,
  GET_EMPLOYER_SIGNATURE_STATUS,
} from "@/graphql/queries";
import { buildGraphQLHeaders } from "@/lib/apollo-client";
import type { ContractRequest, Document, DocumentContent } from "@/lib/types";
import { formatDepartment } from "@/lib/labels";
import { useHrOverlay } from "@/components/hr/overlay-context";

const StatusBadge = ({ status }: { status: string }) => {
  const styles: Record<string, string> = {
    pending: "bg-yellow-600/30 text-yellow-400 border border-yellow-600/40",
    approved: "bg-green-600/30 text-green-400 border border-green-600/40",
    rejected: "bg-red-600/30 text-red-400 border border-red-600/40",
  };
  const label: Record<string, string> = {
    pending: "Хүлээгдэж буй",
    approved: "Баталсан",
    rejected: "Татгалзсан",
  };
  return (
    <span
      className={`text-xs px-3 py-1 rounded-full font-medium whitespace-nowrap ${styles[status] ?? "bg-slate-600/30 text-slate-400"}`}
    >
      {label[status] ?? status}
    </span>
  );
};

function getInitials(firstName: string, lastName: string) {
  return `${lastName.charAt(0)}${firstName.charAt(0)}`.toUpperCase();
}

const avatarColors = [
  "bg-cyan-500",
  "bg-purple-500",
  "bg-teal-500",
  "bg-blue-600",
  "bg-orange-500",
  "bg-pink-500",
  "bg-indigo-500",
];

function avatarColor(str: string) {
  let h = 0;
  for (let i = 0; i < str.length; i++) {
    h = (h * 31 + str.charCodeAt(i)) & 0xffffffff;
  }
  return avatarColors[Math.abs(h) % avatarColors.length];
}

const TEMPLATE_LABELS: Record<string, string> = {
  employment_contract: "Хөдөлмөрийн гэрээ",
  probation_order: "Туршилтаар авах тушаал",
  job_description: "Албан тушаалын тодорхойлолт",
  nda: "Нууцын гэрээ",
  salary_increase_order: "Цалин нэмэх тушаал",
  position_update_order: "Албан тушаал өөрчлөх тушаал",
  contract_addendum: "Гэрээний нэмэлт",
  termination_order: "Ажил дуусгавар болгох тушаал",
  handover_sheet: "Хүлээлгэн өгөх акт",
};

function formatTemplateLabel(id: string) {
  return TEMPLATE_LABELS[id] ?? id;
}

function formatTemplateFilename(id: string, index: number) {
  const prefix = String(index + 1).padStart(2, "0");
  return `${prefix}_${id}.pdf`;
}

function buildDataUrl(content: DocumentContent) {
  if (content.contentType === "application/pdf") {
    return `data:${content.contentType};base64,${content.content}`;
  }
  if (content.contentType.startsWith("text/")) {
    return `data:${content.contentType};charset=utf-8,${encodeURIComponent(content.content)}`;
  }
  return `data:${content.contentType};base64,${content.content}`;
}

const RequestModal = ({
  row,
  onClose,
  onApprove,
  onReject,
}: {
  row: ContractRequest;
  onClose: () => void;
  onApprove: (
    id: string,
    note: string,
    employerSig: {
      mode: string;
      signatureData?: string;
      passcode?: string;
    },
  ) => Promise<void>;
  onReject: (id: string, note: string) => Promise<void>;
}) => {
  const [note, setNote] = useState(row.note ?? "");
  const [acting, setActing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Employer signature states
  const [employerSignMode, setEmployerSignMode] = useState<"reuse" | "redraw">(
    "reuse",
  );
  const [employerPasscode, setEmployerPasscode] = useState("");
  const [employerSignatureData, setEmployerSignatureData] = useState("");
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const drawingRef = useRef(false);

  const { data: sigStatusData } = useQuery<{
    employerSignatureStatus: {
      hasSignature: boolean;
      hasPasscode: boolean;
      updatedAt: string | null;
    };
  }>(GET_EMPLOYER_SIGNATURE_STATUS, {
    context: {
      headers: buildGraphQLHeaders({ actorRole: "hr" }),
    },
    fetchPolicy: "network-only",
  });

  const sigStatus = sigStatusData?.employerSignatureStatus;
  const hasExistingSig = sigStatus?.hasSignature ?? false;
  const hasPasscode = sigStatus?.hasPasscode ?? false;

  // Auto-switch to redraw if no existing sig
  useEffect(() => {
    if (sigStatus && !sigStatus.hasSignature) {
      setEmployerSignMode("redraw");
    }
  }, [sigStatus]);

  // Canvas setup
  useEffect(() => {
    if (employerSignMode !== "redraw") return;
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
  }, [employerSignMode]);

  function getCanvasPoint(e: React.PointerEvent<HTMLCanvasElement>) {
    const canvas = canvasRef.current!;
    const rect = canvas.getBoundingClientRect();
    return { x: e.clientX - rect.left, y: e.clientY - rect.top };
  }

  function handlePointerDown(e: React.PointerEvent<HTMLCanvasElement>) {
    if (employerSignMode !== "redraw") return;
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
    if (!drawingRef.current || employerSignMode !== "redraw") return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const { x, y } = getCanvasPoint(e);
    ctx.lineTo(x, y);
    ctx.stroke();
  }

  function handlePointerUp() {
    if (!drawingRef.current || employerSignMode !== "redraw") return;
    drawingRef.current = false;
    const canvas = canvasRef.current;
    if (!canvas) return;
    setEmployerSignatureData(canvas.toDataURL("image/png"));
  }

  const clearCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    setEmployerSignatureData("");
  }, []);

  const initials = getInitials(row.employee.firstName, row.employee.lastName);
  const color = avatarColor(row.employeeId);

  async function handleApprove() {
    setError(null);

    // Validate employer signature
    if (employerSignMode === "redraw" && !employerSignatureData) {
      setError("Ажил олгогчийн гарын үсгээ зурна уу.");
      return;
    }
    if (employerSignMode === "reuse" && hasPasscode && !employerPasscode) {
      setError("4 оронтой кодоо оруулна уу.");
      return;
    }

    setActing(true);
    try {
      await onApprove(row.id, note, {
        mode: employerSignMode,
        signatureData:
          employerSignMode === "redraw" ? employerSignatureData : undefined,
        passcode: employerPasscode || undefined,
      });
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Алдаа гарлаа.");
    } finally {
      setActing(false);
    }
  }

  async function handleReject() {
    setError(null);
    setActing(true);
    try {
      await onReject(row.id, note);
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Алдаа гарлаа.");
    } finally {
      setActing(false);
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="relative w-[520px] max-w-[95vw] max-h-[90vh] overflow-y-auto bg-white rounded-3xl border border-slate-200 shadow-[0_28px_60px_rgba(15,23,42,0.12)] p-6 flex flex-col gap-5"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="w-14 h-14 rounded-full overflow-hidden shrink-0">
              <div
                className={`w-full h-full ${color} flex items-center justify-center text-white font-bold text-lg`}
              >
                {initials}
              </div>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <p className="text-slate-900 font-bold text-xl">
                  {row.employee.lastName} {row.employee.firstName}
                </p>
                <StatusBadge status={row.status} />
              </div>
              <p className="text-slate-500 text-sm mt-0.5">
                {row.employee.employeeCode} •{" "}
                {formatDepartment(row.employee.department)}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-700 transition-colors text-xl leading-none mt-1"
          >
            ✕
          </button>
        </div>

        <div className="h-px bg-slate-200" />

        <div className="bg-slate-50 rounded-2xl p-4 flex flex-col gap-3 border border-slate-200">
          <p className="text-slate-900 font-semibold text-base">
            Сонгосон гэрээнүүд
          </p>
          <div className="flex flex-wrap gap-2">
            {row.templateIds.map((id) => (
              <span
                key={id}
                className="rounded-full border border-emerald-200 bg-emerald-50 px-2.5 py-1 text-[11px] text-emerald-600"
              >
                {formatTemplateLabel(id)}
              </span>
            ))}
          </div>
          <p className="text-xs text-slate-500">
            Илгээсэн огноо:{" "}
            {new Date(row.createdAt).toLocaleDateString("mn-MN")}
          </p>
        </div>

        {/* Employer Signature Section */}
        {row.status === "pending" ? (
          <div className="bg-blue-50/50 rounded-2xl p-4 flex flex-col gap-3 border border-blue-200/60">
            <div className="flex items-center justify-between">
              <p className="text-slate-900 font-semibold text-base">
                Ажил олгогчийн гарын үсэг
              </p>
              {hasExistingSig ? (
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setEmployerSignMode("reuse")}
                    className={`text-xs px-3 py-1.5 rounded-lg border transition-colors ${
                      employerSignMode === "reuse"
                        ? "bg-blue-600 text-white border-blue-600"
                        : "bg-white text-slate-600 border-slate-200 hover:border-slate-300"
                    }`}
                  >
                    <FiRefreshCw className="inline mr-1 text-[10px]" />
                    Дахин ашиглах
                  </button>
                  <button
                    onClick={() => setEmployerSignMode("redraw")}
                    className={`text-xs px-3 py-1.5 rounded-lg border transition-colors ${
                      employerSignMode === "redraw"
                        ? "bg-blue-600 text-white border-blue-600"
                        : "bg-white text-slate-600 border-slate-200 hover:border-slate-300"
                    }`}
                  >
                    <FiEdit3 className="inline mr-1 text-[10px]" />
                    Шинээр зурах
                  </button>
                </div>
              ) : null}
            </div>

            {employerSignMode === "reuse" && hasExistingSig ? (
              <div className="flex flex-col gap-2">
                <p className="text-xs text-slate-500">
                  Хадгалсан гарын үсгээ ашиглах
                  {sigStatus?.updatedAt
                    ? ` (${new Date(sigStatus.updatedAt).toLocaleDateString("mn-MN")})`
                    : ""}
                </p>
                {hasPasscode ? (
                  <input
                    type="password"
                    inputMode="numeric"
                    maxLength={4}
                    value={employerPasscode}
                    onChange={(e) =>
                      setEmployerPasscode(e.target.value.replace(/\D/g, ""))
                    }
                    placeholder="4 оронтой код"
                    className="w-36 bg-white border border-slate-200 rounded-xl px-3 py-2 text-sm text-slate-700 outline-none focus:border-blue-300 tracking-widest text-center"
                  />
                ) : (
                  <p className="text-xs text-emerald-600">
                    Код шаардлагагүй — шууд батлах боломжтой.
                  </p>
                )}
              </div>
            ) : (
              <div className="flex flex-col gap-2">
                <p className="text-xs text-slate-500">
                  {hasExistingSig
                    ? "Шинэ гарын үсэг зурж хуучныг солих"
                    : "Гарын үсэг олдсонгүй — шинээр зурна уу"}
                </p>
                <div className="relative">
                  <canvas
                    ref={canvasRef}
                    onPointerDown={handlePointerDown}
                    onPointerMove={handlePointerMove}
                    onPointerUp={handlePointerUp}
                    onPointerLeave={handlePointerUp}
                    className="h-24 w-full cursor-crosshair rounded-xl bg-white border border-slate-200"
                    style={{ touchAction: "none" }}
                  />
                  {employerSignatureData ? (
                    <button
                      onClick={clearCanvas}
                      className="absolute top-2 right-2 text-xs text-slate-400 hover:text-red-500 bg-white/80 rounded-md px-2 py-1"
                    >
                      Арилгах
                    </button>
                  ) : (
                    <p className="absolute inset-0 flex items-center justify-center text-xs text-slate-300 pointer-events-none">
                      Энд гарын үсгээ зурна уу
                    </p>
                  )}
                </div>
                <input
                  type="password"
                  inputMode="numeric"
                  maxLength={4}
                  value={employerPasscode}
                  onChange={(e) =>
                    setEmployerPasscode(e.target.value.replace(/\D/g, ""))
                  }
                  placeholder="4 оронтой код (заавал биш)"
                  className="w-48 bg-white border border-slate-200 rounded-xl px-3 py-2 text-sm text-slate-700 outline-none focus:border-blue-300 tracking-widest"
                />
              </div>
            )}
          </div>
        ) : null}

        <div className="flex flex-col gap-2">
          <p className="text-slate-900 font-semibold text-base">
            Тайлбар{" "}
            <span className="text-slate-500 font-normal">(Заавал биш)</span>
          </p>
          <textarea
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="Энд бичнэ үү..."
            rows={3}
            className="w-full bg-white border border-slate-200 rounded-2xl px-4 py-3 text-slate-700 text-sm placeholder:text-slate-400 outline-none resize-none focus:border-slate-300 transition-colors"
          />
        </div>

        {error ? (
          <p className="text-red-500 text-xs bg-red-50 border border-red-200 rounded-lg px-3 py-2">
            {error}
          </p>
        ) : null}

        {row.status === "pending" ? (
          <div className="flex items-center justify-end gap-3 mt-1">
            <button
              onClick={handleReject}
              disabled={acting}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl border border-red-200 text-red-500 text-sm font-medium hover:bg-red-50 disabled:opacity-50 transition-colors"
            >
              <span>✕</span> Татгалзах
            </button>
            <button
              onClick={handleApprove}
              disabled={acting}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-slate-900 text-white text-sm font-medium hover:bg-slate-800 disabled:opacity-50 transition-colors"
            >
              <span>✓</span> {acting ? "Түр хүлээнэ үү..." : "Батлах"}
            </button>
          </div>
        ) : (
          <p className="text-center text-slate-500 text-sm">
            Энэ хүсэлт аль хэдийн <StatusBadge status={row.status} />
          </p>
        )}
      </div>
    </div>
  );
};

export const ContractRequestsComponent = () => {
  const [activeStatus, setActiveStatus] = useState("all");
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState<ContractRequest | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [docCache, setDocCache] = useState<Record<string, Document[]>>({});
  const [previewOpen, setPreviewOpen] = useState(false);
  const [previewContent, setPreviewContent] = useState<DocumentContent | null>(
    null,
  );
  const [previewError, setPreviewError] = useState<string | null>(null);
  const [previewLoading, setPreviewLoading] = useState(false);
  const { setBlurred } = useHrOverlay();

  useEffect(() => {
    setBlurred(Boolean(selected || previewOpen));
    return () => setBlurred(false);
  }, [selected, previewOpen, setBlurred]);

  const { data, loading, error, refetch } = useQuery<{
    contractRequests: ContractRequest[];
  }>(GET_CONTRACT_REQUESTS, {
    context: {
      headers: buildGraphQLHeaders({ actorRole: "hr" }),
    },
    fetchPolicy: "network-only",
  });

  const [approveContractRequest] = useMutation(APPROVE_CONTRACT_REQUEST, {
    context: {
      headers: buildGraphQLHeaders({ actorRole: "hr" }),
    },
  });

  const [rejectContractRequest] = useMutation(REJECT_CONTRACT_REQUEST, {
    context: {
      headers: buildGraphQLHeaders({ actorRole: "hr" }),
    },
  });

  const [loadDocuments] = useLazyQuery<{ documents: Document[] }>(
    GET_DOCUMENTS,
    {
      fetchPolicy: "network-only",
    },
  );

  const [loadDocumentContent] = useLazyQuery<{
    documentContent: DocumentContent | null;
  }>(GET_DOCUMENT_CONTENT, {
    fetchPolicy: "network-only",
  });

  const rows = useMemo(() => data?.contractRequests ?? [], [data]);
  const totalCount = rows.length;
  const pendingCount = rows.filter((row) => row.status === "pending").length;
  const approvedCount = rows.filter((row) => row.status === "approved").length;
  const rejectedCount = rows.filter((row) => row.status === "rejected").length;

  const filtered = rows.filter((row) => {
    if (activeStatus !== "all" && row.status !== activeStatus) return false;
    if (!search.trim()) return true;
    const haystack =
      `${row.employee.firstName} ${row.employee.lastName} ${row.employee.employeeCode} ${row.employee.department}`.toLowerCase();
    return haystack.includes(search.trim().toLowerCase());
  });

  async function handleApprove(
    id: string,
    note: string,
    employerSig: {
      mode: string;
      signatureData?: string;
      passcode?: string;
    },
  ) {
    await approveContractRequest({
      variables: {
        id,
        note,
        employerSignatureMode: employerSig.mode,
        employerSignatureData: employerSig.signatureData,
        employerPasscode: employerSig.passcode,
      },
    });
    await refetch();
    setSuccessMessage("Хүсэлт амжилттай батлагдлаа.");
    setTimeout(() => setSuccessMessage(null), 2000);
  }

  async function handleReject(id: string, note: string) {
    await rejectContractRequest({ variables: { id, note } });
    await refetch();
  }

  async function getDocumentsForEmployee(employeeId: string) {
    if (docCache[employeeId]) return docCache[employeeId];
    const result = await loadDocuments({
      variables: { employeeId },
      context: {
        headers: buildGraphQLHeaders({ actorRole: "hr" }),
      },
    });
    const docs = result.data?.documents ?? [];
    setDocCache((prev) => ({ ...prev, [employeeId]: docs }));
    return docs;
  }

  async function getDocumentByTemplate(
    row: ContractRequest,
    templateId: string,
    index: number,
  ) {
    const docs = await getDocumentsForEmployee(row.employee.id);
    const expectedName = formatTemplateFilename(templateId, index);
    return docs.find((doc) => doc.documentName === expectedName) ?? null;
  }

  async function handlePreview(
    row: ContractRequest,
    templateId: string,
    index: number,
  ) {
    setPreviewOpen(true);
    setPreviewError(null);
    setPreviewLoading(true);
    try {
      const doc = await getDocumentByTemplate(row, templateId, index);
      if (!doc) {
        setPreviewError("Баримт олдсонгүй.");
        return;
      }
      const result = await loadDocumentContent({
        variables: { documentId: doc.id },
        context: {
          headers: buildGraphQLHeaders({ actorRole: "hr" }),
        },
      });
      const content = result.data?.documentContent ?? null;
      if (!content) {
        setPreviewError("Баримтын агуулга олдсонгүй.");
        return;
      }
      setPreviewContent(content);
    } catch (err) {
      setPreviewError(err instanceof Error ? err.message : "Алдаа гарлаа.");
    } finally {
      setPreviewLoading(false);
    }
  }

  async function handleDownload(
    row: ContractRequest,
    templateId: string,
    index: number,
  ) {
    try {
      const doc = await getDocumentByTemplate(row, templateId, index);
      if (!doc) {
        setSuccessMessage("Баримт олдсонгүй.");
        return;
      }
      const result = await loadDocumentContent({
        variables: { documentId: doc.id },
        context: {
          headers: buildGraphQLHeaders({ actorRole: "hr" }),
        },
      });
      const content = result.data?.documentContent ?? null;
      if (!content) {
        setSuccessMessage("Баримтын агуулга олдсонгүй.");
        return;
      }
      const link = window.document.createElement("a");
      link.href = buildDataUrl(content);
      link.download = content.documentName;
      window.document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (err) {
      setSuccessMessage(
        err instanceof Error ? err.message : "Файл татаж чадсангүй.",
      );
    }
  }

  const filters = [
    { key: "all", label: "Бүгд", count: rows.length },
    { key: "pending", label: "Хүлээгдэж буй", count: pendingCount },
    { key: "approved", label: "Баталсан", count: approvedCount },
    { key: "rejected", label: "Татгалзсан", count: rejectedCount },
  ];

  return (
    <div className="flex flex-col gap-6 animate-fade-up">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <h1 className="text-xl font-semibold tracking-tight text-slate-900">
            Гэрээний хүсэлтүүд
          </h1>
          <span className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-medium text-slate-500">
            Нийт {totalCount}
          </span>
        </div>
        <div className="flex items-center gap-2">
          {filters.map((filter) => (
            <span
              key={filter.key}
              className="rounded-full border border-slate-200 bg-white px-3 py-1 text-[11px] font-medium text-slate-500"
            >
              {filter.label} {filter.count}
            </span>
          ))}
        </div>
      </div>
      {successMessage ? (
        <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-600">
          {successMessage}
        </div>
      ) : null}

      <div className="rounded-2xl border border-slate-200 bg-white px-5 py-4 flex flex-wrap items-center gap-3 justify-between shadow-[0_1px_2px_rgba(15,23,42,0.06)]">
        <div className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-600">
          <FiSearch className="text-slate-400" />
          <input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Ажилтны кодоор хайх"
            className="bg-transparent outline-none w-60 text-sm text-slate-600 placeholder:text-slate-400"
          />
        </div>

        <div className="flex items-center gap-2">
          <div className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs text-slate-600">
            <FiFilter className="text-slate-400" />
            <select
              value={activeStatus}
              onChange={(event) => setActiveStatus(event.target.value)}
              className="bg-transparent outline-none text-xs text-slate-600"
            >
              {filters.map((filter) => (
                <option key={filter.key} value={filter.key}>
                  {filter.label} ({filter.count})
                </option>
              ))}
            </select>
          </div>
          <button className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs text-slate-600 hover:text-slate-900">
            <FiDownload className="text-slate-400" />
            Татах
          </button>
        </div>
      </div>

      {error ? (
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-500">
          {error.message}
        </div>
      ) : null}

      <div className="rounded-2xl border border-slate-200 bg-white shadow-[0_1px_2px_rgba(15,23,42,0.06)]">
        {loading ? (
          <div className="p-6 flex flex-col gap-3">
            <div className="h-4 w-48 rounded-full skeleton" />
            <div className="h-3 w-64 rounded-full skeleton" />
            <div className="h-3 w-56 rounded-full skeleton" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="p-6 text-slate-400 text-sm">Хүсэлт байхгүй.</div>
        ) : (
          <div className="divide-y divide-slate-200">
            {filtered.map((row) => {
              const initials = getInitials(
                row.employee.firstName,
                row.employee.lastName,
              );
              const color = avatarColor(row.employeeId);
              return (
                <div
                  key={row.id}
                  role="button"
                  tabIndex={0}
                  onClick={() => setSelected(row)}
                  onKeyDown={(event) => {
                    if (event.key === "Enter" || event.key === " ") {
                      event.preventDefault();
                      setSelected(row);
                    }
                  }}
                  className="w-full text-left px-5 py-4 flex flex-col gap-3 hover:bg-slate-50 transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg overflow-hidden shrink-0">
                        <div
                          className={`w-full h-full ${color} flex items-center justify-center text-white font-semibold text-sm`}
                        >
                          {initials}
                        </div>
                      </div>
                      <div>
                        <p className="text-slate-900 font-medium">
                          {row.employee.lastName} {row.employee.firstName}
                        </p>
                        <p className="text-xs text-slate-500">
                          {row.employee.employeeCode} •{" "}
                          {formatDepartment(row.employee.department)}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="rounded-full border border-[#7aa7ff]/40 bg-[#7aa7ff]/15 px-3 py-1 text-[11px] text-[#a7c1ff]">
                        {row.templateIds.length} гэрээ
                      </span>
                      <button
                        onClick={(event) => {
                          event.stopPropagation();
                          setExpandedId((prev) =>
                            prev === row.id ? null : row.id,
                          );
                        }}
                        className="text-slate-500 hover:text-slate-700 cursor-pointer"
                      >
                        {expandedId === row.id ? (
                          <FiChevronUp className="text-sm" />
                        ) : (
                          <FiChevronDown className="text-sm" />
                        )}
                      </button>
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <p className="text-xs text-slate-500">
                      Илгээсэн огноо:{" "}
                      {new Date(row.createdAt).toLocaleDateString("mn-MN")}
                    </p>
                  </div>
                  {expandedId === row.id ? (
                    <div
                      className="rounded-xl border border-slate-200 bg-white overflow-hidden"
                      onClick={(event) => event.stopPropagation()}
                    >
                      {row.templateIds.map((id, index) => (
                        <div
                          key={id}
                          className={`flex items-center justify-between px-4 py-3 ${index < row.templateIds.length - 1 ? "border-b border-slate-200" : ""}`}
                        >
                          <div className="flex items-center gap-3">
                            <div className="h-9 w-9 rounded-lg border border-slate-200 bg-slate-50 flex items-center justify-center text-slate-500">
                              <FiFileText className="text-base" />
                            </div>
                            <div>
                              <p className="text-sm text-slate-900 font-medium">
                                {formatTemplateLabel(id)}
                              </p>
                              <p className="text-xs text-slate-500">
                                {formatTemplateFilename(id, index)}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center gap-3 text-slate-500">
                            <button
                              onClick={(event) => {
                                event.stopPropagation();
                                handlePreview(row, id, index);
                              }}
                              className="hover:text-slate-900 transition-colors"
                            >
                              <FiEye className="text-sm" />
                            </button>
                            <button
                              onClick={(event) => {
                                event.stopPropagation();
                                handleDownload(row, id, index);
                              }}
                              className="hover:text-slate-900 transition-colors"
                            >
                              <FiDownload className="text-sm" />
                            </button>
                            <span className="text-[11px] text-slate-500">
                              {new Date(row.createdAt).toLocaleDateString(
                                "mn-MN",
                              )}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : null}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {typeof document !== "undefined" && selected
        ? createPortal(
            <RequestModal
              row={selected}
              onClose={() => setSelected(null)}
              onApprove={handleApprove}
              onReject={handleReject}
            />,
            document.body,
          )
        : null}

      {typeof document !== "undefined" && previewOpen
        ? createPortal(
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
              <div
                aria-label="Close preview"
                className="absolute inset-0"
                onClick={() => {
                  setPreviewOpen(false);
                  setPreviewContent(null);
                  setPreviewError(null);
                }}
              />
              <div className="relative w-[920px] max-w-[95vw] h-[82vh] bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-[0_28px_60px_rgba(15,23,42,0.12)]">
                <div className="flex items-center justify-between px-5 py-4 border-b border-slate-200">
                  <p className="text-sm text-slate-900 font-semibold">
                    Inline Preview
                  </p>
                  <button
                    onClick={() => {
                      setPreviewOpen(false);
                      setPreviewContent(null);
                      setPreviewError(null);
                    }}
                    className="text-slate-400 hover:text-slate-700"
                  >
                    ✕
                  </button>
                </div>
                <div className="h-[calc(100%-56px)] bg-slate-50 p-4">
                  {previewLoading ? (
                    <div className="h-full flex items-center justify-center text-slate-500">
                      Ачаалж байна...
                    </div>
                  ) : previewError ? (
                    <div className="h-full flex items-center justify-center text-red-500">
                      {previewError}
                    </div>
                  ) : previewContent ? (
                    previewContent.contentType === "text/html" ? (
                      <iframe
                        title={previewContent.documentName}
                        className="w-full h-full rounded-xl bg-white"
                        srcDoc={previewContent.content}
                      />
                    ) : (
                      <iframe
                        title={previewContent.documentName}
                        className="w-full h-full rounded-xl bg-white"
                        src={buildDataUrl(previewContent)}
                      />
                    )
                  ) : (
                    <div className="h-full flex items-center justify-center text-slate-500">
                      Preview бэлэн биш байна.
                    </div>
                  )}
                </div>
              </div>
            </div>,
            document.body,
          )
        : null}
    </div>
  );
};
