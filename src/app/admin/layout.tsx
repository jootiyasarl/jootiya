import type { ReactNode } from "react";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { createClient } from "@supabase/supabase-js";
import { AdminLayout } from "@/components/admin-layout";

interface AdminAppLayoutProps {
  children: ReactNode;
}

async function checkAdminAuth() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

  const cookieStore = await cookies();
  const allCookies = cookieStore.getAll();
  
  // Find the Supabase auth token
  const supabaseToken = allCookies.find(c => c.name.includes('auth-token'))?.value || 
                        cookieStore.get("sb-access-token")?.value;

  if (!supabaseToken) {
    console.log('Admin Layout: No token, redirecting to /master-access');
    redirect("/master-access");
  }

  const supabase = createClient(supabaseUrl, supabaseAnonKey, {
    auth: { persistSession: false },
  });

  const { data: { user }, error } = await supabase.auth.getUser(supabaseToken);

  if (error || !user) {
    console.error('Admin Layout: Auth error', error);
    redirect("/master-access");
  }

  // Strict email and role check
  const isAuthorizedEmail = user.email === 'jootiyasarl@gmail.com';
  
  const { data: profile } = await supabase
    .from("profiles")
    .select("role, phone")
    .eq("id", user.id)
    .maybeSingle();

  const isSuperAdmin = profile?.role === "super_admin" || profile?.role === "admin";
  const isAuthorizedPhone = profile?.phone === '0618112646';

  if (isAuthorizedEmail || isSuperAdmin || isAuthorizedPhone) {
    return; // Authorized
  }

  console.warn('Admin Layout: Unauthorized access attempt', user.email);
  redirect("/");
}

export default async function AdminAppLayout({ children }: AdminAppLayoutProps) {
  await checkAdminAuth();
  return <AdminLayout>{children}</AdminLayout>;
}
