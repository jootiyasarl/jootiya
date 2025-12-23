"use client";

import { supabase } from "@/lib/supabaseClient";

export const DEFAULT_SEARCH_RADIUS_KM = 3;

export interface AdLocation {
  city: string;
  neighborhood: string;
  latitude: number | null;
  longitude: number | null;
  searchRadiusKm: number;
}

export async function getBrowserGeolocation(): Promise<{
  latitude: number;
  longitude: number;
  accuracy: number;
}> {
  if (typeof window === "undefined") {
    throw new Error("Geolocation is only available in the browser.");
  }

  if (!("geolocation" in navigator)) {
    throw new Error("Your browser does not support location detection.");
  }

  return new Promise((resolve, reject) => {
    navigator.geolocation.getCurrentPosition(
      (position) => {
        resolve({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          accuracy: position.coords.accuracy,
        });
      },
      (error) => {
        if (error.code === error.PERMISSION_DENIED) {
          reject(
            new Error(
              "We couldn't access your location. You can still choose your city and neighborhood manually.",
            ),
          );
          return;
        }

        reject(
          new Error(
            "We couldn't detect your location. Please try again or enter it manually.",
          ),
        );
      },
      {
        enableHighAccuracy: false,
        timeout: 8000,
        maximumAge: 60_000,
      },
    );
  });
}

export interface SaveAdLocationPayload extends AdLocation {}

/**
 * Example helper to persist location to Supabase along with an existing ad.
 * Adjust the table/column names to match your schema (e.g. "ads").
 */
export async function saveAdLocationToSupabase(
  adId: string,
  location: SaveAdLocationPayload,
): Promise<void> {
  if (!adId) {
    throw new Error("adId is required to save ad location.");
  }

  const { error } = await supabase
    .from("ads")
    .update({
      city: location.city,
      neighborhood: location.neighborhood,
      latitude: location.latitude,
      longitude: location.longitude,
      search_radius_km: location.searchRadiusKm,
    })
    .eq("id", adId);

  if (error) {
    throw error;
  }
}
