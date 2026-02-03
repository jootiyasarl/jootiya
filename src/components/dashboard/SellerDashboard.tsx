"use client";

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { Card } from '@/components/ui/card'; // Check if this exists, if not use div with classes
import { Button } from '@/components/ui/button';
import Link from 'next/link';

// Simple SVGs for icons
const PlusIcon = () => <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>;

export default function SellerDashboard() {
    const [stats, setStats] = useState({ totalAds: 0, totalViews: 0, activeAds: 0 });
    const [recentAds, setRecentAds] = useState<any[]>([]);

    useEffect(() => {
        async function fetchStats() {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) return;

            const { data: ads } = await supabase
                .from('ads')
                .select('views_count, status')
                .eq('seller_id', user.id);

            if (ads) {
                const totalAds = ads.length;
                const totalViews = ads.reduce((acc, curr) => acc + (curr.views_count || 0), 0);
                const activeAds = ads.filter(a => a.status === 'approved').length;
                setStats({ totalAds, totalViews, activeAds });
            }

            const { data: recent } = await supabase
                .from('ads')
                .select('*')
                .eq('seller_id', user.id)
                .order('created_at', { ascending: false })
                .limit(5);

            if (recent) setRecentAds(recent);
        }

        fetchStats();
    }, []);

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h1 className="text-3xl font-bold dark:text-white">Dashboard</h1>
                <Link href="/marketplace/post">
                    <Button>
                        <PlusIcon /> Post New Ad
                    </Button>
                </Link>
            </div>

            {/* Stats Grid */}
            <div className="grid gap-4 md:grid-cols-3">
                <div className="p-6 bg-white rounded-2xl shadow-sm border border-gray-100 dark:bg-zinc-900 dark:border-zinc-800">
                    <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Total Listings</h3>
                    <p className="text-3xl font-bold mt-2 dark:text-white">{stats.totalAds}</p>
                </div>
                <div className="p-6 bg-white rounded-2xl shadow-sm border border-gray-100 dark:bg-zinc-900 dark:border-zinc-800">
                    <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Total Views</h3>
                    <p className="text-3xl font-bold mt-2 dark:text-white">{stats.totalViews}</p>
                </div>
                <div className="p-6 bg-white rounded-2xl shadow-sm border border-gray-100 dark:bg-zinc-900 dark:border-zinc-800">
                    <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Active Ads</h3>
                    <p className="text-3xl font-bold mt-2 dark:text-white text-green-600">{stats.activeAds}</p>
                </div>
            </div>

            {/* Recent Activity */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden dark:bg-zinc-900 dark:border-zinc-800">
                <div className="p-6 border-b border-gray-100 dark:border-zinc-800">
                    <h2 className="text-lg font-semibold dark:text-white">Recent Listings</h2>
                </div>
                <div className="divide-y divide-gray-100 dark:divide-zinc-800">
                    {recentAds.length === 0 ? (
                        <div className="p-6 text-center text-gray-500">No listings yet.</div>
                    ) : (
                        recentAds.map((ad) => (
                            <div key={ad.id} className="p-4 flex items-center justify-between hover:bg-gray-50 dark:hover:bg-zinc-800/50 transition-colors">
                                <div className="flex items-center gap-4">
                                    {/* Small preview image could go here */}
                                    <div>
                                        <p className="font-medium text-gray-900 dark:text-white">{ad.title}</p>
                                        <p className="text-sm text-gray-500">{new Date(ad.created_at).toLocaleDateString()}</p>
                                    </div>
                                </div>
                                <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${ad.status === 'approved' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300' :
                                        ad.status === 'pending' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300' :
                                            'bg-gray-100 text-gray-800 dark:bg-zinc-800 dark:text-gray-300'
                                    }`}>
                                    {ad.status}
                                </span>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </div>
    );
}
