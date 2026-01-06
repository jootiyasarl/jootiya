"use client";

import { useEffect, useState } from "react";
import { fetchNearbyAds, type NearbyAd } from "@/lib/nearbyAds";
import { AdCard } from "@/components/AdCard";

interface NearbyNowSectionProps {
  radiusKm?: number;
  limit?: number;
}

export function NearbyNowSection({ radiusKm = 5, limit = 6 }: NearbyNowSectionProps) {
  const [ads, setAds] = useState<NearbyAd[]>([]);
  const [loadingLocation, setLoadingLocation] = useState(true);
  const [loadingAds, setLoadingAds] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    if (!("geolocation" in navigator)) {
      setLoadingLocation(false);
      setError("لم نتمكن من الوصول إلى موقعك من هذا المتصفح.");
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        setLoadingLocation(false);
        setLoadingAds(true);
        try {
          const result = await fetchNearbyAds({
            latitude,
            longitude,
            radiusKm,
            limit,
          });
          setAds(result);
          setError(null);
        } catch (err: any) {
          setError(
            err?.message ?? "حدث خطأ أثناء تحميل الإعلانات القريبة. حاول مرة أخرى.",
          );
        } finally {
          setLoadingAds(false);
        }
      },
      (geoError) => {
        console.error("Geolocation error", geoError);
        setLoadingLocation(false);
        setError("لم نتمكن من استخدام موقعك. تحقّق من إعدادات المتصفح.");
      },
      {
        enableHighAccuracy: false,
        timeout: 8000,
        maximumAge: 60000,
      },
    );
  }, [radiusKm, limit]);

  const isLoading = (loadingLocation || loadingAds) && !error && ads.length === 0;

  if (isLoading) {
    return (
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <div className="h-36 animate-pulse rounded-2xl bg-zinc-100" />
        <div className="h-36 animate-pulse rounded-2xl bg-zinc-100" />
        <div className="h-36 animate-pulse rounded-2xl bg-zinc-100" />
      </div>
    );
  }

  if (error && ads.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-zinc-200 bg-white px-4 py-6 text-xs text-zinc-500">
        <p>{error}</p>
        <p className="mt-1">
          يمكنك السماح بالوصول إلى الموقع من إعدادات المتصفح، ثم تحديث الصفحة.
        </p>
      </div>
    );
  }

  if (!ads.length) {
    return (
      <div className="rounded-2xl border border-dashed border-zinc-200 bg-white px-4 py-6 text-xs text-zinc-500">
        لا توجد إعلانات قريبة حاليًا في محيطك. جرّب توسيع نطاق البحث داخل صفحة السوق.
      </div>
    );
  }

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {ads.map((ad) => {
        const locationParts: string[] = [];
        if (ad.neighborhood) locationParts.push(ad.neighborhood);
        if (ad.city) locationParts.push(ad.city);
        const location = locationParts.join(", ") || "قريب منك";

        const distanceValue =
          ad.distanceKm < 1
            ? ad.distanceKm.toFixed(1)
            : Math.round(ad.distanceKm).toString();
        const distanceLabel = `${distanceValue} km`;

        let createdAtLabel: string | undefined;
        if (ad.created_at) {
          const d = new Date(ad.created_at);
          if (!Number.isNaN(d.getTime())) {
            createdAtLabel = d.toLocaleDateString();
          }
        }

        const priceLabel =
          ad.price != null
            ? `${ad.price} ${ad.currency?.trim() || "MAD"}`
            : "—";

        return (
          <AdCard
            key={ad.id}
            ad={{
              id: ad.id,
              title: ad.title,
              price: priceLabel,
              location,
              distance: distanceLabel,
              createdAt: createdAtLabel,
              sellerBadge: "قريب منك",
              isFeatured: false,
            }}
            variant="default"
          />
        );
      })}
    </div>
  );
}
