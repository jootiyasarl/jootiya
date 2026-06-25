import type { ReactNode } from "react";

interface DashboardProfileLayoutProps {
  children: ReactNode;
}

export default function DashboardProfileLayout({
  children,
}: DashboardProfileLayoutProps) {
  // Independent room: authentication is enforced silently by middleware.
  return <>{children}</>;
}
