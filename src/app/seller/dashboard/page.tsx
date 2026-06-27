import Link from "next/link";
import { redirect } from "next/navigation";
import { getServerUser, createSupabaseServerClient } from "@/lib/supabase-server";
import { Package, PlusCircle, User, BarChart3, MessageSquare } from "lucide-react";

/**
 * Seller Dashboard
 *
 * This page is reached only after the middleware has confirmed that the user
 * has a valid `session_token` cookie and `user_role === "seller"`.
 * We still load the user server-side so we can display the seller name.
 */

export default async function SellerDashboardPage() {
  const user = await getServerUser();
  if (!user) {
    redirect("/login");
  }

  const supabase = createSupabaseServerClient();
  const { data: profile } = await supabase
    .from("profiles")
    .select("full_name, role")
    .eq("id", user.id)
    .maybeSingle();

  const displayName = profile?.full_name || user.email || "Vendeur";

  const quickLinks = [
    {
      label: "Mes annonces",
      description: "Gérer vos annonces publiées",
      href: "/dashboard/ads",
      icon: Package,
      color: "bg-blue-500",
    },
    {
      label: "Nouvelle annonce",
      description: "Déposer une annonce gratuite",
      href: "/poste-annonce",
      icon: PlusCircle,
      color: "bg-orange-500",
    },
    {
      label: "Mon profil",
      description: "Modifier vos informations",
      href: "/seller/profile",
      icon: User,
      color: "bg-zinc-800",
    },
    {
      label: "Statistiques",
      description: "Suivre vos performances",
      href: "/dashboard/analytics",
      icon: BarChart3,
      color: "bg-green-500",
    },
    {
      label: "Messages",
      description: "Conversations avec les acheteurs",
      href: "/dashboard/messages",
      icon: MessageSquare,
      color: "bg-purple-500",
    },
  ];

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      <div className="space-y-1">
        <h1 className="text-3xl font-black text-zinc-900 tracking-tight">
          Bonjour, {displayName}
        </h1>
        <p className="text-zinc-500 font-medium">
          Bienvenue dans votre espace vendeur. Que voulez-vous faire aujourd&apos;hui ?
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {quickLinks.map((link) => {
          const Icon = link.icon;
          return (
            <Link
              key={link.href}
              href={link.href}
              className="group flex items-start gap-4 rounded-2xl bg-white p-5 border border-zinc-100 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-200"
            >
              <div className={`${link.color} text-white p-3 rounded-xl shadow-lg shadow-zinc-200/50 group-hover:scale-105 transition-transform`}>
                <Icon className="h-6 w-6" />
              </div>
              <div className="space-y-1">
                <h2 className="font-bold text-zinc-900 group-hover:text-orange-500 transition-colors">
                  {link.label}
                </h2>
                <p className="text-sm text-zinc-500 font-medium leading-snug">
                  {link.description}
                </p>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
