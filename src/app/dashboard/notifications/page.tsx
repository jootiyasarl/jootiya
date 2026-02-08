"use client";

import { Bell, Loader2, Info, CheckCircle2, AlertTriangle, XCircle, MessageSquare, Check } from "lucide-react";
import { useNotifications } from "@/hooks/useNotifications";
import { formatDistanceToNow } from "date-fns";
import { fr } from "date-fns/locale";
import { cn } from "@/lib/utils";

export default function NotificationsPage() {
    const { notifications, loading, markAsRead, markAllAsRead } = useNotifications();

    const getTypeIcon = (type: string) => {
        switch (type) {
            case "success": return <CheckCircle2 className="h-6 w-6 text-emerald-500" />;
            case "warning": return <AlertTriangle className="h-6 w-6 text-amber-500" />;
            case "error": return <XCircle className="h-6 w-6 text-rose-500" />;
            case "message": return <MessageSquare className="h-6 w-6 text-orange-500" />;
            case "ad_approval": return <Check className="h-6 w-6 text-indigo-500" />;
            default: return <Bell className="h-6 w-6 text-zinc-400" />;
        }
    };

    return (
        <div className="space-y-8 animate-in fade-in duration-500 lg:px-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent dark:from-white dark:to-gray-400">
                        Notifications
                    </h1>
                    <p className="text-zinc-500 dark:text-gray-400 mt-1">
                        Restez informé de votre activité et des mises à jour importantes
                    </p>
                </div>
                {notifications.length > 0 && (
                    <button
                        onClick={markAllAsRead}
                        className="text-sm font-bold text-orange-600 hover:text-orange-700 transition-colors uppercase tracking-tight"
                    >
                        Tout marquer comme lu
                    </button>
                )}
            </div>

            <div className="space-y-4">
                {loading ? (
                    <div className="flex flex-col items-center justify-center py-20 text-zinc-400">
                        <Loader2 className="h-10 w-10 animate-spin mb-4 text-orange-500" />
                        <p className="font-bold">Chargement des notifications...</p>
                    </div>
                ) : notifications.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-20 bg-white border border-dashed border-zinc-200 rounded-[2rem] text-center px-6">
                        <div className="w-16 h-16 bg-zinc-50 rounded-full flex items-center justify-center mb-4">
                            <Bell className="w-8 h-8 text-zinc-300" />
                        </div>
                        <h3 className="text-lg font-black text-zinc-900 uppercase tracking-tight">Aucune notification</h3>
                        <p className="text-sm text-zinc-500 font-medium max-w-xs mt-2">
                            Vous n'avez pas encore reçu de notifications. Votre activité apparaîtra ici.
                        </p>
                    </div>
                ) : (
                    notifications.map((notif) => (
                        <div
                            key={notif.id}
                            className={cn(
                                "p-6 rounded-[2rem] border transition-all duration-300 relative group overflow-hidden",
                                notif.is_read
                                    ? "bg-white border-zinc-100 hover:bg-zinc-50/50"
                                    : "bg-orange-50/30 border-orange-100 shadow-md shadow-orange-100/20"
                            )}
                            onClick={() => !notif.is_read && markAsRead(notif.id)}
                        >
                            {!notif.is_read && (
                                <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-orange-600" />
                            )}

                            <div className="flex gap-5">
                                <div className={cn(
                                    "w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 transition-transform group-hover:scale-110",
                                    notif.is_read ? "bg-zinc-100 text-zinc-400" : "bg-white text-orange-600 shadow-sm"
                                )}>
                                    {getTypeIcon(notif.type)}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-start justify-between gap-4 mb-2">
                                        <h3 className={cn(
                                            "text-lg font-black uppercase tracking-tight truncate",
                                            notif.is_read ? "text-zinc-600" : "text-zinc-900"
                                        )}>
                                            {notif.title}
                                        </h3>
                                        <span className="text-[10px] font-black uppercase tracking-widest text-zinc-400 whitespace-nowrap bg-zinc-50 px-2 py-1 rounded-lg">
                                            {formatDistanceToNow(new Date(notif.created_at), { addSuffix: true, locale: fr })}
                                        </span>
                                    </div>
                                    <p className="text-sm text-zinc-500 font-bold leading-relaxed">{notif.message}</p>

                                    {!notif.is_read && (
                                        <button
                                            className="mt-4 text-[11px] font-black uppercase tracking-widest text-orange-600 hover:text-orange-700 block transition-colors"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                markAsRead(notif.id);
                                            }}
                                        >
                                            Marquer comme lu
                                        </button>
                                    )}
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}
