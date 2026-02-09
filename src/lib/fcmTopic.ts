import { messaging } from "./firebaseClient";
import { getToken } from "firebase/messaging";
import { supabase } from "./supabaseClient";

/**
 * Subscribes the current user device to a specific notification topic.
 * @param topic - The topic name (e.g., 'city_casablanca')
 */
export async function subscribeToTopic(topic: string) {
    try {
        const msg = await messaging();
        if (!msg) return;

        // 1. Get FCM Token
        const token = await getToken(msg, {
            vapidKey: process.env.NEXT_PUBLIC_FIREBASE_VAPID_KEY
        });

        if (!token) {
            console.warn("No FCM token found.");
            return;
        }

        // 2. Call Supabase Edge Function to subscribe token to topic
        // We cannot do this client-side securely
        const { data, error } = await supabase.functions.invoke('manage-fcm-subscription', {
            body: { token, topic, action: 'subscribe' }
        });

        if (error) throw error;

        console.log(`Subscribed to topic: ${topic}`);
        return true;

    } catch (error) {
        console.error("Error subscribing to topic:", error);
        return false;
    }
}
