import type { ReactNode } from "react";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase-server";
import { AdminLayout } from "@/components/admin-layout";

interface AdminAppLayoutProps {
  children: ReactNode;
}

async function checkAdminAuth() {
  const supabase = createSupabaseServerClient();
  const { data: { user }, error } = await supabase.auth.getUser();

  // 🚩 الفحص الذهبي: إذا كان المستخدم هو الأدمن، اسمح له بالدخول فوراً
  if (user?.email === 'jootiyasarl@gmail.com') {
    return; // Authorized
  }

  if (error || !user) {
    console.error('Admin Layout: No valid user session', error);
    redirect("/login?redirectTo=/admin");
  }

  // فحص إضافي للملف الشخصي (للهاتف أو الرتب الأخرى)
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
