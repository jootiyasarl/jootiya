import type { ReactNode } from "react";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { createClient } from "@supabase/supabase-js";

interface DashboardAnalyticsLayoutProps {
  children: ReactNode;
}

async function ensureSeller() {
  const cookieStore = await cookies();
  const accessToken = cookieStore.get("sb-access-token")?.value;

  if (!accessToken) {
    redirect("/login?redirectTo=/dashboard/analytics");
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    redirect("/login");
  }

  const supabase = createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
      persistSession: false,
    },
  });

  const { data, error } = await supabase.auth.getUser(accessToken);

  if (error || !data.user) {
    redirect("/login?redirectTo=/dashboard/analytics");
  }

  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", data.user.id)
    .maybeSingle();

  if (profileError) {
    redirect("/");
  }

  // Self-heal: create a seller profile if missing (e.g. fresh Google login)
  if (!profile) {
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    if (serviceRoleKey) {
      const admin = createClient(supabaseUrl, serviceRoleKey, {
        auth: { persistSession: false },
      });
      const meta = (data.user.user_metadata ?? {}) as Record<string, unknown>;
      const fullName =
        (meta.full_name as string) ||
        (meta.name as string) ||
        (data.user.email ? data.user.email.split("@")[0] : "Utilisateur");
      const avatarUrl =
        (meta.avatar_url as string) || (meta.picture as string) || null;
      const newRole =
        data.user.email === "jootiyasarl@gmail.com" ? "super_admin" : "seller";

      await admin.from("profiles").insert({
        id: data.user.id,
        email: data.user.email,
        full_name: fullName,
        avatar_url: avatarUrl,
        role: newRole,
        updated_at: new Date().toISOString(),
      });

      if (newRole !== "seller") {
        redirect("/admin");
      }
      return;
    }
    return;
  }

  const role = (profile.role ?? "").toString().trim();

  if (role === "super_admin" || role === "admin") {
    redirect("/admin");
  }

  if (role !== "seller") {
    redirect("/");
  }
}

export default async function DashboardAnalyticsLayout({
  children,
}: DashboardAnalyticsLayoutProps) {
  await ensureSeller();

  return <>{children}</>;
}
