"use client";

import type { ReactNode } from "react";
import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Users,
  Megaphone,
  Tag,
  MapPin,
  CreditCard,
  Flag,
  BarChart3,
  Settings,
  Bell,
  Menu,
  PanelLeft,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";

export interface AdminLayoutProps {
  children: ReactNode;
}

type AdminNavItem = {
  label: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
};

const adminNavItems: AdminNavItem[] = [
  {
    label: "Dashboard",
    href: "/admin",
    icon: LayoutDashboard,
  },
  {
    label: "Users",
    href: "/admin/users",
    icon: Users,
  },
  {
    label: "Ads",
    href: "/admin/ads",
    icon: Megaphone,
  },
  {
    label: "Categories",
    href: "/admin/categories",
    icon: Tag,
  },
  {
    label: "Cities",
    href: "/admin/cities",
    icon: MapPin,
  },
  {
    label: "Subscriptions",
    href: "/admin/subscriptions",
    icon: CreditCard,
  },
  {
    label: "Reports",
    href: "/admin/reports",
    icon: Flag,
  },
  {
    label: "Analytics",
    href: "/admin/analytics",
    icon: BarChart3,
  },
  {
    label: "Settings",
    href: "/admin/settings",
    icon: Settings,
  },
];

interface AdminSidebarNavProps {
  collapsed?: boolean;
  onItemClick?: () => void;
}

function AdminSidebarNav({ collapsed, onItemClick }: AdminSidebarNavProps) {
  const pathname = usePathname();

  return (
    <nav className="mt-3 space-y-1">
      {adminNavItems.map((item) => {
        const Icon = item.icon;
        const isActive =
          pathname === item.href || pathname?.startsWith(`${item.href}/`);

        return (
          <Link
            key={item.href}
            href={item.href}
            onClick={onItemClick}
            className={cn(
              "flex items-center gap-2 rounded-lg px-2 py-2.5 text-sm font-medium text-zinc-400 transition-colors hover:bg-zinc-900 hover:text-zinc-50 lg:px-3",
              isActive &&
                "bg-zinc-50 text-zinc-950 hover:bg-zinc-50 hover:text-zinc-950",
              collapsed && "justify-center px-2",
            )}
          >
            <Icon className="h-4 w-4" />
            {!collapsed && <span>{item.label}</span>}
          </Link>
        );
      })}
    </nav>
  );
}

export function AdminLayout({ children }: AdminLayoutProps) {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="flex min-h-screen bg-zinc-950 text-zinc-50">
      {/* Desktop sidebar */}
      <aside
        className={cn(
          "hidden border-r border-zinc-900 bg-zinc-950/95 px-3 py-4 transition-all duration-200 md:flex md:flex-col",
          isCollapsed ? "w-[72px]" : "w-64",
        )}
      >
        <div className="flex items-center justify-between px-1 pb-4">
          <Link href="/admin" className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-zinc-50 text-xs font-bold text-zinc-950">
              JY
            </div>
            {!isCollapsed && (
              <div className="flex flex-col">
                <span className="text-sm font-semibold leading-tight">
                  Jootiya
                </span>
                <span className="text-[11px] text-zinc-400">Admin</span>
              </div>
            )}
          </Link>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="h-8 w-8 text-zinc-400 hover:text-zinc-50"
            onClick={() => setIsCollapsed((prev) => !prev)}
            aria-label={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
          >
            <PanelLeft className="h-4 w-4" />
          </Button>
        </div>

        <AdminSidebarNav collapsed={isCollapsed} />
      </aside>

      {/* Mobile sidebar overlay */}
      <div
        className={cn(
          "fixed inset-0 z-40 flex md:hidden",
          mobileOpen ? "pointer-events-auto" : "pointer-events-none",
        )}
      >
        <div
          className={cn(
            "relative flex w-64 flex-col border-r border-zinc-900 bg-zinc-950 px-3 py-4 transition-transform duration-200",
            mobileOpen ? "translate-x-0" : "-translate-x-full",
          )}
        >
          <div className="flex items-center justify-between px-1 pb-4">
            <Link
              href="/admin"
              className="flex items-center gap-2"
              onClick={() => setMobileOpen(false)}
            >
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-zinc-50 text-xs font-bold text-zinc-950">
                JY
              </div>
              <div className="flex flex-col">
                <span className="text-sm font-semibold leading-tight">
                  Jootiya
                </span>
                <span className="text-[11px] text-zinc-400">Admin</span>
              </div>
            </Link>
          </div>

          <AdminSidebarNav onItemClick={() => setMobileOpen(false)} />
        </div>
        <div
          className={cn(
            "flex-1 bg-black/40 transition-opacity duration-200", 
            mobileOpen ? "opacity-100" : "opacity-0",
          )}
          onClick={() => setMobileOpen(false)}
        />
      </div>

      {/* Main content */}
      <div className="flex min-h-screen flex-1 flex-col bg-zinc-950">
        <header className="sticky top-0 z-30 border-b border-zinc-900 bg-zinc-950/80 backdrop-blur">
          <div className="flex items-center gap-3 px-4 py-3 md:px-6">
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-zinc-400 hover:text-zinc-50 md:hidden"
              onClick={() => setMobileOpen(true)}
              aria-label="Open navigation"
            >
              <Menu className="h-4 w-4" />
            </Button>

            <div className="flex flex-1 items-center justify-between gap-3">
              <div className="space-y-0.5">
                <p className="text-[11px] font-medium uppercase tracking-[0.18em] text-zinc-500">
                  Admin
                </p>
                <h1 className="text-sm font-semibold text-zinc-100 md:text-base">
                  Dashboard
                </h1>
              </div>

              <div className="flex items-center gap-2">
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 text-zinc-400 hover:text-zinc-50"
                  aria-label="Notifications"
                >
                  <Bell className="h-4 w-4" />
                </Button>

                <DropdownMenu>
                  <DropdownMenuTrigger className="flex items-center gap-2 rounded-full border border-zinc-800 bg-zinc-900 px-2 py-1.5 text-left text-xs md:text-sm">
                    <div className="flex h-7 w-7 items-center justify-center rounded-full bg-gradient-to-br from-emerald-400 to-sky-500 text-[11px] font-semibold text-zinc-950">
                      SA
                    </div>
                    <div className="hidden flex-col text-xs text-zinc-100 sm:flex">
                      <span className="font-medium">Super Admin</span>
                      <span className="text-[11px] text-zinc-400">
                        superadmin@jootiya.com
                      </span>
                    </div>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="mt-2 min-w-[190px] border-zinc-800 bg-zinc-950 text-zinc-50">
                    <DropdownMenuLabel>Account</DropdownMenuLabel>
                    <DropdownMenuItem>Profile</DropdownMenuItem>
                    <DropdownMenuItem>Billing</DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem className="text-red-400">
                      Sign out
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
          </div>
        </header>

        <main className="flex-1 px-4 py-4 md:px-6 md:py-6">
          <div className="mx-auto max-w-6xl space-y-4">{children}</div>
        </main>
      </div>
    </div>
  );
}
