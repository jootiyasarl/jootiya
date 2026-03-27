import Image from "next/image";
import React from "react";
import Link from "next/link";
import { getRelatedAds } from "@/lib/db/ads";
import { createSupabaseServerClient } from "@/lib/supabase-server";
import { ShoppingBag, ArrowRight } from "lucide-react";

interface RelatedAdsSectionProps {
  category: string;
}

export async function RelatedAdsSection({ category }: RelatedAdsSectionProps) {
  const supabase = createSupabaseServerClient();
  let ads: any[] = [];
  
  if (category) {
    ads = await getRelatedAds(supabase, category, 4);
  }

  if (ads.length === 0) return null;

  return (
    <div className="mt-20 pt-12 border-t border-zinc-100">
      <div className="flex items-center justify-between mb-10">
        <div className="space-y-1">
          <h3 className="text-2xl font-black tracking-tighter text-zinc-900">Articles en vente</h3>
          <p className="text-zinc-500 text-sm font-medium">Découvrez les meilleures offres liées à ce sujet.</p>
        </div>
        <Link 
          href={`/marketplace?category=${category}`} 
          className="inline-flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-orange-500 hover:text-orange-600 transition-colors"
        >
          Tout voir
          <ArrowRight className="h-3 w-3" />
        </Link>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
        {ads.map((ad) => (
          <Link 
            key={ad.id} 
            href={`/ads/${ad.id}`}
            className="group block space-y-3"
          >
            <div className="relative aspect-square rounded-2xl overflow-hidden bg-zinc-100 border border-zinc-100 shadow-sm transition-all group-hover:shadow-xl group-hover:-translate-y-1">
              <Image 
                src={ad.images?.[0] || "/placeholder-ad.jpg"} 
                alt={ad.title}
                fill
                className="object-cover transition-transform duration-500 group-hover:scale-110"
                sizes="(max-width: 768px) 50vw, 25vw"
              />
              <div className="absolute top-2 right-2 px-2 py-1 bg-white/90 backdrop-blur-md rounded-lg text-[10px] font-black text-orange-600 shadow-sm">
                {ad.price} MAD
              </div>
            </div>
            <div>
              <h4 className="text-xs font-bold text-zinc-900 line-clamp-1 group-hover:text-orange-500 transition-colors">{ad.title}</h4>
              <p className="text-[10px] text-zinc-400 font-medium uppercase tracking-widest">{ad.city || "Maroc"}</p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
