"use client";

import { useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { DashboardStats } from './DashboardStats';
import { AdsTable } from './AdsTable';
import { DashboardCharts } from './DashboardCharts';
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
        if (!confirm("Voulez-vous vraiment supprimer cette annonce ?")) return;

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
            alert("Échec de la suppression de l'annonce");
        }
    };

    return (
        <div className="space-y-8 animate-in fade-in duration-500">

            {/* Header */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent dark:from-white dark:to-gray-400">
                        Tableau de bord vendeur
                    </h1>
                    <p className="text-gray-500 dark:text-gray-400 mt-1">
                        Gérez vos annonces et vos performances
                    </p>
                </div>
                <Link href="/marketplace/post">
                    <Button size="lg" className="rounded-2xl shadow-lg hover:shadow-xl transition-all">
                        <Plus className="mr-2 h-5 w-5" /> Publier une annonce
                    </Button>
                </Link>
            </div>

            {/* Stats Cards */}
            <DashboardStats stats={initialStats} />

            <div className="grid gap-6 md:grid-cols-1 lg:grid-cols-7">
                {/* Charts Area */}
                <div className="lg:col-span-4">
                    <DashboardCharts />
                </div>

                {/* Quick Actions / Activity Feed or just a placeholder for now to balance grid */}
                <div className="lg:col-span-3 space-y-4">
                    <div className="rounded-2xl border border-blue-100 bg-blue-50/50 p-6 dark:border-blue-900/30 dark:bg-blue-900/10">
                        <h3 className="font-semibold text-blue-900 dark:text-blue-100">Astuce Pro</h3>
                        <p className="mt-2 text-sm text-blue-700 dark:text-blue-300">
                            Les annonces avec 3 images ou plus reçoivent 2,5x plus de vues. Modifiez vos annonces pour ajouter plus de photos !
                        </p>
                        <Button variant="outline" size="sm" className="mt-4 border-blue-200 text-blue-700 hover:bg-blue-100 dark:border-blue-800 dark:text-blue-300 dark:hover:bg-blue-900/50">
                            Vérifier la qualité
                        </Button>
                    </div>
                </div>
            </div>

            {/* Main Content: Ads Table */}
            <div className="space-y-4">
                <h2 className="text-xl font-semibold text-gray-800 dark:text-white">Vos annonces</h2>
                <AdsTable ads={ads} onDelete={handleDelete} />
            </div>

        </div>
    );
}
