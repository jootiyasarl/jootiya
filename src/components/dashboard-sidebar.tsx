"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  PlusCircle,
  User2,
  Settings,
  BarChart3,
  List,
  ChevronRight,
  TrendingUp,
  CreditCard,
  MessageCircle,
  Bell,
  Home
} from "lucide-react";
import { cn } from "@/lib/utils";

const sections = [
  {
    title: "Marketplace",
    items: [
      {
        label: "Vue d'ensemble",
        href: "/dashboard",
        icon: LayoutDashboard,
      },
      {
        label: "Mes annonces",
        href: "/dashboard/ads",
        icon: List,
      },
      {
        label: "Publier une annonce",
        href: "/marketplace/post",
        icon: PlusCircle,
      },
      {
        label: "Statistiques",
        href: "/dashboard/analytics",
        icon: BarChart3,
      },
      {
        label: "Messages",
        href: "/dashboard/messages",
        icon: MessageCircle,
      },
    ]
  },
  {
    title: "Gestion",
    items: [
      {
        label: "Mon Profil",
        href: "/dashboard/profile",
        icon: User2,
      },
      {
        label: "Abonnement",
        href: "/dashboard/subscription",
        icon: CreditCard,
      },
      {
        label: "Notifications",
        href: "/dashboard/notifications",
        icon: Bell,
      },
      {
        label: "Paramètres",
        href: "/dashboard/settings",
        icon: Settings,
      },
    ]
  }
];

export function DashboardSidebar() {
  const pathname = usePathname();

  return (
    <aside className="h-full border-r bg-white flex flex-col dark:bg-zinc-950 dark:border-zinc-800">
      <div className="flex h-16 md:h-20 items-center px-6 border-b border-zinc-100 dark:border-zinc-800">
        <Link href="/" className="flex items-center gap-2 group">
          <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center text-white shadow-lg shadow-blue-100 group-hover:scale-110 transition-transform">
            <TrendingUp className="w-5 h-5" />
          </div>
          <span className="text-xl font-black tracking-tighter text-zinc-900 dark:text-white uppercase">
            JOOTIYA <span className="text-blue-600">Pro</span>
          </span>
        </Link>
      </div>

      <nav className="flex-1 overflow-y-auto py-8 px-4 space-y-9 no-scrollbar">
        {sections.map((section, idx) => (
          <div key={idx} className="space-y-3">
            <h3 className="px-3 text-[11px] font-black uppercase tracking-[0.2em] text-zinc-400 dark:text-zinc-500">
              {section.title}
            </h3>
            <div className="space-y-1">
              {section.items.map((item) => {
                const isActive = pathname === item.href;
                const Icon = item.icon;

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={cn(
                      "flex items-center justify-between group rounded-xl px-3 py-2.5 text-sm font-bold transition-all duration-200",
                      isActive
                        ? "bg-blue-600 text-white shadow-lg shadow-blue-100 dark:shadow-none"
                        : "text-zinc-600 hover:bg-zinc-50 hover:text-zinc-900 dark:text-zinc-400 dark:hover:bg-zinc-900 dark:hover:text-zinc-100"
                    )}
                  >
                    <div className="flex items-center gap-3">
                      <Icon className={cn("h-5 w-5 shrink-0 transition-colors", isActive ? "text-white" : "text-zinc-400 group-hover:text-zinc-900 dark:group-hover:text-zinc-100")} />
                      <span>{item.label}</span>
                    </div>
                    {isActive && <ChevronRight className="h-4 w-4 text-white/70" />}
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </nav>

      <div className="p-5 border-t border-zinc-100 dark:border-zinc-800">
        <div className="rounded-2xl bg-zinc-900 p-5 text-white shadow-2xl relative overflow-hidden group">
          <div className="absolute -right-4 -top-4 w-24 h-24 bg-blue-600/20 rounded-full blur-2xl group-hover:bg-blue-600/30 transition-colors" />

          <div className="relative z-10">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-6 h-6 rounded-full bg-blue-600 flex items-center justify-center">
                <Star size={12} className="fill-white text-white" />
              </div>
              <h4 className="text-sm font-black uppercase tracking-wider">Passer au Pro</h4>
            </div>
            <p className="text-[11px] text-zinc-400 leading-relaxed mb-4">
              Boostez vos ventes avec des analyses détaillées et une visibilité prioritaire.
            </p>
            <button className="w-full rounded-xl bg-blue-600 py-2.5 text-xs font-black shadow-lg shadow-blue-900/40 hover:bg-blue-700 transition-all active:scale-[0.98]">
              En savoir plus
            </button>
          </div>
        </div>
      </div>
    </aside>
  );
}

// Add Star icon to lucide imports
import { Star } from "lucide-react";
