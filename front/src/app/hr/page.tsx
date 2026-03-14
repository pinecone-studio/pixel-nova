"use client";

import { gql } from "@apollo/client";
import { useApolloClient, useQuery } from "@apollo/client/react";
import { useEffect, useMemo, useState } from "react";
import {
  AuditLog as AuditLogIcon,
  ArrowUpRightIcon,
  BriefcaseIcon,
  CalendarIcon,
  CheckIcon,
  ClockIcon,
  CubaIcon,
  DocIcon,
  FileIcon,
  InsightIcon,
  NotifIcon,
  SettingsIcon,
  TrendIcon,
  UsersIcon,
} from "../components/icons";
import { FiFilter } from "react-icons/fi";
import { GrDocument } from "react-icons/gr";
import { RequestsComponent } from "../components/requestsComponent";
import { WorkersComponent } from "../components/workersComponent";
import { FilesComponent } from "../components/filesComponent";
import { SettingsComponent } from "../components/settingsComponent";
import AuditlogComponent from "../components/auditlogComponent";
import { buildGraphQLHeaders } from "@/lib/apollo-client";
import type { Document, Employee, LeaveRequest, AuditLog } from "@/lib/types";

type NavItem = { key: string; label: string; icon: React.ReactNode };

type DashboardStats = {
  totalEmployees: number;
  pendingRequests: number;
  approvedRequests: number;
  departmentCount: number;
  documentCount: number;
  employeesOnLeave: number;
  approvalRate: number;
  urgentCount: number;
  monthlyGrowth: number;
};

type DashboardRequest = LeaveRequest & {
  urgent: boolean;
  elapsedLabel: string;
  color: string;
};

const GET_EMPLOYEES = gql`
  query GetEmployees($search: String, $status: String, $department: String) {
    employees(search: $search, status: $status, department: $department) {
      id
      employeeCode
      firstName
      lastName
      firstNameEng
      lastNameEng
      entraId
      email
      imageUrl
      github
      department
      branch
      jobTitle
      level
      hireDate
      terminationDate
      status
      numberOfVacationDays
      isSalaryCompany
      isKpi
      birthDayAndMonth
      birthdayPoster
    }
  }
`;

const GET_LEAVE_REQUESTS = gql`
  query GetLeaveRequests($status: String) {
    leaveRequests(status: $status) {
      id
      employeeId
      employee {
        id
        employeeCode
        firstName
        lastName
        department
        jobTitle
        level
      }
      type
      startTime
      endTime
      reason
      status
      note
      createdAt
      updatedAt
    }
  }
`;

const GET_AUDIT_LOGS = gql`
  query GetAuditLogs($employeeId: ID) {
    auditLogs(employeeId: $employeeId) {
      id
      employeeId
      action
      phase
      actorId
      actorRole
      documentIds
      recipientRoles
      recipientEmails
      incompleteFields
      documentsGenerated
      notificationAttempted
      recipientsNotified
      notificationError
      timestamp
    }
  }
`;

const GET_DOCUMENTS = gql`
  query GetDocuments($employeeId: ID!) {
    documents(employeeId: $employeeId) {
      id
      employeeId
      action
      documentName
      storageUrl
      createdAt
    }
  }
`;

const navItems: NavItem[] = [
  { key: "dashboard", label: "Ð¥ÑÐ½Ð°Ð»Ñ‚Ñ‹Ð½ ÑÐ°Ð¼Ð±Ð°Ñ€", icon: <GrDocument /> },
  { key: "users", label: "ÐÐ¶Ð¸Ð»Ñ‚Ð½ÑƒÑƒÐ´", icon: <UsersIcon /> },
  { key: "requests", label: "Ð¥Ò¯ÑÑÐ»Ñ‚Ò¯Ò¯Ð´", icon: <AuditLogIcon /> },
  { key: "files", label: "Ð‘Ð°Ñ€Ð¸Ð¼Ñ‚ Ð±Ð¸Ñ‡Ð³Ò¯Ò¯Ð´", icon: <CubaIcon /> },
  { key: "auditlog", label: "Ð¥ÑÐ½Ð°Ð»Ñ‚Ñ‹Ð½ Ð±Ò¯Ñ€Ñ‚Ð³ÑÐ»", icon: <InsightIcon /> },
  { key: "settings", label: "Ð¢Ð¾Ñ…Ð¸Ñ€Ð³Ð¾Ð¾", icon: <SettingsIcon /> },
];

