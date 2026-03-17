"use client";

import { useHrDashboardData } from "./dashboard-data";
import { HrDashboardOverview } from "./dashboard-overview";

export function HrDashboard() {
  const { auditCount, barData, loading, stats } = useHrDashboardData();

  return (
    <HrDashboardOverview
      auditCount={auditCount}
      barData={barData}
      loading={loading}
      stats={stats}
    />
  );
}
