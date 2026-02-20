import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";

interface RecentActivityProps {
    recentJoiners: any[];
    recentAds: any[];
}

export function RecentActivity({ recentJoiners, recentAds }: RecentActivityProps) {
    return (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-7">
            <div className="col-span-4 rounded-[2.5rem] border border-zinc-800/50 bg-zinc-900/40 backdrop-blur-xl p-8 shadow-2xl">
                <h3 className="mb-6 text-xl font-black text-white flex items-center gap-3">
                    <span className="h-2 w-2 rounded-full bg-orange-500" />
                    Annonces Récemment Publiées
                </h3>
                <div className="space-y-4">
                    {recentAds?.map((ad) => (
                        <div key={ad.id} className="group flex items-center justify-between bg-zinc-950/30 border border-zinc-800/30 p-4 rounded-2xl hover:bg-zinc-800/40 transition-all duration-300">
                            <div className="flex items-center gap-4">
                                <div className="h-12 w-12 rounded-xl bg-zinc-800/50 border border-zinc-700/50 flex items-center justify-center text-[10px] font-black text-zinc-500 overflow-hidden">
                                    {ad.images?.[0] ? (
                                        <img src={ad.images[0]} alt="" className="h-full w-full object-cover" />
                                    ) : 'NO IMG'}
                                </div>
                                <div>
                                    <p className="text-sm font-bold text-zinc-100 group-hover:text-orange-500 transition-colors">{ad.title}</p>
                                    <p className="text-[10px] font-medium text-zinc-500 uppercase tracking-widest mt-0.5">ID: {ad.id.slice(0, 8)}</p>
                                </div>
                            </div>
                            <span className={cn(
                                "px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-tighter",
                                ad.status === 'approved' ? 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20' :
                                ad.status === 'pending' ? 'bg-amber-500/10 text-amber-500 border border-amber-500/20' : 
                                'bg-zinc-800 text-zinc-400'
                            )}>
                                {ad.status === 'approved' ? 'Approuvé' : ad.status === 'pending' ? 'En attente' : ad.status}
                            </span>
                        </div>
                    ))}
                </div>
            </div>

            <div className="col-span-3 rounded-[2.5rem] border border-zinc-800/50 bg-zinc-900/40 backdrop-blur-xl p-8 shadow-2xl">
                <h3 className="mb-6 text-xl font-black text-white flex items-center gap-3">
                    <span className="h-2 w-2 rounded-full bg-orange-500" />
                    Nouveaux Utilisateurs
                </h3>
                <div className="space-y-4">
                    {recentJoiners?.map((user, i) => (
                        <div key={i} className="flex items-center gap-4 bg-zinc-950/30 border border-zinc-800/30 p-3 rounded-2xl">
                            <Avatar className="h-10 w-10 border-2 border-zinc-800 shadow-xl">
                                <AvatarImage src={user.avatar_url} />
                                <AvatarFallback className="bg-orange-500/10 text-orange-500 font-black">
                                    {user.full_name?.[0] || 'U'}
                                </AvatarFallback>
                            </Avatar>
                            <div className="flex flex-col min-w-0">
                                <span className="text-sm font-bold text-zinc-100 truncate">{user.full_name || 'Anonyme'}</span>
                                <span className="text-[11px] font-medium text-zinc-500 truncate">{user.email}</span>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
