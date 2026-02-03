import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { FilePlus2 } from "lucide-react";
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
      <div className="mx-auto flex min-h-screen w-full max-w-7xl flex-col justify-center px-4 py-10">
        <div className="space-y-6">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
                <FilePlus2 className="h-5 w-5" />
              </div>
              <div className="text-right">
                <h1 className="text-2xl font-semibold tracking-tight text-zinc-900 md:text-3xl">
                  إنشاء إعلان جديد
                </h1>
                <p className="mt-1 text-sm text-zinc-600">
                  املأ تفاصيل الإعلان الخاص بك وسيظهر للمستخدمين في السوق بعد المراجعة.
                </p>
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-zinc-200/80 bg-white/80 p-6 shadow-sm backdrop-blur-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-md">
            {/* TODO: Replace with real create-ad form */}
            <p className="text-sm text-zinc-600">
              نموذج إنشاء الإعلان سيُضاف هنا.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
