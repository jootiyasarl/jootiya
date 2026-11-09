"use client";

/**
 * ─────────────────────────────────────────────────────────────────────────────
 * AdMap — OpenStreetMap via Leaflet (Client-only)
 * ─────────────────────────────────────────────────────────────────────────────
 *
 * ARCHITECTURAL DECISIONS
 * ───────────────────────
 * 1. "use client" only — Leaflet reads `window` and `document` on import.
 *    This component must NEVER be imported directly in a Server Component.
 *    Always load it via `dynamic(() => import(...), { ssr: false })`.
 *
 * 2. Icon fix — Leaflet's default icon URLs break in Next.js (webpack asset
 *    hashing renames the PNG files). We override with direct CDN URLs which
 *    are stable across versions.
 *
 * 3. `scrollWheelZoom={false}` — prevents the map from hijacking page scroll
 *    on mobile/desktop. User can still pan and pinch-zoom inside the map.
 *
 * 4. Tailwind class `z-0` on MapContainer — keeps the Leaflet layer below
 *    the sticky breadcrumb (z-30) and the mobile bottom bar (z-50).
 * ─────────────────────────────────────────────────────────────────────────────
 */

import { useEffect } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

// ── Fix Leaflet's broken default icon in Next.js ──────────────────────────────
const markerIcon = new L.Icon({
  iconUrl:       "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  shadowUrl:     "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
  iconSize:   [25, 41],
  iconAnchor: [12, 41],
  popupAnchor:[1, -34],
  shadowSize: [41, 41],
});

// ── Helper: re-center map when lat/lng props change ───────────────────────────
function MapRecenter({ lat, lng }: { lat: number; lng: number }) {
  const map = useMap();
  useEffect(() => {
    map.setView([lat, lng], map.getZoom(), { animate: true });
  }, [lat, lng, map]);
  return null;
}

// ─────────────────────────────────────────────────────────────────────────────

export interface AdMapProps {
  lat: number;
  lng: number;
  /** Shown in the marker popup */
  title?: string;
  /** City label shown below the map */
  city?: string;
  /** Map height Tailwind class — default h-[180px] */
  heightClass?: string;
}

export default function AdMap({
  lat,
  lng,
  title,
  city,
  heightClass = "h-[180px]",
}: AdMapProps) {
  return (
    <div className={`relative w-full ${heightClass} rounded-xl overflow-hidden border border-gray-200 shadow-sm`}>
      <MapContainer
        center={[lat, lng]}
        zoom={13}
        scrollWheelZoom={false}
        // z-0 prevents the map from rendering above the sticky navbar / modals
        className="h-full w-full z-0"
        // attributionControl stays for OSM license compliance
        attributionControl={true}
      >
        {/* OpenStreetMap tiles — free, no API key required */}
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          maxZoom={19}
        />

        {/* Re-center when coordinates change (e.g. user switches ad) */}
        <MapRecenter lat={lat} lng={lng} />

        {/* Location marker */}
        <Marker position={[lat, lng]} icon={markerIcon}>
          {(title || city) && (
            <Popup>
              <div className="text-[13px] font-semibold text-gray-800 leading-snug">
                {title && <p>{title}</p>}
                {city && <p className="text-gray-500 font-normal mt-0.5">{city}</p>}
              </div>
            </Popup>
          )}
        </Marker>
      </MapContainer>
    </div>
  );
}

