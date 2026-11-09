"use client";

import { useEffect } from "react";

declare global {
  interface Window {
    adsbygoogle?: Record<string, unknown>[];
  }
}

const DEFAULT_AD_CLIENT = "ca-pub-4945284817184050";
const DEFAULT_AD_SLOT = "1125687784";

export type AdFormat = "auto" | "rectangle" | "horizontal" | "vertical" | "fluid";

interface AdUnitProps {
  /** AdSense ad slot ID. Defaults to the site's main display unit. */
  slot?: string;
  /** AdSense ad format. */
  format?: AdFormat;
  /** Extra classes on the outer wrapper (margins, width…). */
  className?: string;
  /** Minimum height (px) to reduce CLS while the ad loads. */
  minHeight?: number;
  /** data-full-width-responsive — defaults to true. */
  fullWidthResponsive?: boolean;
}

/**
 * Generic Google AdSense ad unit.
 *
 * The adsbygoogle.js script is loaded once in the root layout
 * (src/app/layout.tsx). This component only renders the <ins> slot and
 * pushes a fill request to window.adsbygoogle on mount.
 */
export function AdUnit({
  slot = DEFAULT_AD_SLOT,
  format = "auto",
  className = "",
  minHeight = 250,
  fullWidthResponsive = true,
}: AdUnitProps) {
  useEffect(() => {
    try {
      (window.adsbygoogle = window.adsbygoogle || []).push({});
    } catch (err) {
      console.error("AdSense Error:", err);
    }
  }, []);

  return (
    <div className={`ad-unit w-full my-4 ${className}`} style={{ minHeight }}>
      <ins
        className="adsbygoogle"
        style={{ display: "block" }}
        data-ad-client={DEFAULT_AD_CLIENT}
        data-ad-slot={slot}
        data-ad-format={format}
        data-full-width-responsive={fullWidthResponsive ? "true" : "false"}
      />
    </div>
  );
}

export default AdUnit;
