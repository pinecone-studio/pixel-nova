"use client";

import { useRouter } from "next/navigation";

import { useHrDashboardData } from "./dashboard-data";
import { HrDashboardOverview } from "./dashboard-overview";

export function HrDashboard() {
  const router = useRouter();
  const { auditCount, barData, dashboardRequests, loading, stats } =
    useHrDashboardData();

  return (
    <HrDashboardOverview
      auditCount={auditCount}
      barData={barData}
      dashboardRequests={dashboardRequests}
      loading={loading}
      onOpenRequests={() => router.push("/hr/requests")}
      stats={stats}
    />
  );
}
