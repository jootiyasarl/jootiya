"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@supabase/supabase-js";
import { getAuthenticatedServerClient, getServerUser, createSupabaseServerClient } from "@/lib/supabase-server";

// Helper to bypass RLS for anonymous actions (safe in server actions only)
function getAdminClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  console.log("[DEBUG] SUPABASE_SERVICE_ROLE_KEY present?", !!serviceRoleKey);
  if (serviceRoleKey) {
    return createClient(supabaseUrl, serviceRoleKey, { auth: { persistSession: false } });
  }
  console.error("[DEBUG] SUPABASE_SERVICE_ROLE_KEY is missing in environment");
  return null;
}

export async function toggleFavoriteAction(adId: string) {
  const user = await getServerUser();
  if (!user) {
    return { error: "Veuillez vous connecter pour ajouter des favoris" };
  }

  const supabase = await getAuthenticatedServerClient();

  // Check if already favorited
  const { data: existing } = await supabase
    .from("favorites")
    .select("id")
    .eq("user_id", user.id)
    .eq("ad_id", adId)
    .maybeSingle();

  if (existing) {
    // Remove
    const { error } = await supabase
      .from("favorites")
      .delete()
      .eq("user_id", user.id)
      .eq("ad_id", adId);

    if (error) return { error: error.message };
    revalidatePath(`/ads/${adId}`);
    return { success: true, isFavorite: false };
  } else {
    // Add
    const { error } = await supabase
      .from("favorites")
      .insert({ user_id: user.id, ad_id: adId });

    if (error) return { error: error.message };
    revalidatePath(`/ads/${adId}`);
    return { success: true, isFavorite: true };
  }
}

export async function submitReportAction(formData: {
  targetId: string;
  targetType: "ad" | "user";
  reason: string;
  details?: string;
  reporterName?: string;
  reporterPhone?: string;
  reporterEmail?: string;
}) {
  const user = await getServerUser();

  // MUST use admin client to bypass RLS on reports table
  const adminClient = getAdminClient();
  if (!adminClient) {
    return { error: "Service de signalement temporairement indisponible. Veuillez réessayer plus tard." };
  }
  const supabase = adminClient;

  let reporterName: string | null = formData.reporterName ?? null;
  let reporterEmail: string | null = formData.reporterEmail ?? null;

  // Fetch reporter profile data if logged in (overrides guest input with verified data)
  if (user?.id) {
    const { data: profile } = await supabase
      .from("profiles")
      .select("full_name, email, phone")
      .eq("id", user.id)
      .maybeSingle();

    reporterName = profile?.full_name ?? reporterName;
    reporterEmail = profile?.email ?? reporterEmail;
    if (profile?.phone) {
      reporterName = reporterName ? `${reporterName} (${profile.phone})` : profile.phone;
    }
  } else if (formData.reporterPhone) {
    // For guests, append phone to name
    reporterName = reporterName ? `${reporterName} (${formData.reporterPhone})` : formData.reporterPhone;
  }

  const { error } = await supabase
    .from("reports")
    .insert({
      target_type: formData.targetType,
      ad_id: formData.targetType === "ad" ? formData.targetId : null,
      reported_user_id: formData.targetType === "user" ? formData.targetId : null,
      reporter_id: user?.id || null,
      reporter_name: reporterName,
      reporter_email: reporterEmail,
      reason: formData.reason + (formData.details ? ` — ${formData.details}` : "")
    });

  if (error) {
    return { error: error.message };
  }

  return { success: true };
}
