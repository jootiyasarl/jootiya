import { notFound } from "next/navigation";
import Link from "next/link";
import { createSupabaseServerClient } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { AdImageGallery } from "@/components/ads/AdImageGallery";
import {
  MapPin,
  Calendar,
  Share2,
  Heart,
  Flag,
  ShieldCheck,
  CheckCircle2,
  ChevronRight,
  Eye,
  MessageCircle,
  Phone,
  AlertTriangle
} from "lucide-react";

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
    if (error?.code !== "PGRST116") {
      console.error("Error loading ad:", error);
    }
    notFound();
  }

  const images = ad.image_urls || [];
  const formattedPrice = ad.price
    ? Number(ad.price).toLocaleString() + " " + (ad.currency?.trim() || "MAD")
    : "اتصل للمزيد من المعلومات";

  const formattedDate = new Date(ad.created_at).toLocaleDateString("ar-MA", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  return (
    <div dir="rtl" className="min-h-screen bg-[#F8FAFC] pb-20 font-sans text-zinc-900">

      {/* Top Header / Breadcrumbs */}
      <div className="bg-white border-b border-zinc-200">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-14 items-center justify-between text-sm">
            <nav className="flex items-center gap-2 text-zinc-500">
              <Link href="/" className="hover:text-zinc-900 transition-colors">الرئيسية</Link>
              <ChevronRight className="h-4 w-4" />
              <Link href="/marketplace" className="hover:text-zinc-900 transition-colors">السوق</Link>
              <ChevronRight className="h-4 w-4" />
              <span className="text-zinc-900 font-medium truncate max-w-[200px]">{ad.title}</span>
            </nav>

            <div className="flex items-center gap-3">
              <Button variant="ghost" size="sm" className="hidden sm:flex gap-2 text-zinc-600 hover:text-zinc-900">
                <Share2 className="h-4 w-4" />
                <span>مشاركة</span>
              </Button>
              <Button variant="ghost" size="sm" className="hidden sm:flex gap-2 text-zinc-600 hover:text-red-600">
                <Heart className="h-4 w-4" />
                <span>حفظ</span>
              </Button>
            </div>
          </div>
        </div>
      </div>

      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">

          {/* Column Left: Media & Details (8/12) */}
          <div className="lg:col-span-8 space-y-8">

            {/* Image Gallery Component */}
            <section>
              <AdImageGallery images={images} />
            </section>

            {/* Mobile Header (Shows only on small screens) */}
            <div className="lg:hidden space-y-4">
              <div className="flex flex-col gap-2">
                <h1 className="text-2xl font-bold leading-tight sm:text-3xl">{ad.title}</h1>
                <div className="text-3xl font-extrabold text-blue-600">{formattedPrice}</div>
              </div>
              <div className="flex flex-wrap gap-4 text-sm text-zinc-500">
                <div className="flex items-center gap-1.5 bg-white px-3 py-1.5 rounded-full border border-zinc-200 shadow-sm">
                  <MapPin className="h-4 w-4 text-zinc-400" />
                  <span>{ad.city || "المغرب"}</span>
                </div>
                <div className="flex items-center gap-1.5 bg-white px-3 py-1.5 rounded-full border border-zinc-200 shadow-sm">
                  <Calendar className="h-4 w-4 text-zinc-400" />
                  <span>{formattedDate}</span>
                </div>
                <div className="flex items-center gap-1.5 bg-white px-3 py-1.5 rounded-full border border-zinc-200 shadow-sm">
                  <Eye className="h-4 w-4 text-zinc-400" />
                  <span>{ad.views_count || 0} مشاهدة</span>
                </div>
              </div>
            </div>

            {/* Content Cards */}
            <div className="space-y-6">
              {/* Description Card */}
              <div className="rounded-3xl bg-white p-6 shadow-md shadow-zinc-200/50 border border-zinc-100 sm:p-8">
                <h2 className="mb-6 text-xl font-bold flex items-center gap-2">
                  <span className="h-8 w-1.5 rounded-full bg-blue-600" />
                  تفاصيل الإعلان
                </h2>
                <div className="prose prose-zinc max-w-none text-[16px] leading-relaxed text-zinc-700 whitespace-pre-wrap">
                  {ad.description || "لا يوجد وصف إضافي لهذا الإعلان."}
                </div>

                {/* Meta list */}
                <div className="mt-8 grid grid-cols-2 gap-4 border-t border-zinc-100 pt-8 sm:grid-cols-3">
                  <div className="space-y-1">
                    <span className="text-xs uppercase tracking-wider text-zinc-400 font-bold">الفئة</span>
                    <p className="font-semibold text-zinc-900">{ad.category || "غير محدد"}</p>
                  </div>
                  <div className="space-y-1">
                    <span className="text-xs uppercase tracking-wider text-zinc-400 font-bold">الحالة</span>
                    <p className="font-semibold text-zinc-900">مستعمل</p>
                  </div>
                  <div className="space-y-1">
                    <span className="text-xs uppercase tracking-wider text-zinc-400 font-bold">الموقع دقيق</span>
                    <p className="font-semibold text-zinc-900">{ad.neighborhood || ad.city}</p>
                  </div>
                </div>
              </div>

              {/* Safety Section */}
              <div className="rounded-3xl bg-amber-50/50 p-6 border border-amber-100/80">
                <div className="flex gap-4">
                  <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-2xl bg-amber-100 text-amber-700">
                    <ShieldCheck className="h-6 w-6" />
                  </div>
                  <div className="space-y-1">
                    <h3 className="font-bold text-amber-900">إرشادات السلامة</h3>
                    <p className="text-sm text-amber-800/80">
                      نحن نهتم بسلامتك. يرجى اتباع هذه الخطوات لضمان تجربة شراء آمنة:
                    </p>
                    <ul className="mt-3 grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-2 text-sm text-amber-800/70">
                      <li className="flex items-center gap-2">
                        <CheckCircle2 className="h-4 w-4 text-amber-600" />
                        <span>قابل البائع في مكان عام ونهاراً.</span>
                      </li>
                      <li className="flex items-center gap-2">
                        <CheckCircle2 className="h-4 w-4 text-amber-600" />
                        <span>لا تقم بتحويل مالي قبل المعاينة.</span>
                      </li>
                      <li className="flex items-center gap-2">
                        <CheckCircle2 className="h-4 w-4 text-amber-600" />
                        <span>تحقق من ثمن السلعة في السوق.</span>
                      </li>
                      <li className="flex items-center gap-2">
                        <CheckCircle2 className="h-4 w-4 text-amber-600" />
                        <span>أخبر أحداً بمكان لقائك مع البائع.</span>
                      </li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Column Right: Action Sidebar (4/12) */}
          <div className="lg:col-span-4 space-y-6">

            {/* Price & Primary Actions Card */}
            <div className="sticky top-24 space-y-6">
              <div className="hidden lg:block rounded-3xl bg-white p-8 shadow-md shadow-zinc-200/50 border border-zinc-100">
                <div className="space-y-2 mb-8">
                  <h1 className="text-2xl font-bold leading-tight">{ad.title}</h1>
                  <div className="flex items-center gap-2 text-zinc-500 text-sm">
                    <MapPin className="h-4 w-4" />
                    <span>{ad.city}</span>
                    <span>•</span>
                    <span>منذ {formattedDate}</span>
                  </div>
                </div>

                <div className="space-y-6">
                  <div className="text-3xl font-black text-blue-600">{formattedPrice}</div>

                  <div className="space-y-3">
                    <Button className="w-full h-14 text-lg font-bold rounded-2xl bg-zinc-900 hover:bg-zinc-800 text-white shadow-lg transition-all active:scale-[0.98] gap-3">
                      <Phone className="h-5 w-5" />
                      إظهار رقم الهاتف
                    </Button>
                    <Button variant="outline" className="w-full h-14 text-lg font-semibold rounded-2xl border-zinc-200 hover:bg-zinc-50 transition-all active:scale-[0.98] gap-3">
                      <MessageCircle className="h-5 w-5" />
                      إرسال رسالة
                    </Button>
                  </div>
                </div>
              </div>

              {/* Seller Profiling Card */}
              <div className="rounded-3xl bg-white p-6 shadow-md shadow-zinc-200/50 border border-zinc-100">
                <h3 className="mb-4 text-sm font-bold uppercase tracking-wider text-zinc-400">البائع</h3>
                <div className="flex items-center gap-4">
                  <div className="h-14 w-14 rounded-2xl bg-gradient-to-br from-zinc-100 to-zinc-200 flex items-center justify-center text-zinc-400 ring-4 ring-zinc-50">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-7 h-7"><path fillRule="evenodd" d="M7.5 6a4.5 4.5 0 1 1 9 0 4.5 4.5 0 0 1-9 0ZM3.751 20.105a8.25 8.25 0 0 1 16.498 0 .75.75 0 0 1-.437.695A18.683 18.683 0 0 1 12 22.5c-2.786 0-5.433-.608-7.812-1.7a.75.75 0 0 1-.437-.695Z" clipRule="evenodd" /></svg>
                  </div>
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-1.5 font-bold text-zinc-900">
                      مستخدم جوتيا
                      <CheckCircle2 className="h-4 w-4 text-blue-500" />
                    </div>
                    <div className="text-sm text-zinc-500">عضو نشط منذ سنة</div>
                  </div>
                </div>

                <div className="mt-6 pt-6 border-t border-zinc-50">
                  <Link href={`/seller/${ad.seller_id}`} className="text-sm font-bold text-blue-600 hover:text-blue-700 transition-colors flex items-center gap-1">
                    عرض جميع الإعلانات لهذا البائع
                    <ChevronRight className="h-4 w-4 rotate-180" />
                  </Link>
                </div>
              </div>

              {/* Report Section */}
              <div className="flex flex-col items-center gap-4">
                <button className="text-zinc-400 hover:text-red-500 flex items-center gap-1.5 text-xs font-medium transition-colors">
                  <Flag className="h-3.5 w-3.5" />
                  هل يوجد خطأ في الإعلان؟ أبلغنا
                </button>

                <div className="flex items-center gap-2 py-3 px-4 rounded-2xl bg-red-50 text-red-700 text-[11px] border border-red-100">
                  <AlertTriangle className="h-4 w-4 flex-shrink-0" />
                  <span>لا ترسل مبالغ مالية مسبقة، Jootiya لا تضمن عمليات الدفع.</span>
                </div>
              </div>
            </div>
          </div>

        </div>
      </main>

      {/* Mobile Sticky Bar */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-xl border-t border-zinc-100 p-4 pb-safe-bottom shadow-[0_-10px_20px_rgba(0,0,0,0.05)]">
        <div className="mx-auto max-w-7xl flex gap-3">
          <Button className="flex-1 h-14 rounded-2xl bg-zinc-900 text-white font-bold shadow-lg shadow-zinc-900/10">
            اتصل الآن
          </Button>
          <Button variant="outline" size="icon" className="h-14 w-14 rounded-2xl border-zinc-200">
            <MessageCircle className="h-6 w-6 text-zinc-700" />
          </Button>
          <Button variant="outline" size="icon" className="h-14 w-14 rounded-2xl border-zinc-200">
            <Heart className="h-6 w-6 text-zinc-700" />
          </Button>
        </div>
      </div>

    </div>
  );
}
