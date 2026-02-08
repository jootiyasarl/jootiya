"use client";

import { Bell } from "lucide-react";

export default function NotificationsPage() {
    const notifications = [
        {
            id: 1,
            title: "Bienvenue sur Jootiya !",
            message: "Votre compte a été créé avec succès. Complétez votre profil pour gagner en visibilité.",
            date: "Il y a 2 jours",
            read: true,
        },
        {
            id: 2,
            title: "Conseil de vente",
            message: "Les annonces avec plus de 3 photos se vendent 2x plus vite. Mettez à jour vos annonces !",
            date: "Il y a 1 jour",
            read: false,
        }
    ];

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            <div>
                <h1 className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent dark:from-white dark:to-gray-400">
                    Notifications
                </h1>
                <p className="text-zinc-500 dark:text-gray-400 mt-1">
                    Restez informé de votre activité et des mises à jour importantes
                </p>
            </div>

            <div className="space-y-4">
                {notifications.map((notif) => (
                    <div
                        key={notif.id}
                        className={`p-6 rounded-3xl border transition-all hover:shadow-lg hover:shadow-zinc-200/50 hover:scale-[1.01] duration-300 ${notif.read
                            ? "bg-white border-zinc-100 dark:bg-zinc-900 dark:border-zinc-800"
                            : "bg-white border-orange-200 shadow-md shadow-orange-100/50 dark:bg-orange-900/10 dark:border-orange-800"
                            }`}
                    >
                        <div className="flex gap-5">
                            <div className={`mt-1 w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 shadow-sm ${notif.read ? "bg-zinc-50 text-zinc-400" : "bg-orange-600 text-white shadow-orange-200"
                                }`}>
                                <Bell size={20} />
                            </div>
                            <div className="flex-1">
                                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-1">
                                    <h3 className={`text-lg font-black tracking-tight ${notif.read ? "text-zinc-600" : "text-zinc-900"}`}>
                                        {notif.title}
                                    </h3>
                                    <span className="text-xs font-bold uppercase tracking-wider text-zinc-400 bg-zinc-50 px-2 py-1 rounded-md self-start">{notif.date}</span>
                                </div>
                                <p className="text-sm text-zinc-500 mt-2 font-medium leading-relaxed">{notif.message}</p>
                                {!notif.read && (
                                    <div className="mt-3 inline-flex items-center gap-2 text-xs font-bold text-orange-600 cursor-pointer hover:underline">
                                        Marquer comme lu
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
