"use client";

import { supabase } from "@/lib/supabaseClient";
import { DEFAULT_SEARCH_RADIUS_KM } from "@/lib/adLocation";

export type AdStatus = "pending" | "active" | "rejected";

export interface CreateFreeAdInput {
  title: string;
  description: string;
  price: number;
  currency: string;
  city: string;
  neighborhood?: string;
  latitude?: number | null;
  longitude?: number | null;
  searchRadiusKm?: number;
  imageUrls?: string[];
  isWholesale?: boolean;
}

export interface PublishAdResult {
  adId: string;
  status: AdStatus;
}

/**
 * Creates a new free ad with status "pending" so that an admin can review
 * and approve it later. Meant to be called from the publish flow on the
 * client, using the authenticated Supabase session.
 */
export async function publishFreeAd(
  input: CreateFreeAdInput,
): Promise<PublishAdResult> {
  const {
    title,
    description,
    price,
    currency,
    city,
    neighborhood,
    latitude = null,
    longitude = null,
    searchRadiusKm,
    imageUrls = [],
    isWholesale = false,
  } = input;

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError) {
    throw userError;
  }

  if (!user) {
    throw new Error("You must be signed in to publish an ad.");
  }

  const status: AdStatus = "pending";

  const { data, error } = await supabase
    .from("ads")
    .insert({
      seller_id: user.id,
      title,
      description,
      price,
      currency,
      city,
      neighborhood: neighborhood ?? null,
      latitude,
      longitude,
      search_radius_km: searchRadiusKm ?? DEFAULT_SEARCH_RADIUS_KM,
      image_urls: imageUrls,
      is_wholesale: isWholesale,
      status,
    })
    .select("id, status")
    .single();

  if (error) {
    throw error;
  }

  return {
    adId: data.id as string,
    status: data.status as AdStatus,
  };
}

export interface AdStatusMeta {
  label: string;
  description: string;
  tone: "info" | "success" | "danger";
}

/**
 * Returns a human-friendly label and description for an ad status,
 * to show clearly to the seller in dashboards and success screens.
 */
export function getAdStatusMeta(status: AdStatus): AdStatusMeta {
  if (status === "active") {
    return {
      label: "Live",
      description:
        "Your ad is live and visible in search results. You can edit, pause, or promote it from your dashboard.",
      tone: "success",
    };
  }

  if (status === "rejected") {
    return {
      label: "Not approved",
      description:
        "This ad didn’t pass our review. Check your email or notifications for more details, then try again.",
      tone: "danger",
    };
  }

  // default: pending
  return {
    label: "Pending review",
    description:
      "We’re quickly checking your ad for safety and quality. This usually takes just a few minutes.",
    tone: "info",
  };
}
