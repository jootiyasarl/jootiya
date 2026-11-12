/**
 * ─────────────────────────────────────────────────────────────────────────────
 * app/page.tsx — Homepage (React Server Component)
 * ─────────────────────────────────────────────────────────────────────────────
 *
 * ARCHITECTURAL DECISIONS
 * ───────────────────────
 * 1. ISR (Incremental Static Regeneration):
 *    `revalidate = 60` means this page is statically generated at build time
 *    and re-generated in the background every 60 seconds. Vercel Edge Cache
 *    serves the stale page instantly (TTFB < 50 ms) while the new page bakes.
 *    This eliminates SSR cold-start latency for 99% of visitors.
 *
 * 2. Only first 10 ads fetched on the server:
 *    - Reduces initial DB query time (Supabase row scanning stops early).
 *    - Keeps the HTML payload small for faster FCP/LCP.
 *    - Remaining pages are fetched client-side via /api/ads (infinite scroll).
 *    - `.range(0, 10)` fetches 11 rows so we can compute `initialHasMore`
 *      without a separate COUNT query (same probe trick as the API route).
 *
 * 3. Distance calculation stays server-side when lat/lng are present:
 *    Avoids shipping Haversine math to the browser for initial render.
 *    Client-side distance enrichment runs only for localStorage coords.
 * ─────────────────────────────────────────────────────────────────────────────
 */

import React, { Suspense } from "react";
import { SessionSync } from "@/components/auth/SessionSync";
import HomeClient, { type HomepageAdRow } from "@/components/home/HomeClient";
import { StatsBar } from "@/components/home/StatsBar";
import { MOROCCAN_CITIES } from "@/lib/constants/cities";
import { createSupabaseServerClient } from "@/lib/supabase-server";

// ISR: re-generate in background every 60 seconds; serve stale from edge cache
export const revalidate = 60;

/** Number of ads to show in the SSR-rendered first batch */
const INITIAL_PAGE_SIZE = 10;

/** Fields projected from Supabase — keep in sync with HomepageAdRow type */
const AD_SELECT =
  "id, title, price, currency, city, neighborhood, created_at, is_featured, image_urls, category, status, latitude, longitude, seller_id";

type HomeSearchParams = {
  lat?: string;
  lng?: string;
  radius?: string;
  [key: string]: string | string[] | undefined;
};

export default async function Home({
  searchParams,
}: {
  searchParams: Promise<HomeSearchParams>;
}) {
  const resolvedParams = await searchParams;
  const lat =
    typeof resolvedParams.lat === "string"
      ? parseFloat(resolvedParams.lat)
      : null;
  const lng =
    typeof resolvedParams.lng === "string"
      ? parseFloat(resolvedParams.lng)
      : null;

  const supabase = createSupabaseServerClient();

  // ── Fetch first page + one probe row ─────────────────────────────────────
  // Fetching INITIAL_PAGE_SIZE + 1 (index 0 → 10) = 11 rows total.
  // If 13 rows come back, there are more pages → hasMore = true.
  const { data: rawAds, error: adsError } = await supabase
    .from("ads")
    .select(AD_SELECT)
    .or("status.eq.active,status.eq.approved,status.eq.pending,status.is.null")
    .order("is_featured", { ascending: false })
    .order("created_at", { ascending: false })
    // Fetch one extra row to detect hasMore without a COUNT query
    .range(0, INITIAL_PAGE_SIZE); // inclusive: rows 0..10 → 11 rows

  if (adsError) {
    console.error("Error fetching homepage initial ads:", adsError);
  }

  const rows = (rawAds ?? []) as HomepageAdRow[];

  // Determine if there are more pages (probe row present)
  const initialHasMore = rows.length > INITIAL_PAGE_SIZE;
  // Slice off the probe row — only pass exactly INITIAL_PAGE_SIZE to client
  const initialAds = initialHasMore ? rows.slice(0, INITIAL_PAGE_SIZE) : rows;

  // ── Social-proof counters (cheap head-only COUNT queries, in parallel) ──
  const [adsCountRes, usersCountRes] = await Promise.all([
    supabase
      .from("ads")
      .select("*", { count: "exact", head: true })
      .or("status.eq.active,status.eq.approved,status.eq.pending,status.is.null"),
    supabase.from("profiles").select("*", { count: "exact", head: true }),
  ]);

  const statsBar = (
    <StatsBar
      adsCount={adsCountRes.count ?? 0}
      usersCount={usersCountRes.count ?? 0}
      citiesCount={MOROCCAN_CITIES.reduce((n, r) => n + r.cities.length, 0)}
    />
  );

  // ── Server-side distance enrichment (when ?lat=&lng= present) ────────────
  let enrichedAds = initialAds;
  if (lat != null && lng != null) {
    enrichedAds = initialAds.map((ad) => {
      if (ad.latitude != null && ad.longitude != null) {
        const dLat = ((ad.latitude - lat) * Math.PI) / 180;
        const dLon = ((ad.longitude - lng) * Math.PI) / 180;
        const a =
          Math.sin(dLat / 2) * Math.sin(dLat / 2) +
          Math.cos((lat * Math.PI) / 180) *
            Math.cos((ad.latitude * Math.PI) / 180) *
            Math.sin(dLon / 2) *
            Math.sin(dLon / 2);
        return { ...ad, distanceKm: 6371 * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a)) };
      }
      return ad;
    });
  }

  return (
    <Suspense fallback={<div className="min-h-screen bg-white animate-pulse" />}>
      <SessionSync />
      <HomeClient
        initialParams={resolvedParams}
        initialAds={enrichedAds}
        initialHasMore={initialHasMore}
        statsBar={statsBar}
      />
    </Suspense>
  );
}
