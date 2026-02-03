import { notFound } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { createSupabaseServerClient } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { MapPin, Calendar, Share2, Heart, Flag, ShieldCheck } from "lucide-react";

export const dynamic = "force-dynamic";

interface AdPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function AdPage({ params }: AdPageProps) {
  const { id } = await params;
  const supabase = createSupabaseServerClient();

  const { data: ad, error } = await supabase
    .from("ads")
    .select(
      "id, title, description, price, currency, city, neighborhood, created_at, image_urls, category, status, views_count, seller_id"
    )
    .eq("id", id)
    .single();

  if (error || !ad) {
    if (error?.code !== "PGRST116") { // Not found error code
      console.error("Error loading ad:", error);
    }
    notFound();
  }

  // Handle images
  const images = ad.image_urls || [];
  const primaryImage = images[0];

  // Increment views (fire and forget)
  // await supabase.rpc('increment_ad_views', { ad_id: id }); // Optimistic

  const formattedPrice = ad.price
    ? `${ad.price} ${ad.currency?.trim() || "MAD"}`
    : "السعر غير محدد";

  const formattedDate = new Date(ad.created_at).toLocaleDateString("ar-MA", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  return (
    <div dir="rtl" className="min-h-screen bg-zinc-50 pb-20">

      {/* Navbar Placeholder - Assuming global layout handles it, or back button */}
      <div className="bg-white border-b border-zinc-200 sticky top-0 z-20">
        <div className="mx-auto max-w-7xl px-4 h-16 flex items-center justify-between">
          <Link href="/" className="text-zinc-500 hover:text-zinc-900 flex items-center gap-2 text-sm font-medium">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-arrow-right"><path d="M5 12h14" /><path d="m12 5 7 7-7 7" /></svg>
            العودة للرئيسية
          </Link>
          <div className="flex gap-2">
            <Button variant="ghost" size="icon" className="text-zinc-600">
              <Share2 className="w-5 h-5" />
            </Button>
            <Button variant="ghost" size="icon" className="text-zinc-600">
              <Heart className="w-5 h-5" />
            </Button>
          </div>
        </div>
      </div>

      <main className="mx-auto max-w-7xl px-4 py-8 grid grid-cols-1 lg:grid-cols-3 gap-8">

        {/* Main Content (Images + Description) */}
        <div className="lg:col-span-2 space-y-6">

          {/* Image Gallery */}
          <div className="overflow-hidden rounded-2xl bg-white shadow-sm border border-zinc-100">
            <div className="relative aspect-video w-full bg-zinc-100">
              {primaryImage ? (
                <Image
                  src={primaryImage}
                  alt={ad.title}
                  fill
                  className="object-contain"
                  priority
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center text-zinc-400">
                  لا توجد صور
                </div>
              )}
            </div>
            {/* Thumbnails if multiple images (Implement later) */}
            {images.length > 1 && (
              <div className="flex gap-2 p-4 overflow-x-auto">
                {images.map((img: string, idx: number) => (
                  <div key={idx} className="relative h-20 w-20 flex-shrink-0 cursor-pointer overflow-hidden rounded-lg border border-zinc-200 hover:border-zinc-900">
                    <Image src={img} alt="" fill className="object-cover" />
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Title & Info Mobile */}
          <div className="lg:hidden bg-white p-5 rounded-2xl border border-zinc-100 shadow-sm space-y-4">
            <div className="flex justify-between items-start">
              <h1 className="text-xl font-bold text-zinc-900 leading-snug">{ad.title}</h1>
              <span className="font-bold text-xl text-blue-600 whitespace-nowrap">{formattedPrice}</span>
            </div>
            <div className="flex flex-wrap gap-4 text-sm text-zinc-500">
              <div className="flex items-center gap-1">
                <MapPin className="w-4 h-4" />
                {ad.city || "المغرب"}
              </div>
              <div className="flex items-center gap-1">
                <Calendar className="w-4 h-4" />
                {formattedDate}
              </div>
            </div>
          </div>

          {/* Description */}
          <div className="bg-white p-6 rounded-2xl border border-zinc-100 shadow-sm">
            <h2 className="text-lg font-bold text-zinc-900 mb-4">الوصف</h2>
            <div className="prose prose-zinc whitespace-pre-wrap text-zinc-600 leading-relaxed">
              {ad.description || "لا يوجد وصف إضافي."}
            </div>
          </div>

          {/* Safety Tips */}
          <div className="bg-blue-50/50 p-4 rounded-xl border border-blue-100 flex gap-3">
            <ShieldCheck className="w-6 h-6 text-blue-600 flex-shrink-0" />
            <div className="text-sm text-zinc-700">
              <p className="font-semibold mb-1">نصائح للتعامل الآمن:</p>
              <ul className="list-disc list-inside space-y-1 text-zinc-600">
                <li>قابل البائع في مكان عام.</li>
                <li>تفحص المنتج جيداً قبل الشراء.</li>
                <li>لا ترسل الأموال مسبقاً.</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Sidebar (Price, Seller, Contact) */}
        <div className="space-y-6">

          {/* Price Card Desktop */}
          <div className="hidden lg:block bg-white p-6 rounded-2xl border border-zinc-100 shadow-sm">
            <h1 className="text-2xl font-bold text-zinc-900 mb-2">{ad.title}</h1>
            <div className="text-3xl font-bold text-blue-600 mb-6">{formattedPrice}</div>

            <div className="space-y-3 text-sm text-zinc-500 mb-6">
              <div className="flex items-center justify-between border-b border-zinc-50 pb-2">
                <span>الموقع</span>
                <span className="font-medium text-zinc-900">{ad.city || "غير محدد"}</span>
              </div>
              <div className="flex items-center justify-between border-b border-zinc-50 pb-2">
                <span>تاريخ النشر</span>
                <span className="font-medium text-zinc-900">{formattedDate}</span>
              </div>
            </div>
          </div>

          {/* Seller Card */}
          <div className="bg-white p-6 rounded-2xl border border-zinc-100 shadow-sm">
            <h3 className="font-bold text-zinc-900 mb-4">معلومات البائع</h3>
            <div className="flex items-center gap-4 mb-6">
              <div className="h-12 w-12 rounded-full bg-zinc-100 flex items-center justify-center text-zinc-400">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6"><path fillRule="evenodd" d="M7.5 6a4.5 4.5 0 1 1 9 0 4.5 4.5 0 0 1-9 0ZM3.751 20.105a8.25 8.25 0 0 1 16.498 0 .75.75 0 0 1-.437.695A18.683 18.683 0 0 1 12 22.5c-2.786 0-5.433-.608-7.812-1.7a.75.75 0 0 1-.437-.695Z" clipRule="evenodd" /></svg>
              </div>
              <div>
                <div className="font-semibold text-zinc-900">مستخدم Jootiya</div>
                <div className="text-xs text-zinc-500">عضو منذ 2024</div>
              </div>
            </div>

            <div className="space-y-3">
              <Button className="w-full gap-2 bg-zinc-900 hover:bg-zinc-800 text-white" size="lg">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-phone"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" /></svg>
                إظهار الرقم
              </Button>
              <Button variant="outline" className="w-full gap-2 border-zinc-200 text-zinc-700 hover:bg-zinc-50 hover:text-zinc-900" size="lg">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-message-circle"><path d="m3 21 1.9-5.7a8.5 8.5 0 1 1 3.8 3.8z" /></svg>
                الدردشة
              </Button>
            </div>
          </div>

          <div className="flex justify-center">
            <button className="text-zinc-400 hover:text-red-600 flex items-center gap-2 text-sm transition-colors">
              <Flag className="w-4 h-4" />
              الإبلاغ عن هذا الإعلان
            </button>
          </div>
        </div>

      </main>
    </div>
  );
}
