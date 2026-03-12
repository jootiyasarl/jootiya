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

    const storedLocationStr = localStorage.getItem("user_location");
    const storedLocation = storedLocationStr ? JSON.parse(storedLocationStr) : null;

    if (storedLocation && storedLocation.lat && storedLocation.lon) {
      const { lat, lon } = storedLocation;
      setLoadingLocation(false);
      setLoadingAds(true);
      fetchNearbyAds({
        latitude: lat,
        longitude: lon,
        radiusKm,
        limit,
      })
        .then((result) => {
          setAds(result);
          setError(null);
        })
        .catch((err) => {
          setError(err?.message ?? "Une erreur s'est produite.");
        })
        .finally(() => {
          setLoadingAds(false);
        });
      return;
    }

    if (!("geolocation" in navigator)) {
      setLoadingLocation(false);
      setError("Nous n'avons pas pu accéder à votre position depuis ce navigateur.");
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
            err?.message ??
              "Une erreur s'est produite lors du chargement des annonces à proximité. Veuillez réessayer.",
          );
        } finally {
          setLoadingAds(false);
        }
      },
      (geoError) => {
        console.error("Geolocation error", geoError);
        setLoadingLocation(false);
        setError("Nous n'avons pas pu utiliser votre position. Vérifiez les paramètres de votre navigateur.");
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
          Vous pouvez autoriser l'accès à la localisation dans les paramètres du navigateur, puis actualiser la page.
        </p>
      </div>
    );
  }

  if (!ads.length) {
    return (
      <div className="rounded-2xl border border-dashed border-zinc-200 bg-white px-4 py-6 text-xs text-zinc-500">
        Il n'y a actuellement aucune annonce à proximité de vous. Essayez d'élargir le rayon de recherche dans la page du marché.
      </div>
    );
  }

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {ads.map((ad) => {
        const location = ad.location || "Près de chez vous";

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
              sellerBadge: "Près de chez vous",
              isFeatured: false,
            }}
            variant="default"
            href={`/ads/${ad.id}`}
          />
        );
      })}
    </div>
  );
}
