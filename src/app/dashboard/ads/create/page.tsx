import Link from "next/link";

export default function CreateAdPage() {
  return (
    <div className="min-h-screen bg-zinc-50">
      <div className="mx-auto flex min-h-screen w-full max-w-3xl flex-col justify-center px-4 py-10">
        <div className="rounded-2xl border border-zinc-200 bg-white p-6 text-right shadow-sm">
          <h1 className="text-lg font-semibold text-zinc-900">
            إنشاء الإعلانات من لوحة التحكم غير متاح حاليًا
          </h1>
          <p className="mt-2 text-sm text-zinc-600">
            يمكنك نشر إعلان جديد من صفحة
            {" "}
            <Link
              href="/post-ad"
              className="font-medium text-zinc-900 underline-offset-4 hover:underline"
            >
              نشر إعلان
            </Link>
            .
          </p>
        </div>
      </div>
    </div>
  );
}
