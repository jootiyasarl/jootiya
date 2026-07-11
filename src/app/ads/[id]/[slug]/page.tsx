import { notFound } from "next/navigation";
import { createSupabaseServerClient, getServerUser } from "@/lib/supabase-server";
import { generateSlug } from "@/lib/seo-utils";
import { AirbnbAdPageClient } from "./AirbnbAdPageClient";
import { ShadowViewTracker } from "@/components/ads/ShadowViewTracker";

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
    const canonicalUrl = `${baseUrl}/ads/${ad.id}/${adSlug}`;
    
    // Get primary image and ensure it's an absolute URL
    let ogImage = `${baseUrl}/og-image.png`; // Fallback image
    if (ad.image_urls && Array.isArray(ad.image_urls) && ad.image_urls.length > 0) {
      const firstImage = ad.image_urls[0];
      if (firstImage.startsWith('http')) {
        ogImage = firstImage;
      } else {
        const cleanPath = firstImage.startsWith('/') ? firstImage.substring(1) : firstImage;
        const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
        // Check if it's a Supabase path that needs the public URL prefix
        if (!cleanPath.startsWith('storage/v1/object/public/')) {
          ogImage = `${supabaseUrl}/storage/v1/object/public/ad-images/${cleanPath}`;
        } else {
          ogImage = `${supabaseUrl}/${cleanPath}`;
        }
      }
    }
    
    return {
      title: metaTitle,
      description: ad.description?.slice(0, 160),
      alternates: { canonical: canonicalUrl },
      openGraph: {
        title: metaTitle,
        description: ad.description?.slice(0, 160),
        url: canonicalUrl,
        siteName: 'Jootiya',
        images: [
          {
            url: ogImage,
            width: 1200,
            height: 630,
            alt: ad.title,
          },
        ],
        locale: 'fr_FR',
        type: 'website',
      },
      twitter: {
        card: 'summary_large_image',
        title: metaTitle,
        description: ad.description?.slice(0, 160),
        images: [ogImage],
      },
    };
  } catch (err) {
    return { title: "Petites Annonces au Maroc | Jootiya" };
  }
}

