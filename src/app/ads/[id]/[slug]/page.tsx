import { notFound } from "next/navigation";
import Link from "next/link";
import { createSupabaseServerClient, getServerUser } from "@/lib/supabase-server";
import { AdImageGallery } from "@/components/ads/AdImageGallery";
import { ContactActions } from "@/components/ads/ContactActions";
import { AdLocationMapDynamic } from "@/components/ads/AdLocationMapDynamic";
import { AdCard } from "@/components/ads/AdCard";
import { FavoriteButton } from "@/components/ads/FavoriteButton";
import { ViralShareButton } from "@/components/ads/ViralShareButton";
import { ShadowViewTracker } from "@/components/ads/ShadowViewTracker";
import {
  MapPin,
  Calendar,
  ShieldCheck,
  CheckCircle2,
  ChevronRight,
  Eye,
  Award,
  Star
} from "lucide-react";
import { QuickActionFooter } from "@/components/ads/QuickActionFooter";
import Image from "next/image";
import { generateSlug } from "@/lib/seo-utils";

export const revalidate = 3600;

interface AdPageProps {
  params: Promise<{
    id: string;
    slug: string;
  }>;
}

export async function generateMetadata({ params }: AdPageProps) {
  const { id, slug: urlSlug } = await params;
  const supabase = createSupabaseServerClient();
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://jootiya.com';
  
  try {
    const { data: ad, error } = await supabase
      .from("ads")
      .select("title, city, description, image_urls, price, currency, slug, id")
      .or(`id.eq.${id},slug.eq.${id}`)
      .maybeSingle();

    if (error || !ad) return { title: "Petites Annonces au Maroc | Jootiya" };

    const formattedPrice = ad.price ? `${Number(ad.price).toLocaleString()} ${ad.currency || 'MAD'}` : "Prix sur demande";
    const metaTitle = `${ad.title} - ${formattedPrice} | Jootiya`;
    const adSlug = ad.slug || urlSlug || generateSlug(ad.title);
    
    return {
      title: metaTitle,
      description: ad.description?.slice(0, 160),
      alternates: { canonical: `${baseUrl}/ads/${ad.id}/${adSlug}` },
    };
  } catch (err) {
    return { title: "Petites Annonces au Maroc | Jootiya" };
  }
}

