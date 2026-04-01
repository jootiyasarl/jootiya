"use client";

import { useEffect, useState, useMemo } from "react";
import { AdsTable } from "@/components/ads/AdsTable";
import type { AdminAd, AdsTableFilters } from "@/components/ads/AdsTable";
import { getAdminAds, updateAdStatus, deleteAdAdmin } from "./admin-actions";
import { toast } from "sonner";

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
      const result = await getAdminAds();
      if (result.success && result.data) {
        setAds(result.data);
      } else {
        console.error("Error fetching ads:", result.error);
        toast.error("Erreur lors du chargement des annonces");
      }
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
      let result;
      if (action === 'delete') {
        result = await deleteAdAdmin(id);
        if (result.success) {
          setAds(prev => prev.filter(a => a.id !== id));
          toast.success("Annonce supprimée");
        }
      } else if (newStatus) {
        result = await updateAdStatus(id, newStatus);
        if (result.success) {
          setAds(prev => prev.map(a => a.id === id ? { ...a, status: newStatus } : a));
          toast.success(action === 'approve' ? "Annonce approuvée" : "Annonce refusée");
        }
      }
      
      if (result && !result.success) {
        throw new Error(result.error);
      }
    } catch (err: any) {
      console.error(`Failed to ${action} ad`, err);
      toast.error(`Erreur: ${err.message}`);
    } finally {
      setModeratingId(null);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div>
        <h2 className="text-2xl font-bold tracking-tight text-zinc-100">Gestion des annonces</h2>
        <p className="text-zinc-400">
          Modérez, modifiez et gérez toutes les annonces du marché.
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
