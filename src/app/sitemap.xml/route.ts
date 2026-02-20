import { createClient } from '@supabase/supabase-js';

export async function GET() {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY! || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
  
  // 1. Fetch all ad slugs and IDs from the database
  // The URL structure is /ads/[id]/[slug]
  const { data: ads } = await supabase
    .from('ads')
    .select('id, slug, updated_at')
    .eq('status', 'approved')
    .order('updated_at', { ascending: false })
    .limit(1000); // Limit to 1000 for safety, can be increased if needed

  const baseUrl = 'https://jootiya.com';

  // 2. جلب الأقسام (يمكن جلبها ديناميكياً إذا كانت في قاعدة البيانات)
  const categories = ['immobilier', 'vehicules', 'electronique', 'maison', 'loisirs', 'emploi', 'services'];

  // 3. بناء هيكل الـ XML
  const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>${baseUrl}</loc>
    <lastmod>${new Date().toISOString()}</lastmod>
    <changefreq>always</changefreq>
    <priority>1.0</priority>
  </url>
  <url>
    <loc>${baseUrl}/marketplace</loc>
    <lastmod>${new Date().toISOString()}</lastmod>
    <changefreq>daily</changefreq>
    <priority>0.9</priority>
  </url>
  ${categories.map((cat) => `
  <url>
    <loc>${baseUrl}/marketplace?category=${cat}</loc>
    <changefreq>weekly</changefreq>
    <priority>0.7</priority>
  </url>`).join('')}
  ${ads?.map((ad) => `
  <url>
    <loc>${baseUrl}/ads/${ad.id}/${ad.slug || 'details'}</loc>
    <lastmod>${new Date(ad.updated_at || new Date()).toISOString()}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>`).join('')}
</urlset>`;

  return new Response(sitemap, {
    headers: {
      'Content-Type': 'application/xml',
      'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=5900'
    },
  });
}
