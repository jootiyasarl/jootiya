import { supabase } from "./supabaseClient";

// Public VAPID key (should be in env, but providing a way to generate/inject)
const VAPID_PUBLIC_KEY = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY || "";

export async function registerServiceWorker() {
    if (!('serviceWorker' in navigator)) return;

    try {
        const registration = await navigator.serviceWorker.register('/sw.js');
        console.log('SW: Registered', registration);
        return registration;
    } catch (e) {
        console.error('SW: Registration failed', e);
    }
}

export async function subscribeUserToPush() {
    try {
        const registration = await navigator.serviceWorker.ready;

        // Check if already subscribed
        const existingSubscription = await registration.pushManager.getSubscription();
        if (existingSubscription) return existingSubscription;

        // Subscribe
        const subscription = await registration.pushManager.subscribe({
            userVisibleOnly: true,
            applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC_KEY)
        });

        // Save to Supabase
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
            await supabase.from('push_subscriptions').upsert({
                user_id: user.id,
                subscription: subscription.toJSON()
            }, { onConflict: 'user_id, subscription' });
        }

        return subscription;
    } catch (e) {
        console.error('Push: Subscription failed', e);
        throw e;
    }
}

export async function checkPushPermission() {
    if (!('Notification' in window)) return 'unsupported';
    return Notification.permission;
}

function urlBase64ToUint8Array(base64String: string) {
    const padding = '='.repeat((4 - base64String.length % 4) % 4);
    const base64 = (base64String + padding)
        .replace(/\-/g, '+')
        .replace(/_/g, '/');

    const rawData = window.atob(base64);
    const outputArray = new Uint8Array(rawData.length);

    for (let i = 0; i < rawData.length; ++i) {
        outputArray[i] = rawData.charCodeAt(i);
    }
    return outputArray;
}
