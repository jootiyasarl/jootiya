"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, PlusCircle, BarChart3, BadgeDollarSign, User2 } from "lucide-react";
import { cn } from "@/lib/utils";

const navItems = [
  {
    label: "My Ads",
    href: "/dashboard/ads",
    icon: LayoutDashboard,
  },
  {
    label: "Create Ad",
    href: "/dashboard/create-ad",
    icon: PlusCircle,
  },
  {
    label: "Analytics",
    href: "/dashboard/analytics",
    icon: BarChart3,
  },
  {
    label: "Subscription",
    href: "/dashboard/subscription",
    icon: BadgeDollarSign,
  },
  {
    label: "Profile",
    href: "/dashboard/profile",
    icon: User2,
  },
] as const;

export function DashboardSidebar() {
  const pathname = usePathname();

  return (
    <aside className="border-r bg-white/80 backdrop-blur">
      <div className="flex h-16 items-center border-b px-4 text-sm font-semibold tracking-tight text-zinc-900 lg:h-20 lg:px-6">
        <span className="rounded-md bg-zinc-900 px-2 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-zinc-50">
          Seller
        </span>
        <span className="ml-2 text-xs font-medium text-zinc-500">Dashboard</span>
      </div>

      <nav className="space-y-1 px-2 py-4 text-sm lg:px-3">
        {navItems.map((item) => {
          const isActive =
            pathname === item.href || pathname?.startsWith(`${item.href}/`);

          const Icon = item.icon;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-2 rounded-lg px-2 py-2.5 text-sm font-medium text-zinc-600 transition-colors hover:bg-zinc-100 hover:text-zinc-900 lg:px-3",
                isActive &&
                  "bg-zinc-900 text-zinc-50 hover:bg-zinc-900 hover:text-zinc-50",
              )}
            >
              <Icon className="h-4 w-4" />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
