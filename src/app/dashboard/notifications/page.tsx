import { getServerUser } from "@/lib/supabase-server";
export const dynamic = "force-dynamic";
import { redirect } from "next/navigation";
import NotificationsClient from "@/components/dashboard/notifications/NotificationsClient";

export default async function NotificationsPage() {
  const user = await getServerUser();
  if (!user) {
    redirect("/login?next=/dashboard/notifications");
  }
  return <NotificationsClient />;
}
