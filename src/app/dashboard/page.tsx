import Link from "next/link";

export default function DashboardHomePage() {
  return (
    <div className="min-h-screen bg-zinc-50">
      <div className="mx-auto flex min-h-screen w-full max-w-3xl flex-col justify-center px-4 py-10">
        <div className="rounded-2xl border border-zinc-200 bg-white p-6 text-right shadow-sm">
          <h1 className="text-lg font-semibold text-zinc-900">
            لوحة التحكم غير متاحة حاليًا
          </h1>
          <p className="mt-2 text-sm text-zinc-600">
            يمكنك إدارة إعلاناتك من صفحة
            {" "}
            <Link
              href="/post-ad"
              className="font-medium text-zinc-900 underline-offset-4 hover:underline"
            >
              نشر إعلان
            </Link>
            {" "}
            أو العودة إلى
            {" "}
            <Link
              href="/"
              className="font-medium text-zinc-900 underline-offset-4 hover:underline"
            >
              الصفحة الرئيسية
            </Link>
            .
          </p>
        </div>
      </div>
    </div>
  );
}
