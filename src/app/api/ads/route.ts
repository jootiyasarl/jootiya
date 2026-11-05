/**
 * ─────────────────────────────────────────────────────────────────────────────
 * GET /api/ads?page=N&limit=M
 * ─────────────────────────────────────────────────────────────────────────────
 *
 * ARCHITECTURAL DECISIONS
 * ───────────────────────
 * • No auth required — public read-only endpoint (anon key is safe here).
 * • `createSupabaseServerClient()` is reused (no cookie reads needed for public
 *   data, so the light unauthenticated variant is correct).
 * • Supabase `.range(from, to)` maps 1-based pages → 0-based row offsets with
 *   exact precision, preventing off-by-one duplicates during infinite scroll.
 * • `hasMore` is computed by fetching one extra row (limit + 1) then slicing.
 *   This avoids a separate `count` query and saves one DB round-trip.
 * • `Cache-Control: s-maxage=30` lets Vercel's Edge Cache serve this route
 *   for 30 s before revalidating — dramatic TTFB reduction under high traffic.
 * ─────────────────────────────────────────────────────────────────────────────
 */

import { NextRequest, NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase-server";

/** Fields projected from the `ads` table — matches HomepageAdRow shape */
const AD_SELECT =
  "id, title, price, currency, city, neighborhood, created_at, is_featured, image_urls, category, status, latitude, longitude, seller_id";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = request.nextUrl;

    // ── Parse & validate query params ────────────────────────────────────────
    const rawPage = searchParams.get("page");
    const rawLimit = searchParams.get("limit");

    const page = Math.max(1, parseInt(rawPage ?? "1", 10) || 1);
    // Cap at 48 to prevent accidental DB overload from crafted requests
    const limit = Math.min(48, Math.max(1, parseInt(rawLimit ?? "12", 10) || 12));

    // ── Supabase range: 0-indexed, inclusive on both ends ────────────────────
    // Page 1 → rows  0 … 11  (for limit=12)
    // Page 2 → rows 12 … 23
    // Page N → rows (N-1)*limit … N*limit-1
    const from = (page - 1) * limit;
    const to = from + limit - 1;

    // Fetch one extra row (limit+1) to determine hasMore without a count query
    const toProbe = from + limit; // one row past the page boundary

    const supabase = createSupabaseServerClient();

    const { data, error } = await supabase
      .from("ads")
      .select(AD_SELECT)
      .or("status.eq.active,status.eq.approved,status.eq.pending,status.is.null")
      .order("is_featured", { ascending: false })
      .order("created_at", { ascending: false })
      .range(from, toProbe); // fetch limit+1 rows

    if (error) {
      console.error("[/api/ads] Supabase error:", error.message);
      return NextResponse.json(
        { error: "Erreur lors de la récupération des annonces." },
        { status: 500 }
      );
    }

    const rows = data ?? [];
    // hasMore = true when the extra probe row came back (DB has at least one more)
    const hasMore = rows.length > limit;
    // Slice off the probe row so we always return exactly `limit` items
    const ads = hasMore ? rows.slice(0, limit) : rows;

    return NextResponse.json(
      { ads, hasMore, page, limit },
      {
        status: 200,
        headers: {
          // Edge cache: serve stale for 30 s, revalidate in background
          "Cache-Control": "public, s-maxage=30, stale-while-revalidate=59",
        },
      }
    );
  } catch (err: unknown) {
    console.error("[/api/ads] Unexpected error:", err);
    return NextResponse.json(
      { error: "Erreur interne du serveur." },
      { status: 500 }
    );
  }
}
