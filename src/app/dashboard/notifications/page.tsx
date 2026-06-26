import { getServerUser } from "@/lib/supabase-server";
import { redirect } from "next/navigation";
import NotificationsClient from "@/components/dashboard/notifications/NotificationsClient";

export default async function NotificationsPage() {
  const user = await getServerUser();
  if (!user) {
    redirect("/login?redirectTo=/dashboard/notifications");
  }
  return <NotificationsClient />;
}
