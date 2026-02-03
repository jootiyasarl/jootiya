import { supabase } from '@/lib/supabaseClient';

export interface DashboardStats {
    totalAds: number;
    approvedAds: number;
    pendingAds: number;
    revenue: number;
}

export async function getSellerStats(userId: string): Promise<DashboardStats> {
    const { data, error } = await supabase
        .from('ads')
        .select('price, status')
        .eq('seller_id', userId);

    if (error) {
        console.error('Error fetching stats:', error);
        throw new Error('Failed to fetch stats');
    }

    const stats = {
        totalAds: data.length,
        approvedAds: data.filter((ad) => ad.status === 'approved').length,
        pendingAds: data.filter((ad) => ad.status === 'pending').length,
        // Calculating revenue based on 'approved' ads as requested (or 'sold' if we had that flow)
        // User expectation: "Calculate total revenue (sum of approved ads)"
        revenue: data
            .filter((ad) => ad.status === 'approved')
            .reduce((sum, ad) => sum + (Number(ad.price) || 0), 0),
    };

    return stats;
}

export async function getSellerAds(userId: string, page: number = 1, limit: number = 10) {
    const from = (page - 1) * limit;
    const to = from + limit - 1;

    const { data, count, error } = await supabase
        .from('ads')
        .select('*', { count: 'exact' })
        .eq('seller_id', userId)
        .order('created_at', { ascending: false })
        .range(from, to);

    if (error) {
        console.error('Error fetching ads:', error);
        throw new Error('Failed to fetch ads');
    }

    return { ads: data, count: count || 0 };
}
