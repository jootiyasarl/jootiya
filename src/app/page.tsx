import React, { Suspense } from "react";
import { SessionSync } from "@/components/auth/SessionSync";
import HomeClient, { type HomepageAdRow } from "@/components/home/HomeClient";
import { createSupabaseServerClient } from "@/lib/supabase-server";

export const dynamic = "force-dynamic";
export const revalidate = 0;

type HomeSearchParams = {
  lat?: string;
  lng?: string;
  radius?: string;
  [key: string]: string | string[] | undefined;
};

export default async function Home({ searchParams }: { searchParams: Promise<HomeSearchParams> }) {
  const resolvedParams = await searchParams;
  const lat = typeof resolvedParams.lat === "string" ? parseFloat(resolvedParams.lat) : null;
  const lng = typeof resolvedParams.lng === "string" ? parseFloat(resolvedParams.lng) : null;
  const radius = typeof resolvedParams.radius === "string" ? parseInt(resolvedParams.radius, 10) : 50;

  const supabase = createSupabaseServerClient();

  let initialAds: HomepageAdRow[] = [];

  if (lat != null && lng != null) {
    const { data: nearbyData, error: nearbyError } = await supabase.rpc("get_nearby_items", {
      lat,
      lon: lng,
      distance_meters: radius * 1000,
      limit_count: 60,
    });

    if (nearbyError) {
      console.error("Error fetching nearby ads:", nearbyError);
    }

    initialAds = (nearbyData ?? []) as HomepageAdRow[];
  } else {
    const HOMEPAGE_CATEGORIES = [
      "electronics", "home-furniture", "vehicles", "fashion",
      "tools-equipment", "hobbies", "animals", "books",
      "used-clearance", "other",
    ];
    const ADS_PER_CATEGORY = 6;

    const categoryResults = await Promise.all(
      HOMEPAGE_CATEGORIES.map((category) =>
        supabase
          .from("ads")
          .select(
            "id, title, price, currency, city, neighborhood, created_at, is_featured, image_urls, category, status, latitude, longitude, seller_id, profiles: seller_id ( full_name, avatar_url )"
          )
          .or("status.eq.active,status.eq.approved,status.eq.pending")
          .eq("category", category)
          .order("is_featured", { ascending: false })
          .order("created_at", { ascending: false })
          .limit(ADS_PER_CATEGORY)
      )
    );

    const allAds: HomepageAdRow[] = [];
    for (const result of categoryResults) {
      if (result.error) {
        console.error("Error fetching category ads:", result.error);
        continue;
      }
      allAds.push(...(result.data ?? []));
    }

    // Sort combined results for the "latest" section
    allAds.sort((a, b) => {
      const aFeatured = a.is_featured ? 1 : 0;
      const bFeatured = b.is_featured ? 1 : 0;
      if (bFeatured !== aFeatured) return bFeatured - aFeatured;
      return new Date(b.created_at ?? 0).getTime() - new Date(a.created_at ?? 0).getTime();
    });

    initialAds = allAds as HomepageAdRow[];
  }

  return (
    <Suspense fallback={<div className="min-h-screen bg-white animate-pulse" />}>
      <SessionSync defaultNext="/poste-annonce" />
      <HomeClient initialParams={resolvedParams} initialAds={initialAds} />
    </Suspense>
  );
}
