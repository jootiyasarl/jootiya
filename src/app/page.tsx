import Image from "next/image";
import Link from "next/link";
import { AdCard } from "@/components/AdCard";
import { NearbyNowSection } from "@/components/NearbyNowSection";
import { createSupabaseServerClient } from "@/lib/supabase";

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

const categories = [
  {
    id: "phones",
    label: "Téléphones et tablettes",
    icon: "📱",
    description: "Smartphones, tablettes, accessoires",
  },
  {
    id: "home",
    label: "Maison & meubles",
    icon: "🛋️",
    description: "Canapés, tables, décoration",
  },
  {
    id: "vehicles",
    label: "Voitures & véhicules",
    icon: "🚗",
    description: "Voitures, motos, vélos",
  },
  {
    id: "electronics",
    label: "Électronique",
    icon: "💻",
    description: "Ordinateurs, téléviseurs, audio",
  },
  {
    id: "fashion",
    label: "Vêtements & mode",
    icon: "👕",
    description: "Vêtements, chaussures, accessoires",
  },
  {
    id: "sports",
    label: "Sport & loisirs",
    icon: "⚽",
    description: "Équipement sportif, jeux, instruments de musique",
  },
  {
    id: "kids",
    label: "Enfants & bébés",
    icon: "🧸",
    description: "Poussettes, jouets, vêtements pour enfants",
  },
  {
    id: "other",
    label: "Autre",
    icon: "📦",
    description: "Tout le reste",
  },
] as const;

const CATEGORY_SECTION_ORDER = [
  "electronics", // إلكترونيات
  "clothes", // ملابس
  "real-estate", // عقارات
  "cars", // سيارات
  "other", // أشياء أخرى / متفرقات
];

