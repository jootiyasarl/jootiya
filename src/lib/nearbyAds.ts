"use client";

import { supabase } from "@/lib/supabaseClient";

export interface NearbyAdRow {
  id: string;
  seller_id: string;
  category_id: string | null;
  title: string;
  description: string | null;
  price: number | null;
  currency: string | null;
  images: string[] | null;
  location: string | null;
  status: string | null;
  views_count: number | null;
  created_at: string | null;
  dist_meters?: number;
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

  const distanceMeters = radiusKm * 1000;

  const { data, error } = await supabase.rpc("get_nearby_items", {
    lat: latitude,
    lon: longitude,
    distance_meters: distanceMeters,
    limit_count: limit,
  });

  if (error) {
    console.error("Error fetching nearby ads via PostGIS:", error);
    throw error;
  }

  const rows = (data ?? []) as any[];

  return rows.map((row) => ({
    ...row,
    distanceKm: (row.dist_meters ?? 0) / 1000,
    sellerName: row.profiles?.full_name || row.profiles?.username || "Vendeur Jootiya",
    sellerAvatar: row.profiles?.avatar_url,
  }));
}
