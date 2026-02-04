"use client";

import { useEffect, useState, useMemo } from "react";
import { AdsTable } from "@/components/ads/AdsTable";
import type { AdminAd, AdsTableFilters } from "@/components/ads/AdsTable";
import { supabase } from "@/lib/supabaseClient";

export default function AdminAdsPage() {
  const [ads, setAds] = useState<AdminAd[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState<AdsTableFilters>({
    status: "all",
    location: "all",
    category: "all",
    query: "",
  });
  const [moderatingId, setModeratingId] = useState<string | null>(null);

  useEffect(() => {
    fetchAds();
  }, []);

  const fetchAds = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("ads")
        .select("id, title, city, neighborhood, category, status, price, currency, created_at")
        .order("created_at", { ascending: false });

      if (error) throw error;

      // Map DB ads to AdminAd type
      const mappedAds: AdminAd[] = (data || []).map((ad: any) => ({
        id: ad.id,
        title: ad.title,
        location: ad.neighborhood ? `${ad.neighborhood}, ${ad.city}` : ad.city || "Maroc",
        category: ad.category, // Ensure your DB has this or you mocked it
        status: ad.status,
        price: ad.price,
        currency: ad.currency,
        is_featured: false, // Default or fetch if exists
        created_at: ad.created_at,
      }));

      setAds(mappedAds);
    } catch (err) {
      console.error("Error fetching ads:", err);
    } finally {
      setLoading(false);
    }
  };

  const filteredAds = useMemo(() => {
    return ads.filter((ad) => {
      // Status
      if (filters.status !== "all" && ad.status?.toLowerCase() !== filters.status.toLowerCase()) {
        // Handle 'active' vs 'approved' alias mapping if needed
        if (filters.status === 'active' && ad.status === 'approved') return true;
        // otherwise
        return false;
      }

      // Location
      if (filters.location !== "all" && ad.location !== filters.location) {
        return false;
      }

      // Category
      if (filters.category !== "all" && ad.category !== filters.category) {
        return false;
      }

      // Query
      if (filters.query) {
        const q = filters.query.toLowerCase();
        if (
          !ad.title.toLowerCase().includes(q) &&
          !ad.id.toLowerCase().includes(q)
        ) {
          return false;
        }
      }

      return true;
    });
  }, [ads, filters]);

  const handleAction = async (id: string, action: 'approve' | 'reject' | 'delete', newStatus?: string) => {
    setModeratingId(id);
    try {
      if (action === 'delete') {
        await supabase.from('ads').delete().eq('id', id);
        setAds(prev => prev.filter(a => a.id !== id));
      } else {
        await supabase.from('ads').update({ status: newStatus }).eq('id', id);
        setAds(prev => prev.map(a => a.id === id ? { ...a, status: newStatus || a.status } : a));
      }
    } catch (err) {
      console.error(`Failed to ${action} ad`, err);
      alert(`Failed to ${action} ad`);
    } finally {
      setModeratingId(null);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div>
        <h2 className="text-2xl font-bold tracking-tight text-zinc-100">Ads Management</h2>
        <p className="text-zinc-400">
          Moderate, edit, and manage all marketplace listings.
        </p>
      </div>

      <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-1">
        <AdsTable
          ads={filteredAds}
          allAds={ads}
          filters={filters}
          onFiltersChange={setFilters}
          onApprove={(ad) => handleAction(ad.id, 'approve', 'approved')}
          onReject={(ad) => handleAction(ad.id, 'reject', 'rejected')}
          onDelete={(ad) => {
            if (confirm('Are you sure you want to delete this ad?')) {
              handleAction(ad.id, 'delete');
            }
          }}
          onEdit={(ad) => window.alert('Edit functionality coming soon')}
          onToggleFeatured={(ad) => window.alert('Feature toggling coming soon')}
          isModeratingId={moderatingId}
        />
      </div>
    </div>
  );
}
