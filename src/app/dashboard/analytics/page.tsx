import { createSupabaseServerClient, getServerUser, getAuthenticatedServerClient } from "@/lib/supabase";
import { getSellerAds, getSellerStats } from "@/lib/db/dashboard";
import { AnalyticsClient } from "@/components/dashboard/AnalyticsClient";
import { redirect } from "next/navigation";

export default async function SellerAnalyticsPage() {
  const user = await getServerUser();

  if (!user) {
    redirect("/login?redirectTo=/dashboard/analytics");
  }

  const supabase = await getAuthenticatedServerClient();

  // Fetch data for analytics
  const [stats, { ads }] = await Promise.all([
    getSellerStats(supabase, user.id),
    getSellerAds(supabase, user.id, 1, 100),
  ]);

  return (
    <div className="min-h-screen bg-transparent p-4 md:p-8">
      <div className="mx-auto max-w-7xl">
        <AnalyticsClient
          stats={stats}
          ads={ads}
        />
      </div>
    </div>
  );
}
