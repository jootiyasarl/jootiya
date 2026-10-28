import React, { Suspense } from "react";
import { SessionSync } from "@/components/auth/SessionSync";
import HomeClient, { type HomepageAdRow } from "@/components/home/HomeClient";
import { createSupabaseServerClient } from "@/lib/supabase-server";

export const revalidate = 60;

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

  // Fetch ALL ads from database ordered by featured status and creation date
  const { data: allAds, error: adsError } = await supabase
    .from("ads")
    .select(
      "id, title, price, currency, city, neighborhood, created_at, is_featured, image_urls, category, status, latitude, longitude, seller_id"
    )
    .or("status.eq.active,status.eq.approved,status.eq.pending,status.is.null")
    .order("is_featured", { ascending: false })
    .order("created_at", { ascending: false })
    .limit(1000);

  if (adsError) {
    console.error("Error fetching homepage ads:", adsError);
  }

  if (allAds) {
    if (lat != null && lng != null) {
      initialAds = (allAds as HomepageAdRow[]).map((ad) => {
        if (ad.latitude != null && ad.longitude != null) {
          const dLat = ((ad.latitude - lat) * Math.PI) / 180;
          const dLon = ((ad.longitude - lng) * Math.PI) / 180;
          const a =
            Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.cos((lat * Math.PI) / 180) *
              Math.cos((ad.latitude * Math.PI) / 180) *
              Math.sin(dLon / 2) *
              Math.sin(dLon / 2);
          const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
          return { ...ad, distanceKm: 6371 * c };
        }
        return ad;
      });
    } else {
      initialAds = allAds as HomepageAdRow[];
    }
  }

  return (
    <Suspense fallback={<div className="min-h-screen bg-white animate-pulse" />}>
      <SessionSync />
      <HomeClient initialParams={resolvedParams} initialAds={initialAds} />
    </Suspense>
  );
}
