/*
 * Jootiya.com Professional Service Worker
 * Handles background push notifications, deep linking, and basic offline caching.
 */

const CACHE_NAME = 'jootiya-v2'; // Incremented version
const SYNC_INTERVAL = 6 * 60 * 60 * 1000; // 6 hours
const REENGAGEMENT_THRESHOLD = 3 * 24 * 60 * 60 * 1000; // 3 days

const ASSETS_TO_CACHE = [
    '/',
    '/manifest.json',
    '/icon-192x192.png',
    '/icon-512x512.png'
];

self.addEventListener('install', (event) => {
    self.skipWaiting();
    event.waitUntil(
        caches.open(CACHE_NAME).then((cache) => {
            return cache.addAll(ASSETS_TO_CACHE);
        })
    );
});

self.addEventListener('activate', (event) => {
    event.waitUntil(
        Promise.all([
            self.clients.claim(),
            caches.keys().then((cacheNames) => {
                return Promise.all(
                    cacheNames.filter((name) => name !== CACHE_NAME).map((name) => caches.delete(name))
                );
            })
        ])
    );
});

// Smart Re-engagement & Activity Tracking
self.addEventListener('fetch', (event) => {
    // Record last activity on every meaningful fetch
    if (event.request.mode === 'navigate' || event.request.url.includes('/api/')) {
        const updateLastActivity = async () => {
            const cache = await caches.open('jootiya-meta');
            await cache.put('last-activity', new Response(Date.now().toString()));
        };
        event.waitUntil(updateLastActivity());
    }

    event.respondWith(
        caches.match(event.request).then((response) => {
            return response || fetch(event.request);
        })
    );
});

// Background Sync for Data Updates
self.addEventListener('periodicsync', (event) => {
    if (event.tag === 'jootiya-background-update') {
        event.waitUntil(performBackgroundUpdate());
    }
});

async function performBackgroundUpdate() {
    console.log('[SW] Starting background data update...');
    // In a real scenario, this would fetch fresh data and broadcast to clients to update IndexedDB
}

// Re-engagement Notification Check
async function checkReengagement() {
    const cache = await caches.open('jootiya-meta');
    const lastActivityRes = await cache.match('last-activity');
    
    if (lastActivityRes) {
        const lastActivity = parseInt(await lastActivityRes.text());
        const now = Date.now();
        
        if (now - lastActivity > REENGAGEMENT_THRESHOLD) {
            self.registration.showNotification('توحشناك في جولتيا! 👋', {
                body: 'كاينين همزات جداد كيتسناو فيك اليوم. دخل شوف شنو ضاع منك!',
                icon: '/icon-192x192.png',
                badge: '/icon-192x192.png',
                data: { url: '/' },
                vibrate: [200, 100, 200]
            });
        }
    }
}

self.addEventListener('sync', (event) => {
    if (event.tag === 'jootiya-reengage') {
        event.waitUntil(checkReengagement());
    }
});

self.addEventListener('push', function (event) {
    console.log('[SW V2] Push Received:', event);

    if (!event.data) {
        console.warn('[SW V2] Push event received but no data found.');
        return;
    }

    try {
        const payload = event.data.text();
        console.log('[SW V2] Push Payload (Raw):', payload);
        
        let data;
        try {
            data = event.data.json();
            console.log('[SW V2] Push Data (Parsed):', data);
        } catch (jsonErr) {
            console.error('[SW V2] Failed to parse push data as JSON:', jsonErr);
            // Fallback for non-JSON payload
            data = { title: 'Jootiya', body: payload };
        }

        const options = {
            body: data.body || 'Vous avez une nouvelle notification de Jootiya',
            icon: '/icon-192x192.png',
            badge: '/icon-192x192.png',
            data: {
                url: data.url || '/'
            },
            vibrate: [100, 50, 100],
            actions: [
                {
                    action: 'open',
                    title: 'Voir l\'annonce'
                }
            ],
            tag: 'jootiya-push-notification',
            renotify: true
        };

        event.waitUntil(
            self.registration.showNotification(data.title || 'Jootiya', options)
                .then(() => console.log('[SW V2] Notification shown successfully'))
                .catch(err => console.error('[SW V2] Failed to show notification:', err))
        );
    } catch (e) {
        console.error('SW V2: Critical error in push event handler', e);
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
