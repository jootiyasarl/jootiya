"use server";

import { cookies } from "next/headers";
import { createClient } from "@supabase/supabase-js";
import { getProfileRole } from "@/lib/supabase";

const DEFAULT_SEARCH_RADIUS_KM = 3;

type AdStatus = "pending" | "active" | "rejected";

export interface CreateAdPayload {
  title: string;
  price: number;
  city: string;
  description?: string | null;
  currency?: string | null;
  neighborhood?: string | null;
  latitude?: number | null;
  longitude?: number | null;
  searchRadiusKm?: number | null;
  isWholesale?: boolean;
  categorySlug?: string;
  phone?: string;
  whatsapp?: string;
  wholesalePrice?: number | null;
  minQuantity?: number | null;
}

export interface CreateAdResult {
  adId: string;
  status: AdStatus;
}

export async function createAd(input: CreateAdPayload): Promise<CreateAdResult> {
  const cookieStore = await cookies();
  const accessToken = cookieStore.get("sb-access-token")?.value;

  if (!accessToken) {
    throw new Error("You must be signed in to create an ad.");
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error(
      "Missing NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY environment variables.",
    );
  }

  const supabase = createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
      persistSession: false,
    },
  });

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser(accessToken);

  if (userError) {
    throw userError;
  }

  if (!user) {
    throw new Error("You must be signed in to create an ad.");
  }

  const role = await getProfileRole(user.id);

  if (role !== "seller") {
    throw new Error("Only seller accounts can create ads.");
  }

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
    isWholesale = false,
    categorySlug,
  } = input;

  const status: AdStatus = "pending";

  const normalizedDescription =
    typeof description === "string" && description.trim()
      ? description.trim()
      : null;

  const finalCurrency =
    typeof currency === "string" && currency.trim()
      ? currency.trim()
      : "MAD";

  const numericRadius =
    typeof searchRadiusKm === "number" &&
    Number.isFinite(searchRadiusKm) &&
    searchRadiusKm > 0
      ? searchRadiusKm
      : null;

  const finalRadiusKm = numericRadius ?? DEFAULT_SEARCH_RADIUS_KM;

  const { data, error: insertError } = await supabase
    .from("ads")
    .insert({
      seller_id: user.id,
      title,
      description: normalizedDescription,
      price,
      currency: finalCurrency,
      city,
      neighborhood: neighborhood ?? null,
      latitude,
      longitude,
      search_radius_km: finalRadiusKm,
      image_urls: [],
      is_wholesale: isWholesale,
      category: categorySlug ?? null,
      status,
    })
    .select("id, status")
    .single();

  if (insertError) {
    throw insertError;
  }

  return {
    adId: data.id as string,
    status: data.status as AdStatus,
  };
}
