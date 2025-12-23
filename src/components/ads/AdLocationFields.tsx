"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import {
  DEFAULT_SEARCH_RADIUS_KM,
  type AdLocation,
  getBrowserGeolocation,
} from "@/lib/adLocation";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const SUPPORTED_CITIES = [
  "Casablanca",
  "Rabat",
  "Marrakesh",
  "Tangier",
  "Fes",
  "Agadir",
  "Other",
];

export interface AdLocationFieldsProps {
  value: AdLocation;
  onChange: (value: AdLocation) => void;
}

export function AdLocationFields({
  value,
  onChange,
}: AdLocationFieldsProps) {
  const [locating, setLocating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function update(partial: Partial<AdLocation>) {
    onChange({
      ...value,
      ...partial,
    });
  }

  async function handleUseMyLocation() {
    try {
      setLocating(true);
      setError(null);

      const geo = await getBrowserGeolocation();

      update({
        latitude: geo.latitude,
        longitude: geo.longitude,
        searchRadiusKm: value.searchRadiusKm || DEFAULT_SEARCH_RADIUS_KM,
      });
    } catch (err: any) {
      setError(err.message ?? "We could not detect your location.");
    } finally {
      setLocating(false);
    }
  }

  return (
    <section className="space-y-4 rounded-2xl border bg-white p-4">
      <div className="flex flex-col gap-1">
        <h2 className="text-sm font-semibold text-zinc-900">
          Location for this ad
        </h2>
        <p className="text-xs text-zinc-500">
          Choose the city and neighborhood where buyers can expect to meet you.
          We use your location only to show distance and nearby results.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-1">
          <Label htmlFor="ad-city">City</Label>
          <Select
            value={value.city}
            onValueChange={(city) => update({ city })}
          >
            <SelectTrigger id="ad-city">
              <SelectValue placeholder="Select a city" />
            </SelectTrigger>
            <SelectContent>
              {SUPPORTED_CITIES.map((city) => (
                <SelectItem key={city} value={city}>
                  {city}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-1">
          <Label htmlFor="ad-neighborhood">Neighborhood (optional)</Label>
          <Input
            id="ad-neighborhood"
            value={value.neighborhood}
            onChange={(event) =>
              update({ neighborhood: event.target.value })
            }
            placeholder="e.g. Maarif, Gauthier"
          />
        </div>
      </div>

      <div className="flex flex-col gap-2 rounded-lg bg-zinc-50 px-3 py-2 text-xs text-zinc-600 md:flex-row md:items-center md:justify-between">
        <div>
          <p className="font-medium text-zinc-800">
            Use your current location (optional)
          </p>
          <p>
            We&apos;ll only use an approximate point near you to improve local
            results. Buyers never see your exact address.
          </p>
        </div>
        <div className="flex items-center gap-2 pt-1 md:pt-0">
          <Button
            type="button"
            size="sm"
            variant="outline"
            onClick={handleUseMyLocation}
            disabled={locating}
          >
            {locating ? "Detecting..." : "Use my location"}
          </Button>
        </div>
      </div>

      <div className="flex flex-col gap-1 text-xs text-zinc-500 md:flex-row md:items-center md:justify-between">
        <div>
          <span className="font-medium text-zinc-700">Search radius</span>{" "}
          <span>
            We default to {value.searchRadiusKm || DEFAULT_SEARCH_RADIUS_KM} km
            around your chosen point so buyers see nearby results.
          </span>
        </div>
        {value.latitude !== null && value.longitude !== null ? (
          <div className="text-[11px] text-zinc-500">
            Saved as lat {value.latitude.toFixed(5)}, lon {" "}
            {value.longitude.toFixed(5)}.
          </div>
        ) : null}
      </div>

      {error ? (
        <div className="rounded-md border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-800">
          {error}
        </div>
      ) : null}
    </section>
  );
}
