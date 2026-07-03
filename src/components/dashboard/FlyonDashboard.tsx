"use client";

import { useState } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabaseClient";
import { useRouter } from "next/navigation";
import { 
  PlusCircle, 
  List, 
  MessageCircle, 
  User, 
  CreditCard, 
  Settings, 
  Eye, 
  Trash2, 
  Edit3, 
  TrendingUp, 
  Megaphone,
  Heart,
  ChevronRight
} from "lucide-react";

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
    if (s === "approved" || s === "active") return "badge badge-success badge-soft text-[10px] px-2 py-0.5 rounded-full";
    if (s === "pending") return "badge badge-warning badge-soft text-[10px] px-2 py-0.5 rounded-full";
    if (s === "rejected" || s === "deleted") return "badge badge-error badge-soft text-[10px] px-2 py-0.5 rounded-full";
    return "badge badge-neutral text-[10px] px-2 py-0.5 rounded-full";
  };

  return (
    <div className="space-y-6 md:space-y-8">
      
      {/* ======================================================== */}
      {/* DESKTOP HEADER */}
      {/* ======================================================== */}
      <div className="hidden md:flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-black tracking-tight">Tableau de bord vendeur</h1>
          <p className="text-zinc-500 mt-1">Gerez vos annonces et vos performances</p>
        </div>
        <Link href="/marketplace/post" className="btn btn-primary rounded-2xl px-6">
          <PlusCircle className="w-5 h-5" />
          Publier une annonce
        </Link>
      </div>

      {/* ======================================================== */}
      {/* MOBILE PREMIUM HEADER & BANNER */}
      {/* ======================================================== */}
      <div className="block md:hidden space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-black tracking-tight text-zinc-900 dark:text-white">Bonjour Vendeur 👋</h1>
            <p className="text-xs text-zinc-400">Ravi de vous revoir aujourd'hui</p>
          </div>
        </div>

        {/* Quick Stats Grid for Mobile */}
        <div className="grid grid-cols-2 gap-3">
          <div className="card bg-white dark:bg-zinc-900 p-4 border border-zinc-100 dark:border-zinc-800 rounded-2xl flex flex-col gap-1 shadow-sm relative overflow-hidden group">
            <span className="text-zinc-400 text-[10px] uppercase font-black tracking-wider">Revenu total</span>
            <span className="text-lg font-black text-emerald-600 mt-1">{initialStats.revenue.toLocaleString()} MAD</span>
            <span className="absolute right-3 bottom-3 text-emerald-600/10"><TrendingUp size={28} /></span>
          </div>

          <div className="card bg-white dark:bg-zinc-900 p-4 border border-zinc-100 dark:border-zinc-800 rounded-2xl flex flex-col gap-1 shadow-sm relative overflow-hidden group">
            <span className="text-zinc-400 text-[10px] uppercase font-black tracking-wider">Total Annonces</span>
            <span className="text-lg font-black text-orange-600 mt-1">{initialStats.totalAds}</span>
            <span className="absolute right-3 bottom-3 text-orange-600/10"><Megaphone size={28} /></span>
          </div>

          <div className="card bg-white dark:bg-zinc-900 p-4 border border-zinc-100 dark:border-zinc-800 rounded-2xl flex flex-col gap-1 shadow-sm relative overflow-hidden group">
            <span className="text-zinc-400 text-[10px] uppercase font-black tracking-wider">Actives</span>
            <span className="text-lg font-black text-indigo-600 mt-1">{initialStats.approvedAds}</span>
            <span className="absolute right-3 bottom-3 text-indigo-600/10"><List size={28} /></span>
          </div>

          <div className="card bg-white dark:bg-zinc-900 p-4 border border-zinc-100 dark:border-zinc-800 rounded-2xl flex flex-col gap-1 shadow-sm relative overflow-hidden group">
            <span className="text-zinc-400 text-[10px] uppercase font-black tracking-wider">Vues totales</span>
            <span className="text-lg font-black text-amber-600 mt-1">{initialStats.totalViews.toLocaleString()}</span>
            <span className="absolute right-3 bottom-3 text-amber-600/10"><Eye size={28} /></span>
          </div>
        </div>

        {/* Quick App Actions Grid for Mobile */}
        <div className="space-y-2 pt-2">
          <h3 className="text-xs font-black uppercase tracking-widest text-zinc-400 px-1">Raccourcis</h3>
          <div className="grid grid-cols-3 gap-2">
            <Link href="/poste-annonce" className="flex flex-col items-center justify-center bg-white dark:bg-zinc-900 p-3 rounded-2xl border border-zinc-100 dark:border-zinc-800 shadow-sm active:scale-95 transition-all text-center">
              <div className="w-10 h-10 rounded-full bg-orange-100 dark:bg-orange-950/20 flex items-center justify-center text-orange-500 mb-2">
                <PlusCircle size={20} />
              </div>
              <span className="text-[10px] font-bold text-zinc-700 dark:text-zinc-300">Publier</span>
            </Link>

            <Link href="/dashboard/ads" className="flex flex-col items-center justify-center bg-white dark:bg-zinc-900 p-3 rounded-2xl border border-zinc-100 dark:border-zinc-800 shadow-sm active:scale-95 transition-all text-center">
              <div className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-950/20 flex items-center justify-center text-blue-500 mb-2">
                <List size={20} />
              </div>
              <span className="text-[10px] font-bold text-zinc-700 dark:text-zinc-300">Mes Annonces</span>
            </Link>

            <Link href="/dashboard/messages" className="flex flex-col items-center justify-center bg-white dark:bg-zinc-900 p-3 rounded-2xl border border-zinc-100 dark:border-zinc-800 shadow-sm active:scale-95 transition-all text-center">
              <div className="w-10 h-10 rounded-full bg-emerald-100 dark:bg-emerald-950/20 flex items-center justify-center text-emerald-500 mb-2">
                <MessageCircle size={20} />
              </div>
              <span className="text-[10px] font-bold text-zinc-700 dark:text-zinc-300">Messages</span>
            </Link>

            <Link href="/profile" className="flex flex-col items-center justify-center bg-white dark:bg-zinc-900 p-3 rounded-2xl border border-zinc-100 dark:border-zinc-800 shadow-sm active:scale-95 transition-all text-center">
              <div className="w-10 h-10 rounded-full bg-indigo-100 dark:bg-indigo-950/20 flex items-center justify-center text-indigo-500 mb-2">
                <User size={20} />
              </div>
              <span className="text-[10px] font-bold text-zinc-700 dark:text-zinc-300">Mon Profil</span>
            </Link>

            <Link href="/dashboard/subscription" className="flex flex-col items-center justify-center bg-white dark:bg-zinc-900 p-3 rounded-2xl border border-zinc-100 dark:border-zinc-800 shadow-sm active:scale-95 transition-all text-center">
              <div className="w-10 h-10 rounded-full bg-purple-100 dark:bg-purple-950/20 flex items-center justify-center text-purple-500 mb-2">
                <CreditCard size={20} />
              </div>
              <span className="text-[10px] font-bold text-zinc-700 dark:text-zinc-300">Abonnement</span>
            </Link>

            <Link href="/settings" className="flex flex-col items-center justify-center bg-white dark:bg-zinc-900 p-3 rounded-2xl border border-zinc-100 dark:border-zinc-800 shadow-sm active:scale-95 transition-all text-center">
              <div className="w-10 h-10 rounded-full bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center text-zinc-500 mb-2">
                <Settings size={20} />
              </div>
              <span className="text-[10px] font-bold text-zinc-700 dark:text-zinc-300">Parametres</span>
            </Link>
          </div>
        </div>
      </div>

      {/* ======================================================== */}
      {/* DESKTOP STATS SECTION */}
      {/* ======================================================== */}
      <div className="hidden md:block stats stats-vertical lg:stats-horizontal shadow w-full rounded-2xl">
        <div className="stat">
          <div className="stat-title">Revenu total</div>
          <div className="stat-value text-emerald-600">{initialStats.revenue.toLocaleString()} MAD</div>
          <div className="stat-desc">Base sur les ventes</div>
        </div>

        <div className="stat">
          <div className="stat-title">Total annonces</div>
          <div className="stat-value text-orange-600">{initialStats.totalAds}</div>
          <div className="stat-desc">Toutes periodes</div>
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

      {/* ======================================================== */}
      {/* ADS LIST SECTION (RESPONSIVE VIEWPORT) */}
      {/* ======================================================== */}
      <div className="space-y-4">
        
        {/* Desktop View Table */}
        <div className="hidden md:block card bg-base-100 shadow rounded-2xl border border-zinc-100 dark:border-zinc-800">
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

        {/* Mobile View App Cards */}
        <div className="block md:hidden space-y-3">
          <div className="flex items-center justify-between px-1">
            <h2 className="text-sm font-black uppercase tracking-wider text-zinc-400">Mes Annonces Récentes</h2>
            <Link href="/dashboard/ads" className="text-xs font-bold text-orange-500 flex items-center">
              Voir tout <ChevronRight size={14} />
            </Link>
          </div>

          <div className="space-y-3">
            {ads.length === 0 ? (
              <div className="text-center py-10 bg-white dark:bg-zinc-900 rounded-2xl border border-dashed border-zinc-200 p-6">
                <p className="text-zinc-500 text-sm font-medium">Vous n'avez pas encore d'annonces.</p>
                <Link href="/poste-annonce" className="btn btn-primary btn-sm rounded-xl mt-4">Déposer ma première annonce</Link>
              </div>
            ) : (
              ads.slice(0, 5).map(ad => (
                <div key={ad.id} className="bg-white dark:bg-zinc-900 rounded-2xl p-3.5 border border-zinc-100 dark:border-zinc-800 shadow-sm flex gap-3 relative">
                  
                  {/* Thumbnail */}
                  <div className="w-16 h-16 rounded-xl bg-zinc-100 dark:bg-zinc-800 overflow-hidden shrink-0">
                    {ad.image_urls?.[0] ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={ad.image_urls[0]} alt={ad.title} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-[9px] font-black uppercase text-zinc-400">NO IMG</div>
                    )}
                  </div>

                  {/* Body details */}
                  <div className="flex-1 min-w-0 flex flex-col justify-between">
                    <div>
                      <h4 className="font-extrabold text-sm text-zinc-900 dark:text-zinc-100 line-clamp-1 leading-tight">{ad.title}</h4>
                      <p className="text-xs text-zinc-400 mt-0.5">{ad.neighborhood ? `${ad.neighborhood}, ${ad.city}` : ad.city || "Maroc"}</p>
                    </div>

                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-sm font-black text-orange-500">
                        {ad.price ? `${Number(ad.price).toLocaleString()} ${ad.currency || "MAD"}` : "—"}
                      </span>
                      <span className={badgeClass(ad.status)}>{ad.status || "-"}</span>
                    </div>

                    <div className="flex items-center gap-3 text-[10px] font-medium text-zinc-400 mt-2">
                      <span className="flex items-center gap-1"><Eye size={12} /> {ad.views_count ?? 0}</span>
                      <span>📅 {ad.created_at ? new Date(ad.created_at).toLocaleDateString("fr-FR", {day: 'numeric', month: 'short'}) : "-"}</span>
                    </div>
                  </div>

                  {/* Actions vertical group */}
                  <div className="flex flex-col gap-2 justify-center shrink-0 border-l border-zinc-100 dark:border-zinc-800 pl-3">
                    <Link href={`/dashboard/ads/${ad.id}/edit`} className="btn btn-ghost btn-square btn-sm rounded-xl text-zinc-500 hover:text-orange-500 hover:bg-orange-50" title="Modifier">
                      <Edit3 size={16} />
                    </Link>
                    <button onClick={() => handleDelete(ad.id)} className="btn btn-ghost btn-square btn-sm rounded-xl text-zinc-400 hover:text-red-500 hover:bg-red-50" title="Supprimer">
                      <Trash2 size={16} />
                    </button>
                  </div>

                </div>
              ))
            )}
          </div>

        </div>

      </div>

    </div>
  );
}
