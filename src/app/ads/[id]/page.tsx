import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import { AdCardPreview } from "@/components/ads/AdCardPreview";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

type PageProps = {
  params: {
    id: string;
  };
};

type AdStatus = "pending" | "active" | "rejected" | string;

type AdRow = {
  id: string;
  seller_id: string;
  title: string;
  description: string | null;
  price: number | string | null;
  currency: string | null;
  city: string | null;
  neighborhood: string | null;
  latitude: number | null;
  longitude: number | null;
  search_radius_km: number | null;
  image_urls: string[] | null;
  is_wholesale: boolean | null;
  status: AdStatus;
};

type SellerProfile = {
  id: string;
  full_name: string | null;
  city: string | null;
};

async function fetchAdWithSeller(id: string): Promise<
  | {
      ad: AdRow;
      seller: SellerProfile | null;
    }
  | null
> {
  const { data: ad, error } = await supabase
    .from("ads")
    .select("*")
    .eq("id", id)
    .maybeSingle<AdRow>();

  if (error) {
    throw error;
  }

  if (!ad) {
    return null;
  }

  const { data: seller, error: sellerError } = await supabase
    .from("profiles")
    .select("id, full_name, city")
    .eq("id", ad.seller_id)
    .maybeSingle<SellerProfile>();

  if (sellerError) {
    // Seller profile is optional for SEO; we can still render the ad.
    return { ad, seller: null };
  }

  return { ad, seller: seller ?? null };
}

export async function generateMetadata(
  { params }: PageProps,
): Promise<Metadata> {
  const data = await fetchAdWithSeller(params.id);

  if (!data || data.ad.status !== "active") {
    return {
      title: "Ad not found | Jootiya",
      description: "This ad is not available or not yet approved.",
      robots: {
        index: false,
        follow: false,
      },
    };
  }

  const { ad, seller } = data;

  const baseTitle = ad.title;
  const formattedPrice =
    ad.price != null
      ? `${ad.price} ${ad.currency ?? ""}`.trim()
      : undefined;
  const title = formattedPrice
    ? `${baseTitle} – ${formattedPrice} | Jootiya`
    : `${baseTitle} | Jootiya`;

  const description =
    ad.description ??
    `${ad.title} in ${ad.city ?? "your area"} on Jootiya. Find local, trusted listings near you.`;

  const images = Array.isArray(ad.image_urls) ? ad.image_urls : [];
  const canonicalUrl = new URL(`/ads/${ad.id}`, siteUrl).toString();

  return {
    title,
    description,
    alternates: {
      canonical: canonicalUrl,
    },
    openGraph: {
      type: "website",
      url: canonicalUrl,
      title,
      description,
      images: images.map((src) => ({ url: src, alt: ad.title })),
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: images.length > 0 ? [images[0]] : undefined,
    },
    robots: {
      index: true,
      follow: true,
    },
    authors: seller?.full_name
      ? [
          {
            name: seller.full_name,
          },
        ]
      : undefined,
  };
}

export default async function AdPage({ params }: PageProps) {
  const data = await fetchAdWithSeller(params.id);

  if (!data || data.ad.status !== "active") {
    notFound();
  }

  const { ad, seller } = data;

  const images = Array.isArray(ad.image_urls) ? ad.image_urls : [];
  const formattedPrice =
    ad.price != null
      ? `${ad.price} ${ad.currency ?? ""}`.trim()
      : "";

  const locationLabel =
    ad.neighborhood && ad.city
      ? `${ad.neighborhood}, ${ad.city}`
      : ad.city ?? "Nearby";

  const distanceLabel = ad.search_radius_km
    ? `${ad.search_radius_km} km radius`
    : "Local";

  const canonicalUrl = new URL(`/ads/${ad.id}`, siteUrl).toString();

  const productSchema = {
    "@type": "Product",
    name: ad.title,
    description:
      ad.description ??
      `${ad.title} available in ${ad.city ?? "your area"}.`,
    image: images,
    offers: {
      "@type": "Offer",
      price: ad.price ?? undefined,
      priceCurrency: ad.currency ?? "MAD",
      availability: "https://schema.org/InStock",
      url: canonicalUrl,
    },
    seller: {
      "@id": "#seller",
    },
  };

  const localBusinessSchema = {
    "@type": "LocalBusiness",
    "@id": "#seller",
    name: seller?.full_name ?? "Jootiya seller",
    areaServed: ad.city ?? undefined,
    address: {
      "@type": "PostalAddress",
      addressLocality: ad.city ?? undefined,
      addressRegion: undefined,
      addressCountry: "MA",
    },
    geo:
      ad.latitude != null && ad.longitude != null
        ? {
            "@type": "GeoCoordinates",
            latitude: ad.latitude,
            longitude: ad.longitude,
          }
        : undefined,
    url: canonicalUrl,
  };

  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [productSchema, localBusinessSchema],
  };

  return (
    <div className="min-h-screen bg-zinc-50">
      <div className="mx-auto w-full max-w-4xl px-4 py-8">
        <AdCardPreview
          title={ad.title}
          price={formattedPrice}
          images={images}
          locationLabel={locationLabel}
          distanceLabel={distanceLabel}
          isWholesale={Boolean(ad.is_wholesale)}
        />

        <section className="mt-6 space-y-3 rounded-2xl border bg-white p-4">
          <h1 className="text-base font-semibold text-zinc-900">
            {ad.title}
          </h1>
          {ad.description ? (
            <p className="whitespace-pre-line text-sm text-zinc-700">
              {ad.description}
            </p>
          ) : null}

          <div className="mt-2 grid gap-2 text-xs text-zinc-500 md:grid-cols-2">
            <div>
              <p className="font-medium text-zinc-700">Location</p>
              <p>
                {ad.neighborhood ? `${ad.neighborhood}, ` : null}
                {ad.city ?? "Nearby"}
              </p>
            </div>
            <div>
              <p className="font-medium text-zinc-700">Seller</p>
              <p>{seller?.full_name ?? "Private seller"}</p>
            </div>
          </div>
        </section>

        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(jsonLd),
          }}
        />
      </div>
    </div>
  );
}
