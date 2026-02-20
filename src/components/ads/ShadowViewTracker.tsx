"use client";

import { useEffect } from "react";
import { shadowTracker } from "@/lib/shadow-tracker";

interface ShadowViewTrackerProps {
  adId: string;
  category: string;
}

export function ShadowViewTracker({ adId, category }: ShadowViewTrackerProps) {
  useEffect(() => {
    const startTime = Date.now();

    // Track initial view
    shadowTracker.trackEvent({
      type: 'view',
      adId,
      category
    });

    // Update duration on unmount
    return () => {
      const duration = Math.round((Date.now() - startTime) / 1000);
      if (duration > 0) {
        shadowTracker.trackEvent({
          type: 'view',
          adId,
          category,
          duration
        });
      }
    };
  }, [adId, category]);

  return null;
}
