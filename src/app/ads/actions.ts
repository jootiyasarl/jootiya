"use server";

import { revalidatePath } from "next/cache";
import { getAuthenticatedServerClient, getServerUser } from "@/lib/supabase-server";

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
  // Reporting can be anonymous or authenticated, but we prefer authenticated
  
  const supabase = await getAuthenticatedServerClient();

  const { error } = await supabase
    .from("reports")
    .insert({
      target_type: formData.targetType,
      ad_id: formData.targetType === "ad" ? formData.targetId : null,
      reported_user_id: formData.targetType === "user" ? formData.targetId : null,
      reporter_id: user?.id || null,
      reason: formData.reason,
      details: { comment: formData.details }
    });

  if (error) {
    return { error: error.message };
  }

  return { success: true };
}
