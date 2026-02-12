import { notFound } from "next/navigation";
import Link from "next/link";
import { createSupabaseServerClient, getServerUser } from "@/lib/supabase-server";
import { Button } from "@/components/ui/button";
import { AdImageGallery } from "@/components/ads/AdImageGallery";
import { ContactActions } from "@/components/ads/ContactActions";
import { AdLocationMap } from "@/components/ads/AdLocationMap";
import { AdCard } from "@/components/AdCard";
import { RecentReviews } from "@/components/ads/RecentReviews";
import { ReportModal } from "@/components/ads/ReportModal";
import { ReportButton } from "@/components/ads/ReportButton";
import { FavoriteButton } from "@/components/ads/FavoriteButton";
import {
  MapPin,
  Calendar,
  Share2,
  Heart,
  Flag,
  ShieldCheck,
  CheckCircle2,
  ChevronRight,
  Eye,
  MessageCircle,
  Phone,
  AlertTriangle,
  Award,
  Sparkles,
  Star
} from "lucide-react";
import { QuickActionFooter } from "@/components/ads/QuickActionFooter";
import Image from "next/image";

export const dynamic = "force-dynamic";

interface AdPageProps {
  params: Promise<{
    id: string;
  }>;
}

export async function generateMetadata({ params }: AdPageProps) {
  const { id } = await params;
  const supabase = createSupabaseServerClient();
  const identifier = id;
  const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-5][0-9a-f]{3}-[089ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(identifier);

  let query = supabase
    .from("ads")
    .select("title, city, description, image_urls");

  if (isUuid) {
    query = query.or(`id.eq.${identifier},slug.eq.${identifier}`);
  } else {
    query = query.eq("slug", identifier);
  }

  const { data: ad } = await query.single();

  if (!ad) return { title: "Annonce introuvable | Jootiya" };

  const citySuffix = ad.city ? ` à ${ad.city}` : "";
  const title = `${ad.title}${citySuffix} | Jootiya`;
  const description = ad.description?.slice(0, 160) || `Découvrez cette annonce sur Jootiya: ${ad.title}`;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      images: ad.image_urls?.[0] ? [{ url: ad.image_urls[0] }] : [],
    },
  };
}

