"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  PlusCircle,
  User2,
  Settings,
  BarChart3,
  List
} from "lucide-react";
import { cn } from "@/lib/utils";

const sections = [
  {
    title: "Marketplace",
    items: [
      {
        label: "Overview",
        href: "/dashboard",
        icon: LayoutDashboard,
      },
      {
        label: "My Ads",
        href: "/dashboard/ads", // Or keep logic to filters
        icon: List,
      },
      {
        label: "Post Ad",
        href: "/marketplace/post", // Direct link to main post page
        icon: PlusCircle,
      },
      {
        label: "Analytics",
        href: "/dashboard/analytics",
        icon: BarChart3,
      },
    ]
  },
  {
    title: "Account",
    items: [
      {
        label: "Profile",
        href: "/dashboard/profile",
        icon: User2,
      },
      {
        label: "Settings",
        href: "/dashboard/settings",
        icon: Settings,
      },
    ]
  }
];

export function DashboardSidebar() {
  const pathname = usePathname();

  return (
    <aside className="h-full border-r bg-white/80 backdrop-blur-md flex flex-col dark:bg-zinc-950/50 dark:border-zinc-800">
      <div className="flex h-16 items-center px-6 border-b border-gray-100 dark:border-zinc-800">
        <span className="text-xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
          JOOTIYA Seller
        </span>
      </div>

      <nav className="flex-1 overflow-y-auto py-6 px-4 space-y-8">
        {sections.map((section, idx) => (
          <div key={idx}>
            <h3 className="mb-3 px-2 text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">
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
                      "flex items-center gap-3 rounded-xl px-3 py-2 text-sm font-medium transition-all duration-200",
                      isActive
                        ? "bg-blue-50 text-blue-600 shadow-sm dark:bg-blue-900/20 dark:text-blue-400"
                        : "text-gray-600 hover:bg-gray-50 hover:text-gray-900 dark:text-gray-400 dark:hover:bg-zinc-800/50 dark:hover:text-gray-100"
                    )}
                  >
                    <Icon className={cn("h-4 w-4", isActive ? "text-blue-600 dark:text-blue-400" : "text-gray-400")} />
                    <span>{item.label}</span>
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </nav>

      <div className="p-4 border-t border-gray-100 dark:border-zinc-800">
        <div className="rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 p-4 text-white shadow-lg">
          <h4 className="text-sm font-semibold">Pro Plan</h4>
          <p className="text-xs text-white/80 mt-1 mb-3">Unlock more analytics</p>
          <button className="w-full rounded-lg bg-white/20 py-1.5 text-xs font-medium hover:bg-white/30 transition-colors">
            Upgrade
          </button>
        </div>
      </div>
    </aside>
  );
}
