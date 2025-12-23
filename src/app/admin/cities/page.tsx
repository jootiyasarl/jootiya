import { CityManager } from "@/components/cities/CityManager";

export default function AdminCitiesPage() {
  return (
    <div className="space-y-6">
      <div className="space-y-1">
        <h1 className="text-lg font-semibold text-zinc-50 md:text-xl">
          Cities
        </h1>
        <p className="text-xs text-zinc-400 md:text-sm">
          Manage cities used across the marketplace and for local SEO pages.
        </p>
      </div>

      <CityManager />
    </div>
  );
}
