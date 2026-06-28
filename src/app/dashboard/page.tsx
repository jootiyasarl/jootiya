import { getServerUser, getAuthenticatedServerClient } from "@/lib/supabase-server";
export const dynamic = "force-dynamic";
import { getSellerAds, getSellerStats } from "@/lib/db/dashboard";
import SellerDashboard from "@/components/dashboard/SellerDashboard";
import { redirect } from "next/navigation";

export default async function DashboardPage() {
  const user = await getServerUser();

  // Silent protection only: if there's no session, go to login.
  if (!user) {
    redirect("/login?next=/dashboard");
  }

  const supabase = await getAuthenticatedServerClient();

  // Fetch data in parallel using the server client
  const [stats, { ads, count }] = await Promise.all([
    getSellerStats(supabase, user.id),
    getSellerAds(supabase, user.id, 1, 100),
  ]);

  return (
    <div className="min-h-screen bg-gray-50/50 p-4 md:p-8 dark:bg-zinc-950">
      <div className="mx-auto max-w-6xl">
        <SellerDashboard
          initialStats={stats}
          initialAds={ads}
          initialCount={count}
        />
      </div>
    </div>
  );
}
