import type { ReactNode } from "react";

interface DashboardAdsLayoutProps {
  children: ReactNode;
}

export default function DashboardAdsLayout({
  children,
}: DashboardAdsLayoutProps) {
  // Independent room: authentication is enforced silently by middleware.
  return <>{children}</>;
}
