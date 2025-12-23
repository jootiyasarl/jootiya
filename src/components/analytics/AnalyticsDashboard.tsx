"use client";

import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { Megaphone, MapPin, Users as UsersIcon, CreditCard } from "lucide-react";

type AdsRow = {
  city: string | null;
  category: string | null;
  status: string | null;
};

type ProfileRow = {
  id: string;
  created_at: string | null;
};

type CityStat = {
  city: string;
  count: number;
};

type CategoryStat = {
  category: string;
  count: number;
};

type UserGrowthPoint = {
  month: string;
  count: number;
};

const PIE_COLORS = [
  "#22c55e",
  "#3b82f6",
  "#f97316",
  "#e11d48",
  "#a855f7",
  "#facc15",
];

export function AnalyticsDashboard() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [cityStats, setCityStats] = useState<CityStat[]>([]);
  const [categoryStats, setCategoryStats] = useState<CategoryStat[]>([]);
  const [userGrowth, setUserGrowth] = useState<UserGrowthPoint[]>([]);

  const [totalActiveAds, setTotalActiveAds] = useState(0);
  const [totalCitiesWithAds, setTotalCitiesWithAds] = useState(0);
  const [totalUsers, setTotalUsers] = useState(0);
  const [totalRevenueMad, setTotalRevenueMad] = useState(0);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setLoading(true);
      setError(null);

      try {
        const [adsResult, usersResult] = await Promise.all([
          supabase
            .from("ads")
            .select("city, category, status")
            .neq("status", "deleted")
            .returns<AdsRow[]>(),
          supabase
            .from("profiles")
            .select("id, created_at")
            .returns<ProfileRow[]>(),
        ]);

        if (adsResult.error) {
          throw adsResult.error;
        }
        if (usersResult.error) {
          throw usersResult.error;
        }

        if (cancelled) {
          return;
        }

        const adsRows = adsResult.data ?? [];
        const userRows = usersResult.data ?? [];

        const activeAds = adsRows.filter((ad) => {
          const status = (ad.status ?? "").toString().toLowerCase();
          return status === "active";
        });

        const cityMap = new Map<string, number>();
        const categoryMap = new Map<string, number>();

        for (const ad of activeAds) {
          const cityKey = (ad.city ?? "Other").trim() || "Other";
          cityMap.set(cityKey, (cityMap.get(cityKey) ?? 0) + 1);

          const categoryKey = (ad.category ?? "Other").trim() || "Other";
          categoryMap.set(categoryKey, (categoryMap.get(categoryKey) ?? 0) + 1);
        }

        const sortedCities: CityStat[] = Array.from(cityMap.entries())
          .sort((a, b) => b[1] - a[1])
          .slice(0, 6)
          .map(([city, count]) => ({ city, count }));

        const sortedCategories: CategoryStat[] = Array.from(
          categoryMap.entries(),
        )
          .sort((a, b) => b[1] - a[1])
          .slice(0, 6)
          .map(([category, count]) => ({ category, count }));

        const growthMap = new Map<string, number>();

        for (const user of userRows) {
          if (!user.created_at) {
            continue;
          }
          const date = new Date(user.created_at);
          if (Number.isNaN(date.getTime())) {
            continue;
          }
          const monthKey = `${date.getFullYear()}-${String(
            date.getMonth() + 1,
          ).padStart(2, "0")}`;
          growthMap.set(monthKey, (growthMap.get(monthKey) ?? 0) + 1);
        }

        const growthPoints: UserGrowthPoint[] = Array.from(
          growthMap.entries(),
        )
          .sort(([a], [b]) => a.localeCompare(b))
          .map(([month, count]) => ({ month, count }));

        const lastTwelve = growthPoints.slice(-12);

        setCityStats(sortedCities);
        setCategoryStats(sortedCategories);
        setUserGrowth(lastTwelve);
        setTotalActiveAds(activeAds.length);
        setTotalCitiesWithAds(cityMap.size);
        setTotalUsers(userRows.length);
        setTotalRevenueMad(0);
      } catch (err: any) {
        if (!cancelled) {
          setError(err.message ?? "Failed to load analytics.");
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    load();

    return () => {
      cancelled = true;
    };
  }, []);

  const maxCityCount = useMemo(
    () => cityStats.reduce((max, item) => (item.count > max ? item.count : max), 0),
    [cityStats],
  );

  const totalCategoryCount = useMemo(
    () =>
      categoryStats.reduce(
        (sum, item) => sum + item.count,
        0,
      ),
    [categoryStats],
  );

  const pieGradient = useMemo(() => {
    if (!categoryStats.length || totalCategoryCount <= 0) {
      return "";
    }

    let currentAngle = 0;
    const segments: string[] = [];

    categoryStats.forEach((item, index) => {
      const value = item.count;
      const angle = (value / totalCategoryCount) * 360;
      const start = currentAngle;
      const end = currentAngle + angle;
      const color = PIE_COLORS[index % PIE_COLORS.length];
      segments.push(`${color} ${start}deg ${end}deg`);
      currentAngle = end;
    });

    return segments.join(", ");
  }, [categoryStats, totalCategoryCount]);

  const maxUserGrowth = useMemo(
    () => userGrowth.reduce((max, item) => (item.count > max ? item.count : max), 0),
    [userGrowth],
  );

  const userGrowthPath = useMemo(() => {
    if (!userGrowth.length || maxUserGrowth <= 0) {
      return "";
    }

    if (userGrowth.length === 1) {
      const y = 35;
      return `M 0 ${y} L 100 ${y}`;
    }

    const height = 40;
    const paddingTop = 5;
    const paddingBottom = 5;
    const usableHeight = height - paddingTop - paddingBottom;
    const stepX = userGrowth.length > 1 ? 100 / (userGrowth.length - 1) : 0;

    let d = "";

    userGrowth.forEach((point, index) => {
      const ratio = point.count / maxUserGrowth;
      const x = index * stepX;
      const y =
        height - paddingBottom - Math.max(usableHeight * ratio, usableHeight * 0.08);
      d += `${index === 0 ? "M" : "L"} ${x.toFixed(2)} ${y.toFixed(2)} `;
    });

    return d.trim();
  }, [userGrowth, maxUserGrowth]);

  const hasAnyData =
    totalActiveAds > 0 ||
    totalUsers > 0 ||
    cityStats.length > 0 ||
    categoryStats.length > 0;

  return (
    <div className="space-y-5">
      {error ? (
        <div className="rounded-md border border-red-500/40 bg-red-950/60 px-3 py-2 text-xs text-red-100 md:text-sm">
          {error}
        </div>
      ) : null}

      {loading && !hasAnyData ? (
        <div className="grid gap-4 md:grid-cols-4">
          <div className="h-24 animate-pulse rounded-2xl bg-zinc-900/60" />
          <div className="h-24 animate-pulse rounded-2xl bg-zinc-900/60" />
          <div className="h-24 animate-pulse rounded-2xl bg-zinc-900/60" />
          <div className="h-24 animate-pulse rounded-2xl bg-zinc-900/60" />
        </div>
      ) : null}

      {hasAnyData ? (
        <>
          <div className="grid gap-4 md:grid-cols-4">
            <div className="rounded-2xl border border-zinc-800 bg-zinc-950/60 p-4">
              <div className="flex items-center justify-between gap-2">
                <div>
                  <p className="text-[11px] font-medium uppercase tracking-[0.16em] text-zinc-500">
                    Active ads
                  </p>
                  <p className="mt-2 text-2xl font-semibold text-zinc-50">
                    {totalActiveAds}
                  </p>
                </div>
                <Megaphone className="h-5 w-5 text-zinc-500" />
              </div>
              <p className="mt-2 text-xs text-zinc-500">
                Ads currently live in the marketplace.
              </p>
            </div>

            <div className="rounded-2xl border border-zinc-800 bg-zinc-950/60 p-4">
              <div className="flex items-center justify-between gap-2">
                <div>
                  <p className="text-[11px] font-medium uppercase tracking-[0.16em] text-zinc-500">
                    Cities with ads
                  </p>
                  <p className="mt-2 text-2xl font-semibold text-zinc-50">
                    {totalCitiesWithAds}
                  </p>
                </div>
                <MapPin className="h-5 w-5 text-zinc-500" />
              </div>
              <p className="mt-2 text-xs text-zinc-500">
                Unique cities with at least one active listing.
              </p>
            </div>

            <div className="rounded-2xl border border-zinc-800 bg-zinc-950/60 p-4">
              <div className="flex items-center justify-between gap-2">
                <div>
                  <p className="text-[11px] font-medium uppercase tracking-[0.16em] text-zinc-500">
                    Total users
                  </p>
                  <p className="mt-2 text-2xl font-semibold text-zinc-50">
                    {totalUsers}
                  </p>
                </div>
                <UsersIcon className="h-5 w-5 text-zinc-500" />
              </div>
              <p className="mt-2 text-xs text-zinc-500">
                Registered profiles in the marketplace.
              </p>
            </div>

            <div className="rounded-2xl border border-zinc-800 bg-zinc-950/60 p-4">
              <div className="flex items-center justify-between gap-2">
                <div>
                  <p className="text-[11px] font-medium uppercase tracking-[0.16em] text-zinc-500">
                    Revenue
                  </p>
                  <p className="mt-2 text-2xl font-semibold text-zinc-50">
                    {totalRevenueMad.toLocaleString()} MAD
                  </p>
                </div>
                <CreditCard className="h-5 w-5 text-zinc-500" />
              </div>
              <p className="mt-2 text-xs text-zinc-500">
                Connect billing data to make this metric live.
              </p>
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-[minmax(0,1.2fr)_minmax(0,1fr)]">
            <div className="rounded-2xl border border-zinc-800 bg-zinc-950/60 p-4">
              <div className="flex items-center justify-between gap-2">
                <div>
                  <h2 className="text-sm font-semibold text-zinc-50">
                    Ads per city
                  </h2>
                  <p className="text-xs text-zinc-400">
                    Distribution of active listings across cities.
                  </p>
                </div>
              </div>

              {cityStats.length === 0 || maxCityCount === 0 ? (
                <div className="mt-6 flex h-32 items-center justify-center rounded-xl bg-zinc-950 text-xs text-zinc-500">
                  Not enough data yet.
                </div>
              ) : (
                <div className="mt-4 space-y-3">
                  {cityStats.map((item) => {
                    const ratio = item.count / maxCityCount;
                    const percentage = Math.max(12, ratio * 100);
                    return (
                      <div key={item.city} className="space-y-1">
                        <div className="flex items-center justify-between text-xs">
                          <span className="text-zinc-200">{item.city}</span>
                          <span className="text-zinc-400">{item.count}</span>
                        </div>
                        <div className="h-2 overflow-hidden rounded-full bg-zinc-900">
                          <div
                            className="h-full rounded-full bg-gradient-to-r from-emerald-400 to-sky-500"
                            style={{ width: `${percentage}%` }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            <div className="rounded-2xl border border-zinc-800 bg-zinc-950/60 p-4">
              <div className="flex items-center justify-between gap-2">
                <div>
                  <h2 className="text-sm font-semibold text-zinc-50">
                    Top categories
                  </h2>
                  <p className="text-xs text-zinc-400">
                    Share of active ads by category.
                  </p>
                </div>
              </div>

              {categoryStats.length === 0 || totalCategoryCount === 0 ? (
                <div className="mt-6 flex h-32 items-center justify-center rounded-xl bg-zinc-950 text-xs text-zinc-500">
                  Not enough data yet.
                </div>
              ) : (
                <div className="mt-4 flex flex-col gap-4 md:flex-row md:items-center">
                  <div className="flex justify-center md:w-1/2">
                    <div
                      className="h-32 w-32 rounded-full border border-zinc-800 bg-zinc-900"
                      style={
                        pieGradient
                          ? { backgroundImage: `conic-gradient(${pieGradient})` }
                          : undefined
                      }
                    />
                  </div>
                  <div className="flex-1 space-y-2 text-xs">
                    {categoryStats.map((item, index) => {
                      const ratio = item.count / totalCategoryCount;
                      const percentage = Math.round(ratio * 100);
                      const color = PIE_COLORS[index % PIE_COLORS.length];
                      return (
                        <div
                          key={`${item.category}-${index}`}
                          className="flex items-center justify-between gap-2"
                        >
                          <div className="flex items-center gap-2">
                            <span
                              className="h-2.5 w-2.5 rounded-full"
                              style={{ backgroundColor: color }}
                            />
                            <span className="text-zinc-200">
                              {item.category || "Other"}
                            </span>
                          </div>
                          <span className="text-zinc-400">
                            {item.count}  b7 {percentage}%
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-[minmax(0,2fr)_minmax(0,1fr)]">
            <div className="rounded-2xl border border-zinc-800 bg-zinc-950/60 p-4">
              <div className="flex items-center justify-between gap-2">
                <div>
                  <h2 className="text-sm font-semibold text-zinc-50">
                    User growth
                  </h2>
                  <p className="text-xs text-zinc-400">
                    New profiles created per month.
                  </p>
                </div>
              </div>

              {userGrowth.length === 0 || maxUserGrowth === 0 ? (
                <div className="mt-6 flex h-32 items-center justify-center rounded-xl bg-zinc-950 text-xs text-zinc-500">
                  Not enough data yet.
                </div>
              ) : (
                <div className="mt-4">
                  <svg
                    viewBox="0 0 100 40"
                    preserveAspectRatio="none"
                    className="h-32 w-full text-emerald-400"
                  >
                    <path
                      d={userGrowthPath}
                      fill="none"
                      stroke="currentColor"
                      strokeWidth={1.6}
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                    {userGrowth.map((point, index) => {
                      const height = 40;
                      const paddingTop = 5;
                      const paddingBottom = 5;
                      const usableHeight = height - paddingTop - paddingBottom;
                      const stepX =
                        userGrowth.length > 1
                          ? 100 / (userGrowth.length - 1)
                          : 0;
                      const ratio = point.count / maxUserGrowth;
                      const x = index * stepX;
                      const y =
                        height -
                        paddingBottom -
                        Math.max(usableHeight * ratio, usableHeight * 0.08);
                      return (
                        <circle
                          key={`${point.month}-${index}`}
                          cx={x}
                          cy={y}
                          r={1.2}
                          fill="currentColor"
                          opacity={0.9}
                        />
                      );
                    })}
                  </svg>
                  <div className="mt-2 flex items-center justify-between text-[11px] text-zinc-500">
                    <span>
                      {userGrowth[0]?.month ?? ""}
                    </span>
                    <span>
                      {userGrowth[userGrowth.length - 1]?.month ?? ""}
                    </span>
                  </div>
                </div>
              )}
            </div>

            <div className="rounded-2xl border border-zinc-800 bg-zinc-950/60 p-4 text-xs text-zinc-400">
              <h2 className="text-sm font-semibold text-zinc-50">
                Revenue overview
              </h2>
              <p className="mt-1">
                Revenue metrics are currently based on a placeholder value.
                Connect your billing or subscription system to track real
                subscription and promotion revenue over time.
              </p>
              <p className="mt-3 text-[11px] text-zinc-500">
                Once connected, this panel can show monthly recurring revenue,
                plan breakdowns, and growth trends.
              </p>
            </div>
          </div>
        </>
      ) : !loading ? (
        <div className="rounded-2xl border border-zinc-800 bg-zinc-950/60 px-4 py-8 text-center text-sm text-zinc-400">
          No analytics data available yet.
        </div>
      ) : null}
    </div>
  );
}
