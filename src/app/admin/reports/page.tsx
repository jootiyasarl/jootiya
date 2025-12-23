import { ReportsDashboard } from "@/components/reports/ReportsDashboard";

export default function AdminReportsPage() {
  return (
    <div className="space-y-6">
      <div className="space-y-1">
        <h1 className="text-lg font-semibold text-zinc-50 md:text-xl">
          Reports moderation
        </h1>
        <p className="text-xs text-zinc-400 md:text-sm">
          Review reported ads and users, take action, and keep an audit trail of
          moderator decisions.
        </p>
      </div>

      <ReportsDashboard />
    </div>
  );
}
