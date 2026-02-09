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
          reject(new Error("Accès refusé. Veuillez autoriser la localisation dans les paramètres de votre navigateur."));
          return;
        }
        if (error.code === error.TIMEOUT) {
          reject(new Error("Délai d'attente dépassé. Le signal GPS est faible, veuillez réessayer."));
          return;
        }

        reject(new Error("Erreur de localisation. Vérifiez que votre GPS est activé."));
      },
      {
        enableHighAccuracy: true, // Try high accuracy for better results on mobile
        timeout: 10000, // Increase timeout to 10s
        maximumAge: 0, // Force fresh location
      },
    );
  });
}

export interface SaveAdLocationPayload extends AdLocation { }

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
