"use client";

import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowUpRight, BarChart3, Eye, MessageSquare, Sparkles } from "lucide-react";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from "recharts";

type AnalyticsAd = {
  id: string;
  title: string;
  status: string | null;
  views_count?: number | null;
  created_at?: string | null;
};

export default function SellerAnalyticsPage() {
  const [ads, setAds] = useState<AnalyticsAd[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function loadAnalytics() {
      setLoading(true);
      setError(null);

      try {
        const {
          data: { user },
          error: userError,
        } = await supabase.auth.getUser();

        if (userError) {
          throw userError;
        }

        if (!user) {
          if (!cancelled) {
            setError("You must be signed in to view analytics.");
          }
          return;
        }

        const { data, error: adsError } = await supabase
          .from("ads")
          .select("*")
          .eq("seller_id", user.id)
          .neq("status", "deleted")
          .returns<AnalyticsAd[]>();

        if (adsError) {
          throw adsError;
        }

        if (!cancelled) {
          setAds(data ?? []);
        }
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

    loadAnalytics();

    return () => {
      cancelled = true;
    };
  }, []);

  const totalAds = ads.length;
  const totalViews = useMemo(
    () => ads.reduce((sum, ad) => sum + (ad.views_count ?? 0), 0),
    [ads],
  );

  const messagesReceived = 0;

  const bestAd = useMemo(() => {
    if (ads.length === 0) return null;
    return ads.reduce((best, ad) => {
      const currentViews = ad.views_count ?? 0;
      const bestViews = best.views_count ?? 0;
      if (currentViews > bestViews) return ad;
      return best;
    }, ads[0]);
  }, [ads]);

  const statusCounts = useMemo(() => {
    const map = new Map<string, number>();
    for (const ad of ads) {
      const key = (ad.status ?? "unknown").toString();
      map.set(key, (map.get(key) ?? 0) + 1);
    }
    return Array.from(map.entries()).map(([status, count]) => ({ status, count }));
  }, [ads]);

  const viewsOverTime = useMemo(() => {
    const map = new Map<string, number>();

    for (const ad of ads) {
      if (!ad.created_at) continue;
      const date = new Date(ad.created_at);
      if (Number.isNaN(date.getTime())) continue;
      const key = date.toISOString().slice(0, 10);
      const current = map.get(key) ?? 0;
      map.set(key, current + (ad.views_count ?? 0));
    }

    const entries = Array.from(map.entries()).sort(([a], [b]) =>
      a.localeCompare(b),
    );

    return entries.map(([date, views]) => ({ date, views }));
  }, [ads]);

  const hasData = ads.length > 0;

  return (
    <div className="space-y-6 md:space-y-8">
      <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-xl font-semibold text-zinc-900">Seller analytics</h1>
          <p className="mt-1 text-sm text-zinc-500">
            Understand how your ads are performing and where to focus next.
          </p>
        </div>
        <div className="flex items-center gap-2 text-xs text-zinc-500">
          <BarChart3 className="h-4 w-4 text-zinc-400" />
          <span>Private to you – only you can see this data.</span>
        </div>
      </div>

      {loading ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <div className="h-24 animate-pulse rounded-2xl bg-zinc-100" />
          <div className="h-24 animate-pulse rounded-2xl bg-zinc-100" />
          <div className="h-24 animate-pulse rounded-2xl bg-zinc-100" />
        </div>
      ) : error ? (
        <div className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
          {error}
        </div>
      ) : !hasData ? (
        <div className="rounded-2xl border border-dashed border-zinc-200 bg-white px-6 py-10 text-center">
          <p className="text-sm font-medium text-zinc-900">
            No analytics yet.
          </p>
          <p className="mt-2 text-xs text-zinc-500 max-w-sm mx-auto">
            Once you start publishing ads and receiving views and messages, your
            performance metrics will appear here.
          </p>
        </div>
      ) : (
        <>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <div className="rounded-2xl border bg-white p-4 sm:p-5 lg:p-6">
              <div className="flex items-center justify-between gap-2">
                <span className="text-xs font-medium uppercase tracking-[0.16em] text-zinc-500">
                  Total ads
                </span>
                <Badge variant="secondary" className="text-[11px]">
                  Active journey
                </Badge>
              </div>
              <p className="mt-3 text-2xl font-semibold text-zinc-900">
                {totalAds}
              </p>
              <p className="mt-1 text-xs text-zinc-500">
                Across all statuses except deleted.
              </p>
            </div>

            <div className="rounded-2xl border bg-white p-4">
              <div className="flex items-center justify-between gap-2">
                <span className="text-xs font-medium uppercase tracking-[0.16em] text-zinc-500">
                  Total views
                </span>
                <Eye className="h-4 w-4 text-emerald-500" />
              </div>
              <p className="mt-3 text-2xl font-semibold text-zinc-900">
                {totalViews}
              </p>
              <p className="mt-1 text-xs text-zinc-500">
                Sum of views across all your ads.
              </p>
            </div>

            <div className="rounded-2xl border bg-white p-4">
              <div className="flex items-center justify-between gap-2">
                <span className="text-xs font-medium uppercase tracking-[0.16em] text-zinc-500">
                  Messages received
                </span>
                <MessageSquare className="h-4 w-4 text-sky-500" />
              </div>
              <p className="mt-3 text-2xl font-semibold text-zinc-900">
                {messagesReceived}
              </p>
              <p className="mt-1 text-xs text-zinc-500">
                Messaging analytics will appear once conversations are enabled.
              </p>
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-[minmax(0,2fr)_minmax(0,1fr)]">
            <div className="rounded-2xl border bg-white p-4 sm:p-5 lg:p-6">
              <div className="flex items-center justify-between gap-2">
                <div>
                  <h2 className="text-sm font-semibold text-zinc-900">
                    Views over time
                  </h2>
                  <p className="text-xs text-zinc-500">
                    Approximate views by ad publish date.
                  </p>
                </div>
              </div>

              {viewsOverTime.length === 0 ? (
                <div className="mt-6 flex h-28 items-center justify-center rounded-xl bg-zinc-50 text-xs text-zinc-500">
                  Not enough data yet.
                </div>
              ) : (
                <div className="mt-4 h-48">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={viewsOverTime}
                      margin={{ top: 8, right: 8, left: -16, bottom: 0 }}
                    >
                      <defs>
                        <linearGradient
                          id="viewsGradient"
                          x1="0"
                          y1="0"
                          x2="0"
                          y2="1"
                        >
                          <stop
                            offset="0%"
                            stopColor="#10b981"
                            stopOpacity={1}
                          />
                          <stop
                            offset="100%"
                            stopColor="#10b981"
                            stopOpacity={0.3}
                          />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} />
                      <XAxis
                        dataKey="date"
                        tickFormatter={(value: string | number) =>
                          new Date(String(value)).toLocaleDateString(
                            undefined,
                            {
                              month: "short",
                              day: "numeric",
                            },
                          )
                        }
                        tick={{ fontSize: 11, fill: "#6b7280" }}
                        axisLine={false}
                        tickLine={false}
                      />
                      <YAxis
                        tick={{ fontSize: 11, fill: "#6b7280" }}
                        axisLine={false}
                        tickLine={false}
                        allowDecimals={false}
                      />
                      <Tooltip
                        cursor={{ fill: "rgba(16,185,129,0.08)" }}
                        contentStyle={{ fontSize: 12 }}
                        labelFormatter={(value: string | number) =>
                          new Date(String(value)).toLocaleDateString(
                            undefined,
                            {
                              year: "numeric",
                              month: "short",
                              day: "numeric",
                            },
                          )
                        }
                      />
                      <Bar
                        dataKey="views"
                        radius={[4, 4, 0, 0]}
                        fill="url(#viewsGradient)"
                      />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              )}
            </div>

            <div className="rounded-2xl border bg-white p-4">
              <div className="flex items-center justify-between gap-2">
                <div>
                  <h2 className="text-sm font-semibold text-zinc-900">
                    Ad status breakdown
                  </h2>
                  <p className="text-xs text-zinc-500">
                    See how many ads are live, pending, or need attention.
                  </p>
                </div>
              </div>

              <div className="mt-4 space-y-2">
                {statusCounts.map((item) => {
                  const ratio = totalAds > 0 ? item.count / totalAds : 0;
                  const percentage = Math.round(ratio * 100);
                  return (
                    <div key={item.status} className="space-y-1">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-medium text-zinc-800">
                          {item.status}
                        </span>
                        <span className="text-zinc-500">
                          {item.count} · {percentage}%
                        </span>
                      </div>
                      <div className="h-2 overflow-hidden rounded-full bg-zinc-100">
                        <div
                          className="h-full rounded-full bg-zinc-900"
                          style={{ width: `${percentage}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {bestAd ? (
            <div className="rounded-2xl border bg-gradient-to-r from-emerald-50 via-white to-white p-4 sm:p-5">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div className="space-y-1">
                  <div className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2 py-0.5 text-[11px] font-medium text-emerald-800">
                    <Sparkles className="h-3 w-3" />
                    Best performing ad
                  </div>
                  <p className="text-sm font-semibold text-zinc-900">
                    {bestAd.title}
                  </p>
                  <p className="text-xs text-zinc-500">
                    {(bestAd.views_count ?? 0).toLocaleString()} views so far.
                  </p>
                </div>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="mt-1 inline-flex items-center gap-1 text-xs sm:mt-0"
                >
                  See ad details
                  <ArrowUpRight className="h-3 w-3" />
                </Button>
              </div>
            </div>
          ) : null}
        </>
      )}
    </div>
  );
}