export default async function Home() {
  const supabase = createSupabaseServerClient();

  const baseSelect =
    "id, title, price, currency, city, neighborhood, created_at, is_featured, image_urls, category";

  const [
    { data: featuredData, error: featuredError },
    { data: recentData, error: recentError },
    { data: categoriesData, error: categoriesError },
  ] = await Promise.all([
    supabase
      .from("ads")
      .select(baseSelect)
      .eq("status", "active")
      .eq("is_featured", true)
      .order("created_at", { ascending: false })
      .limit(6),
    supabase
      .from("ads")
      .select(baseSelect)
      .eq("status", "active")
      .order("created_at", { ascending: false })
      .limit(48),
    supabase
      .from("categories")
      .select("slug, name")
      .order("name", { ascending: true }),
  ]);

  const supabaseError = featuredError ?? recentError ?? categoriesError ?? null;

  const categoryNameBySlug = new Map<string, string>();
  if (Array.isArray(categoriesData)) {
    for (const category of categoriesData as { slug: string; name: string | null }[]) {
      if (category.slug) {
        categoryNameBySlug.set(category.slug, category.name ?? category.slug);
      }
    }
  }

  const mapRowToHomepageAd = (row: any): HomepageAd => {
    const locationParts: string[] = [];
    if (row.neighborhood) locationParts.push(row.neighborhood);
    if (row.city) locationParts.push(row.city);
    const location = locationParts.join(", ") || "Près de chez vous";

    let createdAtLabel: string | undefined;
    if (row.created_at) {
      const d = new Date(row.created_at);
      if (!Number.isNaN(d.getTime())) {
        createdAtLabel = d.toLocaleDateString("fr-FR");
      }
    }

    const primaryImageUrl =
      Array.isArray(row.image_urls) && row.image_urls.length > 0
        ? (row.image_urls[0] as string)
        : undefined;

    const categorySlug = (row.category as string | null) ?? null;
    const categoryName =
      categorySlug && categoryNameBySlug.get(categorySlug)
        ? categoryNameBySlug.get(categorySlug)!
        : null;

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
      sellerBadge: row.is_featured ? "En vedette" : "Annonce approuvée",
      isFeatured: Boolean(row.is_featured),
      imageUrl: primaryImageUrl,
      categorySlug: categorySlug ?? undefined,
      categoryName: categoryName ?? undefined,
    };
  };

  const featuredAds: HomepageAd[] = Array.isArray(featuredData)
    ? featuredData.map(mapRowToHomepageAd)
    : [];

  const recentAds: HomepageAd[] = Array.isArray(recentData)
    ? recentData.map(mapRowToHomepageAd)
    : [];

  // Group all recent (approved) ads by an effective category slug.
  // If the ad's category slug is missing or not present in the categories table,
  // we fall back to the special "other" bucket so that no approved ad is lost.
  const adsByCategory = new Map<string, HomepageAd[]>();
  for (const ad of recentAds) {
    const hasValidCategorySlug =
      ad.categorySlug && categoryNameBySlug.has(ad.categorySlug);

    const effectiveSlug = hasValidCategorySlug ? ad.categorySlug! : "other";

    if (!adsByCategory.has(effectiveSlug)) {
      adsByCategory.set(effectiveSlug, []);
    }

    adsByCategory.get(effectiveSlug)!.push({
      ...ad,
      categorySlug: effectiveSlug,
    });
  }

  const categorySections: { slug: string; name: string; ads: HomepageAd[] }[] = [];

  for (const [slug, adsForCategory] of adsByCategory) {
    if (!adsForCategory.length) continue;

    const name =
      slug === "other"
        ? "Autres annonces"
        : categoryNameBySlug.get(slug) ?? slug;

    categorySections.push({
      slug,
      name,
      ads: adsForCategory,
    });
  }

  categorySections.sort((a, b) => {
    const indexA = CATEGORY_SECTION_ORDER.indexOf(a.slug);
    const indexB = CATEGORY_SECTION_ORDER.indexOf(b.slug);

    const orderA = indexA === -1 ? CATEGORY_SECTION_ORDER.length : indexA;
    const orderB = indexB === -1 ? CATEGORY_SECTION_ORDER.length : indexB;

    if (orderA !== orderB) return orderA - orderB;

    return a.name.localeCompare(b.name, "fr");
  });

  const allHomepageAds: HomepageAd[] = [...featuredAds, ...recentAds];

  const homepageAdsJsonLd = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    itemListElement: allHomepageAds.map((ad, index) => ({
      "@type": "Product",
      position: index + 1,
      name: ad.title,
      description: ad.location,
      offers: {
        "@type": "Offer",
        price: ad.price,
        priceCurrency: "MAD",
        areaServed: ad.location,
      },
    })),
  };

  return (
    <div dir="ltr" lang="fr" className="min-h-screen bg-zinc-50 text-zinc-900">
      <div className="mx-auto flex min-h-screen max-w-6xl flex-col px-4 pb-10 pt-4 sm:px-6 lg:px-8">
        <main className="flex-1 space-y-8 pt-6">
          <section className="space-y-2 text-right">
            <h1 className="text-2xl font-semibold tracking-tight text-zinc-900 sm:text-3xl">
              الإعلانات حسب التصنيفات
            </h1>
            <p className="text-sm text-zinc-600">
              تصفّح أحدث الإعلانات التي تمّت الموافقة عليها، مرتبة حسب نوع المنتج.
            </p>
            {supabaseError ? (
              <div className="mt-2 rounded-md border border-red-200 bg-red-50 px-3 py-2 text-right text-xs text-red-700">
                <p className="font-medium">حدث خطأ أثناء جلب الإعلانات من Supabase.</p>
                <p className="mt-1 break-words">
                  {supabaseError.message ?? "Unknown error"}
                </p>
              </div>
            ) : null}
            {!supabaseError ? (
              <p className="text-[11px] text-zinc-500">
                عدد الإعلانات النشطة (status = 'active') التي تم جلبها: {recentAds.length}
              </p>
            ) : null}
          </section>

          <section className="space-y-4">
            {categorySections.length ? (
              <div className="space-y-6">
                {categorySections.map((section) => (
                  <div key={section.slug} className="space-y-3">
                    <div className="flex items-baseline justify-between">
                      <div className="text-right">
                        <h2 className="text-base font-semibold tracking-tight text-zinc-900">
                          {section.name}
                        </h2>
                      </div>
                      <Link
                        href={`/marketplace?category=${encodeURIComponent(section.slug)}`}
                        className="text-[11px] font-medium text-zinc-600 hover:text-zinc-800"
                      >
                        عرض كل الإعلانات
                      </Link>
                    </div>
                    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                      {section.ads.slice(0, 4).map((ad) => (
                        <AdCard
                          key={ad.id}
                          ad={ad}
                          variant="default"
                          href={`/ads/${ad.id}`}
                        />
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-zinc-500">
                لا توجد إعلانات منشورة بعد.
              </p>
            )}
          </section>
        </main>

        <footer className="mt-10 border-t border-zinc-100 pt-6 text-xs text-zinc-500">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-2">
              <span className="font-medium text-zinc-800">Jootiya</span>
              <span>•</span>
              <span>Un marché en ligne simple pour tous</span>
            </div>
            <div className="flex flex-wrap gap-3">
              <Link href="#" className="hover:text-zinc-700">
                Aide & FAQ
              </Link>
              <Link href="#" className="hover:text-zinc-700">
                Sécurité
              </Link>
              <Link href="#" className="hover:text-zinc-700">
                Conditions
              </Link>
              <Link href="#" className="hover:text-zinc-700">
                Confidentialité
              </Link>
            </div>
          </div>
        </footer>
      </div>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(homepageAdsJsonLd) }}
      />
    </div>
  );
}
