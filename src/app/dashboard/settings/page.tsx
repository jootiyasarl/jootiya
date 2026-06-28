import { getServerUser } from "@/lib/supabase-server";
export const dynamic = "force-dynamic";
import { redirect } from "next/navigation";
import SettingsForm from "@/components/dashboard/settings/SettingsForm";

export default async function SettingsPage() {
  const user = await getServerUser();
  if (!user) {
    redirect("/login?next=/dashboard/settings");
  }
  return <SettingsForm />;
}
