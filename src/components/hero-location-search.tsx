"use client";

import * as React from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";

type RadiusKm = "1" | "3" | "5";

type Coordinates = {
  lat: number;
  lng: number;
};

export interface HeroLocationSearchProps {
  initialQuery?: string;
  initialLocation?: string;
  initialRadius?: RadiusKm;
  autoDetectLocationOnMount?: boolean;
  onSearch?: (params: {
    query: string;
    location: string;
    radiusKm: RadiusKm;
    coordinates: Coordinates | null;
  }) => void;
}

export function HeroLocationSearch({
  initialQuery = "",
  initialLocation = "",
  initialRadius = "3",
  autoDetectLocationOnMount = true,
  onSearch,
}: HeroLocationSearchProps) {
  const [query, setQuery] = React.useState(initialQuery);
  const [location, setLocation] = React.useState(initialLocation);
  const [radius, setRadius] = React.useState<RadiusKm>(initialRadius);
  const [coordinates, setCoordinates] = React.useState<Coordinates | null>(
    null,
  );
  const [isLocating, setIsLocating] = React.useState(false);
  const [geoError, setGeoError] = React.useState<string | null>(null);

  const resolveHumanReadableLocation = React.useCallback(
    async (lat: number, lng: number) => {
      try {
        const response = await fetch(
          `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=14&addressdetails=1`,
          {
            headers: {
              "Accept-Language": "en",
            },
          },
        );

        if (!response.ok) {
          setLocation("Near your location");
          return;
        }

        const data = await response.json();
        const address = data.address ?? {};
        const city =
          address.city ||
          address.town ||
          address.village ||
          address.municipality;
        const area = address.suburb || address.neighbourhood;
        const label =
          [area, city].filter(Boolean).join(", ") ||
          city ||
          data.display_name ||
          "Near your location";

        setLocation(label);
      } catch {
        setLocation("Near your location");
      }
    },
    [],
  );

  const detectLocation = React.useCallback(() => {
    setGeoError(null);

    if (typeof window === "undefined" || !("geolocation" in navigator)) {
      setGeoError("Location is not supported in this browser.");
      return;
    }

    setIsLocating(true);

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const lat = position.coords.latitude;
        const lng = position.coords.longitude;

        setCoordinates({ lat, lng });

        await resolveHumanReadableLocation(lat, lng);

        setIsLocating(false);
      },
      (error) => {
        setIsLocating(false);
        if (error.code === error.PERMISSION_DENIED) {
          setGeoError("Location permission was denied.");
        } else if (error.code === error.POSITION_UNAVAILABLE) {
          setGeoError("Unable to determine your location.");
        } else {
          setGeoError("Something went wrong while getting your location.");
        }
      },
      {
        enableHighAccuracy: false,
        timeout: 10000,
        maximumAge: 5 * 60 * 1000,
      },
    );
  }, [resolveHumanReadableLocation]);

  React.useEffect(() => {
    if (!autoDetectLocationOnMount) return;
    if (location) return;
    detectLocation();
  }, [autoDetectLocationOnMount, detectLocation, location]);

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    if (onSearch) {
      onSearch({
        query: query.trim(),
        location: location.trim(),
        radiusKm: radius,
        coordinates,
      });
    }
  };

  return (
    <section className="w-full rounded-3xl bg-gradient-to-b from-zinc-900 to-zinc-950 px-4 py-6 text-zinc-50 shadow-sm sm:px-6 lg:px-8">
      <div className="mx-auto flex max-w-3xl flex-col gap-5">
        <div className="space-y-2">
          <p className="text-xs font-medium uppercase tracking-[0.16em] text-emerald-300/80">
            Local search
          </p>
          <h1 className="text-2xl font-semibold leading-tight tracking-tight sm:text-3xl">
            Discover what&apos;s available right around you.
          </h1>
          <p className="text-sm text-zinc-300">
            Search by what you need, fine-tune the radius, and we&apos;ll keep
            results focused on your neighborhood.
          </p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="flex flex-col gap-3 rounded-2xl bg-zinc-950/60 p-3 ring-1 ring-zinc-800/80 sm:p-4"
        >
          <div className="flex flex-col gap-2">
            <label className="text-xs font-medium text-zinc-300">
              What are you looking for?
            </label>
            <Input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="e.g. city bike, iPhone, sofa..."
              className="h-12 rounded-xl border-zinc-700/70 bg-zinc-900/60 text-base text-zinc-50 placeholder:text-zinc-500 focus-visible:ring-emerald-500"
            />
          </div>

          <div className="flex flex-col gap-3 sm:flex-row">
            <div className="flex-1 space-y-2">
              <label className="text-xs font-medium text-zinc-300">
                Location
              </label>
              <div className="flex gap-2">
                <Input
                  value={location}
                  onChange={(event) => setLocation(event.target.value)}
                  placeholder="Detecting your area..."
                  className="h-12 rounded-xl border-zinc-700/70 bg-zinc-900/60 text-base text-zinc-50 placeholder:text-zinc-500 focus-visible:ring-emerald-500"
                />
                <Button
                  type="button"
                  size="default"
                  variant="secondary"
                  onClick={detectLocation}
                  disabled={isLocating}
                  className="h-12 min-w-[3rem] rounded-xl bg-zinc-800 text-xs font-medium text-zinc-50 hover:bg-zinc-700"
                >
                  {isLocating ? "Locating..." : "Use"}
                </Button>
              </div>
              {geoError && (
                <p className="text-[11px] text-amber-300/90">{geoError}</p>
              )}
            </div>

            <div className="w-full space-y-2 sm:w-40">
              <label className="text-xs font-medium text-zinc-300">
                Radius
              </label>
              <Select
                value={radius}
                onValueChange={(value) => setRadius(value as RadiusKm)}
              >
                <SelectTrigger className="h-12 rounded-xl border-zinc-700/70 bg-zinc-900/60 text-base text-zinc-50 focus-visible:ring-emerald-500">
                  <SelectValue placeholder="Radius" />
                </SelectTrigger>
                <SelectContent className="border-zinc-700 bg-zinc-900 text-zinc-50">
                  <SelectItem value="1">Within 1 km</SelectItem>
                  <SelectItem value="3">Within 3 km</SelectItem>
                  <SelectItem value="5">Within 5 km</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="pt-1">
            <Button
              type="submit"
              size="lg"
              className="h-12 w-full rounded-xl bg-emerald-500 text-base font-semibold text-emerald-950 shadow-lg shadow-emerald-500/30 hover:bg-emerald-400"
            >
              Show near me
            </Button>
          </div>
        </form>
      </div>
    </section>
  );
}