export default async function AdPage({ params }: AdPageProps) {
  const { id, slug } = await params;
  const user = await getServerUser();
  const supabase = createSupabaseServerClient();

  const { data: ad, error } = await supabase
    .from("ads")
    .select(`*, profiles(phone, full_name, avatar_url, created_at)`)
    .or(`id.eq.${id},slug.eq.${id}`)
    .maybeSingle();

  if (error || !ad) notFound();

  const sellerProfile = (ad as any).profiles;
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://jootiya.com';
  const formattedPrice = ad.price ? `${Number(ad.price).toLocaleString()} ${ad.currency || 'MAD'}` : "Sur demande";
  const formattedDate = new Date(ad.created_at).toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" });
  const sellerName = sellerProfile?.full_name || "Utilisateur Jootiya";
  const memberSince = sellerProfile?.created_at ? new Date(sellerProfile.created_at).getFullYear() : "2024";

  const images = (ad.image_urls || []).map((img: string) => 
    img.startsWith('http') ? img : `${baseUrl}/${img.startsWith('/') ? img.substring(1) : img}`
  );

  const { data: stats } = await supabase.rpc('get_seller_stats', { target_seller_id: ad.seller_id });
  const avgRating = stats?.[0]?.avg_rating || 0;
  const totalReviews = stats?.[0]?.total_reviews || 0;
  const isTrusted = totalReviews > 10 && avgRating >= 4.5;

  const { data: similarAds } = await supabase
    .from("ads")
    .select("*")
    .eq("category", ad.category)
    .neq("id", ad.id)
    .limit(4);

  return (
    <div dir="ltr" className="bg-[#F8FAFC] dark:bg-zinc-950 pb-8 font-sans">
      <ShadowViewTracker adId={ad.id} category={ad.category} />
      
      {/* Unified Breadcrumbs - Responsive & Professional */}
      <div className="sticky top-[50px] md:top-[128px] z-30 bg-white/80 dark:bg-zinc-950/80 backdrop-blur-md border-b border-zinc-100 dark:border-zinc-800">
        <div className="max-w-[1440px] mx-auto px-4 md:px-8 py-3">
          <nav className="flex items-center gap-2 text-[12px] font-bold text-zinc-500 uppercase tracking-wider overflow-x-auto no-scrollbar whitespace-nowrap">
            <Link href="/" className="hover:text-orange-600 shrink-0">Accueil</Link>
            <ChevronRight className="h-3.5 w-3.5 text-zinc-300 shrink-0" />
            <Link href="/marketplace" className="hover:text-orange-600 shrink-0">Marché</Link>
            <ChevronRight className="h-3.5 w-3.5 text-zinc-300 shrink-0" />
            <span className="text-orange-600 font-black shrink-0">{ad.category || "Annonce"}</span>
            <ChevronRight className="h-3.5 w-3.5 text-zinc-300 shrink-0" />
            <span className="text-zinc-400 truncate max-w-[200px] md:max-w-none font-medium shrink-0">{ad.title}</span>
          </nav>
        </div>
      </div>
      
      <main className="max-w-[1440px] mx-auto px-4 md:px-8 pt-4 md:pt-14 pb-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Main Content Column */}
          <div className="lg:col-span-8 space-y-6">
            <section className="rounded-2xl overflow-hidden bg-white dark:bg-zinc-900 shadow-sm ring-1 ring-zinc-100 dark:ring-white/5">
              <AdImageGallery images={images} />
            </section>

            {/* Title & Info - Unified for all screens */}
            <div className="space-y-4">
              <div className="flex flex-col gap-2">
                <div className="flex items-center justify-between">
                  <p className="text-2xl font-black text-orange-600 tracking-tight">{formattedPrice}</p>
                  <FavoriteButton adId={ad.id} className="h-10 w-10 hover:bg-red-50 rounded-xl" />
                </div>
                <h1 className="text-2xl md:text-3xl font-black tracking-tighter text-zinc-900 dark:text-white leading-tight">
                  {ad.title}
                </h1>
                <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm font-medium text-zinc-500">
                  <span className="flex items-center gap-1.5"><MapPin className="h-4 w-4 text-orange-500" />{ad.city}</span>
                  <span className="h-1 w-1 rounded-full bg-zinc-300" />
                  <span className="flex items-center gap-1.5"><Calendar className="h-4 w-4 text-orange-500" />{formattedDate}</span>
                  <span className="h-1 w-1 rounded-full bg-zinc-300" />
                  <span className="flex items-center gap-1.5"><Eye className="h-4 w-4 text-orange-500" />{ad.views_count || 1} vues</span>
                </div>
              </div>

              <div className="bg-white dark:bg-zinc-900 rounded-2xl p-6 shadow-sm ring-1 ring-zinc-100 dark:ring-white/5">
                <h2 className="text-lg font-black mb-4">Description</h2>
                <p className="whitespace-pre-wrap leading-relaxed text-zinc-700 dark:text-zinc-300">
                  {ad.description || "Aucune description fournie."}
                </p>
                
                <div className="mt-8 pt-8 border-t border-zinc-100 dark:border-zinc-800 grid grid-cols-2 md:grid-cols-3 gap-4">
                  <div className="space-y-1">
                    <p className="text-[10px] uppercase font-black text-zinc-400 tracking-widest">Catégorie</p>
                    <p className="font-bold">{ad.category || "Autre"}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-[10px] uppercase font-black text-zinc-400 tracking-widest">État</p>
                    <p className="font-bold">{ad.condition === 'new' ? "Neuf" : "Occasion"}</p>
                  </div>
                </div>
              </div>

              {ad.latitude && ad.longitude && (
                <div className="rounded-2xl overflow-hidden shadow-sm ring-1 ring-zinc-100 dark:ring-white/5 h-[300px]">
                  <AdLocationMapDynamic lat={Number(ad.latitude)} lng={Number(ad.longitude)} city={ad.city} />
                </div>
              )}
            </div>

            {similarAds && similarAds.length > 0 && (
              <section className="pt-8">
                <h2 className="text-xl font-black mb-6">Annonces similaires</h2>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {similarAds.map((simAd) => (
                    <AdCard key={simAd.id} ad={{...simAd, images: simAd.image_urls}} />
                  ))}
                </div>
              </section>
            )}
          </div>

          {/* Sidebar Column */}
          <aside className="lg:col-span-4 space-y-4">
            <div className="lg:sticky lg:top-[180px] space-y-4">
              <div className="bg-white dark:bg-zinc-900 p-6 rounded-2xl shadow-sm ring-1 ring-zinc-100 dark:ring-white/5">
                <p className="text-sm font-black text-zinc-400 uppercase tracking-widest mb-1">Prix</p>
                <p className="text-3xl font-black text-orange-600 mb-6">{formattedPrice}</p>
                <ContactActions adId={ad.id} sellerId={ad.seller_id} currentUser={user} sellerPhone={ad.phone || sellerProfile?.phone} />
                
                {user?.id === ad.seller_id && (
                  <div className="mt-4 pt-4 border-t border-zinc-100 dark:border-zinc-800">
                    <ViralShareButton adId={ad.id} adTitle={ad.title} adPrice={formattedPrice} sellerId={ad.seller_id} />
                  </div>
                )}
              </div>

              <div className="bg-white dark:bg-zinc-900 p-6 rounded-2xl shadow-sm ring-1 ring-zinc-100 dark:ring-white/5">
                <div className="flex items-center gap-4 mb-6">
                  <div className="h-14 w-14 rounded-full bg-zinc-100 flex items-center justify-center text-xl font-black overflow-hidden ring-2 ring-orange-500/10">
                    {sellerProfile?.avatar_url ? (
                      <Image src={sellerProfile.avatar_url} alt={sellerName} width={56} height={56} className="object-cover" />
                    ) : sellerName.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <h3 className="font-black text-lg flex items-center gap-2">
                      {sellerName}
                      {isTrusted && <Award className="w-5 h-5 text-blue-500" />}
                    </h3>
                    <p className="text-xs text-zinc-500 font-medium">Membre منذ {memberSince}</p>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-2 mb-6">
                  <div className="bg-zinc-50 dark:bg-zinc-800/50 p-3 rounded-xl text-center">
                    <p className="text-lg font-black">100%</p>
                    <p className="text-[10px] text-zinc-400 uppercase font-black tracking-widest">Réponse</p>
                  </div>
                  <div className="bg-zinc-50 dark:bg-zinc-800/50 p-3 rounded-xl text-center">
                    <p className="text-lg font-black flex items-center justify-center gap-1">
                      {avgRating || '-'}<Star className="w-3 h-3 fill-yellow-500 text-yellow-500" />
                    </p>
                    <p className="text-[10px] text-zinc-400 uppercase font-black tracking-widest">{totalReviews} Avis</p>
                  </div>
                </div>
                <Link href={`/profile/${ad.seller_id}`} className="block text-center text-sm font-black text-orange-600 hover:underline">
                  Voir le profil complet
                </Link>
              </div>

              <div className="bg-gradient-to-br from-emerald-500/10 to-teal-500/10 p-6 rounded-2xl ring-1 ring-emerald-500/20">
                <div className="flex items-center gap-3 mb-3">
                  <ShieldCheck className="w-8 h-8 text-emerald-600" />
                  <h3 className="font-black text-emerald-900 dark:text-emerald-400">Protection Jootiya</h3>
                </div>
                <p className="text-sm text-emerald-800 dark:text-emerald-500/80 mb-4 font-medium">Achetez et vendez en toute sécurité.</p>
                <ul className="space-y-2 text-xs font-bold text-emerald-700 dark:text-emerald-500">
                  <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4" /> Identité vérifiée</li>
                  <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4" /> Support 24/7</li>
                </ul>
              </div>
            </div>
          </aside>
        </div>
      </main>
      <QuickActionFooter phone={ad.phone || sellerProfile?.phone} adTitle={ad.title} adPrice={formattedPrice} adId={ad.id} sellerId={ad.seller_id} currentUser={user} />
    </div>
  );
}
