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

  const role = (profile?.role ?? "").toString().trim();

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
