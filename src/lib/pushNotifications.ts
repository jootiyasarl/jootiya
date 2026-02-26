import { supabase } from "./supabaseClient";

export async function registerServiceWorker() {
    if (typeof window === 'undefined' || !('serviceWorker' in navigator)) return;

    try {
        // Register the Main PWA Service Worker (Handles caching/offline)
        // Using a cache-busting parameter to ensure the latest version is loaded
        const pwaRegistration = await navigator.serviceWorker.register('/sw.js?v=' + Date.now(), {
            scope: '/'
        });
        console.log('PWA SW: Registered Successfully', pwaRegistration);

        return { pwaRegistration };
    } catch (e) {
        console.error('SW: Registration failed', e);
    }
}

export async function subscribeUserToPush() {
    if (typeof window === 'undefined' || !('serviceWorker' in navigator)) return;

    try {
        const registration = await navigator.serviceWorker.ready;
        
        // Use the native push manager instead of Firebase for standard web push
        const subscription = await registration.pushManager.subscribe({
            userVisibleOnly: true,
            applicationServerKey: urlBase64ToUint8Array(process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!)
        });

        console.log('Push: Generated Subscription:', JSON.stringify(subscription));

        // Save to Supabase via our API
        const response = await fetch('/api/notifications/save-subscription', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                subscription: subscription
            }),
        });

        const data = await response.json();
        if (response.ok) {
            console.log('Push: Subscription saved successfully!', data);
            localStorage.setItem("jootiya_notif_subscribed", "true");
            return subscription;
        } else {
            console.error('Push: Failed to save subscription', data);
            throw new Error(data.error || 'Failed to save subscription');
        }
    } catch (e) {
        console.error('Push: Subscription failed', e);
        throw e;
    }
}

// Helper to convert VAPID key
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

export async function checkPushPermission() {
    if (typeof window === 'undefined' || !('Notification' in window)) return 'unsupported';
    return Notification.permission;
}
