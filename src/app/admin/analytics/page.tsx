import { AnalyticsDashboard } from "@/components/analytics/AnalyticsDashboard";

export default function AdminAnalyticsPage() {
  return (
    <div className="space-y-6">
      <div className="space-y-1">
        <h1 className="text-lg font-semibold text-zinc-50 md:text-xl">
          Analytics
        </h1>
        <p className="text-xs text-zinc-400 md:text-sm">
          High-level marketplace metrics across ads, users, and revenue.
        </p>
      </div>

      <AnalyticsDashboard />
    </div>
  );
}
