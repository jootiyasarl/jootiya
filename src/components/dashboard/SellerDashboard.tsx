"use client";

import { useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { DashboardStats } from './DashboardStats';
import { AdsTable } from './AdsTable';
import { Plus } from 'lucide-react';
import { useRouter } from 'next/navigation';

// Types
type DashboardProps = {
    initialStats: any;
    initialAds: any[];
    initialCount: number;
};

export default function SellerDashboard({ initialStats, initialAds, initialCount }: DashboardProps) {
    const router = useRouter();
    const [ads, setAds] = useState(initialAds);

    // Pagination State (Simplified for 1 page demo, can expand)
    // const [page, setPage] = useState(1);

    const handleDelete = async (id: string) => {
        if (!confirm("Are you sure you want to delete this ad?")) return;

        try {
            const { error } = await supabase
                .from('ads')
                .delete() // Actually delete, or set status='deleted' if using soft delete
                .eq('id', id);

            if (error) throw error;

            // Optimistic UI update
            setAds(prev => prev.filter(ad => ad.id !== id));
            router.refresh(); // Refresh server stats
        } catch (err) {
            console.error("Delete failed", err);
            alert("Failed to delete ad");
        }
    };

    return (
        <div className="space-y-8 animate-in fade-in duration-500">

            {/* Header */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent dark:from-white dark:to-gray-400">
                        Seller Dashboard
                    </h1>
                    <p className="text-gray-500 dark:text-gray-400 mt-1">
                        Manage your listings and performance
                    </p>
                </div>
                <Link href="/marketplace/post">
                    <Button size="lg" className="rounded-2xl shadow-lg hover:shadow-xl transition-all">
                        <Plus className="mr-2 h-5 w-5" /> Post New Ad
                    </Button>
                </Link>
            </div>

            {/* Stats Cards */}
            <DashboardStats stats={initialStats} />

            {/* Main Content: Ads Table */}
            <div className="space-y-4">
                <h2 className="text-xl font-semibold text-gray-800 dark:text-white">Your Listings</h2>
                <AdsTable ads={ads} onDelete={handleDelete} />
            </div>

        </div>
    );
}
