import { ProfileForm } from "@/components/profile/ProfileForm";
import { getServerUser, createSupabaseServerClient } from "@/lib/supabase-server";
import { redirect } from "next/navigation";

export default async function ProfilePage() {
  const user = await getServerUser();
  if (!user) {
    redirect("/login?redirectTo=/dashboard/profile");
  }

  const supabase = createSupabaseServerClient();
  const { data: profile } = await supabase
    .from("profiles")
    .select("full_name, phone, city, push_enabled, avatar_url")
    .eq("id", user.id)
    .maybeSingle();

  const initialData = {
    name: profile?.full_name ?? "",
    phone: profile?.phone ?? "",
    city: profile?.city ?? "",
    email: user.email || "",
    push_enabled: profile?.push_enabled ?? true,
    avatar_url: profile?.avatar_url ?? "",
  };

  return (
    <div className="min-h-screen bg-zinc-50 pb-16 pt-8">
      <div className="mx-auto w-full max-w-3xl px-4">
        <div className="mb-6">
          <h1 className="text-2xl font-semibold tracking-tight text-zinc-900">
            Profile settings
          </h1>
          <p className="mt-1 text-sm text-zinc-500">
            Manage your personal information, update your password, and
            control your seller account.
          </p>
        </div>

        <ProfileForm initialData={initialData} />
      </div>
    </div>
  );
}
