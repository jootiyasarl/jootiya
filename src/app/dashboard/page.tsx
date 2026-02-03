import { supabase } from '@/lib/supabaseClient';
import { getSellerAds, getSellerStats } from '@/lib/db/dashboard';
import SellerDashboard from "@/components/dashboard/SellerDashboard";
import { redirect } from 'next/navigation';

export default async function DashboardPage() {
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login?redirectTo=/dashboard');
  }

  // Fetch data in parallel
  const [stats, { ads, count }] = await Promise.all([
    getSellerStats(user.id),
    getSellerAds(user.id, 1, 100), // Defaulting to first 100 for now
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
