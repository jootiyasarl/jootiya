"use client";

/**
 * ─────────────────────────────────────────────────────────────────────────────
 * AdUnit — Generic Google AdSense ad unit
 * ─────────────────────────────────────────────────────────────────────────────
 * The adsbygoogle.js script is loaded ONCE in src/app/layout.tsx.
 * This component only renders the <ins> slot and pushes a fill request.
 * ─────────────────────────────────────────────────────────────────────────────
 */

import { useEffect, useId } from "react";

declare global {
  interface Window {
    adsbygoogle?: Record<string, unknown>[];
  }
}

const DEFAULT_AD_CLIENT = "ca-pub-4945284817184050";
const DEFAULT_AD_SLOT   = "1125687784";

export type AdFormat = "auto" | "rectangle" | "horizontal" | "vertical" | "fluid";

interface AdUnitProps {
  slot?: string;
  format?: AdFormat;
  className?: string;
  minHeight?: number;
  fullWidthResponsive?: boolean;
}

export function AdUnit({
  slot = DEFAULT_AD_SLOT,
  format = "auto",
  className = "",
  minHeight = 100,
  fullWidthResponsive = true,
}: AdUnitProps) {
  const uid = useId();

  useEffect(() => {
    try {
      (window.adsbygoogle = window.adsbygoogle || []).push({});
    } catch (err) {
      console.warn("[AdSense] push failed:", err);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div
      key={uid}
      className={`ad-unit w-full ${className}`}
      style={{ minHeight }}
    >
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
