import { getServerUser } from "@/lib/supabase-server";
import { redirect } from "next/navigation";
import SettingsForm from "@/components/dashboard/settings/SettingsForm";

export default async function SettingsPage() {
  const user = await getServerUser();
  if (!user) {
    redirect("/login?redirectTo=/dashboard/settings");
  }
  return <SettingsForm />;
}
