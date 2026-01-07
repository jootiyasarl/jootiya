import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getServerUser } from "@/lib/supabase";

export const metadata: Metadata = {
  title: "Create Ad | Jootiya",
};

export default async function CreateAdPage() {
  const user = await getServerUser();

  if (!user) {
    redirect("/login?redirect=/create-ad");
  }

  return (
    <div className="min-h-screen bg-zinc-50">
      <div className="mx-auto flex min-h-screen w-full max-w-5xl flex-col justify-center px-4 py-10">
        <div className="mb-6">
          <h1 className="text-2xl font-semibold tracking-tight text-zinc-900 md:text-3xl">
            إنشاء إعلان جديد
          </h1>
          <p className="mt-2 text-sm text-zinc-600">
            املأ تفاصيل الإعلان الخاص بك وسيظهر للمستخدمين في السوق بعد المراجعة.
          </p>
        </div>

        <div className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm">
          {/* TODO: Replace with real create-ad form */}
          <p className="text-sm text-zinc-600">
            نموذج إنشاء الإعلان سيُضاف هنا.
          </p>
        </div>
      </div>
    </div>
  );
}
