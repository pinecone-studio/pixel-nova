"use client";

import { useApolloClient, useQuery } from "@apollo/client/react";
import { useEffect, useMemo, useState } from "react";

import { buildGraphQLHeaders } from "@/lib/apollo-client";
import {
  GET_AUDIT_LOGS,
  GET_DOCUMENTS,
  GET_EMPLOYEES,
  GET_LEAVE_REQUESTS,
} from "@/graphql/queries";
import type { AuditLog, Document, Employee, LeaveRequest } from "@/lib/types";

export type DashboardStats = {
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

export type DashboardRequest = LeaveRequest & {
  urgent: boolean;
  elapsedLabel: string;
  color: string;
};

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
  if (hours < 24) return `${hours} Ã‘â€ ÃÂ°ÃÂ³ÃÂ¸ÃÂ¹ÃÂ½ Ã“Â©ÃÂ¼ÃÂ½Ã“Â©`;
  const days = Math.floor(hours / 24);
  if (days < 30) return `${days} Ã“Â©ÃÂ´Ã‘â‚¬ÃÂ¸ÃÂ¹ÃÂ½ Ã“Â©ÃÂ¼ÃÂ½Ã“Â©`;
  const months = Math.floor(days / 30);
  return `${months} Ã‘ÂÃÂ°Ã‘â‚¬Ã‘â€¹ÃÂ½ Ã“Â©ÃÂ¼ÃÂ½Ã“Â©`;
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

export function useHrDashboardData() {
  const apolloClient = useApolloClient();
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

  const employees = useMemo(() => employeesData?.employees ?? [], [employeesData]);
  const requests = useMemo(
    () => leaveRequestsData?.leaveRequests ?? [],
    [leaveRequestsData],
  );
  const auditLogs = useMemo(() => auditLogsData?.auditLogs ?? [], [auditLogsData]);
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

        if (cancelled) return;

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
    const onLeaveStatuses = new Set([
      "ÃÂ§Ã“Â©ÃÂ»Ã“Â©Ã“Â©Ã‘â€šÃ‘ÂÃÂ¹",
      "ÃÂÃÂ¼Ã‘â‚¬ÃÂ°ÃÂ»Ã‘â€šÃ‘â€šÃÂ°ÃÂ¹",
      "ÃÂ¢Ã’Â¯Ã‘â‚¬ Ã‘â€¡Ã“Â©ÃÂ»Ã“Â©Ã“Â©Ã‘â€šÃ‘ÂÃÂ¹",
    ]);
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

  return {
    auditCount: auditLogs.length,
    barData,
    dashboardRequests,
    loading,
    stats,
  };
}