export default async function AdPage({ params }: AdPageProps) {
  const { id } = await params;
  const user = await getServerUser();
  const supabase = createSupabaseServerClient();

  console.log("DEBUG: Fetching ad with ID:", id);

  const { data: ad, error: adError } = await supabase
    .from("ads")
    .select(`
      *,
      profiles:seller_id(phone, full_name, avatar_url, created_at)
    `)
    .or(`id.eq.${id},slug.eq.${id}`)
    .maybeSingle();

  if (adError || !ad) {
    console.error("DEBUG: Ad Fetch Error or Not Found:", adError, id);
    // Try a simpler query if the first one fails
    const { data: retryAd, error: retryError } = await supabase
      .from("ads")
      .select("*")
      .or(`id.eq.${id},slug.eq.${id}`)
      .maybeSingle();
    
    if (retryError || !retryAd) {
      console.error("DEBUG: Retry Error or Not Found:", retryError, id);
      notFound();
    }

    const { data: profileData } = await supabase
      .from("profiles")
      .select("full_name, avatar_url, created_at, phone")
      .eq("id", retryAd.seller_id)
      .maybeSingle();

    const sellerName = profileData?.full_name || "Utilisateur Jootiya";
    const sellerAvatar = profileData?.avatar_url || null;
    const memberSince = profileData?.created_at ? new Date(profileData.created_at).getFullYear() : "2024";
    const sellerPhone = retryAd.phone || profileData?.phone;
    
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://jootiya.com';
    const formattedPrice = retryAd.price ? `${Number(retryAd.price).toLocaleString()} ${retryAd.currency || 'MAD'}` : "Sur demande";
    const formattedDate = new Date(retryAd.created_at).toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" });

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const images = (retryAd.image_urls || []).map((img: string) => {
      if (!img) return '/placeholder-ad.jpg';
      if (img.startsWith('http')) return img;
      const cleanPath = img.startsWith('/') ? img.substring(1) : img;
      if (cleanPath.startsWith('storage/v1/object/public/')) {
        return `${supabaseUrl}/${cleanPath}`;
      } else if (cleanPath.startsWith('ad-images/')) {
        return `${supabaseUrl}/storage/v1/object/public/${cleanPath}`;
      }
      return `${supabaseUrl}/storage/v1/object/public/ad-images/${cleanPath}`;
    });

    const { data: stats } = await supabase.rpc('get_seller_stats', { target_seller_id: retryAd.seller_id });
    const avgRating = stats?.[0]?.avg_rating || 5.0;
    const totalReviews = stats?.[0]?.total_reviews || 0;
    const isTrusted = totalReviews > 10 && avgRating >= 4.5;

    // Fetch similar ads for retry path
    const { data: retrySimilarAds } = await supabase
      .from("ads")
      .select("id, title, price, currency, city, image_urls, slug")
      .eq("category", retryAd.category)
      .neq("id", retryAd.id)
      .or("status.eq.active,status.eq.approved")
      .order("created_at", { ascending: false })
      .limit(4);

    return (
      <>
        <ShadowViewTracker adId={retryAd.id} category={retryAd.category} />
        <AirbnbAdPageClient 
          ad={retryAd}
          images={images}
          sellerName={sellerName}
          sellerAvatar={sellerAvatar}
          memberSince={memberSince}
          sellerPhone={sellerPhone}
          formattedPrice={formattedPrice}
          formattedDate={formattedDate}
          avgRating={avgRating}
          totalReviews={totalReviews}
          isTrusted={isTrusted}
          user={user}
          similarAds={retrySimilarAds || []}
        />
      </>
    );
  }

    const { data: profileData } = await supabase
      .from("profiles")
      .select("full_name, avatar_url, created_at, phone")
      .eq("id", ad.seller_id)
      .maybeSingle();

    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://jootiya.com';
    const formattedPrice = ad.price ? `${Number(ad.price).toLocaleString()} ${ad.currency || 'MAD'}` : "Sur demande";
    const formattedDate = new Date(ad.created_at).toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" });

    const sellerName = profileData?.full_name || ad.profiles?.full_name || "Utilisateur Jootiya";
    const sellerAvatar = profileData?.avatar_url || ad.profiles?.avatar_url || null;
    const memberSince = (profileData?.created_at || ad.profiles?.created_at) 
      ? new Date(profileData?.created_at || ad.profiles?.created_at).getFullYear() 
      : "2024";
    const sellerPhone = ad.phone || profileData?.phone || ad.profiles?.phone;

  const supabaseUrl2 = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const images = (ad.image_urls || []).map((img: string) => {
    if (!img) return '/placeholder-ad.jpg';
    if (img.startsWith('http')) return img;
    const cleanPath = img.startsWith('/') ? img.substring(1) : img;
    if (cleanPath.startsWith('storage/v1/object/public/')) {
      return `${supabaseUrl2}/${cleanPath}`;
    } else if (cleanPath.startsWith('ad-images/')) {
      return `${supabaseUrl2}/storage/v1/object/public/${cleanPath}`;
    }
    return `${supabaseUrl2}/storage/v1/object/public/ad-images/${cleanPath}`;
  });

  const { data: stats } = await supabase.rpc('get_seller_stats', { target_seller_id: ad.seller_id });
  const avgRating = stats?.[0]?.avg_rating || 5.0;
  const totalReviews = stats?.[0]?.total_reviews || 0;
  const isTrusted = totalReviews > 10 && avgRating >= 4.5;

  // Fetch similar ads (same category, exclude current ad, limit to 4)
  const { data: similarAds } = await supabase
    .from("ads")
    .select("id, title, price, currency, city, image_urls, slug")
    .eq("category", ad.category)
    .neq("id", ad.id)
    .or("status.eq.active,status.eq.approved")
    .order("created_at", { ascending: false })
    .limit(4);

  return (
    <>
      <ShadowViewTracker adId={ad.id} category={ad.category} />
      <AirbnbAdPageClient 
        ad={ad}
        images={images}
        sellerName={sellerName}
        sellerAvatar={sellerAvatar}
        memberSince={memberSince}
        sellerPhone={sellerPhone}
        formattedPrice={formattedPrice}
        formattedDate={formattedDate}
        avgRating={avgRating}
        totalReviews={totalReviews}
        isTrusted={isTrusted}
        user={user}
        similarAds={similarAds || []}
      />
    </>
  );
}
