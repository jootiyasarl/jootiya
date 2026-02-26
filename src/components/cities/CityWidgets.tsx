"use client";

import { useEffect, useState } from "react";
import { Clock, Cloud } from "lucide-react";

interface CityData {
  prayer: {
    Fajr: string;
    Dhuhr: string;
    Asr: string;
    Maghrib: string;
    Isha: string;
  } | null;
  weather: {
    temperature: number;
    weathercode: number;
  } | null;
}

export function CityWidgets({ cityName }: { cityName: string }) {
  const [data, setData] = useState<CityData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        const res = await fetch(`/api/city-data?city=${encodeURIComponent(cityName)}`);
        const json = await res.json();
        setData(json);
      } catch (error) {
        console.error("Failed to fetch city widgets data", error);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [cityName]);

  if (loading) {
    return (
      <div className="flex items-center gap-4 animate-pulse">
        <div className="h-3 w-20 bg-zinc-200 dark:bg-zinc-800 rounded" />
        <div className="h-3 w-20 bg-zinc-200 dark:bg-zinc-800 rounded" />
      </div>
    );
  }

  // Get next prayer or current one
  const getNextPrayer = () => {
    if (!data?.prayer) return "--:--";
    const now = new Date();
    const currentTime = now.getHours() * 60 + now.getMinutes();
    
    const timings = [
      { name: "Fajr", time: data.prayer.Fajr },
      { name: "Dhuhr", time: data.prayer.Dhuhr },
      { name: "Asr", time: data.prayer.Asr },
      { name: "Maghrib", time: data.prayer.Maghrib },
      { name: "Isha", time: data.prayer.Isha },
    ];

    for (const p of timings) {
      const [h, m] = p.time.split(":").map(Number);
      if (h * 60 + m > currentTime) return p.time;
    }
    return data.prayer.Fajr; // Next day
  };

  return (
    <div className="flex items-center gap-4">
      <div className="flex items-center gap-1.5" title="Prochaine prière">
        <Clock className="w-3 h-3 text-orange-500" />
        <span>Prière: {getNextPrayer()}</span>
      </div>
      <div className="flex items-center gap-1.5" title="Météo actuelle">
        <Cloud className="w-3 h-3 text-blue-500" />
        <span>Météo: {data?.weather?.temperature ?? "--"}°C</span>
      </div>
    </div>
  );
}
