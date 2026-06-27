import { ProfileForm } from "@/components/profile/ProfileForm";
import { getServerUser, createSupabaseServerClient } from "@/lib/supabase-server";
import { redirect } from "next/navigation";

/**
 * Seller Profile Page
 *
 * Reuses the existing ProfileForm component. The middleware already guards the
 * `/seller/*` prefix, so this page only loads the user data to pre-fill the form.
 */

export default async function SellerProfilePage() {
  const user = await getServerUser();
  if (!user) {
    redirect("/login");
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
    <div className="max-w-3xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-black text-zinc-900 tracking-tight">
          Profil vendeur
        </h1>
        <p className="text-sm text-zinc-500 font-medium mt-1">
          Mettez à jour vos informations de contact et votre photo de profil.
        </p>
      </div>

      <ProfileForm initialData={initialData} />
    </div>
  );
}