const avatarColors = [
  "bg-red-500",
  "bg-blue-500",
  "bg-orange-500",
  "bg-gradient-to-br from-purple-500 to-pink-500",
  "bg-gradient-to-br from-teal-400 to-emerald-500",
  "bg-cyan-500",
];

function formatElapsed(value: string) {
  const diff = Date.now() - new Date(value).getTime();
  const hours = Math.max(1, Math.floor(diff / (1000 * 60 * 60)));
  if (hours < 24) return `${hours} Ñ†Ð°Ð³Ð¸Ð¹Ð½ Ó©Ð¼Ð½Ó©`;
  const days = Math.floor(hours / 24);
  if (days < 30) return `${days} Ó©Ð´Ñ€Ð¸Ð¹Ð½ Ó©Ð¼Ð½Ó©`;
  const months = Math.floor(days / 30);
  return `${months} ÑÐ°Ñ€Ñ‹Ð½ Ó©Ð¼Ð½Ó©`;
}

function getApprovalRate(requests: LeaveRequest[]) {
  if (requests.length === 0) return 0;
  const approved = requests.filter((request) => request.status === "approved").length;
  return Math.round((approved / requests.length) * 100);
}

function getMonthlyGrowth(employees: Employee[]) {
  if (employees.length === 0) return 0;
  const thisMonth = new Date();
  const monthStart = new Date(thisMonth.getFullYear(), thisMonth.getMonth(), 1);
  const previousMonthStart = new Date(thisMonth.getFullYear(), thisMonth.getMonth() - 1, 1);
  const previousMonthEnd = new Date(thisMonth.getFullYear(), thisMonth.getMonth(), 0, 23, 59, 59);

  const currentNew = employees.filter((employee) => new Date(employee.hireDate) >= monthStart).length;
  const previousNew = employees.filter((employee) => {
    const hireDate = new Date(employee.hireDate);
    return hireDate >= previousMonthStart && hireDate <= previousMonthEnd;
  }).length;

  if (previousNew === 0) return currentNew > 0 ? 100 : 0;
  return Number((((currentNew - previousNew) / previousNew) * 100).toFixed(1));
}

function isUrgentRequest(request: LeaveRequest) {
  const ageHours = (Date.now() - new Date(request.createdAt).getTime()) / (1000 * 60 * 60);
  return request.status === "pending" && ageHours >= 24;
}

function buildDashboardRequests(requests: LeaveRequest[]): DashboardRequest[] {
  return requests
    .filter((request) => request.status === "pending")
    .sort(
      (left, right) =>
        new Date(right.createdAt).getTime() - new Date(left.createdAt).getTime(),
    )
    .slice(0, 5)
    .map((request, index) => ({
      ...request,
      urgent: isUrgentRequest(request),
      elapsedLabel: formatElapsed(request.createdAt),
      color: avatarColors[index % avatarColors.length],
    }));
}

