"use client";

import { useEffect } from "react";
import { registerServiceWorker } from "@/lib/pushNotifications";

export function ServiceWorkerRegistration() {
    useEffect(() => {
        if (typeof window !== "undefined") {
            registerServiceWorker();
        }
    }, []);

    return null;
}
