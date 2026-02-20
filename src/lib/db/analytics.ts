import { supabase } from "@/lib/supabaseClient";

export async function getPageViewsStats() {
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  const { data, error } = await supabase
    .from("page_views")
    .select("viewed_at")
    .gte("viewed_at", thirtyDaysAgo.toISOString());

  if (error) {
    console.error("Error fetching page views:", error);
    return [];
  }

  // Group by date
  const counts: { [key: string]: number } = {};
  
  // Initialize last 7 days with 0
  for (let i = 6; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const dateStr = d.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' });
    counts[dateStr] = 0;
  }

  data.forEach(view => {
    const dateStr = new Date(view.viewed_at).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' });
    if (counts[dateStr] !== undefined) {
      counts[dateStr]++;
    }
  });

  return Object.entries(counts).map(([date, views]) => ({ date, views }));
}

export async function getTopPagesStats(limit: number = 5) {
  const { data, error } = await supabase
    .from("page_views")
    .select("page_path");

  if (error) {
    console.error("Error fetching top pages:", error);
    return [];
  }

  const pathCounts: { [key: string]: number } = {};
  data.forEach((view) => {
    pathCounts[view.page_path] = (pathCounts[view.page_path] || 0) + 1;
  });

  return Object.entries(pathCounts)
    .map(([path, views]) => ({ path, views }))
    .sort((a, b) => b.views - a.views)
    .slice(0, limit);
}

export async function getDeviceStats() {
  const { data, error } = await supabase
    .from("page_views")
    .select("device_type");

  if (error) {
    console.error("Error fetching device stats:", error);
    return { mobile: 0, desktop: 0 };
  }

  const stats = { mobile: 0, desktop: 0 };
  data.forEach((view) => {
    if (view.device_type === "mobile") stats.mobile++;
    else stats.desktop++;
  });

  const total = stats.mobile + stats.desktop || 1;
  return {
    mobile: Math.round((stats.mobile / total) * 100),
    desktop: Math.round((stats.desktop / total) * 100),
  };
}

