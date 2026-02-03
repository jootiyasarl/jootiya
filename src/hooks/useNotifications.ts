"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";

export interface Notification {
    id: string;
    user_id: string;
    title: string;
    message: string;
    type: string;
    link: string | null;
    is_read: boolean;
    created_at: string;
}

export function useNotifications() {
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        let channel: any;

        async function fetchNotifications() {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) {
                setLoading(false);
                return;
            }

            // 1. Initial Fetch
            const { data, error } = await supabase
                .from("notifications")
                .select("*")
                .eq("user_id", user.id)
                .order("created_at", { ascending: false })
                .limit(20);

            if (error) {
                console.error("Error fetching notifications:", error);
            } else {
                setNotifications(data || []);
                setUnreadCount((data || []).filter(n => !n.is_read).length);
            }
            setLoading(false);

            // 2. Real-time Subscription
            channel = supabase
                .channel(`user-notifications-${user.id}`)
                .on(
                    "postgres_changes",
                    {
                        event: "*",
                        schema: "public",
                        table: "notifications",
                        filter: `user_id=eq.${user.id}`,
                    },
                    (payload) => {
                        if (payload.eventType === "INSERT") {
                            const newNotification = payload.new as Notification;
                            setNotifications(prev => [newNotification, ...prev].slice(0, 20));
                            setUnreadCount(prev => prev + 1);
                        } else if (payload.eventType === "UPDATE") {
                            const updatedNotification = payload.new as Notification;
                            setNotifications(prev => prev.map(n => n.id === updatedNotification.id ? updatedNotification : n));
                            // Recalculate unread count
                            setUnreadCount(prev => {
                                const wasRead = notifications.find(n => n.id === updatedNotification.id)?.is_read;
                                if (!wasRead && updatedNotification.is_read) return Math.max(0, prev - 1);
                                if (wasRead && !updatedNotification.is_read) return prev + 1;
                                return prev;
                            });
                        }
                    }
                )
                .subscribe();
        }

        fetchNotifications();

        return () => {
            if (channel) {
                supabase.removeChannel(channel);
            }
        };
    }, []);

    const markAsRead = async (id: string) => {
        const { error } = await supabase
            .from("notifications")
            .update({ is_read: true })
            .eq("id", id);

        if (error) console.error("Error marking notification as read:", error);
    };

    const markAllAsRead = async () => {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        const { error } = await supabase
            .from("notifications")
            .update({ is_read: true })
            .eq("user_id", user.id)
            .eq("is_read", false);

        if (error) console.error("Error marking all notifications as read:", error);
        else {
            setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
            setUnreadCount(0);
        }
    };

    return { notifications, unreadCount, loading, markAsRead, markAllAsRead };
}
