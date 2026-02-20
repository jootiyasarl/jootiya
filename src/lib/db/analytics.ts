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
