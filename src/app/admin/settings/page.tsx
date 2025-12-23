import { SettingsManager } from "@/components/settings/SettingsManager";

export default function AdminSettingsPage() {
  return (
    <div className="space-y-6">
      <div className="space-y-1">
        <h1 className="text-lg font-semibold text-zinc-50 md:text-xl">
          Site settings
        </h1>
        <p className="text-xs text-zinc-400 md:text-sm">
          Manage general, SEO, legal, and contact information for your marketplace.
        </p>
      </div>

      <SettingsManager />
    </div>
  );
}
