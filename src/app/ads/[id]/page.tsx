import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase-server";
import { generateSlug } from "@/lib/seo-utils";

interface AdRedirectPageProps {
    params: Promise<{
        id: string;
    }>;
}

export default async function AdRedirectPage({ params }: AdRedirectPageProps) {
    const { id } = await params;
    const supabase = createSupabaseServerClient();

    // Fetch the ad to get its title/slug
    const { data: ad } = await supabase
        .from("ads")
        .select("title, slug")
        .or(`id.eq.${id},slug.eq.${id}`)
        .maybeSingle();

    if (!ad) {
        // If the ad doesn't exist, we can't redirect with a slug, 
        // but let's let the sub-route handle the 404
        redirect(`/ads/${id}/view`);
    }

    const adSlug = ad.slug || generateSlug(ad.title);

    // Perform a permanent redirect (301) to the new SEO-friendly URL
    // Next.js 'redirect' uses 307 by default in Server Components, 
    // but for SEO we ideally want 301. 
    // In Next.js App Router, 'redirect' is 307 (temporary) or 308 (permanent).
    // Let's use the standard redirect which is 307/308.
    redirect(`/ads/${id}/${adSlug}`);
}
