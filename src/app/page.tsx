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
    .select("id, title, price, currency, city, neighborhood, created_at, is_featured, image_urls, category, status")
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

    const location = locationParts.join(", ") || "Maroc";

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
      sellerBadge: row.is_featured ? "À la une" : undefined,
      isFeatured: Boolean(row.is_featured),
      imageUrl: primaryImageUrl,
      categorySlug: row.category,
    };
  };

  const ads: HomepageAd[] = Array.isArray(adsData)
    ? adsData.map(mapRowToHomepageAd)
    : [];

  return (
    <div dir="ltr" className="min-h-screen bg-white font-sans text-zinc-900 pb-20">

      <HeroSection />

      <main className="mx-auto max-w-[1920px] px-4 sm:px-6 lg:px-8 pt-6">

        <CategoryGrid />

        {adsError ? (
          <div className="rounded-md border border-red-200 bg-red-50 px-4 py-8 text-center text-red-700">
            <p>Une erreur s'est produite lors du chargement des annonces.</p>
          </div>
        ) : null}

        {!adsError && ads.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <h3 className="text-lg font-semibold text-zinc-900">Aucune annonce pour le moment</h3>
            <p className="text-zinc-500 mt-2">Soyez le premier à publier une annonce !</p>
            <Link href="/marketplace/post" className="mt-4 px-6 py-2 bg-zinc-900 text-white rounded-full font-medium hover:bg-zinc-800 transition">
              Publier une annonce
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
    </div>
  );
}
