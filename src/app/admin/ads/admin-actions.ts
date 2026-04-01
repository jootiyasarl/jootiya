"use server";

import { createSupabaseServerClient, getServerUser, getProfileRole } from "@/lib/supabase-server";

export async function getAdminAds() {
  try {
    const user = await getServerUser();
    if (!user) throw new Error("Unauthorized");

    const role = await getProfileRole(user.id);
    if (role !== "admin") throw new Error("Forbidden: Admin access required");

    const supabase = createSupabaseServerClient();
    
    // Fetch ads using server client which has higher privileges or correctly bypasses RLS if configured
    const { data: ads, error: adsError } = await supabase
      .from("ads")
      .select(`
        id, 
        title, 
        city, 
        neighborhood, 
        category, 
        status, 
        price, 
        currency, 
        created_at,
        image_urls,
        seller_id
      `)
      .order("created_at", { ascending: false });

    if (adsError) throw adsError;

    // Fetch profiles for sellers
    const sellerIds = Array.from(new Set((ads || []).map(ad => ad.seller_id)));
    const { data: profiles, error: profilesError } = await supabase
      .from("profiles")
      .select("id, full_name, avatar_url")
      .in("id", sellerIds);

    if (profilesError) {
      console.error("Error fetching profiles for admin ads:", profilesError);
    }

    const profileMap = new Map((profiles || []).map(p => [p.id, p]));

    const mappedAds = (ads || []).map(ad => {
      const profile = profileMap.get(ad.seller_id);
      return {
        id: ad.id,
        title: ad.title,
        location: ad.neighborhood ? `${ad.neighborhood}, ${ad.city}` : ad.city || "Maroc",
        category: ad.category,
        status: ad.status,
        price: ad.price,
        currency: ad.currency,
        is_featured: false,
        created_at: ad.created_at,
        image_url: ad.image_urls?.[0] || null,
        seller_id: ad.seller_id,
        seller: profile ? {
          full_name: profile.full_name,
          avatar_url: profile.avatar_url
        } : undefined,
      };
    });

    return { success: true, data: mappedAds };
  } catch (error: any) {
    console.error("getAdminAds Error:", error);
    return { success: false, error: error.message };
  }
}

export async function updateAdStatus(id: string, status: string) {
  try {
    const user = await getServerUser();
    if (!user) throw new Error("Unauthorized");

    const role = await getProfileRole(user.id);
    if (role !== "admin") throw new Error("Forbidden");

    const supabase = createSupabaseServerClient();
    const { error } = await supabase
      .from("ads")
      .update({ status })
      .eq("id", id);

    if (error) throw error;
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function deleteAdAdmin(id: string) {
  try {
    const user = await getServerUser();
    if (!user) throw new Error("Unauthorized");

    const role = await getProfileRole(user.id);
    if (role !== "admin") throw new Error("Forbidden");

    const supabase = createSupabaseServerClient();
    const { error } = await supabase
      .from("ads")
      .delete()
      .eq("id", id);

    if (error) throw error;
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}
