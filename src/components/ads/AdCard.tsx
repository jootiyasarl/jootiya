import Image from 'next/image';
import Link from 'next/link';
import { MapPin, Pencil, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { getOptimizedImageUrl } from '@/lib/storageUtils';
import { WishlistHeart } from './WishlistHeart';

export interface Ad {
  id: string;
  title: string;
  price: number | null;
  currency: string | null;
  images: string[] | null;
  location?: string | null;
  created_at: string;
  status?: string;
}

export function AdCard({ ad, canBoost, onEdit, onDelete }: { ad: Ad; canBoost?: boolean; onEdit?: (ad: Ad) => void; onDelete?: (ad: Ad) => void }) {
  // Minimalist: Use optimized thumbnails
  const mainImage = ad.images?.[0] || '/placeholder-ad.jpg';
  const thumbnailUrl = getOptimizedImageUrl(mainImage, { width: 400, height: 400, quality: 60 });
  const blurUrl = getOptimizedImageUrl(mainImage, { width: 20, height: 20, quality: 10 });

  const priceDisplay = ad.price != null ? ad.price.toLocaleString() : 'N/A';
  const currencyDisplay = ad.currency || 'MAD';

  return (
    <Link
      href={`/ads/${ad.id}`}
      className="group relative block overflow-hidden transition-all duration-200 hover:-translate-y-1"
    >
      {/* Image Container - Minimalist with rounded-xl */}
      <div className="relative aspect-square w-full overflow-hidden rounded-xl bg-zinc-100 dark:bg-zinc-800 p-0.5">
        <div className="relative w-full h-full rounded-lg overflow-hidden">
          <Image
            src={thumbnailUrl}
            alt={ad.title}
            fill
            placeholder="blur"
            blurDataURL={blurUrl}
            className="object-cover transition-transform duration-300 group-hover:scale-105"
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
            loading="lazy"
          />

          {/* Wishlist Heart - Top Right */}
          <WishlistHeart adId={ad.id} />

          {/* Sold Overlay */}
          {ad.status === "sold" && (
            <div className="absolute inset-0 z-20 flex items-center justify-center bg-black/40 backdrop-blur-[2px]">
              <div className="rotate-[-12deg] rounded-xl border-4 border-white px-4 py-2 text-2xl font-black tracking-tighter text-white shadow-floating">
                VENDU
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Content - Minimalist with generous spacing */}
      <div className="mt-3 space-y-2">
        {/* Title - Clean and simple */}
        <h3 className="line-clamp-2 text-sm font-medium text-zinc-900 dark:text-zinc-100 leading-snug">
          {ad.title}
        </h3>

        {/* Location - Subtle */}
        <div className="flex items-center gap-1 text-xs text-zinc-500 dark:text-zinc-400">
          <MapPin className="h-3 w-3" strokeWidth={1.5} />
          <span className="truncate">{ad.location || 'Maroc'}</span>
        </div>

        {/* Price - Bold Orange at Bottom */}
        <div className="text-xl font-extrabold text-[#FF6B00]">
          {priceDisplay} {currencyDisplay}
        </div>

        {/* Edit/Delete Actions (Dashboard only) */}
        {(onEdit || onDelete) && (
          <div className="mt-3 flex items-center gap-2 pt-3 border-t border-zinc-100 dark:border-zinc-800">
            {onEdit && (
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="flex-1 h-9 rounded-xl gap-2 text-xs font-bold"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  onEdit(ad);
                }}
              >
                <Pencil className="h-3.5 w-3.5" />
                Modifier
              </Button>
            )}
            {onDelete && (
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="h-9 w-9 p-0 rounded-xl border-red-200 text-red-600 hover:bg-red-50 dark:border-red-900 dark:hover:bg-red-950"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  onDelete(ad);
                }}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            )}
          </div>
        )}
      </div>
    </Link>
  );
}
