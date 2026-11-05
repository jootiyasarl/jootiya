"use client";

import { useEffect } from "react";

export default function AdsenseHeader() {
    useEffect(() => {
        try {
            ((window as any).adsbygoogle = (window as any).adsbygoogle || []).push({});
        } catch (err) {
            console.error("AdSense Error:", err);
        }
    }, []);

    return (
        <div className="w-full my-4 text-center overflow-hidden min-h-[90px]">
            <ins
                className="adsbygoogle"
                style={{ display: "block" }}
                data-ad-client="ca-pub-4945284817184050"
                data-ad-slot="1125687784"
                data-ad-format="auto"
                data-full-width-responsive="true"
            ></ins>
        </div>
    );
}