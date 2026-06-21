"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@supabase/supabase-js";
import { getAuthenticatedServerClient, getServerUser, createSupabaseServerClient } from "@/lib/supabase-server";

// Helper to bypass RLS for anonymous actions (safe in server actions only)
function getAdminClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (serviceRoleKey) {
    return createClient(supabaseUrl, serviceRoleKey, { auth: { persistSession: false } });
  }
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
}) {
  const user = await getServerUser();

  // Use admin client to bypass RLS (safe in server actions)
  const adminClient = getAdminClient();
  const supabase = adminClient ?? await getAuthenticatedServerClient();

  const { error } = await supabase
    .from("reports")
    .insert({
      target_type: formData.targetType,
      ad_id: formData.targetType === "ad" ? formData.targetId : null,
      reported_user_id: formData.targetType === "user" ? formData.targetId : null,
      reporter_id: user?.id || null,
      reason: formData.reason + (formData.details ? ` — ${formData.details}` : "")
    });

  if (error) {
    return { error: error.message };
  }

  return { success: true };
}
