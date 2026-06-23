import { supabase } from '@/lib/supabaseClient';

export interface AdminStats {
    totalUsers: number;
    totalAds: number;
    activeAds: number;
    totalRevenue: number;
    growth: {
        users: number; // percentage
        ads: number;
        revenue: number;
    };
}

export async function getAdminStats(): Promise<AdminStats> {
    const { count: totalUsers, data: profilesData } = await supabase
        .from('profiles')
        .select('created_at', { count: 'exact' });

    const { data: ads } = await supabase
        .from('ads')
        .select('price, status, created_at');

    const totalAds = ads?.length || 0;
    const activeAds = ads?.filter(a => a.status === 'approved').length || 0;

    // Calculate total revenue from approved ads
    const totalRevenue = ads
        ?.filter(a => a.status === 'approved')
        .reduce((sum, a) => sum + (Number(a.price) || 0), 0) || 0;

    // Calculate real growth: last 7 days vs previous 7 days
    const now = new Date();
    const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const fourteenDaysAgo = new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000);

    // User growth (from profiles)
    const recentUsers = profilesData?.filter((p: any) => {
        const created = p.created_at ? new Date(p.created_at) : null;
        return created && created >= sevenDaysAgo;
    }).length || 0;
    const previousUsers = profilesData?.filter((p: any) => {
        const created = p.created_at ? new Date(p.created_at) : null;
        return created && created >= fourteenDaysAgo && created < sevenDaysAgo;
    }).length || 0;

    const usersGrowth = previousUsers > 0
        ? Math.round(((recentUsers - previousUsers) / previousUsers) * 100)
        : (recentUsers > 0 ? 100 : 0);

    // Ad growth
    const recentAds = ads?.filter((a: any) => {
        const created = a.created_at ? new Date(a.created_at) : null;
        return created && created >= sevenDaysAgo;
    }).length || 0;
    const previousAds = ads?.filter((a: any) => {
        const created = a.created_at ? new Date(a.created_at) : null;
        return created && created >= fourteenDaysAgo && created < sevenDaysAgo;
    }).length || 0;

    const adsGrowth = previousAds > 0
        ? Math.round(((recentAds - previousAds) / previousAds) * 100)
        : (recentAds > 0 ? 100 : 0);

    // Revenue growth (approved ads only)
    const recentRevenue = ads
        ?.filter((a: any) => a.status === 'approved')
        .filter((a: any) => {
            const created = a.created_at ? new Date(a.created_at) : null;
            return created && created >= sevenDaysAgo;
        })
        .reduce((sum: number, a: any) => sum + (Number(a.price) || 0), 0) || 0;

    const previousRevenue = ads
        ?.filter((a: any) => a.status === 'approved')
        .filter((a: any) => {
            const created = a.created_at ? new Date(a.created_at) : null;
            return created && created >= fourteenDaysAgo && created < sevenDaysAgo;
        })
        .reduce((sum: number, a: any) => sum + (Number(a.price) || 0), 0) || 0;

    const revenueGrowth = previousRevenue > 0
        ? Math.round(((recentRevenue - previousRevenue) / previousRevenue) * 100)
        : (recentRevenue > 0 ? 100 : 0);

    return {
        totalUsers: totalUsers || 0,
        totalAds,
        activeAds,
        totalRevenue,
        growth: {
            users: usersGrowth,
            ads: adsGrowth,
            revenue: revenueGrowth
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
