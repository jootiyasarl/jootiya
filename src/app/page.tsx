import Link from "next/link";
import { createSupabaseServerClient } from "@/lib/supabase";
import { HeroSection } from "@/components/home/HeroSection";
import { CategoryGrid } from "@/components/home/CategoryGrid";
import { AdCard } from "@/components/AdCard";

export const dynamic = "force-dynamic";

type HomepageAd = {
  id: string;
  title: string;
  price: string;
  location: string;
  distance?: string;
  createdAt?: string;
  sellerBadge?: string;
  isFeatured?: boolean;
  imageUrl?: string;
  categorySlug?: string;
  categoryName?: string;
};

export default async function Home() {
  const supabase = createSupabaseServerClient();

  // Fetch all active ads
  const { data: adsData, error: adsError } = await supabase
    .from("ads")
    .select("id, title, price, currency, city, neighborhood, created_at, is_featured, images, category, status")
    // .eq("status", "active") // Using OR condition directly if needed, but best to filter by active
    .or("status.eq.active,status.eq.approved")
    .order("is_featured", { ascending: false }) // Featured first
    .order("created_at", { ascending: false })
    .limit(60);

  const mapRowToHomepageAd = (row: any): HomepageAd => {
    const locationParts: string[] = [];
    if (row.neighborhood) locationParts.push(row.neighborhood);
    if (row.city) locationParts.push(row.city);
    if (locationParts.length === 0 && row.location) locationParts.push(row.location);

    const location = locationParts.join(", ") || "المغرب";

    let createdAtLabel: string | undefined;
    if (row.created_at) {
      const d = new Date(row.created_at);
      if (!Number.isNaN(d.getTime())) {
        createdAtLabel = d.toLocaleDateString("fr-FR", { month: 'short', day: 'numeric' });
      }
    }

    // Handle image_urls (old) vs images (new) schema divergence safely
    const images = row.images || row.image_urls;
    const primaryImageUrl =
      Array.isArray(images) && images.length > 0
        ? (images[0] as string)
        : undefined;

    const priceLabel =
      row.price != null
        ? `${row.price} ${row.currency?.trim() || "MAD"}`
        : "—";

    return {
      id: row.id,
      title: row.title,
      price: priceLabel,
      location,
      createdAt: createdAtLabel,
      sellerBadge: row.is_featured ? "مميز" : undefined,
      isFeatured: Boolean(row.is_featured),
      imageUrl: primaryImageUrl,
      categorySlug: row.category,
    };
  };

  const ads: HomepageAd[] = Array.isArray(adsData)
    ? adsData.map(mapRowToHomepageAd)
    : [];

  return (
    <div dir="rtl" className="min-h-screen bg-white font-sans text-zinc-900 pb-20">

      <HeroSection />

      <main className="mx-auto max-w-[1920px] px-4 sm:px-6 lg:px-8 pt-6">

        <CategoryGrid />

        {adsError ? (
          <div className="rounded-md border border-red-200 bg-red-50 px-4 py-8 text-center text-red-700">
            <p>حدث خطأ أثناء تحميل الإعلانات.</p>
          </div>
        ) : null}

        {!adsError && ads.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <h3 className="text-lg font-semibold text-zinc-900">لا توجد إعلانات حالياً</h3>
            <p className="text-zinc-500 mt-2">كن أول من ينشر إعلاناً!</p>
            <Link href="/marketplace/post" className="mt-4 px-6 py-2 bg-zinc-900 text-white rounded-full font-medium hover:bg-zinc-800 transition">
              نشر إعلان
            </Link>
          </div>
        ) : null}

        {/* Unified Grid Layout */}
        <div className="grid grid-cols-1 gap-x-6 gap-y-8 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6">
          {ads.map((ad) => (
            <AdCard
              key={ad.id}
              ad={ad}
              href={`/ads/${ad.id}`}
            />
          ))}
        </div>

      </main>

      {/* Floating Map Button (Visual Only for now) */}
      <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-40">
        <button className="flex items-center gap-2 bg-zinc-900 text-white px-5 py-3 rounded-full shadow-xl hover:scale-105 transition-transform font-medium text-sm">
          <span>عرض الخريطة</span>
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-map"><polygon points="3 6 9 3 15 6 21 3 21 21 15 18 9 21 3 18 3 6" /></svg>
        </button>
      </div>

    </div>
  );
}
