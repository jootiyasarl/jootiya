"use client";

/**
 * ─────────────────────────────────────────────────────────────────────────────
 * AdSenseSidebar — Google AdSense unit for the ad-details right sidebar
 * ─────────────────────────────────────────────────────────────────────────────
 *
 * TECHNICAL NOTES
 * ───────────────
 * 1. The adsbygoogle.js script is loaded ONCE in src/app/layout.tsx via
 *    <Script strategy="afterInteractive">. This component ONLY pushes a fill
 *    request — it never loads the script itself.
 *
 * 2. data-ad-format="auto" + data-full-width-responsive="true" let Google
 *    choose the best ad size for the available container width (~300px on
 *    desktop sidebar). This avoids the 300×600 hard-coding that causes
 *    AdSense to refuse filling when the slot is too narrow.
 *
 * 3. DEV placeholder — in development the real <ins> is replaced with a
 *    visible grey box so the layout can be reviewed without AdSense errors.
 *
 * 4. min-h-[250px] on the wrapper prevents Cumulative Layout Shift (CLS)
 *    while AdSense decides which ad to inject.
 * ─────────────────────────────────────────────────────────────────────────────
 */

import { useEffect, useId } from "react";

declare global {
  interface Window {
    adsbygoogle?: Record<string, unknown>[];
  }
}

const AD_CLIENT = "ca-pub-4945284817184050";
const AD_SLOT   = "1125687784"; // Replace with a dedicated sidebar slot if you create one in AdSense dashboard

export function AdSenseSidebar({ className = "" }: { className?: string }) {
  const uid   = useId(); // unique key per component instance — prevents double-push
  const isDev = process.env.NODE_ENV === "development";

  useEffect(() => {
    if (isDev) return;
    try {
      (window.adsbygoogle = window.adsbygoogle || []).push({});
    } catch (err) {
      // AdSense throws when the script hasn't finished loading yet — safe to ignore
      console.warn("[AdSense] push failed:", err);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className={`bg-white border border-gray-200 rounded-md overflow-hidden shadow-sm ${className}`}>
      {/* "Publicité" label — required by AdSense policy */}
      <p className="text-[9px] font-bold uppercase tracking-widest text-gray-400 text-center py-1.5 border-b border-gray-100">
        Publicité
      </p>

      {isDev ? (
        /* ── Dev placeholder — exact same dimensions as the real unit ── */
        <div className="w-full min-h-[250px] flex flex-col items-center justify-center gap-2 bg-gray-50 text-gray-400">
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
            <rect x="3" y="3" width="18" height="18" rx="2" />
            <path d="M3 9h18M9 21V9" />
          </svg>
          <span className="text-xs font-semibold">Google AdSense</span>
          <span className="text-[10px] text-gray-300">ca-pub-4945284817184050</span>
          <span className="text-[10px] text-gray-300">slot: {AD_SLOT}</span>
        </div>
      ) : (
        /*
         * ── Real AdSense unit ──
         *
         * - data-ad-format="auto" → Google picks the best format
         * - data-full-width-responsive="true" → adapts to container width
         * - style={{ display: "block" }} is required by AdSense
         * - min-h-[250px] prevents CLS before the ad fills in
         */
        <div className="w-full min-h-[250px]" key={uid}>
          <ins
            className="adsbygoogle"
            style={{ display: "block" }}
            data-ad-client={AD_CLIENT}
            data-ad-slot={AD_SLOT}
            data-ad-format="auto"
            data-full-width-responsive="true"
          />
        </div>
      )}
    </div>
  );
}

export default AdSenseSidebar;
