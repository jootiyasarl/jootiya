import SellerDashboard from "@/components/dashboard/SellerDashboard";

export default function DashboardPage() {
  return (
    <div className="min-h-screen bg-gray-50/50 p-8 dark:bg-zinc-950">
      <div className="mx-auto max-w-5xl">
        <SellerDashboard />
      </div>
    </div>
  );
}
