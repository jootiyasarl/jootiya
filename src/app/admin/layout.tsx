"use client";

import type { ReactNode } from "react";
import { AdminLayout } from "@/components/admin-layout";

interface AdminAppLayoutProps {
  children: ReactNode;
}

export default function AdminAppLayout({ children }: AdminAppLayoutProps) {
  return <AdminLayout>{children}</AdminLayout>;
}
