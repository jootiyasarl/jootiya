import Image from 'next/image';
import Link from 'next/link';
import { Clock, MapPin, Pencil, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { getOptimizedImageUrl } from '@/lib/storageUtils';

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

export function AdCard({ ad, canBoost, onEdit, onDelete }: { ad: Ad; canBoost?: boolean; onEdit?: (ad: Ad) => void; onDelete?: (ad: any) => void }) {
  // Senior/Performance: Use first image and generate 20KB smart thumbnails
  const mainImage = ad.images?.[0] || '/placeholder-ad.jpg';
  const thumbnailUrl = getOptimizedImageUrl(mainImage, { width: 400, height: 400, quality: 60 });
  const blurUrl = getOptimizedImageUrl(mainImage, { width: 20, height: 20, quality: 10 });

  const priceDisplay = ad.price != null ? ad.price.toLocaleString() : 'N/A';
  const currencyDisplay = ad.currency || '';

  return (
    <Link
      href={`/ads/${ad.id}`}
      className="group relative block h-full overflow-hidden rounded-2xl bg-white/70 shadow-sm backdrop-blur-md transition-all duration-300 hover:scale-[1.02] hover:shadow-xl dark:bg-zinc-900/70 dark:border dark:border-white/10"
    >
      <div className="relative aspect-square w-full overflow-hidden bg-gray-100 dark:bg-zinc-800">
        <Image
          src={thumbnailUrl}
          alt={ad.title}
          fill
          placeholder="blur"
          blurDataURL={blurUrl}
          className="object-cover transition-transform duration-500 group-hover:scale-110"
          sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />

        {/* Sold Overlay */}
        {ad.status === "sold" && (
          <div className="absolute inset-0 z-20 flex items-center justify-center bg-black/40 backdrop-blur-[2px]">
            <div className="rotate-[-12deg] rounded-xl border-4 border-white px-4 py-2 text-2xl font-black tracking-tighter text-white shadow-2xl outline outline-2 outline-white/50">
              VENDU
            </div>
          </div>
        )}
      </div>

      <div className="p-4">
        <div className="flex items-start justify-between gap-2">
          <h3 className="line-clamp-2 text-lg font-semibold text-gray-900 dark:text-white group-hover:text-orange-600 transition-colors">
            {ad.title}
          </h3>
          <span className="shrink-0 rounded-full bg-orange-100 px-3 py-1 text-sm font-bold text-orange-700 dark:bg-orange-900/30 dark:text-orange-400">
            {currencyDisplay} {priceDisplay}
          </span>
        </div>

        <div className="mt-4 flex items-center justify-between text-sm text-gray-500 dark:text-gray-400">
          <div className="flex items-center gap-1">
            <MapPin className="h-4 w-4" />
            <span className="truncate max-w-[100px]">{ad.location || 'Unknown'}</span>
          </div>
          <div className="flex items-center gap-1">
            <Clock className="h-4 w-4" />
            <span>{new Date(ad.created_at).toLocaleDateString()}</span>
          </div>
        </div>

        {(onEdit || onDelete) && (
          <div className="mt-4 flex items-center gap-2 pt-4 border-t border-gray-100 dark:border-white/10">
            {onEdit && (
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="flex-1 h-9 rounded-xl gap-2 text-xs font-bold uppercase tracking-wider"
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
                className="h-9 w-9 p-0 rounded-xl border-red-50 text-red-600 hover:bg-red-50"
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
