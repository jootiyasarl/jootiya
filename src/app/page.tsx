import Image from "next/image";
import Link from "next/link";
import { createSupabaseServerClient } from "@/lib/supabase";
import { HeroSection } from "@/components/home/HeroSection";
import { CategoryGrid } from "@/components/home/CategoryGrid";
import { FeaturedGrid } from "@/components/home/FeaturedGrid";
import { TrustSection } from "@/components/home/TrustSection";

type HomepageAd = {
  id: string;
  title: string;
  price: string;
  location: string;
  distance?: string;
  createdAt?: string;
  sellerBadge?: string;
  isFeatured?: boolean;
  imageUrl?: string;
  categorySlug?: string;
  categoryName?: string;
};

export default async function Home() {
  const supabase = createSupabaseServerClient();

  const baseSelect =
    "id, title, price, currency, city, neighborhood, created_at, is_featured, images, category"; // Note: Changed image_urls to images based on previous schema knowledge

  const [
    { data: featuredData, error: featuredError },
    { data: recentData, error: recentError },
  ] = await Promise.all([
    supabase
      .from("ads")
      .select(baseSelect)
      .eq("status", "active") // or approved, check DB
      .eq("is_featured", true)
      .order("created_at", { ascending: false })
      .limit(4),
    supabase
      .from("ads")
      .select(baseSelect)
      // .eq("status", "active") // Assuming 'active' or 'approved'
      .or("status.eq.active,status.eq.approved")
      .order("created_at", { ascending: false })
      .limit(8),
  ]);

  const mapRowToHomepageAd = (row: any): HomepageAd => {
    const locationParts: string[] = [];
    if (row.neighborhood) locationParts.push(row.neighborhood);
    if (row.city) locationParts.push(row.city);
    // Fallback if location parts are empty but 'location' string exists (schema variance)
    if (locationParts.length === 0 && row.location) locationParts.push(row.location);

    const location = locationParts.join(", ") || "المغرب";

    let createdAtLabel: string | undefined;
    if (row.created_at) {
      const d = new Date(row.created_at);
      if (!Number.isNaN(d.getTime())) {
        createdAtLabel = d.toLocaleDateString("ar-MA"); // Arabic locale
      }
    }

    // Handle image_urls (old) vs images (new) schema divergence safely
    const images = row.images || row.image_urls;
    const primaryImageUrl =
      Array.isArray(images) && images.length > 0
        ? (images[0] as string)
        : undefined;

    const priceLabel =
      row.price != null
        ? `${row.price} ${row.currency?.trim() || "MAD"}`
        : "—";

    return {
      id: row.id,
      title: row.title,
      price: priceLabel,
      location,
      createdAt: createdAtLabel,
      sellerBadge: row.is_featured ? "مميز" : undefined,
      isFeatured: Boolean(row.is_featured),
      imageUrl: primaryImageUrl,
      categorySlug: row.category,
    };
  };

  const featuredAds: HomepageAd[] = Array.isArray(featuredData)
    ? featuredData.map(mapRowToHomepageAd)
    : [];

  const recentAds: HomepageAd[] = Array.isArray(recentData)
    ? recentData.map(mapRowToHomepageAd)
    : [];

  return (
    <div dir="rtl" className="min-h-screen bg-white font-sans text-zinc-900">

      <HeroSection />

      <main className="space-y-10">

        <CategoryGrid />

        {/* Featured Ads Section */}
        {featuredAds.length > 0 && (
          <div className="bg-blue-50/50">
            <FeaturedGrid
              title="إعلانات مميزة"
              ads={featuredAds}
            />
          </div>
        )}

        {/* Recent Ads Section */}
        <FeaturedGrid
          title="وصل حديثاً"
          ads={recentAds}
          viewAllLink="/marketplace"
        />

        <TrustSection />

      </main>

      <footer className="mt-16 border-t border-zinc-100 bg-zinc-50 py-12 text-sm text-zinc-500">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
            <div>
              <h3 className="text-zinc-900 font-bold text-lg mb-4">Jootiya</h3>
              <p>منصتك الأولى للبيع والشراء في المغرب. سهولة، أمان، وسرعة في التواصل.</p>
            </div>
            <div>
              <h4 className="font-semibold text-zinc-900 mb-3">روابط سريعة</h4>
              <ul className="space-y-2">
                <li><Link href="/marketplace" className="hover:text-blue-600">تصفح الإعلانات</Link></li>
                <li><Link href="/marketplace/post" className="hover:text-blue-600">بع شيئاً</Link></li>
                <li><Link href="/login" className="hover:text-blue-600">تسجيل الدخول</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-zinc-900 mb-3">دعم</h4>
              <ul className="space-y-2">
                <li><Link href="#" className="hover:text-blue-600">مركز المساعدة</Link></li>
                <li><Link href="#" className="hover:text-blue-600">شروط الاستخدام</Link></li>
                <li><Link href="#" className="hover:text-blue-600">سياسة الخصوصية</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-zinc-900 mb-3">تواصل معنا</h4>
              <p>info@jootiya.com</p>
            </div>
          </div>
          <div className="mt-8 border-t border-zinc-200 pt-8 text-center">
            <p>&copy; {new Date().getFullYear()} Jootiya. جميع الحقوق محفوظة.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
