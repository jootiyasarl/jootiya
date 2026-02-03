import { supabase } from '@/lib/supabaseClient';

export interface AdminStats {
    totalUsers: number;
    totalAds: number;
    activeAds: number;
    totalRevenue: number;
    growth: {
        users: number; // percentage
        ads: number;
    };
}

export async function getAdminStats(): Promise<AdminStats> {
    const { count: totalUsers } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true });

    const { data: ads } = await supabase
        .from('ads')
        .select('price, status');

    const totalAds = ads?.length || 0;
    const activeAds = ads?.filter(a => a.status === 'approved').length || 0;

    // Calculate revenue (mock business logic: assuming 10% commission or just sum of sales if platform handles it)
    // For now, let's just sum approved ad values as "Platform Volume" (GMV)
    const totalRevenue = ads
        ?.filter(a => a.status === 'approved')
        .reduce((sum, a) => sum + (Number(a.price) || 0), 0) || 0;

    return {
        totalUsers: totalUsers || 0,
        totalAds,
        activeAds,
        totalRevenue,
        growth: {
            users: 12, // Dummy growth data for UI
            ads: 8
        }
    };
}

export async function getRecentActivity() {
    const { data: recentJoiners } = await supabase
        .from('profiles')
        .select('email, full_name, created_at, avatar_url')
        .order('created_at', { ascending: false })
        .limit(5);

    const { data: recentAds } = await supabase
        .from('ads')
        .select('id, title, status, created_at, seller_id')
        .order('created_at', { ascending: false })
        .limit(5);

    return { recentJoiners, recentAds };
}
