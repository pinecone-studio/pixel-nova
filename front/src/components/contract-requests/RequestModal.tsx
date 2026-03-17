import { useState } from "react";
import type { ContractRequest } from "@/lib/types";
import { formatDepartment } from "@/lib/labels";
import { StatusBadge } from "./StatusBadge";
import { formatTemplateLabel } from "./utils";

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

export const RequestModal = ({
  row,
  onClose,
  onApprove,
  onReject,
}: {
  row: ContractRequest;
  onClose: () => void;
  onApprove: (id: string, note: string) => Promise<void>;
  onReject: (id: string, note: string) => Promise<void>;
}) => {
  const [note, setNote] = useState(row.note ?? "");
  const [acting, setActing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const initials = getInitials(row.employee.firstName, row.employee.lastName);
  const color = avatarColor(row.employeeId);

  async function handleApprove() {
    setError(null);
    setActing(true);
    try {
      await onApprove(row.id, note);
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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm" onClick={onClose}>
      <div className="relative w-[460px] max-w-[95vw] bg-[#0f1520] rounded-3xl border border-slate-700/60 shadow-2xl p-6 flex flex-col gap-5" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="w-14 h-14 rounded-full overflow-hidden shrink-0">
              <div className={`w-full h-full ${color} flex items-center justify-center text-white font-bold text-lg`}>
                {initials}
              </div>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <p className="text-white font-bold text-xl">
                  {row.employee.lastName} {row.employee.firstName}
                </p>
                <StatusBadge status={row.status} />
              </div>
              <p className="text-slate-400 text-sm mt-0.5">
                {row.employee.employeeCode} • {formatDepartment(row.employee.department)}
              </p>
            </div>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white transition-colors text-xl leading-none mt-1">
            ✕
          </button>
        </div>

        <div className="h-px bg-slate-700/50" />

        <div className="bg-[#161d2b] rounded-2xl p-4 flex flex-col gap-3">
          <p className="text-white font-semibold text-base">Сонгосон гэрээнүүд</p>
          <div className="flex flex-wrap gap-2">
            {row.templateIds.map((id) => (
              <span key={id} className="rounded-full border border-[#00CC99]/30 bg-[#00CC99]/10 px-2.5 py-1 text-[11px] text-[#9BEBD7]">
                {formatTemplateLabel(id)}
              </span>
            ))}
          </div>
          <p className="text-xs text-slate-500">
            Илгээсэн огноо: {new Date(row.createdAt).toLocaleDateString("mn-MN")}
          </p>
        </div>

        <div className="flex flex-col gap-2">
          <p className="text-white font-semibold text-base">
            Тайлбар <span className="text-slate-500 font-normal">(Заавал биш)</span>
          </p>
          <textarea
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="Энд бичнэ үү..."
            rows={3}
            className="w-full bg-[#161d2b] border border-slate-700/50 rounded-2xl px-4 py-3 text-slate-300 text-sm placeholder:text-slate-600 outline-none resize-none focus:border-blue-500/50 transition-colors"
          />
        </div>

        {error ? (
          <p className="text-red-400 text-xs bg-red-500/10 border border-red-500/20 rounded-lg px-3 py-2">{error}</p>
        ) : null}

        {row.status === "pending" ? (
          <div className="flex items-center justify-end gap-3 mt-1">
            <button
              onClick={handleReject}
              disabled={acting}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl border border-red-500/50 text-red-400 text-sm font-medium hover:bg-red-500/10 disabled:opacity-50 transition-colors"
            >
              <span>✕</span> Татгалзах
            </button>
            <button
              onClick={handleApprove}
              disabled={acting}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#0ad4b1] text-black text-sm font-medium hover:bg-[#08bfa0] disabled:opacity-50 transition-colors"
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
