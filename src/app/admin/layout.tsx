import type { ReactNode } from "react";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { createClient } from "@supabase/supabase-js";
import { AdminLayout } from "@/components/admin-layout";

interface AdminAppLayoutProps {
  children: ReactNode;
}

async function ensureAdminOrSuperAdmin() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

  const cookieStore = await cookies();
  // Get all cookies to find the supabase auth token which might have a different name
  const allCookies = cookieStore.getAll();
  const supabaseToken = allCookies.find(c => c.name.includes('-auth-token'))?.value || cookieStore.get("sb-access-token")?.value;

  if (!supabaseToken) {
    console.log('Admin Layout: No token found, redirecting');
    redirect("/master-access");
  }

  const supabase = createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
      persistSession: false,
    },
  });

  const { data, error } = await supabase.auth.getUser(supabaseToken);

  if (error || !data?.user) {
    console.error('Admin Layout: Auth error', error);
    redirect("/master-access");
  }

  // Admin access is strictly restricted to this email or specific phone
  const isAuthorizedEmail = data.user.email === 'jootiyasarl@gmail.com';
  
  // For other profiles, check their role
  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("role, phone")
    .eq("id", data.user.id)
    .maybeSingle();

  const isSuperAdmin = profile?.role === "super_admin" || profile?.role === "admin";
  const isAuthorizedPhone = profile?.phone === '0618112646';

  if (isAuthorizedEmail || isSuperAdmin || isAuthorizedPhone) {
    return; // Authorized
  }

  console.warn('Admin Layout: Unauthorized access attempt', data.user.email);
  redirect("/");
}

export default async function AdminAppLayout({
  children,
}: AdminAppLayoutProps) {
  await ensureAdminOrSuperAdmin();

  return <AdminLayout>{children}</AdminLayout>;
}
