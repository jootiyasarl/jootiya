import { initializeApp, getApps, getApp } from "firebase/app";
import { getMessaging, isSupported } from "firebase/messaging";

// 🚨 REPLACE WITH YOUR FIREBASE CONFIG
const firebaseConfig = {
    apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || "YOUR_API_KEY",
    authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || "jootiya.firebaseapp.com",
    projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || "jootiya",
    storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || "jootiya.appspot.com",
    messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || "YOUR_SENDER_ID",
    appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID || "YOUR_APP_ID"
};

const app = getApps().length ? getApp() : initializeApp(firebaseConfig);

// Safe export for SSR
export const messaging = async () => {
    try {
        const supported = await isSupported();
        if (supported) {
            return getMessaging(app);
        }
        return null;
    } catch (err) {
        console.error("Firebase Messaging not supported", err);
        return null;
    }
};

export default app;
