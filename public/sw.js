/*
 * Jootiya.com Professional Service Worker
 * Handles background push notifications and deep linking.
 */

self.addEventListener('push', function (event) {
    if (!event.data) return;

    try {
        const data = event.data.json();
        const options = {
            body: data.body || 'لديك إشعار جديد من Jootiya',
            icon: '/icon-192x192.png', // Fallback to site icon
            badge: '/badge-72x72.png',
            data: {
                url: data.url || '/dashboard/messages'
            },
            vibrate: [100, 50, 100],
            actions: [
                {
                    action: 'open',
                    title: 'عرض الرسالة'
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
