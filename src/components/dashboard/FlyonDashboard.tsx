"use client";

import { useState } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabaseClient";
import { useRouter } from "next/navigation";

type DashboardProps = {
  initialStats: {
    totalAds: number;
    approvedAds: number;
    pendingAds: number;
    revenue: number;
    totalViews: number;
  };
  initialAds: Array<{
    id: string;
    title: string;
    price?: number | null;
    currency?: string | null;
    status?: string | null;
    city?: string | null;
    neighborhood?: string | null;
    created_at?: string | null;
    views_count?: number | null;
    image_urls?: string[] | null;
  }>;
  initialCount: number;
};

export default function FlyonDashboard({ initialStats, initialAds, initialCount }: DashboardProps) {
  const [ads, setAds] = useState(initialAds);
  const router = useRouter();

  const handleDelete = async (id: string) => {
    if (!confirm("Voulez-vous vraiment supprimer cette annonce ?")) return;
    try {
      const { error } = await supabase
        .from("ads")
        .delete()
        .eq("id", id);
      if (error) throw error;
      setAds(prev => prev.filter(a => a.id !== id));
      router.refresh();
    } catch (e) {
      console.error(e);
      alert("Échec de la suppression de l'annonce");
    }
  };

  const badgeClass = (status?: string | null) => {
    const s = String(status || "").toLowerCase();
    if (s === "approved" || s === "active") return "badge badge-success";
    if (s === "pending") return "badge badge-warning";
    if (s === "rejected" || s === "deleted") return "badge badge-error";
    return "badge badge-ghost";
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-black tracking-tight">Tableau de bord vendeur</h1>
          <p className="text-zinc-500 mt-1">Gérez vos annonces et vos performances</p>
        </div>
        <Link href="/marketplace/post" className="btn btn-primary rounded-2xl">
          Publier une annonce
        </Link>
      </div>

      {/* Stats using FlyonUI */}
      <div className="stats stats-vertical lg:stats-horizontal shadow w-full rounded-2xl">
        <div className="stat">
          <div className="stat-title">Revenu total</div>
          <div className="stat-value text-emerald-600">{initialStats.revenue.toLocaleString()} MAD</div>
          <div className="stat-desc">Basé sur les ventes</div>
        </div>

        <div className="stat">
          <div className="stat-title">Total annonces</div>
          <div className="stat-value text-orange-600">{initialStats.totalAds}</div>
          <div className="stat-desc">Toutes périodes</div>
        </div>

        <div className="stat">
          <div className="stat-title">Annonces actives</div>
          <div className="stat-value text-indigo-600">{initialStats.approvedAds}</div>
          <div className="stat-desc">Visibles sur le site</div>
        </div>

        <div className="stat">
          <div className="stat-title">Vues totales</div>
          <div className="stat-value text-amber-600">{initialStats.totalViews.toLocaleString()}</div>
          <div className="stat-desc">+12% cette semaine</div>
        </div>
      </div>

      {/* Ads table */}
      <div className="card bg-base-100 shadow rounded-2xl">
        <div className="card-body">
          <div className="flex items-center justify-between">
            <h2 className="card-title">Vos annonces</h2>
            <span className="badge badge-neutral">{initialCount} total</span>
          </div>

          <div className="overflow-x-auto mt-4">
            <table className="table">
              <thead>
                <tr>
                  <th>Titre</th>
                  <th>Prix</th>
                  <th>Statut</th>
                  <th>Ville</th>
                  <th>Vues</th>
                  <th>Date</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {ads.map(ad => (
                  <tr key={ad.id}>
                    <td className="max-w-[280px]">
                      <div className="flex items-center gap-3">
                        <div className="mask mask-squircle w-12 h-12 bg-zinc-100 overflow-hidden">
                          {ad.image_urls?.[0] ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img src={ad.image_urls[0]} alt="thumb" className="w-full h-full object-cover" />
                          ) : null}
                        </div>
                        <div>
                          <div className="font-bold line-clamp-1">{ad.title}</div>
                          <div className="text-xs opacity-50">{ad.neighborhood ? `${ad.neighborhood}, ${ad.city}` : ad.city || "Maroc"}</div>
                        </div>
                      </div>
                    </td>
                    <td>
                      {ad.price ? `${Number(ad.price).toLocaleString()} ${ad.currency || "MAD"}` : "-"}
                    </td>
                    <td>
                      <span className={badgeClass(ad.status)}>{ad.status || "-"}</span>
                    </td>
                    <td>{ad.city || "-"}</td>
                    <td>{ad.views_count ?? 0}</td>
                    <td>{ad.created_at ? new Date(ad.created_at).toLocaleDateString("fr-FR") : "-"}</td>
                    <td className="flex gap-2 justify-end">
                      <Link href={`/dashboard/ads/${ad.id}/edit`} className="btn btn-xs">Modifier</Link>
                      <button onClick={() => handleDelete(ad.id)} className="btn btn-xs btn-error text-white">Supprimer</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="card-actions justify-end mt-4">
            <Link href="/dashboard/ads" className="btn btn-ghost">Voir toutes les annonces</Link>
          </div>
        </div>
      </div>
    </div>
  );
}
