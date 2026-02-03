"use client";

import { useState, useRef, useEffect } from "react";
import { Bell, Check, ExternalLink, Info, CheckCircle2, AlertTriangle, XCircle, MessageSquare } from "lucide-react";
import { useNotifications, type Notification } from "@/hooks/useNotifications";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { formatDistanceToNow } from "date-fns";
import { ar } from "date-fns/locale";

export function NotificationBell() {
    const [isOpen, setIsOpen] = useState(false);
    const { notifications, unreadCount, loading, markAsRead, markAllAsRead } = useNotifications();
    const dropdownRef = useRef<HTMLDivElement>(null);

    // Close when clicking outside
    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const getTypeIcon = (type: string) => {
        switch (type) {
            case "success": return <CheckCircle2 className="h-4 w-4 text-emerald-500" />;
            case "warning": return <AlertTriangle className="h-4 w-4 text-amber-500" />;
            case "error": return <XCircle className="h-4 w-4 text-rose-500" />;
            case "message": return <MessageSquare className="h-4 w-4 text-blue-500" />;
            case "ad_approval": return <Check className="h-4 w-4 text-indigo-500" />;
            default: return <Info className="h-4 w-4 text-zinc-500" />;
        }
    };

    return (
        <div className="relative" ref={dropdownRef}>
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="relative p-2 rounded-full hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
                aria-label="التنبيهات"
            >
                <Bell className="h-5 w-5 text-zinc-600 dark:text-zinc-400" />
                {unreadCount > 0 && (
                    <span className="absolute top-1 right-1 flex h-4 w-4 items-center justify-center rounded-full bg-rose-500 text-[10px] font-bold text-white ring-2 ring-white dark:ring-zinc-950">
                        {unreadCount > 9 ? "+9" : unreadCount}
                    </span>
                )}
            </button>

            {/* Dropdown Menu */}
            {isOpen && (
                <div className="absolute left-0 mt-2 w-80 sm:w-96 origin-top-left rounded-2xl border border-zinc-200 bg-white/95 shadow-2xl backdrop-blur-xl dark:border-zinc-800 dark:bg-zinc-900/95 z-50 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                    <div className="p-4 border-b border-zinc-100 dark:border-zinc-800 flex items-center justify-between">
                        <h3 className="font-bold text-zinc-900 dark:text-white">التنبيهات</h3>
                        {unreadCount > 0 && (
                            <button
                                onClick={() => markAllAsRead()}
                                className="text-xs font-medium text-blue-600 hover:text-blue-700 dark:text-blue-400 transition-colors"
                            >
                                تحديد الكل كمقروء
                            </button>
                        )}
                    </div>

                    <div className="max-h-[400px] overflow-y-auto overflow-x-hidden scrollbar-thin scrollbar-thumb-zinc-200 dark:scrollbar-thumb-zinc-700">
                        {loading ? (
                            <div className="p-8 text-center">
                                <div className="inline-block h-6 w-6 animate-spin rounded-full border-2 border-zinc-200 border-t-blue-600" />
                            </div>
                        ) : notifications.length > 0 ? (
                            <div className="divide-y divide-zinc-50 dark:divide-zinc-800/50">
                                {notifications.map((notification) => (
                                    <div
                                        key={notification.id}
                                        className={cn(
                                            "p-4 transition-colors hover:bg-zinc-50 dark:hover:bg-zinc-800/50 cursor-default relative",
                                            !notification.is_read && "bg-blue-50/30 dark:bg-blue-900/10"
                                        )}
                                        onClick={() => !notification.is_read && markAsRead(notification.id)}
                                    >
                                        {!notification.is_read && (
                                            <div className="absolute right-0 top-0 bottom-0 w-1 bg-blue-500" />
                                        )}
                                        <div className="flex gap-3">
                                            <div className="mt-1 flex-shrink-0">
                                                {getTypeIcon(notification.type)}
                                            </div>
                                            <div className="flex-1 space-y-1">
                                                <div className="flex items-center justify-between">
                                                    <p className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
                                                        {notification.title}
                                                    </p>
                                                    <span className="text-[10px] text-zinc-500 whitespace-nowrap mr-2">
                                                        {formatDistanceToNow(new Date(notification.created_at), { addSuffix: true, locale: ar })}
                                                    </span>
                                                </div>
                                                <p className="text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed">
                                                    {notification.message}
                                                </p>
                                                {notification.link && (
                                                    <Link
                                                        href={notification.link}
                                                        className="inline-flex items-center gap-1 mt-2 text-[11px] font-medium text-blue-600 hover:underline"
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            setIsOpen(false);
                                                        }}
                                                    >
                                                        عرض التفاصيل
                                                        <ExternalLink className="h-3 w-3" />
                                                    </Link>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="p-12 text-center">
                                <div className="mx-auto h-12 w-12 rounded-full bg-zinc-50 dark:bg-zinc-800 flex items-center justify-center mb-3">
                                    <Bell className="h-6 w-6 text-zinc-300 dark:text-zinc-600" />
                                </div>
                                <p className="text-sm text-zinc-500">لا توجد تنبيهات حالياً</p>
                            </div>
                        )}
                    </div>

                    <Link
                        href="/dashboard/notifications"
                        className="block p-3 text-center text-xs font-medium text-zinc-500 hover:bg-zinc-50 dark:hover:bg-zinc-800 border-t border-zinc-100 dark:border-zinc-800 transition-colors"
                        onClick={() => setIsOpen(false)}
                    >
                        عرض جميع التنبيهات
                    </Link>
                </div>
            )}
        </div>
    );
}