export default function HrPage() {
  const apolloClient = useApolloClient();
  const [activeKey, setActiveKey] = useState("dashboard");
  const [documentCount, setDocumentCount] = useState(0);
  const [documentsLoading, setDocumentsLoading] = useState(true);

  const queryContext = useMemo(
    () => ({
      headers: buildGraphQLHeaders({ actorRole: "hr" }),
    }),
    [],
  );

  const { data: employeesData, loading: employeesLoading } = useQuery<{
    employees: Employee[];
  }>(GET_EMPLOYEES, {
    variables: { search: null, status: null, department: null },
    context: queryContext,
    fetchPolicy: "cache-and-network",
  });

  const { data: leaveRequestsData, loading: leaveRequestsLoading } = useQuery<{
    leaveRequests: LeaveRequest[];
  }>(GET_LEAVE_REQUESTS, {
    variables: { status: null },
    context: queryContext,
    fetchPolicy: "cache-and-network",
  });

  const { data: auditLogsData, loading: auditLogsLoading } = useQuery<{
    auditLogs: AuditLog[];
  }>(GET_AUDIT_LOGS, {
    variables: { employeeId: null },
    context: queryContext,
    fetchPolicy: "cache-and-network",
  });

  const employees = employeesData?.employees ?? [];
  const requests = leaveRequestsData?.leaveRequests ?? [];
  const auditLogs = auditLogsData?.auditLogs ?? [];
  const loading =
    employeesLoading || leaveRequestsLoading || auditLogsLoading || documentsLoading;

  useEffect(() => {
    let cancelled = false;

    async function loadDocumentCount() {
      if (employees.length === 0) {
        setDocumentCount(0);
        setDocumentsLoading(false);
        return;
      }

      setDocumentsLoading(true);

      try {
        const allDocuments = await Promise.all(
          employees.map((employee) =>
            apolloClient.query<{ documents: Document[] }>({
              query: GET_DOCUMENTS,
              variables: { employeeId: employee.id },
              context: queryContext,
              fetchPolicy: "network-only",
            }),
          ),
        );

        if (cancelled) {
          return;
        }

        setDocumentCount(
          allDocuments.reduce(
            (total, result) => total + (result.data?.documents?.length ?? 0),
            0,
          ),
        );
      } catch (error) {
        if (!cancelled) {
          console.error(error);
          setDocumentCount(0);
        }
      } finally {
        if (!cancelled) {
          setDocumentsLoading(false);
        }
      }
    }

    void loadDocumentCount();

    return () => {
      cancelled = true;
    };
  }, [apolloClient, employees, queryContext]);

  const stats = useMemo<DashboardStats>(() => {
    const departments = new Set(
      employees.map((employee) => employee.department).filter(Boolean),
    ).size;

    const pendingRequests = requests.filter((request) => request.status === "pending").length;
    const approvedRequests = requests.filter((request) => request.status === "approved").length;
    const onLeaveStatuses = new Set(["Ð§Ó©Ð»Ó©Ó©Ñ‚ÑÐ¹", "ÐÐ¼Ñ€Ð°Ð»Ñ‚Ñ‚Ð°Ð¹", "Ð¢Ò¯Ñ€ Ñ‡Ó©Ð»Ó©Ó©Ñ‚ÑÐ¹"]);
    const employeesOnLeave = employees.filter((employee) =>
      onLeaveStatuses.has(employee.status),
    ).length;

    return {
      totalEmployees: employees.length,
      pendingRequests,
      approvedRequests,
      departmentCount: departments,
      documentCount,
      employeesOnLeave,
      approvalRate: getApprovalRate(requests),
      urgentCount: requests.filter(isUrgentRequest).length,
      monthlyGrowth: getMonthlyGrowth(employees),
    };
  }, [documentCount, employees, requests]);

  const dashboardRequests = useMemo(
    () => buildDashboardRequests(requests),
    [requests],
  );

  const barData = useMemo(() => {
    const months = Array.from({ length: 12 }, (_, index) => index);
    const currentYear = new Date().getFullYear();

    return months.map((month) => {
      const count = employees.filter((employee) => {
        const hireDate = new Date(employee.hireDate);
        return hireDate.getFullYear() === currentYear && hireDate.getMonth() === month;
      }).length;

      return count === 0 ? 8 : Math.min(88, count * 10);
    });
  }, [employees]);

  const auditCount = auditLogs.length;

  const renderContent = () => {
    if (activeKey === "users") return <WorkersComponent />;
    if (activeKey === "requests") return <RequestsComponent />;
    if (activeKey === "files") return <FilesComponent />;
    if (activeKey === "auditlog") return <AuditlogComponent />;
    if (activeKey === "settings") return <SettingsComponent />;

    return (
      <>
        <div className="rounded-2xl border border-white/8 bg-linear-to-br from-[#0e2b26] to-[#092a25] p-6 relative overflow-hidden">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_right,rgba(10,212,177,0.08),transparent_60%)] pointer-events-none" />
          <div className="relative flex items-start justify-between">
            <div>
              <p className="text-xs uppercase tracking-[0.2em] text-white font-medium mb-3">
                ÐÐ¸Ð¹Ñ‚ Ð°Ð¶Ð¸Ð»Ñ‡Ð¸Ð´
              </p>
              <div className="flex items-center gap-3 mb-1">
                <p className="text-5xl font-bold text-[#0ad4b1]">
                  {loading ? "..." : stats.totalEmployees}
                </p>
                <span className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-[#0ad4b1]/15 text-[#0ad4b1] text-xs font-semibold">
                  <ArrowUpRightIcon className="w-3.5 h-3.5" /> {stats.monthlyGrowth >= 0 ? "+" : ""}
                  {stats.monthlyGrowth}%
                </span>
              </div>
              <p className="text-white text-sm">
                Audit Ð±Ò¯Ñ€Ñ‚Ð³ÑÐ»: {loading ? "..." : auditCount}
              </p>
            </div>
            <div className="w-14 h-14 rounded-2xl bg-[#0ad4b1] flex items-center justify-center shadow-[0_8px_24px_rgba(10,212,177,0.4)]">
              <UsersIcon />
            </div>
          </div>
          <div className="mt-6 flex items-end gap-2 h-16">
            {barData.map((height, index) => (
              <div
                key={index}
                className="flex-1 rounded-sm bg-[#0ad4b1]/30 hover:bg-[#0ad4b1]/60 transition-colors"
                style={{ height: `${(height / 88) * 100}%` }}
              />
            ))}
          </div>
        </div>
        <div className="grid grid-cols-2 gap-5">
          <div className="rounded-2xl border border-white/8 bg-[#130c06] p-6 relative overflow-hidden">
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_right,rgba(255,165,0,0.5),black_70%)] pointer-events-none" />
            <div className="relative">
              <div className="flex items-start justify-between mb-4">
                <div className="w-11 h-11 rounded-xl bg-orange-500 flex items-center justify-center shadow-[0_6px_20px_rgba(251,146,60,0.4)]">
                  <ClockIcon className="w-5 h-5 text-white" />
                </div>
                <button className="text-slate-600 hover:text-slate-400 text-lg">
                  ...
                </button>
              </div>
              <p className="text-slate-400 text-sm mb-3">Ð¥Ò¯Ð»ÑÑÐ³Ð´ÑÐ¶ Ð±ÑƒÐ¹</p>
              <p className="text-4xl font-bold text-white mb-3">
                {loading ? "..." : stats.pendingRequests}
              </p>
              <div className="flex items-center gap-1.5 text-orange-400 text-xs">
                <ClockIcon className="w-3.5 h-3.5" />
                <span>{loading ? "..." : stats.urgentCount} ÑÐ°Ñ€Ð°Ð»Ñ‚Ð°Ð¹</span>
              </div>
            </div>
          </div>
          <div className="rounded-2xl border border-white/8 bg-[#071210] p-6 relative overflow-hidden">
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_right,rgba(10,212,177,0.07),transparent_60%)] pointer-events-none" />
            <div className="relative">
              <div className="flex items-start justify-between mb-4">
                <div className="w-11 h-11 rounded-xl bg-[#0ad4b1] flex items-center justify-center shadow-[0_6px_20px_rgba(10,212,177,0.4)]">
                  <CheckIcon className="w-5 h-5 text-[#060d0c]" />
                </div>
                <button className="text-slate-600 hover:text-slate-400 text-lg">
                  ...
                </button>
              </div>
              <p className="text-slate-400 text-sm mb-3">Ð‘Ð°Ñ‚Ð°Ð»ÑÐ°Ð½</p>
              <p className="text-4xl font-bold text-white mb-3">
                {loading ? "..." : stats.approvedRequests}
              </p>
              <div className="flex items-center gap-1.5 text-[#0ad4b1] text-xs">
                <ArrowUpRightIcon className="w-3.5 h-3.5" />
                <span>Ð‘Ð°Ñ‚Ð»Ð°Ñ… Ñ…ÑƒÐ²ÑŒ {stats.approvalRate}%</span>
              </div>
            </div>
          </div>
        </div>
        <div className="grid grid-cols-4 gap-4">
          {[
            {
              icon: <BriefcaseIcon />,
              value: loading ? "..." : String(stats.departmentCount),
              label: "Ð¥ÑÐ»Ñ‚ÑÑ",
              color: "bg-blue-500/20 text-blue-400",
            },
            {
              icon: <FileIcon />,
              value: loading ? "..." : String(stats.documentCount),
              label: "Ð‘Ð°Ñ€Ð¸Ð¼Ñ‚",
              color: "bg-purple-500/20 text-purple-400",
            },
            {
              icon: <CalendarIcon />,
              value: loading ? "..." : String(stats.employeesOnLeave),
              label: "Ð§Ó©Ð»Ó©Ó©Ñ‚ÑÐ¹",
              color: "bg-pink-500/20 text-pink-400",
            },
            {
              icon: <TrendIcon />,
              value: loading ? "..." : `${stats.approvalRate}%`,
              label: "Ð¨Ð¸Ð¹Ð´Ð²ÑÑ€Ð»ÑÐ»Ñ‚",
              color: "bg-[#0ad4b1]/20 text-[#0ad4b1]",
            },
          ].map((stat) => (
            <div
              key={stat.label}
              className="rounded-2xl border border-white/8 bg-[#0a0f0e] p-4 flex items-center gap-4"
            >
              <div
                className={`w-10 h-10 rounded-xl flex items-center justify-center ${stat.color}`}
              >
                {stat.icon}
              </div>
              <div>
                <p className="text-white text-xl font-bold leading-tight">
                  {stat.value}
                </p>
                <p className="text-slate-500 text-xs mt-0.5">{stat.label}</p>
              </div>
            </div>
          ))}
        </div>
        <div className="rounded-2xl border border-[#0ad4b1]/40 bg-[#0a0f0e] overflow-hidden">
          <div className="flex items-center justify-between px-6 py-5 border-b border-dashed border-[#0ad4b1]/30">
            <div>
              <p className="text-white text-xl font-bold">Ð¥Ò¯Ð»ÑÑÐ³Ð´ÑÐ¶ Ð±ÑƒÐ¹ Ñ…Ò¯ÑÑÐ»Ñ‚Ò¯Ò¯Ð´</p>
              <p className="text-slate-500 text-sm mt-0.5">
                Ð¡Ò¯Ò¯Ð»Ð¸Ð¹Ð½ pending leave request-Ò¯Ò¯Ð´
              </p>
            </div>
            <div className="flex items-center gap-3">
              <button className="flex items-center gap-2 h-9 px-4 rounded-lg border border-white/10 text-slate-300 text-sm hover:border-white/20 transition-colors">
                <FiFilter /> Ð¨Ò¯Ò¯Ñ…
              </button>
              <button
                onClick={() => setActiveKey("requests")}
                className="flex items-center gap-2 h-9 px-4 rounded-lg bg-[#085044] text-[#0ad4b1] text-sm font-semibold hover:bg-[#0ad4b1]/20 transition-colors"
              >
                Ð‘Ò¯Ð³Ð´Ð¸Ð¹Ð³ Ñ…Ð°Ñ€Ð°Ñ… <ArrowUpRightIcon className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
          <div className="flex flex-col">
            {loading ? (
              <div className="px-6 py-8 text-sm text-slate-500">Ð£Ð½ÑˆÐ¸Ð¶ Ð±Ð°Ð¹Ð½Ð°...</div>
            ) : dashboardRequests.length === 0 ? (
              <div className="px-6 py-8 text-sm text-slate-500">
                Pending Ñ…Ò¯ÑÑÐ»Ñ‚ Ð¾Ð»Ð´ÑÐ¾Ð½Ð³Ò¯Ð¹
              </div>
            ) : (
              dashboardRequests.map((request) => (
                <div
                  key={request.id}
                  className="flex items-center gap-4 px-6 py-4 border-b border-white/5 hover:bg-white/2 transition-colors cursor-pointer"
                  onClick={() => setActiveKey("requests")}
                >
                  <div
                    className={`w-11 h-11 rounded-xl ${request.color} flex items-center justify-center text-white text-base font-bold shrink-0`}
                  >
                    {request.employee.firstName.charAt(0)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="text-white text-sm font-semibold">
                        {request.employee.lastName} {request.employee.firstName}
                      </p>
                      {request.urgent && (
                        <span className="px-2 py-0.5 rounded-full bg-red-500/20 text-red-400 text-xs font-medium border border-red-500/20">
                          Ð¯Ð°Ñ€Ð°Ð»Ñ‚Ð°Ð¹
                        </span>
                      )}
                    </div>
                    <p className="text-slate-500 text-xs mt-0.5">{request.type}</p>
                  </div>
                  <span className="text-slate-600 text-sm shrink-0">
                    {request.elapsedLabel}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>
      </>
    );
  };

  return (
    <div className="min-h-screen bg-[#060d0c] flex flex-col">
      <div className="flex flex-1">
        <aside className="group w-16 hover:w-60 transition-[width] duration-300 border-r border-white/8 bg-[#060d0c] flex flex-col py-4 px-2 shrink-0">
          <div className="mb-8 flex justify-center">
            <div className="w-9 h-9 rounded-xl bg-[#0ad4b1]/15 border border-[#0ad4b1]/30 flex items-center justify-center">
              <DocIcon />
            </div>
          </div>
          <div className="flex flex-col gap-1 flex-1">
            {navItems.map((item) => {
              const active = activeKey === item.key;
              return (
                <button
                  key={item.key}
                  onClick={() => setActiveKey(item.key)}
                  className={`relative flex items-center gap-3 rounded-xl px-2 py-2 transition-all duration-200 text-left w-full ${
                    active
                      ? "bg-[#0ad4b1]/10 text-[#0ad4b1] border border-[#0ad4b1]/25 shadow-[0_0_12px_rgba(10,212,177,0.15)]"
                      : "text-slate-500 hover:text-slate-200 hover:bg-white/5 border border-transparent"
                  }`}
                >
                  {active && (
                    <span className="absolute left-0 top-1/2 -translate-y-1/2 w-0.75 h-5 rounded-r-full bg-[#0ad4b1] shadow-[0_0_8px_rgba(10,212,177,0.8)]" />
                  )}
                  <span
                    className={`flex h-9 w-9 items-center justify-center rounded-lg shrink-0 transition-all ${active ? "bg-[#0ad4b1]/15" : ""}`}
                  >
                    {item.icon}
                  </span>
                  <span className="whitespace-nowrap text-sm font-medium opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                    {item.label}
                  </span>
                </button>
              );
            })}
          </div>
          <button className="flex items-center gap-3 rounded-xl px-2 py-2 hover:bg-white/5 transition-colors">
            <span className="flex h-9 w-9 items-center justify-center rounded-full bg-linear-to-br from-purple-500 to-pink-500 text-white text-xs font-bold shrink-0">
              HR
            </span>
            <span className="whitespace-nowrap text-sm text-slate-400 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
              HR Team
            </span>
          </button>
        </aside>

        <main className="flex-1 overflow-y-auto flex flex-col">
          <header className="h-14 border-b border-white/8 flex items-center justify-between px-6 shrink-0 bg-[#060d0c]">
            <div className="flex items-center gap-2 text-sm">
              <span className="text-slate-500">HR</span>
              <span className="text-slate-600">â€º</span>
              <span className="text-[#0ad4b1] font-semibold">
                {navItems.find((item) => item.key === activeKey)?.label}
              </span>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={() => setActiveKey("users")}
                className="flex items-center gap-2 h-9 px-4 rounded-lg border cursor-pointer border-[#0ad4b1]/50 bg-linear-to-br from-[#0a3b33] to-[#0ad4b1]/20 text-white text-sm font-medium hover:border-[#0ad4b1] transition-colors"
              >
                <span>ï¼‹</span> ÐÐ¶Ð¸Ð»Ñ‚Ð°Ð½ Ð½ÑÐ¼ÑÑ…
              </button>
              <div className="relative">
                <button className="h-9 w-9 rounded-lg border border-[#0ad4b1] cursor-pointer text-slate-300 flex items-center justify-center hover:border-white/40 transition-colors">
                  <NotifIcon />
                </button>
                <span className="absolute -top-1.5 -right-1.5 w-4 h-4 rounded-full bg-[#0ad4b1] text-[#060d0c] text-[9px] font-bold flex items-center justify-center">
                  {stats.pendingRequests}
                </span>
              </div>
            </div>
          </header>
          <div className="flex-1 px-6 py-6 flex flex-col gap-5">{renderContent()}</div>
        </main>
      </div>
    </div>
  );
}
