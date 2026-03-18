"use client";

import { useMutation, useQuery } from "@apollo/client/react";
import { useEffect, useMemo, useRef, useState } from "react";
import { BiChevronDown, BiChevronUp, BiGridAlt, BiListUl } from "react-icons/bi";

import { GET_MY_CONTRACT_REQUESTS, GET_SIGNATURE_STATUS } from "@/graphql/queries";
import { SAVE_MY_SIGNATURE } from "@/graphql/mutations";
import { buildGraphQLHeaders } from "@/lib/apollo-client";
import type { ContractRequest } from "@/lib/types";

const TOKEN_KEY = "epas_auth_token";

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

export const MyContractRequests = () => {
  const token =
    typeof window === "undefined"
      ? ""
      : window.localStorage.getItem(TOKEN_KEY) ?? "";

  const { data, loading, error } = useQuery<{
    myContractRequests: ContractRequest[];
  }>(GET_MY_CONTRACT_REQUESTS, {
    skip: !token,
    context: {
      headers: buildGraphQLHeaders({ authToken: token }),
    },
    fetchPolicy: "network-only",
  });

  const {
    data: signatureStatusData,
    loading: signatureStatusLoading,
    refetch: refetchSignatureStatus,
  } = useQuery<{
    mySignatureStatus: {
      hasSignature: boolean;
      hasPasscode: boolean;
      updatedAt?: string | null;
    };
  }>(GET_SIGNATURE_STATUS, {
    skip: !token,
    context: {
      headers: buildGraphQLHeaders({ authToken: token }),
    },
    fetchPolicy: "network-only",
  });

  const [saveSignature, { loading: savingSignature }] = useMutation(
    SAVE_MY_SIGNATURE,
    {
      context: {
        headers: buildGraphQLHeaders({ authToken: token }),
      },
    },
  );

  const rows = useMemo(() => data?.myContractRequests ?? [], [data]);
  const [expanded, setExpanded] = useState(false);
  const [viewMode, setViewMode] = useState<"list" | "grid">("list");
  const sortedRows = useMemo(
    () =>
      [...rows].sort(
        (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
      ),
    [rows],
  );
  const visibleRows = expanded ? sortedRows : sortedRows.slice(0, 5);
  const groupedRows = useMemo(() => {
    const grouped = new Map<string, ContractRequest[]>();
    visibleRows.forEach((row) => {
      const label = new Date(row.createdAt).toLocaleDateString("mn-MN", {
        year: "numeric",
        month: "long",
      });
      if (!grouped.has(label)) grouped.set(label, []);
      grouped.get(label)?.push(row);
    });
    return grouped;
  }, [visibleRows]);

  const [signatureOpen, setSignatureOpen] = useState(false);
  const [activeRequest, setActiveRequest] = useState<ContractRequest | null>(null);
  const [signatureMode, setSignatureMode] = useState<"reuse" | "redraw">("reuse");
  const [signatureData, setSignatureData] = useState("");
  const [passcode, setPasscode] = useState("");
  const [usePasscode, setUsePasscode] = useState(false);
  const [signatureError, setSignatureError] = useState<string | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const drawingRef = useRef(false);

  const signatureStatus = signatureStatusData?.mySignatureStatus ?? null;
  const hasSignature = signatureStatus?.hasSignature ?? false;

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

  function openSignatureModal(row: ContractRequest) {
    setActiveRequest(row);
    setSignatureOpen(true);
    setSignatureError(null);
    setSignatureMode(hasSignature ? "reuse" : "redraw");
    setSignatureData("");
    setPasscode("");
    setUsePasscode(false);
  }

  async function handleSaveSignature() {
    setSignatureError(null);
    if (signatureMode === "reuse") {
      setSignatureOpen(false);
      return;
    }
    if (!signatureData) {
      setSignatureError("Гарын үсгээ зурна уу.");
      return;
    }
    if (usePasscode && passcode.length !== 4) {
      setSignatureError("4 оронтой кодоо бүрэн оруулна уу.");
      return;
    }
    try {
      await saveSignature({
        variables: {
          signatureData,
          passcode: usePasscode ? passcode : null,
        },
      });
      await refetchSignatureStatus();
      setSignatureOpen(false);
    } catch (err) {
      setSignatureError(
        err instanceof Error ? err.message : "Алдаа гарлаа. Дахин оролдоно уу.",
      );
    }
  }

  return (
    <section className="mx-auto flex w-full max-w-[1056px] flex-col gap-4 animate-fade-up">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <h2 className="text-[20px] font-semibold tracking-[-0.02em] text-white">
            Миний гэрээний хүсэлтүүд
          </h2>
          <span className="rounded-full border border-[#233246] bg-[#162130] px-3 py-1 text-[12px] font-medium text-[#94A3B8]">
            {rows.length} хүсэлт
          </span>
        </div>
        <div className="flex items-center gap-2 rounded-full border border-white/10 bg-white/5 p-1">
          <button
            type="button"
            onClick={() => setViewMode("list")}
            className={`flex items-center gap-1 rounded-full px-3 py-1 text-xs font-medium transition ${
              viewMode === "list"
                ? "bg-white text-[#0B0E14]"
                : "text-slate-300 hover:text-white"
            }`}
          >
            <BiListUl className="text-sm" />
            Жагсаалт
          </button>
          <button
            type="button"
            onClick={() => setViewMode("grid")}
            className={`flex items-center gap-1 rounded-full px-3 py-1 text-xs font-medium transition ${
              viewMode === "grid"
                ? "bg-white text-[#0B0E14]"
                : "text-slate-300 hover:text-white"
            }`}
          >
            <BiGridAlt className="text-sm" />
            Grid
          </button>
        </div>
      </div>

      {error ? (
        <div className="rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-300">
          {error.message}
        </div>
      ) : null}

      <div className="rounded-xl border border-white/5 bg-[#0B0E14]/40">
        {loading ? (
          <div className="p-6 flex flex-col gap-3">
            <div className="h-4 w-40 rounded-full skeleton" />
            <div className="h-3 w-64 rounded-full skeleton" />
            <div className="h-3 w-52 rounded-full skeleton" />
          </div>
        ) : rows.length === 0 ? (
          <div className="flex flex-col items-center justify-center gap-2 py-10 text-center text-[#7C8698] text-sm">
            Одоогоор гэрээний хүсэлт байхгүй.
          </div>
        ) : viewMode === "grid" ? (
          <div className="flex flex-col gap-4 p-4">
            {[...groupedRows.entries()].map(([month, monthRows]) => (
              <div key={month} className="flex flex-col gap-3">
                <div className="text-xs uppercase tracking-[0.18em] text-slate-400">
                  {month}
                </div>
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
                  {monthRows.map((row) => (
                    <div
                      key={row.id}
                      className="rounded-xl border border-white/10 bg-white/5 px-4 py-4 flex flex-col gap-3"
                    >
                      <div className="flex items-center justify-between">
                        <p className="text-xs text-slate-500">
                          {new Date(row.createdAt).toLocaleDateString("mn-MN")}
                        </p>
                        <StatusBadge status={row.status} />
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {row.templateIds.map((id) => (
                          <span
                            key={id}
                            className="rounded-full border border-white/10 bg-white/5 px-2 py-0.5 text-[11px] text-slate-300"
                          >
                            {formatTemplateLabel(id)}
                          </span>
                        ))}
                      </div>
                      {row.status === "pending" ? (
                        <button
                          type="button"
                          onClick={() => openSignatureModal(row)}
                          className="mt-1 rounded-lg border border-white/10 bg-white/5 px-3 py-1.5 text-[12px] text-white hover:bg-white/10 transition-colors"
                        >
                          Гарын үсэг зурах
                        </button>
                      ) : null}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="flex flex-col gap-4">
            {[...groupedRows.entries()].map(([month, monthRows], groupIndex) => (
              <div key={month} className="flex flex-col">
                <div className="px-4 pt-4 text-xs uppercase tracking-[0.18em] text-slate-400">
                  {month}
                </div>
                <div
                  className={`flex flex-col divide-y divide-white/10 ${
                    groupIndex === 0 ? "pt-2" : "pt-1"
                  }`}
                >
                  {monthRows.map((row) => (
                    <div key={row.id} className="px-4 py-4 flex flex-col gap-2">
                      <div className="flex items-center justify-between">
                        <div className="flex flex-wrap gap-2">
                          {row.templateIds.map((id) => (
                            <span
                              key={id}
                              className="rounded-full border border-white/10 bg-white/5 px-2 py-0.5 text-[11px] text-slate-300"
                            >
                              {formatTemplateLabel(id)}
                            </span>
                          ))}
                        </div>
                        <StatusBadge status={row.status} />
                      </div>
                      <p className="text-xs text-slate-500">
                        Илгээсэн огноо:{" "}
                        {new Date(row.createdAt).toLocaleDateString("mn-MN")}
                      </p>
                      {row.status === "pending" ? (
                        <div className="flex justify-end">
                          <button
                            type="button"
                            onClick={() => openSignatureModal(row)}
                            className="rounded-lg border border-white/10 bg-white/5 px-3 py-1.5 text-[12px] text-white hover:bg-white/10 transition-colors"
                          >
                            Гарын үсэг зурах
                          </button>
                        </div>
                      ) : null}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {rows.length > 5 ? (
        <div className="flex justify-center">
          <button
            type="button"
            onClick={() => setExpanded((prev) => !prev)}
            className="flex items-center gap-1 text-xs text-[#9BEBD7] hover:text-white transition-colors"
          >
            {expanded ? "Хаах" : "Бүгдийг харах"}
            {expanded ? (
              <BiChevronUp className="text-base" />
            ) : (
              <BiChevronDown className="text-base" />
            )}
          </button>
        </div>
      ) : null}

      {signatureOpen ? (
        <div className="fixed inset-0 z-60 flex items-center justify-center">
          <button
            type="button"
            aria-label="Close signature"
            className="absolute inset-0 bg-black/70"
            onClick={() => setSignatureOpen(false)}
          />
          <div className="relative w-[640px] max-w-[92vw] rounded-2xl border border-white/10 bg-[#0B0E14] p-6 text-white shadow-2xl">
            <div className="flex items-center justify-between">
              <div className="flex flex-col">
                <p className="text-sm font-semibold">Гарын үсэг баталгаажуулах</p>
                <p className="text-xs text-slate-400">
                  {activeRequest ? `Хүсэлт #${activeRequest.id.slice(0, 6)}` : ""}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setSignatureOpen(false)}
                className="h-8 w-8 rounded-lg bg-white/5 text-slate-300 hover:bg-white/10"
              >
                ×
              </button>
            </div>

            <div className="mt-4 rounded-lg border border-white/10 bg-[#040d18] p-3 flex flex-col gap-3">
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium text-white">Гарын үсэг</p>
                {signatureStatusLoading ? (
                  <span className="text-xs text-gray-500">Уншиж байна...</span>
                ) : null}
              </div>

              {signatureStatusLoading ? null : hasSignature ? (
                <div className="flex flex-wrap gap-3 text-sm text-gray-300">
                  <label className="flex items-center gap-2">
                    <input
                      type="radio"
                      name="signature-mode"
                      checked={signatureMode === "reuse"}
                      onChange={() => setSignatureMode("reuse")}
                      className="h-4 w-4 text-[#00CC99] border-[#1a2035] bg-[#040d18] focus:ring-0"
                    />
                    Өмнөх гарын үсэг ашиглах
                  </label>
                  <label className="flex items-center gap-2">
                    <input
                      type="radio"
                      name="signature-mode"
                      checked={signatureMode === "redraw"}
                      onChange={() => setSignatureMode("redraw")}
                      className="h-4 w-4 text-[#00CC99] border-[#1a2035] bg-[#040d18] focus:ring-0"
                    />
                    Дахин зурах
                  </label>
                </div>
              ) : (
                <p className="text-xs text-gray-500">
                  Эхний удаа гарын үсгээ зурж баталгаажуулна.
                </p>
              )}

              {signatureMode === "redraw" ? (
                <>
                  <div className="rounded-lg border border-dashed border-[#1a2035] bg-[#020812] p-3">
                    <canvas
                      ref={canvasRef}
                      onPointerDown={handlePointerDown}
                      onPointerMove={handlePointerMove}
                      onPointerUp={handlePointerUp}
                      onPointerLeave={handlePointerUp}
                      className="h-30 w-full cursor-crosshair rounded-md"
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <p className="text-xs text-gray-500">
                      Хуруу/хулганаар гарын үсгээ зурна уу.
                    </p>
                    <button
                      type="button"
                      onClick={clearSignature}
                      className="text-xs text-gray-400 hover:text-white transition-colors"
                    >
                      Арилгах
                    </button>
                  </div>

                  <div className="flex items-center gap-2">
                    <input
                      id="use-passcode"
                      type="checkbox"
                      checked={usePasscode}
                      onChange={(e) => {
                        setUsePasscode(e.target.checked);
                        setSignatureError(null);
                      }}
                      className="h-4 w-4 rounded border-[#1a2035] bg-[#040d18] text-[#00CC99] focus:ring-0"
                    />
                    <label htmlFor="use-passcode" className="text-sm text-gray-300">
                      4 оронтой код тохируулах (заавал биш)
                    </label>
                  </div>

                  {usePasscode && (
                    <div className="flex flex-col gap-1.5">
                      <label className="text-sm font-medium text-white">
                        Нууц код
                      </label>
                      <input
                        inputMode="numeric"
                        pattern="[0-9]*"
                        maxLength={4}
                        placeholder="0000"
                        className="rounded-lg border border-[#1a2035] bg-[#040d18] px-3 py-2 text-sm text-white outline-none focus:border-[#00CC99]"
                        value={passcode}
                        onChange={(e) =>
                          setPasscode(e.target.value.replace(/\D/g, ""))
                        }
                      />
                    </div>
                  )}
                </>
              ) : (
                <p className="text-xs text-gray-500">
                  Танай гарын үсэг хадгалагдсан байна.
                </p>
              )}
            </div>

            {signatureError ? (
              <p className="mt-3 text-red-400 text-xs bg-red-500/10 border border-red-500/20 rounded-lg px-3 py-2">
                {signatureError}
              </p>
            ) : null}

            <div className="mt-4 flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setSignatureOpen(false)}
                className="rounded-lg border border-white/10 px-4 py-2 text-xs text-slate-300 hover:text-white hover:bg-white/5 transition-colors"
              >
                Болих
              </button>
              <button
                type="button"
                onClick={handleSaveSignature}
                disabled={savingSignature}
                className="rounded-lg bg-[#00CC99] px-4 py-2 text-xs font-semibold text-[#0B0E14] hover:bg-[#19d6a7] transition-colors disabled:opacity-60"
              >
                {savingSignature ? "Хадгалж байна..." : "Хадгалах"}
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </section>
  );
};
