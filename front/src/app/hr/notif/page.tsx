"use client";

import { useQuery } from "@apollo/client/react";
import { useMemo } from "react";

import { BellIcon } from "@/components/icons";
import { GET_CONTRACT_REQUESTS } from "@/graphql/queries";
import { buildGraphQLHeaders } from "@/lib/apollo-client";
import type { ContractRequest } from "@/lib/types";
import { formatDepartment } from "@/lib/labels";

type NotifItem = {
  id: string;
  title: string;
  body: string;
  status: "pending" | "approved" | "rejected";
  date: string;
  audience: string;
};

const StatusBadge = ({ status }: { status: NotifItem["status"] }) => {
  const styles: Record<NotifItem["status"], string> = {
    pending: "bg-yellow-600/30 text-yellow-400 border border-yellow-600/40",
    approved: "bg-green-600/30 text-green-400 border border-green-600/40",
    rejected: "bg-red-600/30 text-red-400 border border-red-600/40",
  };
  const labels: Record<NotifItem["status"], string> = {
    pending: "Хүлээгдэж буй",
    approved: "Баталсан",
    rejected: "Татгалзсан",
  };
  return (
    <span
      className={`text-xs px-2.5 py-0.5 rounded-full font-medium ${styles[status]}`}
    >
      {labels[status]}
    </span>
  );
};

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

function buildContractBody(row: ContractRequest) {
  const labels = row.templateIds.map(formatTemplateLabel).join(", ");
  return `${row.employee.lastName} ${row.employee.firstName} • ${formatDepartment(row.employee.department)} • ${labels}`;
}

export default function NotificationsPage() {
  const { data: contractData, loading: contractsLoading } = useQuery<{
    contractRequests: ContractRequest[];
  }>(GET_CONTRACT_REQUESTS, {
    context: {
      headers: buildGraphQLHeaders({ actorRole: "hr" }),
    },
    fetchPolicy: "network-only",
  });

  const notifs = useMemo(() => {
    const contractRows = (contractData?.contractRequests ?? []).map((row) => ({
      id: `contract-${row.id}`,
      title: "Гэрээний хүсэлт",
      body: buildContractBody(row),
      status: row.status,
      date: row.createdAt,
      audience: "HR",
    }));
    return contractRows.sort(
      (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime(),
    );
  }, [contractData]);

  const totalCount = notifs.length;
  const pendingCount = notifs.filter((n) => n.status === "pending").length;
  const approvedCount = notifs.filter((n) => n.status === "approved").length;

  const loading = contractsLoading;

  return (
    <div className="min-h-screen bg-[#080c12] text-white font-sans animate-fade-up">
      <div className="p-6 flex flex-col gap-6">
        <div className="grid grid-cols-3 gap-4">
          <div className="rounded-2xl border border-slate-700/40 bg-gradient-to-br from-emerald-600/15 to-transparent p-5 flex items-center gap-4">
            <div className="w-11 h-11 rounded-xl bg-emerald-500/20 flex items-center justify-center text-emerald-400 flex-shrink-0">
              <BellIcon />
            </div>
            <div>
              <p className="text-white text-4xl font-bold">{totalCount}</p>
              <p className="text-slate-400 text-sm mt-0.5">Нийт мэдэгдэл</p>
            </div>
          </div>

          <div className="rounded-2xl border border-slate-700/40 bg-gradient-to-br from-cyan-600/15 to-transparent p-5 flex items-center gap-4">
            <div className="w-11 h-11 rounded-xl bg-cyan-500/20 flex items-center justify-center text-cyan-400 flex-shrink-0">
              <BellIcon />
            </div>
            <div>
              <p className="text-white text-4xl font-bold">{pendingCount}</p>
              <p className="text-slate-400 text-sm mt-0.5">Хүлээгдэж буй</p>
            </div>
          </div>

          <div className="rounded-2xl border border-slate-700/40 bg-gradient-to-br from-blue-600/15 to-transparent p-5 flex items-center gap-4">
            <div className="w-11 h-11 rounded-xl bg-blue-500/20 flex items-center justify-center text-blue-400 flex-shrink-0">
              <BellIcon />
            </div>
            <div>
              <p className="text-white text-4xl font-bold">{approvedCount}</p>
              <p className="text-slate-400 text-sm mt-0.5">Баталсан</p>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between">
          <p className="text-white text-xl font-bold">Шинэ мэдэгдлүүд</p>
          <span className="text-xs text-slate-500">
            {loading ? "Ачаалж байна..." : `${notifs.length} мэдэгдэл`}
          </span>
        </div>

        <div className="flex flex-col gap-3">
          {loading ? (
            <div className="rounded-2xl border border-slate-700/40 bg-[#0d1117] p-6 flex flex-col gap-3">
              <div className="h-4 w-56 rounded-full skeleton" />
              <div className="h-3 w-72 rounded-full skeleton" />
              <div className="h-3 w-64 rounded-full skeleton" />
            </div>
          ) : notifs.length === 0 ? (
            <div className="rounded-2xl border border-slate-700/40 bg-[#0d1117] p-6 text-sm text-slate-500">
              Одоогоор мэдэгдэл алга байна.
            </div>
          ) : (
            notifs.map((notif) => (
              <div
                key={notif.id}
                className="rounded-2xl border border-slate-700/40 bg-[#0d1117] px-5 py-4 flex items-start gap-4 hover:border-slate-600/50 transition-colors"
              >
                <div className="w-10 h-10 rounded-xl bg-emerald-500/15 border border-emerald-500/20 flex items-center justify-center text-emerald-400 flex-shrink-0 mt-0.5">
                  <BellIcon />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2.5 flex-wrap mb-1">
                    <p className="text-white font-semibold text-sm">
                      {notif.title}
                    </p>
                    <StatusBadge status={notif.status} />
                  </div>
                  <p className="text-slate-400 text-sm leading-relaxed line-clamp-2 mb-2">
                    {notif.body}
                  </p>
                  <div className="flex items-center gap-4 flex-wrap">
                    <span className="text-slate-500 text-xs">
                      {new Date(notif.date).toLocaleDateString("mn-MN")}
                    </span>
                    <span className="text-slate-500 text-xs">{notif.audience}</span>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
