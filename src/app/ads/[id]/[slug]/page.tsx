import { notFound } from "next/navigation";
import { createSupabaseServerClient, getServerUser } from "@/lib/supabase-server";
import { generateSlug } from "@/lib/seo-utils";
import { AirbnbAdPageClient } from "./AirbnbAdPageClient";
import { ShadowViewTracker } from "@/components/ads/ShadowViewTracker";

export const revalidate = 3600;

interface AdPageProps {
  params: Promise<{ id: string; slug: string }>;
}

// ─── Helpers ───────────────────────────────────────────────────────────────
function buildImageUrl(img: string, supabaseUrl: string): string {
  if (!img) return "/icon-512x512.png";
  if (img.startsWith("http")) return img;
  const clean = img.startsWith("/") ? img.slice(1) : img;
  if (clean.startsWith("storage/v1/object/public/")) return `${supabaseUrl}/${clean}`;
  if (clean.startsWith("ad-images/")) return `${supabaseUrl}/storage/v1/object/public/${clean}`;
  return `${supabaseUrl}/storage/v1/object/public/ad-images/${clean}`;
}

// ─── Metadata ──────────────────────────────────────────────────────────────
export async function generateMetadata({ params }: AdPageProps) {
  const { id, slug: urlSlug } = await params;
  const supabase   = createSupabaseServerClient();
  const baseUrl    = process.env.NEXT_PUBLIC_APP_URL || "https://jootiya.com";
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";

  try {
    const { data: ad } = await supabase
      .from("ads")
      .select("title, city, description, image_urls, price, currency, slug, id")
      .or(`id.eq.${id},slug.eq.${id}`)
      .maybeSingle();

    if (!ad) return { title: "Petites Annonces au Maroc | Jootiya" };

    const formattedPrice = ad.price
      ? `${Number(ad.price).toLocaleString("fr-FR")} ${ad.currency || "MAD"}`
      : "Prix sur demande";
    const metaTitle    = `${ad.title} - ${formattedPrice} | Jootiya`;
    const adSlug       = ad.slug || urlSlug || generateSlug(ad.title);
    const canonicalUrl = `${baseUrl}/ads/${ad.id}/${adSlug}`;

    const ogImage =
      ad.image_urls?.[0]
        ? buildImageUrl(ad.image_urls[0], supabaseUrl)
        : `${baseUrl}/og-image.png`;

    return {
      title: metaTitle,
      description: ad.description?.slice(0, 160),
      alternates: { canonical: canonicalUrl },
      openGraph: {
        title: metaTitle,
        description: ad.description?.slice(0, 160),
        url: canonicalUrl,
        siteName: "Jootiya",
        images: [{ url: ogImage, width: 1200, height: 630, alt: ad.title }],
        locale: "fr_FR",
        type: "website",
      },
      twitter: {
        card: "summary_large_image",
        title: metaTitle,
        description: ad.description?.slice(0, 160),
        images: [ogImage],
      },
    };
  } catch {
    return { title: "Petites Annonces au Maroc | Jootiya" };
  }
}

// ─── Page ──────────────────────────────────────────────────────────────────
export default async function AdPage({ params }: AdPageProps) {
  const { id } = await params;
  const supabase    = createSupabaseServerClient();
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";

  // ── 1. Fetch ad + user in parallel ────────────────────────────────────────
  const [{ data: ad, error: adError }, user] = await Promise.all([
    supabase
      .from("ads")
      .select("*, profiles:seller_id(phone, full_name, avatar_url, created_at)")
      .or(`id.eq.${id},slug.eq.${id}`)
      .maybeSingle(),
    getServerUser(),
  ]);

  if (adError || !ad) {
    console.error("[AdPage] ad not found:", id, adError?.message);
    notFound();
  }

  // ── 2. Build seller data (prefer joined profile) ───────────────────────────
  const profile     = ad.profiles as any;
  const sellerName  = profile?.full_name  || "Utilisateur Jootiya";
  const sellerAvatar= profile?.avatar_url || null;
  const memberSince = profile?.created_at
    ? new Date(profile.created_at).getFullYear()
    : "2024";
  const sellerPhone = ad.phone || profile?.phone;

  // ── 3. Build images ────────────────────────────────────────────────────────
  const images: string[] = (ad.image_urls || []).map((img: string) =>
    buildImageUrl(img, supabaseUrl)
  );

  // ── 4. Format price / date ─────────────────────────────────────────────────
  const formattedPrice = ad.price
    ? `${Number(ad.price).toLocaleString("fr-FR")} ${ad.currency || "MAD"}`
    : "Sur demande";
  const formattedDate = new Date(ad.created_at).toLocaleDateString("fr-FR", {
    day: "numeric", month: "long", year: "numeric",
  });

  // ── 5. Parallel: seller stats + similar ads ────────────────────────────────
  //    get_seller_stats wrapped with a race-timeout so a missing RPC
  //    never hangs the page.
  const STATS_TIMEOUT = 3000; // ms

  const statsPromise = Promise.race([
    supabase.rpc("get_seller_stats", { target_seller_id: ad.seller_id }),
    new Promise<{ data: null }>((resolve) =>
      setTimeout(() => resolve({ data: null }), STATS_TIMEOUT)
    ),
  ]);

  const similarPromise = supabase
    .from("ads")
    .select("id, title, price, currency, city, image_urls, slug, condition, is_featured")
    .eq("category", ad.category)
    .neq("id", ad.id)
    .or("status.eq.active,status.eq.approved")
    .order("created_at", { ascending: false })
    .limit(4);

  const [statsResult, similarResult] = await Promise.all([
    statsPromise,
    similarPromise,
  ]);

  const stats       = (statsResult as any)?.data;
  const avgRating   = stats?.[0]?.avg_rating  || 0;
  const totalReviews= stats?.[0]?.total_reviews || 0;
  const isTrusted   = totalReviews > 10 && avgRating >= 4.5;
  const similarAds  = similarResult?.data || [];

  // ── 6. Render ──────────────────────────────────────────────────────────────
  return (
    <>
      <ShadowViewTracker adId={ad.id} category={ad.category} />
      <AirbnbAdPageClient
        ad={ad}
        images={images}
        sellerName={sellerName}
        sellerAvatar={sellerAvatar}
        memberSince={memberSince}
        sellerPhone={sellerPhone}
        formattedPrice={formattedPrice}
        formattedDate={formattedDate}
        avgRating={avgRating}
        totalReviews={totalReviews}
        isTrusted={isTrusted}
        user={user}
        similarAds={similarAds}
      />
    </>
  );
}
