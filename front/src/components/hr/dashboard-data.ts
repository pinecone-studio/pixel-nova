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
  departmentCount: number;
  documentCount: number;
  monthlyGrowth: number;
};

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

  const { data: auditLogsData, loading: auditLogsLoading } = useQuery<{
    auditLogs: AuditLog[];
  }>(GET_AUDIT_LOGS, {
    variables: { employeeId: null },
    context: queryContext,
    fetchPolicy: "cache-and-network",
  });

  const { data: pendingRequestsData, loading: pendingLoading } = useQuery<{
    leaveRequests: LeaveRequest[];
  }>(GET_LEAVE_REQUESTS, {
    variables: { status: "pending" },
    context: queryContext,
    fetchPolicy: "cache-and-network",
  });

  const employees = useMemo(() => employeesData?.employees ?? [], [employeesData]);
  const auditLogs = useMemo(() => auditLogsData?.auditLogs ?? [], [auditLogsData]);
  const loading =
    employeesLoading || auditLogsLoading || documentsLoading || pendingLoading;

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

    return {
      totalEmployees: employees.length,
      departmentCount: departments,
      documentCount,
      monthlyGrowth: getMonthlyGrowth(employees),
    };
  }, [documentCount, employees]);

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
    loading,
    stats,
    pendingRequests: pendingRequestsData?.leaveRequests ?? [],
  };
}
