"use client";

import { supabase } from "@/lib/supabaseClient";

export interface NearbyAdRow {
  id: string;
  title: string;
  price: number | null;
  currency: string | null;
  city: string | null;
  neighborhood: string | null;
  latitude: number | null;
  longitude: number | null;
  image_urls: string[] | null;
  created_at: string | null;
  status?: string | null;
}

export interface NearbyAd extends NearbyAdRow {
  distanceKm: number;
}

export interface FetchNearbyAdsParams {
  latitude: number;
  longitude: number;
  radiusKm: number;
  limit?: number;
}

const EARTH_RADIUS_KM = 6371;

function toRadians(degrees: number): number {
  return (degrees * Math.PI) / 180;
}

export function haversineDistanceKm(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number,
): number {
  const dLat = toRadians(lat2 - lat1);
  const dLon = toRadians(lon2 - lon1);
  const rLat1 = toRadians(lat1);
  const rLat2 = toRadians(lat2);

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(rLat1) *
      Math.cos(rLat2) *
      Math.sin(dLon / 2) *
        Math.sin(dLon / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return EARTH_RADIUS_KM * c;
}

export async function fetchNearbyAds(
  params: FetchNearbyAdsParams,
): Promise<NearbyAd[]> {
  const { latitude, longitude, radiusKm, limit = 24 } = params;

  if (!Number.isFinite(latitude) || !Number.isFinite(longitude)) {
    throw new Error("A valid latitude and longitude are required.");
  }

  const effectiveRadiusKm = radiusKm > 0 ? radiusKm : 1;

  const latDelta = effectiveRadiusKm / 111.32;
  const lngDelta =
    effectiveRadiusKm /
    (111.32 * Math.max(Math.cos(toRadians(latitude)), 0.01));

  const minLat = latitude - latDelta;
  const maxLat = latitude + latDelta;
  const minLon = longitude - lngDelta;
  const maxLon = longitude + lngDelta;

  const { data, error } = await supabase
    .from("ads")
    .select(
      "id, title, price, currency, city, neighborhood, latitude, longitude, image_urls, created_at, status",
    )
    .eq("status", "active")
    .not("latitude", "is", null)
    .not("longitude", "is", null)
    .gte("latitude", minLat)
    .lte("latitude", maxLat)
    .gte("longitude", minLon)
    .lte("longitude", maxLon)
    .limit(limit);

  if (error) {
    throw error;
  }

  const rows = (data ?? []) as NearbyAdRow[];

  const withDistance = rows
    .map((row) => {
      if (
        row.latitude == null ||
        row.longitude == null ||
        !Number.isFinite(row.latitude) ||
        !Number.isFinite(row.longitude)
      ) {
        return null;
      }

      const distanceKm = haversineDistanceKm(
        latitude,
        longitude,
        row.latitude,
        row.longitude,
      );

      return {
        ...row,
        distanceKm,
      } as NearbyAd;
    })
    .filter((row): row is NearbyAd => row !== null)
    .filter((row) => row.distanceKm <= effectiveRadiusKm);

  withDistance.sort((a, b) => {
    if (a.distanceKm !== b.distanceKm) {
      return a.distanceKm - b.distanceKm;
    }

    const aTime = a.created_at ? new Date(a.created_at).getTime() : 0;
    const bTime = b.created_at ? new Date(b.created_at).getTime() : 0;

    return bTime - aTime;
  });

  return withDistance;
}
