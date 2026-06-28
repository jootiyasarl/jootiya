import { getServerUser } from "@/lib/supabase-server";
export const dynamic = "force-dynamic";
import { redirect } from "next/navigation";
import { ChangePasswordForm } from "@/components/auth/ChangePasswordForm";

export default async function ChangePasswordPage() {
  const user = await getServerUser();
  if (!user) {
    redirect("/login?next=/change-password");
  }

  return (
    <div className="min-h-screen bg-zinc-50 pb-16 pt-8">
      <div className="mx-auto w-full max-w-md px-4">
        <div className="mb-6">
          <h1 className="text-2xl font-semibold tracking-tight text-zinc-900">
            Changer le mot de passe
          </h1>
          <p className="mt-1 text-sm text-zinc-500">
            Mettez à jour votre mot de passe pour sécuriser votre compte.
          </p>
        </div>

        <ChangePasswordForm />
      </div>
    </div>
  );
}
