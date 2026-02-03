import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface RecentActivityProps {
    recentJoiners: any[];
    recentAds: any[];
}

export function RecentActivity({ recentJoiners, recentAds }: RecentActivityProps) {
    return (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
            <div className="col-span-4 rounded-xl border border-zinc-800 bg-zinc-900/50 p-6">
                <h3 className="mb-4 text-lg font-medium text-zinc-100">Recently Posted Ads</h3>
                <div className="space-y-4">
                    {recentAds?.map((ad) => (
                        <div key={ad.id} className="flex items-center justify-between border-b border-zinc-800 pb-4 last:border-0 last:pb-0">
                            <div className="flex items-center gap-4">
                                <div className="h-10 w-10 rounded bg-zinc-800 flex items-center justify-center text-xs text-zinc-500">
                                    IMG
                                </div>
                                <div>
                                    <p className="text-sm font-medium text-zinc-200">{ad.title}</p>
                                    <p className="text-xs text-zinc-500">ID: {ad.id.slice(0, 8)}</p>
                                </div>
                            </div>
                            <span className={`px-2 py-1 rounded-full text-xs font-medium 
                        ${ad.status === 'approved' ? 'bg-emerald-500/10 text-emerald-500' :
                                    ad.status === 'pending' ? 'bg-amber-500/10 text-amber-500' : 'bg-zinc-800 text-zinc-400'}`}>
                                {ad.status}
                            </span>
                        </div>
                    ))}
                </div>
            </div>

            <div className="col-span-3 rounded-xl border border-zinc-800 bg-zinc-900/50 p-6">
                <h3 className="mb-4 text-lg font-medium text-zinc-100">New Users</h3>
                <div className="space-y-4">
                    {recentJoiners?.map((user, i) => (
                        <div key={i} className="flex items-center gap-4">
                            <Avatar className="h-9 w-9 border border-zinc-700">
                                <AvatarImage src={user.avatar_url} />
                                <AvatarFallback className="bg-zinc-800 text-zinc-400">
                                    {user.full_name?.[0] || 'U'}
                                </AvatarFallback>
                            </Avatar>
                            <div className="flex flex-col">
                                <span className="text-sm font-medium text-zinc-200">{user.full_name || 'Anonymous'}</span>
                                <span className="text-xs text-zinc-500">{user.email}</span>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
