import { notFound } from "next/navigation";
import Link from "next/link";
import { createSupabaseServerClient, getServerUser } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { AdImageGallery } from "@/components/ads/AdImageGallery";
import { ContactActions } from "@/components/ads/ContactActions";
import { MobileAdActions } from "@/components/ads/MobileAdActions";
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
  AlertTriangle
} from "lucide-react";

export const dynamic = "force-dynamic";

interface AdPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function AdPage({ params }: AdPageProps) {
  const { id } = await params;
  const user = await getServerUser();
  const supabase = createSupabaseServerClient();

  const identifier = id;
  const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-5][0-9a-f]{3}-[089ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(identifier);

  let query = supabase
    .from("ads")
    .select(
      "id, title, description, price, currency, city, neighborhood, created_at, image_urls, category, status, views_count, seller_id, slug"
    );

  if (isUuid) {
    query = query.or(`id.eq.${identifier},slug.eq.${identifier}`);
  } else {
    query = query.eq("slug", identifier);
  }

  const { data: ad, error } = await query.single();

  if (error || !ad) {
    if (error?.code !== "PGRST116") {
      console.error("Error loading ad:", error);
    }
    notFound();
  }

  // Increment views using the actual UUID
  supabase.rpc('increment_ad_views', { ad_id: ad.id }).then();

  const images = ad.image_urls || [];
  const formattedPrice = ad.price
    ? Number(ad.price).toLocaleString() + " " + (ad.currency?.trim() || "MAD")
    : "Contactez-nous pour plus d'informations";

  const formattedDate = new Date(ad.created_at).toLocaleDateString("fr-FR", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  return (
    <div dir="ltr" className="min-h-screen bg-[#F8FAFC] pb-20 font-sans text-zinc-900">

      {/* Top Header / Breadcrumbs */}
      <div className="bg-white border-b border-zinc-200">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-14 items-center justify-between text-sm">
            <nav className="flex items-center gap-2 text-zinc-500">
              <Link href="/" className="hover:text-zinc-900 transition-colors">Accueil</Link>
              <ChevronRight className="h-4 w-4" />
              <Link href="/marketplace" className="hover:text-zinc-900 transition-colors">Marché</Link>
              <ChevronRight className="h-4 w-4" />
              <span className="text-zinc-900 font-medium truncate max-w-[200px]">{ad.title}</span>
            </nav>

            <div className="flex items-center gap-3">
              <Button variant="ghost" size="sm" className="hidden sm:flex gap-2 text-zinc-600 hover:text-zinc-900">
                <Share2 className="h-4 w-4" />
                <span>Partager</span>
              </Button>
              <Button variant="ghost" size="sm" className="hidden sm:flex gap-2 text-zinc-600 hover:text-red-600">
                <Heart className="h-4 w-4" />
                <span>Enregistrer</span>
              </Button>
            </div>
          </div>
        </div>
      </div>

      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">

          {/* Column Left: Media & Details (8/12) */}
          <div className="lg:col-span-8 space-y-8">

            {/* Image Gallery Component */}
            <section>
              <AdImageGallery images={images} />
            </section>

            {/* Mobile Header (Shows only on small screens) */}
            <div className="lg:hidden space-y-4">
              <div className="flex flex-col gap-2">
                <h1 className="text-2xl font-bold leading-tight sm:text-3xl">{ad.title}</h1>
                <div className="text-3xl font-extrabold text-blue-600">{formattedPrice}</div>
              </div>
              <div className="flex flex-wrap gap-4 text-sm text-zinc-500">
                <div className="flex items-center gap-1.5 bg-white px-3 py-1.5 rounded-full border border-zinc-200 shadow-sm">
                  <MapPin className="h-4 w-4 text-zinc-400" />
                  <span>{ad.city || "Maroc"}</span>
                </div>
                <div className="flex items-center gap-1.5 bg-white px-3 py-1.5 rounded-full border border-zinc-200 shadow-sm">
                  <Calendar className="h-4 w-4 text-zinc-400" />
                  <span>{formattedDate}</span>
                </div>
                <div className="flex items-center gap-1.5 bg-white px-3 py-1.5 rounded-full border border-zinc-200 shadow-sm">
                  <Eye className="h-4 w-4 text-zinc-400" />
                  <span>{ad.views_count || 0} vues</span>
                </div>
              </div>
            </div>

            {/* Content Cards */}
            <div className="space-y-6">
              {/* Description Card */}
              <div className="rounded-3xl bg-white p-6 shadow-md shadow-zinc-200/50 border border-zinc-100 sm:p-8">
                <h2 className="mb-6 text-xl font-bold flex items-center gap-2">
                  <span className="h-8 w-1.5 rounded-full bg-blue-600" />
                  Détails de l'annonce
                </h2>
                <div className="prose prose-zinc max-w-none text-[16px] leading-relaxed text-zinc-700 whitespace-pre-wrap">
                  {ad.description || "Aucune description supplémentaire pour cette annonce."}
                </div>

                {/* Meta list */}
                <div className="mt-8 grid grid-cols-2 gap-4 border-t border-zinc-100 pt-8 sm:grid-cols-3">
                  <div className="space-y-1">
                    <span className="text-xs uppercase tracking-wider text-zinc-400 font-bold">Catégorie</span>
                    <p className="font-semibold text-zinc-900">{ad.category || "Non spécifié"}</p>
                  </div>
                  <div className="space-y-1">
                    <span className="text-xs uppercase tracking-wider text-zinc-400 font-bold">État</span>
                    <p className="font-semibold text-zinc-900">Occasion</p>
                  </div>
                  <div className="space-y-1">
                    <span className="text-xs uppercase tracking-wider text-zinc-400 font-bold">Quartier</span>
                    <p className="font-semibold text-zinc-900">{ad.neighborhood || ad.city}</p>
                  </div>
                </div>
              </div>

              {/* Safety Section */}
              <div className="rounded-3xl bg-amber-50/50 p-6 border border-amber-100/80">
                <div className="flex gap-4">
                  <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-2xl bg-amber-100 text-amber-700">
                    <ShieldCheck className="h-6 w-6" />
                  </div>
                  <div className="space-y-1">
                    <h3 className="font-bold text-amber-900">Conseils de sécurité</h3>
                    <p className="text-sm text-amber-800/80">
                      Votre sécurité nous tient à cœur. Veuillez suivre ces étapes pour une transaction sécurisée :
                    </p>
                    <ul className="mt-3 grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-2 text-sm text-amber-800/70">
                      <li className="flex items-center gap-2">
                        <CheckCircle2 className="h-4 w-4 text-amber-600" />
                        <span>Rencontrez le vendeur dans un lieu public.</span>
                      </li>
                      <li className="flex items-center gap-2">
                        <CheckCircle2 className="h-4 w-4 text-amber-600" />
                        <span>N'envoyez pas d'argent avant d'avoir vu l'article.</span>
                      </li>
                      <li className="flex items-center gap-2">
                        <CheckCircle2 className="h-4 w-4 text-amber-600" />
                        <span>Vérifiez le prix du marché pour cet article.</span>
                      </li>
                      <li className="flex items-center gap-2">
                        <CheckCircle2 className="h-4 w-4 text-amber-600" />
                        <span>Informez un proche de votre rendez-vous.</span>
                      </li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Column Right: Action Sidebar (4/12) */}
          <div className="lg:col-span-4 space-y-6">

            {/* Price & Primary Actions Card */}
            <div className="sticky top-24 space-y-6">
              <div className="hidden lg:block rounded-3xl bg-white p-8 shadow-md shadow-zinc-200/50 border border-zinc-100">
                <div className="space-y-2 mb-8">
                  <h1 className="text-2xl font-bold leading-tight">{ad.title}</h1>
                  <div className="flex items-center gap-2 text-zinc-500 text-sm">
                    <MapPin className="h-4 w-4" />
                    <span>{ad.city}</span>
                    <span>•</span>
                    <span>Modifié le {formattedDate}</span>
                  </div>
                </div>

                <div className="space-y-6">
                  <div className="text-3xl font-black text-blue-600">{formattedPrice}</div>

                  <ContactActions
                    adId={ad.id}
                    sellerId={ad.seller_id}
                    currentUser={user}
                  />
                </div>
              </div>

              {/* Seller Profiling Card */}
              <div className="rounded-3xl bg-white p-6 shadow-md shadow-zinc-200/50 border border-zinc-100">
                <h3 className="mb-4 text-sm font-bold uppercase tracking-wider text-zinc-400">Vendeur</h3>
                <div className="flex items-center gap-4">
                  <div className="h-14 w-14 rounded-2xl bg-gradient-to-br from-zinc-100 to-zinc-200 flex items-center justify-center text-zinc-400 ring-4 ring-zinc-50">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-7 h-7"><path fillRule="evenodd" d="M7.5 6a4.5 4.5 0 1 1 9 0 4.5 4.5 0 0 1-9 0ZM3.751 20.105a8.25 8.25 0 0 1 16.498 0 .75.75 0 0 1-.437.695A18.683 18.683 0 0 1 12 22.5c-2.786 0-5.433-.608-7.812-1.7a.75.75 0 0 1-.437-.695Z" clipRule="evenodd" /></svg>
                  </div>
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-1.5 font-bold text-zinc-900">
                      Utilisateur Jootiya
                      <CheckCircle2 className="h-4 w-4 text-blue-500" />
                    </div>
                    <div className="text-sm text-zinc-500">Membre actif depuis 1 an</div>
                  </div>
                </div>

                <div className="mt-6 pt-6 border-t border-zinc-50">
                  <Link href={`/marketplace?seller_id=${ad.seller_id}`} className="text-sm font-bold text-blue-600 hover:text-blue-700 transition-colors flex items-center gap-1">
                    Voir toutes les annonces de ce vendeur
                    <ChevronRight className="h-4 w-4" />
                  </Link>
                </div>
              </div>

              {/* Report Section */}
              <div className="flex flex-col items-center gap-4">
                <button className="text-zinc-400 hover:text-red-500 flex items-center gap-1.5 text-xs font-medium transition-colors">
                  <Flag className="h-3.5 w-3.5" />
                  Signaler un problème
                </button>

                <div className="flex items-center gap-2 py-3 px-4 rounded-2xl bg-red-50 text-red-700 text-[11px] border border-red-100">
                  <AlertTriangle className="h-4 w-4 flex-shrink-0" />
                  <span>Ne transférez jamais d'argent à l'avance. Jootiya ne garantit pas les paiements.</span>
                </div>
              </div>
            </div>
          </div>

        </div>
      </main>

      {/* Mobile Sticky Bar */}
      <MobileAdActions
        adId={ad.id}
        sellerId={ad.seller_id}
        sellerPhone={undefined} // Phone not yet in schema
        currentUser={user}
      />

    </div>
  );
}
