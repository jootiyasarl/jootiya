importScripts('https://www.gstatic.com/firebasejs/9.0.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/9.0.0/firebase-messaging-compat.js');

// 🚨 REPLACE WITH YOUR FIREBASE CONFIG
firebase.initializeApp({
    apiKey: "YOUR_API_KEY",
    authDomain: "jootiya.firebaseapp.com",
    projectId: "jootiya",
    storageBucket: "jootiya.appspot.com",
    messagingSenderId: "YOUR_SENDER_ID",
    appId: "YOUR_APP_ID"
});

const messaging = firebase.messaging();

// IndexedDB Helper for Anti-Spam Quota
const DB_NAME = 'jootiya-push-db';
const STORE_NAME = 'daily_counts';
const MAX_NOTIFICATIONS_PER_DAY = 2;

function checkAndIncrementQuota() {
    return new Promise((resolve) => {
        const request = indexedDB.open(DB_NAME, 1);

        request.onupgradeneeded = (event) => {
            const db = event.target.result;
            if (!db.objectStoreNames.contains(STORE_NAME)) {
                db.createObjectStore(STORE_NAME);
            }
        };

        request.onsuccess = (event) => {
            const db = event.target.result;
            const transaction = db.transaction([STORE_NAME], 'readwrite');
            const store = transaction.objectStore(STORE_NAME);
            const today = new Date().toISOString().split('T')[0];

            const getRequest = store.get(today);

            getRequest.onsuccess = () => {
                const currentCount = getRequest.result || 0;
                if (currentCount >= MAX_NOTIFICATIONS_PER_DAY) {
                    console.log(`🚫 Jootiya Anti-Spam: Daily limit reached for ${today}. Suppressing.`);
                    resolve(false);
                } else {
                    store.put(currentCount + 1, today);
                    console.log(`✅ Jootiya Anti-Spam: Notification allowed (${currentCount + 1}/${MAX_NOTIFICATIONS_PER_DAY})`);
                    resolve(true);
                }
            };

            getRequest.onerror = () => resolve(true); // Fail open
        };

        request.onerror = () => resolve(true); // Fail open
    });
}

// Background Message Handler
messaging.onBackgroundMessage(async function (payload) {
    console.log('[firebase-messaging-sw.js] Received background message ', payload);

    // Anti-Spam Check
    const allowed = await checkAndIncrementQuota();
    if (!allowed) return;

    // Time Window Check (Client-Side Preference)
    // Optional: If it's 3 AM, maybe don't vibrate?
    // For now, Quota is the hard limit.

    const notificationTitle = payload.notification?.title || payload.data?.title || 'Jootiya';
    const notificationOptions = {
        body: payload.notification?.body || payload.data?.body,
        icon: '/icon-192x192.png',
        badge: '/badge-72x72.png',
        data: payload.data, // Contains deep link URL
        actions: [
            { action: 'open', title: 'Voir l\'annonce' }
        ]
    };

    self.registration.showNotification(notificationTitle, notificationOptions);
});

// Deep Linking Logic
self.addEventListener('notificationclick', function (event) {
    event.notification.close();

    // Get URL from data or default to dashboard
    const urlToOpen = event.notification.data?.url || '/';

    event.waitUntil(
        clients.matchAll({ type: 'window', includeUncontrolled: true }).then(function (clientList) {
            for (let i = 0; i < clientList.length; i++) {
                const client = clientList[i];
                if (client.url.includes(urlToOpen) && 'focus' in client) {
                    return client.focus();
                }
            }
            if (clients.openWindow) {
                return clients.openWindow(urlToOpen);
            }
        })
    );
});