export default async function AdPage({ params }: AdPageProps) {
  const { id } = await params;
  const user = await getServerUser();
  const supabase = createSupabaseServerClient();

  const identifier = id;
  const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-5][0-9a-f]{3}-[089ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(identifier);

  // 1. Fetch Main Ad
  let query = supabase
    .from("ads")
    .select(
      "id, title, description, price, currency, city, neighborhood, created_at, image_urls, category, status, views_count, seller_id, slug, condition, phone, latitude, longitude, profiles(phone, full_name, avatar_url, created_at)"
    );

  if (isUuid) {
    query = query.or(`id.eq.${identifier},slug.eq.${identifier}`);
  } else {
    query = query.eq("slug", identifier);
  }

  const { data: adData, error } = await query.single();
  const ad = adData as any;

  if (error || !ad) {
    if (error?.code !== "PGRST116") console.error("Error loading ad:", error);
    notFound();
  }

  // 2. Increment Views (Simple Unique Logic)
  const { cookies } = await import("next/headers");
  const cookieStore = await cookies();
  const viewedCookie = cookieStore.get(`v_${ad.id}`);

  if (!viewedCookie) {
    // Fire and forget RPC (handled by Supabase DB function)
    supabase.rpc('increment_ad_views', { ad_id: ad.id }).then(() => {
      // We can't set cookies in a RSC body, but the DB will handle the count.
      // For perfect uniqueness, we'd use a client component or middleware.
    });
  }

  // 3. Fetch Seller Stats & Reviews
  const { data: stats } = await supabase.rpc('get_seller_stats', { target_seller_id: ad.seller_id });
  const avgRating = stats?.[0]?.avg_rating || 0;
  const totalReviews = stats?.[0]?.total_reviews || 0;
  const isTrusted = totalReviews > 10 && avgRating >= 4.5;

  const { data: reviews } = await supabase
    .from('reviews')
    .select('id, rating, comment, created_at, profiles(full_name, avatar_url)')
    .eq('seller_id', ad.seller_id)
    .eq('status', 'approved')
    .order('created_at', { ascending: false })
    .limit(3);

  // 4. Fetch Similar Ads
  // Strategy: Try Geospatial first (if coords exist), else Category fallback
  let similarAds: any[] = [];

  if (ad.latitude && ad.longitude) {
    const { data: geoAds } = await supabase.rpc('get_ads_nearby', {
      user_lat: ad.latitude,
      user_lon: ad.longitude,
      radius_km: 20, // 20km radius for similar items
      limit_count: 5 // Get 5, filter out current
    });
    if (geoAds) similarAds = geoAds;
  }

  // Create a fallback query if geo didn't return enough (or at all)
  if (similarAds.length < 2) {
    const { data: catAds } = await supabase
      .from("ads")
      .select("id, title, price, currency, city, neighborhood, created_at, is_featured, image_urls, category, status, latitude, longitude")
      .eq("category", ad.category)
      .neq("id", ad.id) // Exclude current
      .limit(4);

    if (catAds) similarAds = [...similarAds, ...catAds];
  }

  // Deduplicate and filter out current ad
  similarAds = similarAds.filter((item, index, self) =>
    index === self.findIndex((t) => t.id === item.id) && item.id !== ad.id
  ).slice(0, 4);


  const images = ad.image_urls || [];
  const formattedPrice = ad.price
    ? Number(ad.price).toLocaleString() + " " + (ad.currency?.trim() || "MAD")
    : "Sur demande";

  const formattedDate = new Date(ad.created_at).toLocaleDateString("fr-FR", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  const sellerProfile = Array.isArray(ad.profiles) ? ad.profiles[0] : ad.profiles;
  const sellerName = sellerProfile?.full_name || "Utilisateur Jootiya";
  const sellerInitial = sellerName.charAt(0).toUpperCase();
  const memberSince = sellerProfile?.created_at ? new Date(sellerProfile.created_at).getFullYear() : "2024";

  return (
    <div dir="ltr" className="min-h-screen bg-[#F8FAFC] dark:bg-zinc-950 pb-32 font-sans text-zinc-900 dark:text-zinc-100">

      {/* Top Header / Breadcrumbs */}
      <div className="bg-white dark:bg-zinc-900 border-b border-zinc-200 dark:border-zinc-800 sticky top-0 z-40 backdrop-blur-md bg-white/90 dark:bg-zinc-900/90 supports-[backdrop-filter]:bg-white/60 dark:supports-[backdrop-filter]:bg-zinc-900/60">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between text-sm">
            <nav className="flex items-center gap-2 text-zinc-500 overflow-hidden">
              <Link href="/" className="hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors flex-shrink-0">Accueil</Link>
              <ChevronRight className="h-4 w-4 flex-shrink-0" />
              <Link href="/marketplace" className="hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors flex-shrink-0">Marché</Link>
              <ChevronRight className="h-4 w-4 flex-shrink-0" />
              <span className="text-zinc-900 dark:text-zinc-100 font-medium truncate">{ad.title}</span>
            </nav>

            <div className="flex items-center gap-3 flex-shrink-0">
              <div className="hidden md:block text-right mr-4">
                <p className="text-xs text-zinc-400 font-bold uppercase tracking-wider">Prix</p>
                <p className="font-black text-orange-600 leading-none">{formattedPrice}</p>
              </div>
              <Button variant="ghost" size="sm" className="hidden sm:flex gap-2 text-zinc-600 hover:text-zinc-900">
                <Share2 className="h-4 w-4" />
                <span className="hidden lg:inline">Partager</span>
              </Button>
              <FavoriteButton
                adId={ad.id}
                className="hover:bg-red-50 text-zinc-600 hover:text-red-600 rounded-xl"
              />
              <ReportButton
                targetId={ad.id}
                targetType="ad"
                reporterId={user?.id}
              />
            </div>
          </div>
        </div>
      </div>

      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">

          {/* Column Left: Media & Details (8/12) */}
          <div className="lg:col-span-8 space-y-8">

            {/* Image Gallery Component */}
            <section className="rounded-3xl overflow-hidden shadow-sm bg-white dark:bg-zinc-900">
              <AdImageGallery images={images} />
            </section>

            {/* Mobile Title & Price (Visible only on mobile) */}
            <div className="lg:hidden space-y-3 px-1">
              <div className="flex items-start justify-between gap-4">
                <h1 className="text-2xl font-bold leading-tight sm:text-3xl text-zinc-900 dark:text-zinc-100">{ad.title}</h1>
                <div className="text-xl font-black text-orange-600 whitespace-nowrap">{formattedPrice}</div>
              </div>
              <div className="flex items-center gap-2 text-sm text-zinc-500">
                <MapPin className="h-4 w-4" />
                <span>{ad.city}, {ad.neighborhood || "Maroc"}</span>
                <span className="w-1 h-1 rounded-full bg-zinc-300" />
                <span>{formattedDate}</span>
              </div>
            </div>

            {/* Description Card */}
            <div className="rounded-3xl bg-white dark:bg-zinc-900 p-6 shadow-sm border border-zinc-100 dark:border-zinc-800 sm:p-8">
              <h2 className="text-lg font-bold flex items-center gap-2 mb-6 text-zinc-900 dark:text-zinc-100">
                <Sparkles className="w-5 h-5 text-orange-500" />
                Description
              </h2>
              <div className="prose prose-zinc prose-p:text-zinc-600 prose-headings:text-zinc-900 max-w-none">
                <p className="whitespace-pre-wrap leading-relaxed text-[15px]">{ad.description || "Aucune description fournie."}</p>
              </div>

              {/* Specs Grid */}
              <div className="mt-10 grid grid-cols-2 gap-4 pt-8 border-t border-zinc-50 sm:grid-cols-3">
                <div className="p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-800 border border-zinc-100 dark:border-zinc-700">
                  <span className="text-[10px] uppercase tracking-wider text-zinc-400 font-bold block mb-1">Catégorie</span>
                  <p className="font-semibold text-zinc-900 dark:text-zinc-100 text-sm">{ad.category || "Autre"}</p>
                </div>
                <div className="p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-800 border border-zinc-100 dark:border-zinc-700">
                  <span className="text-[10px] uppercase tracking-wider text-zinc-400 font-bold block mb-1">État</span>
                  <p className="font-semibold text-zinc-900 dark:text-zinc-100 text-sm flex items-center gap-1.5">
                    {ad.condition === 'new' ? (
                      <>
                        <span className="w-2 h-2 rounded-full bg-green-500" /> Neuf
                      </>
                    ) : (
                      <>
                        <span className="w-2 h-2 rounded-full bg-amber-500" /> Occasion
                      </>
                    )}
                  </p>
                </div>
                <div className="p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-800 border border-zinc-100 dark:border-zinc-700">
                  <span className="text-[10px] uppercase tracking-wider text-zinc-400 font-bold block mb-1">Vues</span>
                  <p className="font-semibold text-zinc-900 dark:text-zinc-100 text-sm flex items-center gap-1.5">
                    <Eye className="w-3.5 h-3.5 text-zinc-400" /> {ad.views_count || 1}
                  </p>
                </div>
              </div>
            </div>

            {/* Location Map */}
            {(ad.latitude && ad.longitude) && (
              <div className="rounded-3xl bg-zinc-900 p-1 overflow-hidden shadow-lg">
                <div className="bg-white rounded-[20px] overflow-hidden relative">
                  <div className="absolute top-4 left-4 z-[400] bg-white/90 backdrop-blur px-4 py-2 rounded-xl shadow-sm border border-zinc-100">
                    <p className="text-xs font-bold flex items-center gap-2">
                      <MapPin className="w-4 h-4 text-orange-600" />
                      Emplacement approximatif
                    </p>
                  </div>
                  <AdLocationMap
                    lat={Number(ad.latitude)}
                    lng={Number(ad.longitude)}
                    city={ad.city}
                    neighborhood={ad.neighborhood}
                  />
                </div>
              </div>
            )}
          </div>

          {/* Column Right: Sticky Sidebar (4/12) */}
          <div className="lg:col-span-4 space-y-6">

            {/* Primary Details Card (Desktop) */}
            <div className="hidden lg:block rounded-3xl bg-white dark:bg-zinc-900 p-8 shadow-sm border border-zinc-100 dark:border-zinc-800 sticky top-24">
              <h1 className="text-2xl font-bold leading-tight mb-2 text-zinc-900 dark:text-zinc-100">{ad.title}</h1>
              <div className="flex items-center gap-2 text-sm text-zinc-500 mb-8">
                <MapPin className="h-4 w-4" />
                <span>{ad.city}</span>
                <span className="text-zinc-300">•</span>
                <span>{formattedDate}</span>
              </div>

              <div className="text-4xl font-black text-zinc-900 dark:text-zinc-100 mb-8 tracking-tight">{formattedPrice}</div>

              <div className="space-y-4">
                <ContactActions
                  adId={ad.id}
                  sellerId={ad.seller_id}
                  currentUser={user}
                  sellerPhone={ad.phone || (Array.isArray(ad.profiles) ? ad.profiles[0]?.phone : ad.profiles?.phone)}
                />
              </div>
            </div>

            {/* Verified Seller Card */}
            <div className="rounded-3xl bg-white dark:bg-zinc-900 p-6 shadow-sm border border-zinc-100 dark:border-zinc-800 relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-24 h-24 bg-orange-50 rounded-bl-[80px] -mr-4 -mt-4 z-0 transition-transform group-hover:scale-110" />

              <div className="relative z-10 flex items-center gap-4 mb-6">
                <div className="h-16 w-16 rounded-full bg-zinc-100 border-2 border-white shadow-md flex items-center justify-center text-xl font-bold text-zinc-400 overflow-hidden">
                  {sellerProfile?.avatar_url ? (
                    <Image src={sellerProfile.avatar_url} alt={sellerName} width={64} height={64} className="w-full h-full object-cover" />
                  ) : (
                    sellerInitial
                  )}
                </div>
                <div>
                  <h3 className="font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-1.5">
                    {sellerName}
                    {isTrusted && (
                      <span className="flex items-center gap-0.5 px-1.5 py-0.5 rounded-full bg-blue-100 text-[10px] text-blue-700 font-extrabold tracking-wide border border-blue-200">
                        <Award className="w-3 h-3" />
                        TOP
                      </span>
                    )}
                  </h3>
                  <p className="text-xs text-zinc-500 font-medium">Membre depuis {memberSince}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 relative z-10">
                <div className="bg-zinc-50 dark:bg-zinc-800 p-3 rounded-2xl text-center border border-zinc-100 dark:border-zinc-700">
                  <span className="block text-lg font-black text-zinc-900 dark:text-zinc-100">100%</span>
                  <span className="text-[10px] text-zinc-400 uppercase font-bold tracking-wider">Réponse</span>
                </div>
                <div className="bg-zinc-50 dark:bg-zinc-800 p-3 rounded-2xl text-center border border-zinc-100 dark:border-zinc-700">
                  <span className="block text-lg font-black text-zinc-900 dark:text-zinc-100 flex items-center justify-center gap-1">
                    {avgRating > 0 ? avgRating : '-'}
                    <Star className="w-3 h-3 text-yellow-500 fill-yellow-500" />
                  </span>
                  <span className="text-[10px] text-zinc-400 uppercase font-bold tracking-wider">{totalReviews} Avis</span>
                </div>
              </div>

              <div className="mt-6 pt-4 border-t border-zinc-50 text-center">
                <Link href={`/profile/${ad.seller_id}`} className="text-xs font-bold text-orange-600 hover:underline flex items-center justify-center gap-1">
                  Voir le profil complet
                  <ChevronRight className="w-3 h-3" />
                </Link>
              </div>
            </div>

            {/* Trust & Safety Shield */}
            <div className="rounded-3xl bg-gradient-to-br from-emerald-50 to-teal-50 p-6 border border-emerald-100/50">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600 shadow-sm">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <h3 className="font-bold text-emerald-900 text-sm">Protection Jootiya</h3>
              </div>
              <p className="text-xs text-emerald-800/80 leading-relaxed mb-4">
                Nous veillons à votre sécurité. Ne payez jamais à l'avance et privilégiez les remises en main propre.
              </p>
              <ul className="space-y-2">
                {["Identité vérifiée", "Support 24/7", "Signalement facile"].map((item, i) => (
                  <li key={i} className="flex items-center gap-2 text-xs font-semibold text-emerald-700">
                    <CheckCircle2 className="w-3.5 h-3.5" /> {item}
                  </li>
                ))}
              </ul>
            </div>

          </div>
        </div>

        {/* Similar Ads Section */}
        {similarAds.length > 0 && (
          <div className="mt-24 border-t border-zinc-100 dark:border-zinc-800 pt-16">
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">Annonces similaires</h2>
              <Link href={`/marketplace?category=${ad.category}`} className="text-sm font-bold text-orange-600 hover:text-orange-700 hidden sm:block">
                Voir plus
              </Link>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 sm:gap-6" style={{ gridTemplateColumns: 'repeat(2, minmax(0, 1fr))' }}>
              {similarAds.map((simAd: any) => (
                <AdCard key={simAd.id} ad={{
                  id: simAd.id,
                  title: simAd.title,
                  price: simAd.price ? `${Number(simAd.price).toLocaleString()} ${simAd.currency || 'MAD'}` : 'Sur demande',
                  location: simAd.city || 'Maroc',
                  imageUrl: (simAd.images || simAd.image_urls)?.[0],
                  createdAt: simAd.created_at ? new Date(simAd.created_at).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' }) : undefined
                }} />
              ))}
            </div>
          </div>
        )}

      </main>

      <QuickActionFooter
        phone={ad.phone || (Array.isArray(ad.profiles) ? ad.profiles[0]?.phone : ad.profiles?.phone)}
        adTitle={ad.title}
        adPrice={formattedPrice}
        adId={ad.id}
        sellerId={ad.seller_id}
        currentUser={user}
      />

    </div>
  );
}
