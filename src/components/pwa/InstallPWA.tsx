"use client";

import { useEffect, useState } from "react";
import { Download, BellRing } from "lucide-react";
import { toast } from "sonner";

export default function InstallPWA() {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [showBanner, setShowBanner] = useState(false);

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

  const subscribeForNotifications = async () => {
    try {
      if (!("Notification" in window)) return;
      
      const permission = await Notification.requestPermission();
      if (permission === "granted") {
        const registration = await navigator.serviceWorker.ready;
        const subscription = await registration.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: urlBase64ToUint8Array(process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!)
        });

        console.log("PWA: Generated Subscription:", JSON.stringify(subscription));

        const response = await fetch("/api/notifications/save-subscription", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            subscription: subscription,
          }),
        });

        const data = await response.json();
        
        if (response.ok) {
          localStorage.setItem("jootiya_notif_subscribed", "true");
          console.log("Subscription saved!", data);
        } else {
          console.error("PWA: Failed to save subscription to API", data);
        }
      }
    } catch (error) {
      console.error("PWA: Error subscribing for notifications:", error);
    }
  };

  useEffect(() => {
    // التحقق هل التطبيق مثبت أصلاً (Standalone mode)
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches;
    if (isStandalone) {
      // إذا كان التطبيق مثبت ولكن لم يشترك بعد، نطلب منه الإذن بهدوء
      if (localStorage.getItem("jootiya_notif_subscribed") !== "true") {
        subscribeForNotifications();
      }
      return;
    }

    const handler = (e: any) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setShowBanner(true); // يظهر دائماً بمجرد توفر الإمكانية
    };

    window.addEventListener("beforeinstallprompt", handler);

    return () => window.removeEventListener("beforeinstallprompt", handler);
  }, []);

  const handleInstall = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === "accepted") {
      setDeferredPrompt(null);
      setShowBanner(false);
      // طلب تفعيل التنبيهات فور قبول التثبيت
      setTimeout(() => {
        subscribeForNotifications();
      }, 2000);
    }
  };

  if (!showBanner) return null;

  return (
    // التعديل هنا: جعلناه ثابتاً (Sticky) في أسفل الشاشة بكل الصفحات
    <div className="fixed bottom-0 left-0 right-0 z-[100] w-full animate-in slide-in-from-bottom-full duration-500">
      <div className="bg-zinc-950/95 border-t border-orange-600/30 p-4 backdrop-blur-md shadow-[0_-10px_40px_rgba(234,88,12,0.15)]">
        <div className="max-w-xl mx-auto flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-orange-600 rounded-xl flex items-center justify-center shadow-lg shadow-orange-600/40 animate-bounce">
              <span className="text-white font-black text-lg">J</span>
            </div>
            <div>
              <h3 className="text-white font-bold text-sm leading-none">تطبيق جوطية متاح الآن</h3>
              <p className="text-zinc-500 text-[10px] mt-1">ثبته الآن لتصلك الهمزات قبل الجميع</p>
            </div>
          </div>
          
          <button
            onClick={handleInstall}
            className="bg-orange-600 hover:bg-orange-500 text-white px-6 py-2.5 rounded-2xl text-xs font-black transition-all active:scale-95 shadow-lg shadow-orange-600/20 whitespace-nowrap"
          >
            تثبيت التطبيق
          </button>
        </div>
      </div>
    </div>
  );
}
