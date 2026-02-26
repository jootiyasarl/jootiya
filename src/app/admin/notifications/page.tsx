"use client";

import { useState, useEffect } from "react";
import { Send, Bell, Link as LinkIcon, AlertCircle, CheckCircle2, Loader2, Users, Download, Smartphone } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/lib/supabaseClient";

interface Subscriber {
  user_id: string;
  created_at: string;
  profiles: {
    full_name: string;
    email: string;
  } | null;
}

interface InstallLog {
  id: string;
  created_at: string;
  platform: string;
  profiles: {
    full_name: string;
  } | null;
}

export default function NotificationsPage() {
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [url, setUrl] = useState("/");
  const [isLoading, setIsLoading] = useState(false);
  const [subscribers, setSubscribers] = useState<Subscriber[]>([]);
  const [installs, setInstalls] = useState<InstallLog[]>([]);
  const [isLoadingStats, setIsLoadingStats] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      // Fetch Subscribers
      const { data: subData } = await supabase
        .from('push_subscriptions')
        .select(`
          user_id,
          created_at,
          profiles:user_id (full_name, email)
        `)
        .order('created_at', { ascending: false })
        .limit(10);

      // Fetch Installs
      const { data: installData } = await supabase
        .from('install_logs')
        .select(`
          id,
          created_at,
          platform,
          profiles:user_id (full_name)
        `)
        .order('created_at', { ascending: false })
        .limit(10);

      if (subData) setSubscribers(subData as any);
      if (installData) setInstalls(installData as any);
    } catch (error) {
      console.error("Error fetching stats:", error);
    } finally {
      setIsLoadingStats(false);
    }
  };

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

      <div className="grid gap-8 md:grid-cols-2">
        {/* Form Section */}
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

        {/* Stats Section */}
        <div className="space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div className="rounded-3xl bg-zinc-900/40 border border-zinc-800/50 p-6">
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2 bg-orange-500/10 rounded-xl">
                  <Users className="w-4 h-4 text-orange-500" />
                </div>
                <span className="text-[10px] font-black uppercase text-zinc-500 tracking-widest">Abonnés Push</span>
              </div>
              <p className="text-3xl font-black text-white">{subscribers.length}</p>
            </div>
            <div className="rounded-3xl bg-zinc-900/40 border border-zinc-800/50 p-6">
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2 bg-emerald-500/10 rounded-xl">
                  <Download className="w-4 h-4 text-emerald-500" />
                </div>
                <span className="text-[10px] font-black uppercase text-zinc-500 tracking-widest">Installations</span>
              </div>
              <p className="text-3xl font-black text-white">{installs.length}</p>
            </div>
          </div>

          <div className="rounded-[2.5rem] border border-zinc-800/50 bg-zinc-950/50 p-8 overflow-hidden h-[400px] flex flex-col">
            <h3 className="text-xs font-black uppercase text-orange-500 tracking-[0.2em] mb-6 flex items-center gap-2">
              <Smartphone className="w-4 h-4" />
              Activités récentes
            </h3>
            
            <div className="space-y-4 overflow-y-auto no-scrollbar flex-1">
              {isLoadingStats ? (
                <div className="flex items-center justify-center h-full">
                  <Loader2 className="w-6 h-6 animate-spin text-zinc-700" />
                </div>
              ) : (
                <>
                  {subscribers.map((sub, i) => (
                    <div key={`sub-${i}`} className="flex items-center justify-between p-4 bg-zinc-900/50 rounded-2xl border border-zinc-800/30">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-orange-500/10 flex items-center justify-center text-orange-500">
                          <Bell className="w-4 h-4" />
                        </div>
                        <div className="min-w-0">
                          <p className="text-xs font-bold text-white truncate">{sub.profiles?.full_name || "Utilisateur Anonyme"}</p>
                          <p className="text-[10px] text-zinc-500">Nouvel abonné Push</p>
                        </div>
                      </div>
                      <span className="text-[9px] text-zinc-600 font-medium">
                        {new Date(sub.created_at).toLocaleDateString()}
                      </span>
                    </div>
                  ))}
                  {installs.map((inst, i) => (
                    <div key={`inst-${i}`} className="flex items-center justify-between p-4 bg-emerald-500/5 rounded-2xl border border-emerald-500/10">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-emerald-500/10 flex items-center justify-center text-emerald-500">
                          <Download className="w-4 h-4" />
                        </div>
                        <div className="min-w-0">
                          <p className="text-xs font-bold text-white truncate">{inst.profiles?.full_name || "Utilisateur Anonyme"}</p>
                          <p className="text-[10px] text-emerald-500/60">Application installée ({inst.platform})</p>
                        </div>
                      </div>
                      <span className="text-[9px] text-zinc-600 font-medium">
                        {new Date(inst.created_at).toLocaleDateString()}
                      </span>
                    </div>
                  ))}
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
