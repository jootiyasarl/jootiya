"use client";

import React, { useEffect } from "react";
import Script from "next/script";

export function HomeHeaderAd() {
  useEffect(() => {
    try {
      const win = typeof window !== "undefined" ? (window as unknown as { adsbygoogle?: unknown[] }) : null;
      if (win) {
        win.adsbygoogle = win.adsbygoogle || [];
        win.adsbygoogle.push({});
      }
    } catch (err) {
      console.error("AdSense push error:", err);
    }
  }, []);

  return (
    <div className="w-full my-3 flex justify-center items-center overflow-hidden min-h-[90px]">
      <Script
        id="adsense-init"
        strategy="afterInteractive"
        src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-4945284817184050"
        crossOrigin="anonymous"
      />
      <ins
        className="adsbygoogle"
        style={{ display: "block", width: "100%" }}
        data-ad-client="ca-pub-4945284817184050"
        data-ad-slot="auto"
        data-ad-format="auto"
        data-full-width-responsive="true"
      />
    </div>
  );
}
