"use client";

import { useMutation, useQuery } from "@apollo/client/react";
import { useEffect, useRef, useState } from "react";
import { BiToggleLeft, BiToggleRight } from "react-icons/bi";

import { GET_EMPLOYER_SIGNATURE_STATUS } from "@/graphql/queries";
import { SAVE_EMPLOYER_SIGNATURE } from "@/graphql/mutations";
import { buildGraphQLHeaders } from "@/lib/apollo-client";

const STORAGE_KEY = "epas_hr_settings";

export const SettingsComponent = () => {
  const saveTimerRef = useRef<number | null>(null);
  const signatureCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const signatureDrawingRef = useRef(false);

  const [saveState, setSaveState] = useState<"idle" | "saved">("idle");
  const [signatureModeOverride, setSignatureModeOverride] = useState<
    "reuse" | "redraw" | null
  >(null);
  const [signatureData, setSignatureData] = useState("");
  const [passcode, setPasscode] = useState("");
  const [signatureMessage, setSignatureMessage] = useState<string | null>(null);
  const [signatureError, setSignatureError] = useState<string | null>(null);

  const {
    data: signatureStatusData,
    loading: signatureStatusLoading,
    refetch,
  } = useQuery<{
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
  });

  const [saveEmployerSignature, { loading: signatureSaving }] = useMutation(
    SAVE_EMPLOYER_SIGNATURE,
    {
      context: {
        headers: buildGraphQLHeaders({ actorRole: "hr" }),
      },
    },
  );

  const signatureStatus = signatureStatusData?.employerSignatureStatus ?? null;
  const hasSignature = signatureStatus?.hasSignature ?? false;
  const hasPasscode = signatureStatus?.hasPasscode ?? false;
  const signatureMode =
    signatureModeOverride ?? (hasSignature ? "reuse" : "redraw");

  useEffect(() => {
    if (signatureMode !== "redraw") {
      return;
    }

    const canvas = signatureCanvasRef.current;
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
  }, [signatureMode]);

  function persist(next: Record<string, boolean>) {
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      setSaveState("saved");
      if (saveTimerRef.current) {
        window.clearTimeout(saveTimerRef.current);
      }
      saveTimerRef.current = window.setTimeout(
        () => setSaveState("idle"),
        1800,
      );
    } catch (error) {
      console.error(error);
    }
  }

  function getCanvasPoint(event: React.PointerEvent<HTMLCanvasElement>) {
    const canvas = signatureCanvasRef.current!;
    const rect = canvas.getBoundingClientRect();
    return { x: event.clientX - rect.left, y: event.clientY - rect.top };
  }

  function handlePointerDown(event: React.PointerEvent<HTMLCanvasElement>) {
    if (signatureMode !== "redraw") return;
    const canvas = signatureCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    signatureDrawingRef.current = true;
    const { x, y } = getCanvasPoint(event);
    ctx.beginPath();
    ctx.moveTo(x, y);
  }

  function handlePointerMove(event: React.PointerEvent<HTMLCanvasElement>) {
    if (!signatureDrawingRef.current || signatureMode !== "redraw") return;
    const canvas = signatureCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const { x, y } = getCanvasPoint(event);
    ctx.lineTo(x, y);
    ctx.stroke();
  }

  function handlePointerUp() {
    if (!signatureDrawingRef.current || signatureMode !== "redraw") return;
    signatureDrawingRef.current = false;
    const canvas = signatureCanvasRef.current;
    if (!canvas) return;
    setSignatureData(canvas.toDataURL("image/png"));
  }

  function clearSignature() {
    const canvas = signatureCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    setSignatureData("");
  }

  async function handleSaveSignature() {
    setSignatureError(null);
    setSignatureMessage(null);

    if (signatureMode === "reuse") {
      setSignatureMessage("Хадгалсан гарын үсгийг ашиглана.");
      return;
    }

    if (!signatureData) {
      setSignatureError("Гарын үсгээ зурна уу.");
      return;
    }

    if (passcode && !/^[0-9]{4}$/.test(passcode)) {
      setSignatureError("4 оронтой код оруулна уу.");
      return;
    }

    try {
      await saveEmployerSignature({
        variables: {
          signatureData,
          passcode: passcode || null,
        },
      });
      await refetch();
      setSignatureMessage("Ажил олгогчийн гарын үсэг амжилттай хадгалагдлаа.");
      setPasscode("");
      setSignatureModeOverride("reuse");
    } catch (error) {
      setSignatureError(
        error instanceof Error
          ? error.message
          : "Гарын үсэг хадгалах үед алдаа гарлаа.",
      );
    }
  }

  return (
    <div className="flex flex-col gap-5">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-slate-900 text-2xl font-bold tracking-tight">
            Тохиргоо
          </p>
          <p className="text-slate-500 text-sm mt-1">
            Системийн ерөнхий тохиргоо болон хувийн сонголтууд
          </p>
        </div>
        <div className="text-xs text-slate-400 mt-1">
          {saveState === "saved" ? "Локал дээр хадгалагдлаа" : " "}
        </div>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-[0_1px_2px_rgba(15,23,42,0.06)]">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-slate-900 font-semibold text-lg">
              Ажил олгогчийн гарын үсэг
            </p>
            <p className="text-slate-500 text-sm mt-1">
              Шинэ ажилтан нэмэх болон HR баталгаажуулалттай баримтуудад
              ашиглана.
            </p>
          </div>
          {signatureStatusLoading ? null : hasSignature ? (
            <span className="rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs font-medium text-emerald-600">
              Хадгалсан
            </span>
          ) : (
            <span className="rounded-full border border-amber-200 bg-amber-50 px-3 py-1 text-xs font-medium text-amber-600">
              Хадгалаагүй
            </span>
          )}
        </div>

        <div className="mt-5 flex flex-col gap-4">
          {hasSignature ? (
            <div className="flex items-center gap-3">
              <button
                onClick={() => setSignatureModeOverride("reuse")}
                className={`rounded-lg border px-3 py-2 text-sm transition-colors ${
                  signatureMode === "reuse"
                    ? "border-slate-900 bg-slate-900 text-white"
                    : "border-slate-200 bg-white text-slate-600 hover:border-slate-300"
                }`}
              >
                Одоогийн гарын үсэг
              </button>
              <button
                onClick={() => setSignatureModeOverride("redraw")}
                className={`rounded-lg border px-3 py-2 text-sm transition-colors ${
                  signatureMode === "redraw"
                    ? "border-slate-900 bg-slate-900 text-white"
                    : "border-slate-200 bg-white text-slate-600 hover:border-slate-300"
                }`}
              >
                Шинээр зурах
              </button>
            </div>
          ) : null}

          {signatureMode === "reuse" && hasSignature ? (
            <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
              <p className="text-sm text-slate-700">
                Хадгалсан гарын үсгийг ашиглана
                {signatureStatus?.updatedAt
                  ? ` (${new Date(signatureStatus.updatedAt).toLocaleDateString("mn-MN")})`
                  : ""}
                .
              </p>
              <p className="mt-1 text-xs text-slate-500">
                {hasPasscode
                  ? "Энэ гарын үсэг 4 оронтой кодтой хадгалагдсан."
                  : "Энэ гарын үсэг кодгүй хадгалагдсан."}
              </p>
            </div>
          ) : (
            <div className="flex flex-col gap-3">
              <div className="relative">
                <canvas
                  ref={signatureCanvasRef}
                  onPointerDown={handlePointerDown}
                  onPointerMove={handlePointerMove}
                  onPointerUp={handlePointerUp}
                  onPointerLeave={handlePointerUp}
                  className="h-32 w-full cursor-crosshair rounded-xl border border-slate-200 bg-white"
                  style={{ touchAction: "none" }}
                />
                {signatureData ? (
                  <button
                    onClick={clearSignature}
                    className="absolute right-3 top-3 rounded-md bg-white/90 px-2 py-1 text-xs text-slate-500 hover:text-red-500"
                  >
                    Арилгах
                  </button>
                ) : (
                  <p className="pointer-events-none absolute inset-0 flex items-center justify-center text-xs text-slate-300">
                    Энд гарын үсгээ зурна уу
                  </p>
                )}
              </div>

              <div className="flex flex-col gap-2">
                <label className="text-sm font-medium text-slate-900">
                  4 оронтой код (заавал биш)
                </label>
                <input
                  type="password"
                  inputMode="numeric"
                  maxLength={4}
                  value={passcode}
                  onChange={(event) =>
                    setPasscode(event.target.value.replace(/\D/g, ""))
                  }
                  placeholder="1234"
                  className="w-40 rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm tracking-widest text-slate-700 outline-none focus:border-slate-400"
                />
                <p className="text-xs text-slate-500">
                  Хадгалсны дараа энэ signature-ийг зарим үйлдэл дээр кодоор
                  баталгаажуулж ашиглаж болно.
                </p>
              </div>
            </div>
          )}

          {signatureMessage ? (
            <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-600">
              {signatureMessage}
            </div>
          ) : null}

          {signatureError ? (
            <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
              {signatureError}
            </div>
          ) : null}

          <div className="flex justify-end">
            <button
              onClick={handleSaveSignature}
              disabled={
                signatureSaving ||
                (signatureMode === "redraw" && !signatureData)
              }
              className="rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-medium text-white w-[116px] h-[36px] transition-colors hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {signatureSaving ? "Хадгалж байна..." : "Хадгалах"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
