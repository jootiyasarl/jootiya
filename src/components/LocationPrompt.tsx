"use client";

import { useState, useEffect } from "react";
import { MapPin, X, Navigation } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export function LocationPrompt() {
  const [isVisible, setIsVisible] = useState(false);
  const [isloading, setIsLoading] = useState(false);

  useEffect(() => {
    // Check if location is already stored in localStorage
    const storedLocation = localStorage.getItem("user_location");
    const dismissed = localStorage.getItem("location_prompt_dismissed");

    if (!storedLocation && !dismissed) {
      // Delay appearance for better UX
      const timer = setTimeout(() => setIsVisible(true), 2000);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleEnableLocation = () => {
    setIsLoading(true);
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          const locationData = {
            lat: latitude,
            lon: longitude,
            timestamp: new Date().getTime(),
          };
          localStorage.setItem("user_location", JSON.stringify(locationData));
          setIsVisible(false);
          setIsLoading(false);
          // Optional: Refresh the page or trigger a re-fetch of nearby ads
          window.location.reload();
        },
        (error) => {
          console.error("Error getting location:", error);
          setIsLoading(false);
          // Handle error (e.g., user denied permission)
        },
        { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
      );
    } else {
      setIsLoading(false);
      alert("الجغرافي غير مدعوم في هذا المتصفح.");
    }
  };

  const handleDismiss = () => {
    localStorage.setItem("location_prompt_dismissed", "true");
    setIsVisible(false);
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 100, opacity: 0 }}
          className="fixed bottom-6 left-1/2 z-50 w-[90%] max-w-md -translate-x-1/2 overflow-hidden rounded-2xl border border-zinc-800 bg-zinc-950 p-5 shadow-2xl shadow-orange-500/10"
        >
          <div className="flex items-start gap-4">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-orange-500/10 text-orange-500">
              <MapPin size={20} />
            </div>
            <div className="flex-1">
              <h3 className="text-sm font-semibold text-white">البحث بالأقرب</h3>
              <p className="mt-1 text-xs text-zinc-400">
                فعل الموقع الجغرافي لتشاهد أفضل العروض المتوفرة في محيطك الآن.
              </p>
            </div>
            <button
              onClick={handleDismiss}
              className="text-zinc-500 hover:text-white transition-colors"
            >
              <X size={18} />
            </button>
          </div>

          <div className="mt-5 flex gap-3">
            <button
              onClick={handleEnableLocation}
              disabled={isloading}
              className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-orange-500 px-4 py-2.5 text-xs font-bold text-white transition-transform active:scale-95 disabled:opacity-50"
            >
              {isloading ? (
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-white/20 border-t-white" />
              ) : (
                <Navigation size={14} />
              )}
              آه، فعل الموقع
            </button>
            <button
              onClick={handleDismiss}
              className="flex-1 rounded-xl border border-zinc-800 bg-zinc-900 px-4 py-2.5 text-xs font-medium text-zinc-300 transition-colors hover:bg-zinc-800"
            >
              ليس الآن
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
