import type { ReactNode } from "react";
import { redirect } from "next/navigation";
import { getServerUser, createSupabaseServerClient } from "@/lib/supabase-server";
import { AdminLayout } from "@/components/admin-layout";

interface AdminAppLayoutProps {
  children: ReactNode;
}

async function checkAdminAuth() {
  const user = await getServerUser();

  if (!user) {
    redirect("/login?next=/admin");
  }

  if (user.email === 'jootiyasarl@gmail.com') {
    return; // Authorized
  }

  const supabase = createSupabaseServerClient();
  const { data: profile } = await supabase
    .from("profiles")
    .select("role, phone")
    .eq("id", user.id)
    .maybeSingle();

  const isSuperAdmin = profile?.role === "super_admin" || profile?.role === "admin";
  const isAuthorizedPhone = profile?.phone === '0618112646';

  if (isSuperAdmin || isAuthorizedPhone) {
    return; // Authorized
  }

  console.warn('Admin Layout: Unauthorized access attempt', user.email);
  redirect("/");
}

export default async function AdminAppLayout({ children }: AdminAppLayoutProps) {
  await checkAdminAuth();
  return <AdminLayout>{children}</AdminLayout>;
}
