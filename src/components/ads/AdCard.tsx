import Image from 'next/image';
import Link from 'next/link';
import { Pencil, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { getOptimizedImageUrl } from '@/lib/storageUtils';
import { WishlistHeart } from './WishlistHeart';
import { formatDistanceToNow } from 'date-fns';
import { fr } from 'date-fns/locale';

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
  const mainImage = ad.images?.[0] || '/placeholder-ad.jpg';
  const thumbnailUrl = getOptimizedImageUrl(mainImage, { width: 500, height: 500, quality: 75 });
  const blurUrl = getOptimizedImageUrl(mainImage, { width: 20, height: 20, quality: 10 });

  const priceDisplay = ad.price != null ? ad.price.toLocaleString() : 'N/A';
  const currencyDisplay = ad.currency || 'MAD';
  
  const timeAgo = formatDistanceToNow(new Date(ad.created_at), { addSuffix: false, locale: fr })
    .replace('environ ', '')
    .replace('il y a ', '');

  return (
    <Link
      href={`/ads/${ad.id}`}
      className="airbnb-card group"
    >
      {/* Image Container */}
      <div className="airbnb-card-image-wrapper">
        <Image
          src={thumbnailUrl}
          alt={ad.title}
          fill
          placeholder="blur"
          blurDataURL={blurUrl}
          className="airbnb-card-image"
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
          loading="lazy"
          unoptimized
        />

        {/* Wishlist Heart */}
        <div className="airbnb-wishlist-pos">
          <WishlistHeart adId={ad.id} />
        </div>

        {/* Sold Overlay */}
        {ad.status === "sold" && (
          <div className="absolute inset-0 z-10 flex items-center justify-center bg-black/30 backdrop-blur-[1px]">
            <div className="rounded-lg bg-white/90 px-3 py-1 text-xs font-black tracking-tight text-black uppercase">
              Vendu
            </div>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="airbnb-card-content">
        <div className="airbnb-card-title-row">
          <h3 className="airbnb-card-title">
            {ad.title}
          </h3>
          {/* Optional: Rating like in image if you have it */}
          <div className="flex items-center gap-1 text-[14px]">
            <span className="text-zinc-900 font-medium">★</span>
            <span className="text-zinc-900">5,0</span>
          </div>
        </div>

        <p className="airbnb-card-location">
          {ad.location || 'Maroc'}
        </p>

        <p className="airbnb-card-time">
          Il y a {timeAgo}
        </p>

        <div className="airbnb-card-price">
          {currencyDisplay} {priceDisplay}
          <span className="airbnb-card-price-unit">total</span>
        </div>

        {/* Edit/Delete Actions (Dashboard only) */}
        {(onEdit || onDelete) && (
          <div className="mt-2 flex items-center gap-2 pt-2">
            {onEdit && (
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="flex-1 h-8 rounded-lg text-[11px] font-bold border-zinc-200"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  onEdit(ad);
                }}
              >
                <Pencil className="h-3 w-3 mr-1" />
                Modifier
              </Button>
            )}
            {onDelete && (
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="h-8 w-8 p-0 rounded-lg border-red-100 text-red-600 hover:bg-red-50"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  onDelete(ad);
                }}
              >
                <Trash2 className="h-3.5 w-3.5" />
              </Button>
            )}
          </div>
        )}
      </div>
    </Link>
  );
}
