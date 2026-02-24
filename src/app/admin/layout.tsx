import type { ReactNode } from "react";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { createClient } from "@supabase/supabase-js";
import { AdminLayout } from "@/components/admin-layout";

interface AdminAppLayoutProps {
  children: ReactNode;
}

async function ensureAdminOrSuperAdmin() {
  const cookieStore = await cookies();
  const accessToken = cookieStore.get("sb-access-token")?.value;

  if (!accessToken) {
    redirect("/master-access");
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    redirect("/master-access");
  }

  const supabase = createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
      persistSession: false,
    },
  });

  const { data, error } = await supabase.auth.getUser(accessToken);

  if (error || !data.user) {
    redirect("/master-access");
  }

  // Admin access is strictly restricted to this email
  if (data.user.email === 'jootiyasarl@gmail.com') {
    return; // Authorized
  }

  // For other profiles, check their role
  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", data.user.id)
    .maybeSingle();

  if (profileError || (profile?.role !== "super_admin" && profile?.role !== "admin")) {
    redirect("/");
  }
}

export default async function AdminAppLayout({
  children,
}: AdminAppLayoutProps) {
  await ensureAdminOrSuperAdmin();

  return <AdminLayout>{children}</AdminLayout>;
}
