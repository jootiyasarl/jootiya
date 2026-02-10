import Image from "next/image";

interface AdCardPreviewProps {
  title: string;
  price: string;
  images: string[];
  locationLabel: string;
  distanceLabel: string;
  isWholesale: boolean;
}

export function AdCardPreview({
  title,
  price,
  images,
  locationLabel,
  distanceLabel,
  isWholesale,
}: AdCardPreviewProps) {
  const primaryImage = images[0] ?? "";

  return (
    <article className="overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-sm">
      <div className="relative h-56 w-full bg-zinc-100 sm:h-64">
        {primaryImage ? (
          <Image
            src={primaryImage}
            alt={title}
            fill
            sizes="(max-width: 768px) 100vw, 640px"
            className="object-cover"
          />
        ) : null}
      </div>

      <div className="space-y-3 p-4 text-sm text-zinc-700">
        <header className="space-y-1">
          <p className="line-clamp-2 text-base font-semibold text-zinc-900">
            {title}
          </p>
          <p className="text-xs text-zinc-500">{locationLabel}</p>
        </header>

        <div className="flex items-center justify-between text-xs text-zinc-500">
          <span className="text-sm font-semibold text-zinc-900">
            {price}
          </span>
          <span>{distanceLabel}</span>
        </div>

        <footer className="flex items-center justify-between text-[11px] text-zinc-500">
          {isWholesale ? (
            <span className="rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-medium text-emerald-700">
              Vente en gros
            </span>
          ) : (
            <span className="rounded-full bg-zinc-100 px-2 py-0.5 text-[10px] font-medium text-zinc-700">
              Annonce classique
            </span>
          )}

          {images.length > 1 ? (
            <span>{images.length} photos</span>
          ) : null}
        </footer>
      </div>
    </article>
  );
}

