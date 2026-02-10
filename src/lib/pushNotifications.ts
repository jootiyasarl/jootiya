import { supabase } from "./supabaseClient";
import { messaging } from "./firebaseClient";
import { getToken } from "firebase/messaging";

export async function registerServiceWorker() {
    if (!('serviceWorker' in navigator)) return;

    try {
        // Register the Main PWA Service Worker (Handles caching/offline)
        const pwaRegistration = await navigator.serviceWorker.register('/sw.js');
        console.log('PWA SW: Registered', pwaRegistration);

        // Register the Firebase Service Worker
        const firebaseRegistration = await navigator.serviceWorker.register('/firebase-messaging-sw.js');
        console.log('FCM SW: Registered', firebaseRegistration);

        return { pwaRegistration, firebaseRegistration };
    } catch (e) {
        console.error('SW: Registration failed', e);
    }
}

export async function subscribeUserToPush() {
    try {
        const msg = await messaging();
        if (!msg) return;

        const permission = await Notification.requestPermission();
        if (permission !== 'granted') return;

        const token = await getToken(msg, {
            vapidKey: process.env.NEXT_PUBLIC_FIREBASE_VAPID_KEY
        });

        if (token) {
            console.log('FCM Token:', token);
            // Save to Supabase
            const { data: { user } } = await supabase.auth.getUser();
            if (user) {
                await supabase.from('push_subscriptions').upsert({
                    user_id: user.id,
                    subscription: { token }, // Store token instead of raw subscription object
                }, { onConflict: 'user_id' });
            }
            return token;
        }
    } catch (e) {
        console.error('Push: Subscription failed', e);
        throw e;
    }
}

export async function checkPushPermission() {
    if (typeof window === 'undefined' || !('Notification' in window)) return 'unsupported';
    return Notification.permission;
}
