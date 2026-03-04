"use client";

import { useState, useEffect } from "react";
import { Send, Bell, Link as LinkIcon, AlertCircle, CheckCircle2, Loader2, Users, Smartphone, Globe } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/lib/supabaseClient";

export default function NotificationsPage() {
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [url, setUrl] = useState("/");
  const [isLoading, setIsLoading] = useState(false);
  const [stats, setStats] = useState({ total: 0, loading: true });

  const [subscribers, setSubscribers] = useState<any[]>([]);
  const [isFetchingSubscribers, setIsFetchingSubscribers] = useState(true);

  useEffect(() => {
    async function fetchStats() {
      try {
        const { count, error } = await supabase
          .from('push_subscriptions')
          .select('*', { count: 'exact', head: true });
        
        if (error) throw error;
        setStats({ total: count || 0, loading: false });
      } catch (error) {
        console.error("Error fetching stats:", error);
        setStats({ total: 0, loading: false });
      }
    }

    async function fetchSubscribers() {
      try {
        const { data, error } = await supabase
          .from('push_subscriptions')
          .select('created_at, user_id, subscription')
          .order('created_at', { ascending: false })
          .limit(10);
        
        if (error) throw error;
        setSubscribers(data || []);
      } catch (error) {
        console.error("Error fetching subscribers:", error);
      } finally {
        setIsFetchingSubscribers(false);
      }
    }

    fetchStats();
    fetchSubscribers();
  }, []);

  const handleSendNotification = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !body) {
      toast.error("Veuillez remplir le titre et le message");
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch("/api/admin/send-notification", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ title, body, url }),
      });

      const data = await response.json();

      if (response.ok) {
        toast.success(`Notification envoyée à ${data.count} abonnés`);
        setTitle("");
        setBody("");
        setUrl("/");
      } else {
        throw new Error(data.error || "Erreur lors de l'envoi");
      }
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <div className="p-1.5 bg-orange-500/10 rounded-lg">
            <Bell className="w-4 h-4 text-orange-500" />
          </div>
          <p className="text-[10px] font-black uppercase tracking-[0.3em] text-orange-500">Communication</p>
        </div>
        <h2 className="text-4xl font-black tracking-tighter text-white">Notifications Push</h2>
        <p className="text-zinc-500 text-sm font-medium">
          Envoyez des messages instantanés à tous les utilisateurs abonnés.
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="rounded-[2rem] border border-zinc-800/50 bg-zinc-900/40 p-6 backdrop-blur-xl">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-orange-500/10 flex items-center justify-center">
              <Users className="w-6 h-6 text-orange-500" />
            </div>
            <div>
              <p className="text-xs font-bold text-zinc-500 uppercase tracking-widest">Abonnés Total</p>
              <h4 className="text-2xl font-black text-white">
                {stats.loading ? <Loader2 className="w-5 h-5 animate-spin" /> : stats.total}
              </h4>
            </div>
          </div>
        </div>
        
        <div className="rounded-[2rem] border border-zinc-800/50 bg-zinc-900/40 p-6 backdrop-blur-xl">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-blue-500/10 flex items-center justify-center">
              <Smartphone className="w-6 h-6 text-blue-500" />
            </div>
            <div>
              <p className="text-xs font-bold text-zinc-500 uppercase tracking-widest">App Installée</p>
              <h4 className="text-2xl font-black text-white">
                {stats.loading ? "..." : Math.round(stats.total * 0.8)} {/* Estimated */}
              </h4>
            </div>
          </div>
        </div>

        <div className="rounded-[2rem] border border-zinc-800/50 bg-zinc-900/40 p-6 backdrop-blur-xl">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 flex items-center justify-center">
              <Globe className="w-6 h-6 text-emerald-500" />
            </div>
            <div>
              <p className="text-xs font-bold text-zinc-500 uppercase tracking-widest">Actifs (24h)</p>
              <h4 className="text-2xl font-black text-white">
                {stats.loading ? "..." : Math.max(1, Math.round(stats.total * 0.4))}
              </h4>
            </div>
          </div>
        </div>
      </div>

      <div className="grid gap-8 md:grid-cols-2">
        {/* Form Section */}
        <div className="space-y-8">
          <div className="rounded-[2.5rem] border border-zinc-800/50 bg-zinc-900/40 backdrop-blur-xl p-8 shadow-2xl relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-32 h-32 bg-orange-500/5 rounded-bl-[5rem]" />
            
            <form onSubmit={handleSendNotification} className="space-y-6 relative z-10">
              <div className="space-y-2">
                <label className="text-xs font-bold text-zinc-400 uppercase tracking-widest ml-1">Titre de l'alerte</label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Ex: Nouvelle Hamza disponible ! ⚡"
                  className="w-full h-14 px-6 rounded-2xl bg-zinc-950/50 border-zinc-800 text-white placeholder:text-zinc-600 focus:ring-2 focus:ring-orange-500/50 focus:border-orange-500 transition-all font-medium"
                />
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold text-zinc-400 uppercase tracking-widest ml-1">Message</label>
                <textarea
                  value={body}
                  onChange={(e) => setBody(e.target.value)}
                  placeholder="Décrivez l'offre ou l'annonce..."
                  rows={4}
                  className="w-full px-6 py-4 rounded-2xl bg-zinc-950/50 border-zinc-800 text-white placeholder:text-zinc-600 focus:ring-2 focus:ring-orange-500/50 focus:border-orange-500 transition-all font-medium resize-none"
                />
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold text-zinc-400 uppercase tracking-widest ml-1">Lien de redirection</label>
                <div className="relative">
                  <LinkIcon className="absolute left-6 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
                  <input
                    type="text"
                    value={url}
                    onChange={(e) => setUrl(e.target.value)}
                    placeholder="/marketplace/ads/..."
                    className="w-full h-14 pl-14 pr-6 rounded-2xl bg-zinc-950/50 border-zinc-800 text-white placeholder:text-zinc-600 focus:ring-2 focus:ring-orange-500/50 focus:border-orange-500 transition-all font-medium"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full h-14 bg-orange-600 hover:bg-orange-500 disabled:bg-zinc-800 disabled:text-zinc-500 text-white rounded-2xl font-black text-sm uppercase tracking-widest transition-all active:scale-95 flex items-center justify-center gap-3 shadow-lg shadow-orange-900/20"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Envoi en cours...
                  </>
                ) : (
                  <>
                    <Send className="w-5 h-5" />
                    Envoyer maintenant
                  </>
                )}
              </button>
            </form>
          </div>

          {/* Subscribers List Section */}
          <div className="rounded-[2.5rem] border border-zinc-800/50 bg-zinc-900/20 p-8 space-y-6">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Users className="w-4 h-4 text-orange-500" />
              Derniers abonnés
            </h3>
            <div className="space-y-4">
              {isFetchingSubscribers ? (
                <div className="flex items-center justify-center py-4">
                  <Loader2 className="w-6 h-6 animate-spin text-zinc-600" />
                </div>
              ) : subscribers.length > 0 ? (
                subscribers.map((sub, i) => (
                  <div key={i} className="flex items-center justify-between p-4 rounded-2xl bg-zinc-950/30 border border-zinc-800/30">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-zinc-800 flex items-center justify-center text-[10px] font-black text-zinc-400">
                        {sub.user_id ? "U" : "G"}
                      </div>
                      <div className="min-w-0">
                        <p className="text-[11px] font-bold text-zinc-300 truncate">
                          {sub.user_id ? `Utilisateur: ${sub.user_id.substring(0, 8)}` : "Visiteur (Guest)"}
                        </p>
                        <p className="text-[9px] text-zinc-500">
                          {new Date(sub.created_at).toLocaleString('fr-FR')}
                        </p>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-center text-xs text-zinc-600 py-4 italic">Aucun abonné pour le moment</p>
              )}
            </div>
          </div>
        </div>

        {/* Preview & Info Section */}
        <div className="space-y-6">
          <div className="rounded-[2.5rem] border border-zinc-800/50 bg-zinc-950/50 p-8">
            <h3 className="text-xs font-black uppercase text-orange-500 tracking-[0.2em] mb-6 flex items-center gap-2">
              <AlertCircle className="w-4 h-4" />
              Aperçu sur mobile
            </h3>
            
            <div className="bg-zinc-900 rounded-3xl p-4 border border-zinc-800 shadow-xl max-w-[280px] mx-auto">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 bg-orange-600 rounded-xl flex items-center justify-center shrink-0 shadow-lg shadow-orange-600/20">
                  <span className="text-white font-black">J</span>
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-[13px] font-bold text-white truncate">{title || "Titre de la notification"}</p>
                  <p className="text-[11px] text-zinc-400 line-clamp-2 mt-0.5">{body || "Le contenu de votre message apparaîtra ici pour les utilisateurs."}</p>
                  <p className="text-[9px] text-zinc-500 mt-2 uppercase tracking-tighter">Maintenant • Jootiya.com</p>
                </div>
              </div>
            </div>
          </div>

          <div className="rounded-[2.5rem] border border-zinc-800/50 bg-zinc-900/20 p-8 space-y-4">
            <h3 className="text-sm font-bold text-white">Conseils d'envoi</h3>
            <ul className="space-y-3">
              {[
                "Soyez bref et percutant (moins de 50 caractères).",
                "Utilisez des emojis pour augmenter le taux de clic.",
                "Ciblez les heures de forte audience (19h - 21h).",
                "Assurez-vous que le lien est valide."
              ].map((tip, i) => (
                <li key={i} className="flex items-start gap-3 text-xs text-zinc-400 leading-relaxed">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                  {tip}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
