import { createSupabaseServerClient, getServerUser, getAuthenticatedServerClient } from "@/lib/supabase-server";
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
    getSellerAds(supabase, user.id, 1, 1000), // Fetch up to 1000 ads for historical accuracy
  ]);

  // Generate real chart data (Ads posted per month)
  const monthNames = ["Jan", "Fév", "Mar", "Avr", "Mai", "Juin", "Juil", "Août", "Sep", "Oct", "Nov", "Déc"];
  const last6Months = Array.from({ length: 6 }, (_, i) => {
    const d = new Date();
    d.setMonth(d.getMonth() - (5 - i));
    return {
      name: monthNames[d.getMonth()],
      monthNum: d.getMonth(),
      year: d.getFullYear(),
      total: 0
    };
  });

  ads.forEach(ad => {
    const adDate = new Date(ad.created_at);
    const monthIndex = last6Months.findIndex(m => m.monthNum === adDate.getMonth() && m.year === adDate.getFullYear());
    if (monthIndex !== -1) {
      last6Months[monthIndex].total++;
    }
  });

  const chartData = last6Months.map(({ name, total }) => ({ name, total }));

  return (
    <div className="min-h-screen bg-transparent p-4 md:p-8">
      <div className="mx-auto max-w-7xl">
        <AnalyticsClient
          stats={stats}
          ads={ads}
          chartData={chartData}
        />
      </div>
    </div>
  );
}
