"use client";

import { useEffect } from "react";

/**
 * AdSenseSidebar — dedicated vertical (300x600) Google AdSense unit
 * for the ad-details right column.
 *
 * - Fixed min-height prevents CLS while the ad loads.
 * - "Publicité" label keeps the unit compliant with AdSense policies.
 * - In development the <ins> is swapped for a visible placeholder so the
 *   slot can be reviewed before AdSense approval.
 */

declare global {
  interface Window {
    adsbygoogle?: Record<string, unknown>[];
  }
}

const AD_CLIENT = "ca-pub-4945284817184050";
const AD_SLOT = "1125687784";

export function AdSenseSidebar({ className = "" }: { className?: string }) {
  const isDev = process.env.NODE_ENV === "development";

  useEffect(() => {
    if (isDev) return;
    try {
      (window.adsbygoogle = window.adsbygoogle || []).push({});
    } catch (err) {
      console.error("AdSense Error:", err);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className={`bg-white border border-gray-200 rounded-md p-3 shadow-sm ${className}`}>
      <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 text-center mb-2">
        Publicité
      </p>
      {isDev ? (
        <div className="w-full min-h-[600px] flex items-center justify-center border border-dashed border-gray-300 rounded-md bg-gray-50 text-gray-400 text-xs font-semibold">
          Google AdSense Slot (300×600)
        </div>
      ) : (
        <div style={{ minHeight: 600 }} className="flex justify-center">
          <ins
            className="adsbygoogle"
            style={{ display: "block", width: 300, height: 600 }}
            data-ad-client={AD_CLIENT}
            data-ad-slot={AD_SLOT}
            data-ad-format="vertical"
            data-full-width-responsive="false"
          />
        </div>
      )}
    </div>
  );
}

export default AdSenseSidebar;
