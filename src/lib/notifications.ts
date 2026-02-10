import { createSupabaseServerClient } from "./supabase-server";

export type NotificationType = 'info' | 'success' | 'warning' | 'error' | 'message' | 'ad_approval' | 'price_drop' | 'follow_up';

export interface CreateNotificationParams {
    userId: string;
    title: string;
    message: string;
    type?: NotificationType;
    link?: string;
}

/**
 * Triggers a notification for a user (Server-side)
 */
export async function triggerNotification({
    userId,
    title,
    message,
    type = 'info',
    link
}: CreateNotificationParams) {
    const supabase = createSupabaseServerClient();

    const { error } = await supabase
        .from('notifications')
        .insert({
            user_id: userId,
            title,
            message,
            type,
            link
        });

    if (error) {
        console.error('Error triggering notification:', error);
        return { success: false, error };
    }

    return { success: true };
}
