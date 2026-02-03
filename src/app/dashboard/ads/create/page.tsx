import Link from "next/link";
import { FilePlus2 } from "lucide-react";

export default function DashboardCreateAdPlaceholderPage() {
  return (
    <div className="min-h-screen bg-zinc-50">
      <div className="mx-auto flex min-h-screen w-full max-w-7xl flex-col justify-center px-4 py-10">
        <div className="space-y-6">
          <div className="flex items-center justify-between gap-4">
            <div className="space-y-3 text-right">
              <div className="inline-flex items-center rounded-full border border-zinc-200 bg-white/80 px-3 py-1 text-xs font-medium text-zinc-600 shadow-sm backdrop-blur-sm">
                إنشاء الإعلانات من لوحة التحكم غير متاح حاليًا
              </div>
              <h1 className="text-2xl font-semibold tracking-tight text-zinc-900 md:text-3xl">
                أنشئ إعلانك من صفحة النشر
              </h1>
              <p className="text-sm text-zinc-600">
                يمكنك نشر إعلان جديد بسرعة من صفحة النشر الرئيسية دون الحاجة
                إلى لوحة تحكم معقّدة.
              </p>
            </div>
            <div className="hidden h-16 w-16 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600 shadow-sm md:flex">
              <FilePlus2 className="h-8 w-8" />
            </div>
          </div>

          <div className="rounded-2xl border border-zinc-200/80 bg-white/80 p-6 shadow-sm backdrop-blur-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-md">
            <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
              <div className="space-y-1 text-right">
                <p className="text-sm font-medium text-zinc-900">
                  جاهز لنشر إعلانك؟
                </p>
                <p className="text-xs text-zinc-600">
                  اضغط على الزر أدناه للانتقال إلى صفحة نشر الإعلان.
                </p>
              </div>
              <Link
                href="/post-ad"
                className="inline-flex items-center justify-center rounded-full bg-zinc-900 px-5 py-2 text-sm font-medium text-white shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:scale-105 hover:bg-zinc-800 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-zinc-300"
              >
                <FilePlus2 className="ml-2 h-4 w-4" />
                نشر إعلان جديد
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
