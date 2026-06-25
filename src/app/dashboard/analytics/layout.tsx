import type { ReactNode } from "react";

interface DashboardAnalyticsLayoutProps {
  children: ReactNode;
}

export default function DashboardAnalyticsLayout({
  children,
}: DashboardAnalyticsLayoutProps) {
  // Independent room: authentication is enforced silently by middleware.
  return <>{children}</>;
}
