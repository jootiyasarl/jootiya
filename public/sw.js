/*
 * Jootiya.com Professional Service Worker
 * Handles background push notifications, deep linking, and basic offline caching.
 */

const CACHE_NAME = 'jootiya-v1';
const ASSETS_TO_CACHE = [
    '/',
    '/manifest.json',
    '/icon-192x192.png',
    '/icon-512x512.png'
];

self.addEventListener('install', (event) => {
    event.waitUntil(
        caches.open(CACHE_NAME).then((cache) => {
            return cache.addAll(ASSETS_TO_CACHE);
        })
    );
});

self.addEventListener('activate', (event) => {
    event.waitUntil(
        caches.keys().then((cacheNames) => {
            return Promise.all(
                cacheNames.filter((name) => name !== CACHE_NAME).map((name) => caches.delete(name))
            );
        })
    );
});

self.addEventListener('fetch', (event) => {
    event.respondWith(
        caches.match(event.request).then((response) => {
            return response || fetch(event.request);
        })
    );
});

self.addEventListener('push', function (event) {
    if (!event.data) return;

    try {
        const data = event.data.json();
        const options = {
            body: data.body || 'Vous avez une nouvelle notification de Jootiya',
            icon: '/icon-192x192.png', // Fallback to site icon
            badge: '/icon-192x192.png',
            data: {
                url: data.url || '/dashboard/messages'
            },
            vibrate: [100, 50, 100],
            actions: [
                {
                    action: 'open',
                    title: 'Voir le message'
                }
            ]
        };

        event.waitUntil(
            self.registration.showNotification(data.title || 'Jootiya', options)
        );
    } catch (e) {
        console.error('SW: Error parsing push data', e);
    }
});

self.addEventListener('notificationclick', function (event) {
    event.notification.close();

    const targetUrl = event.notification.data.url;

    event.waitUntil(
        clients.matchAll({ type: 'window', includeUncontrolled: true }).then(function (clientList) {
            for (let i = 0; i < clientList.length; i++) {
                let client = clientList[i];
                if (client.url.includes(targetUrl) && 'focus' in client) {
                    return client.focus();
                }
            }
            if (clients.openWindow) {
                return clients.openWindow(targetUrl);
            }
        })
    );
});
