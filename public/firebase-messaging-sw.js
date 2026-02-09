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

// Background Message Handler
messaging.onBackgroundMessage(function (payload) {
    console.log('[firebase-messaging-sw.js] Received background message ', payload);

    const notificationTitle = payload.notification.title;
    const notificationOptions = {
        body: payload.notification.body,
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
