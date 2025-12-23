"use client";

import * as React from "react";
import { Menu, Bell, ChevronDown } from "lucide-react";
import { DashboardSidebar } from "@/components/dashboard-sidebar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = React.useState(false);

  return (
    <div className="flex min-h-screen bg-zinc-50">
      {/* Desktop sidebar */}
      <div className="hidden lg:flex lg:w-64 lg:flex-col">
        <DashboardSidebar />
      </div>

      {/* Mobile sidebar overlay */}
      {sidebarOpen ? (
        <div className="fixed inset-0 z-40 flex lg:hidden">
          <div
            className="fixed inset-0 bg-black/30"
            aria-hidden="true"
            onClick={() => setSidebarOpen(false)}
          />
          <div className="relative z-40 h-full w-64 bg-white shadow-lg">
            <DashboardSidebar />
          </div>
        </div>
      ) : null}

      {/* Main column */}
      <div className="flex min-h-screen flex-1 flex-col">
        {/* Topbar */}
        <header className="flex h-14 items-center justify-between border-b bg-white/80 px-4 backdrop-blur lg:h-16 lg:px-8">
          <div className="flex items-center gap-2 lg:gap-3">
            <Button
              type="button"
              variant="outline"
              size="icon"
              className="h-8 w-8 border-zinc-200 text-zinc-700 lg:hidden"
              onClick={() => setSidebarOpen(true)}
            >
              <Menu className="h-4 w-4" />
              <span className="sr-only">Open navigation</span>
            </Button>

            <div className="flex flex-col">
              <span className="text-xs font-medium uppercase tracking-[0.18em] text-zinc-500">
                Seller Area
              </span>
              <span className="text-sm font-semibold text-zinc-900">
                Dashboard
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2 lg:gap-3">
            <Button
              type="button"
              variant="outline"
              size="icon"
              className="h-8 w-8 border-zinc-200 text-zinc-700"
            >
              <Bell className="h-4 w-4" />
              <span className="sr-only">Open notifications</span>
            </Button>

            <DropdownMenu>
              <DropdownMenuTrigger className="flex items-center gap-2 rounded-full border border-zinc-200 bg-white px-2 py-1.5 text-left text-xs font-medium text-zinc-700 shadow-sm transition hover:bg-zinc-50">
                <div className="flex h-7 w-7 items-center justify-center rounded-full bg-zinc-900 text-[11px] font-semibold uppercase text-zinc-50">
                  SA
                </div>
                <div className="hidden flex-col leading-tight sm:flex">
                  <span className="text-xs font-medium text-zinc-900">
                    Seller Account
                  </span>
                  <span className="text-[11px] text-zinc-500">
                    seller@example.com
                  </span>
                </div>
                <ChevronDown className="ml-1 h-3 w-3 text-zinc-500" />
              </DropdownMenuTrigger>

              <DropdownMenuContent className="mt-1 w-48">
                <DropdownMenuLabel>Account</DropdownMenuLabel>
                <DropdownMenuItem>Profile</DropdownMenuItem>
                <DropdownMenuItem>Subscription</DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem>Sign out</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </header>

        {/* Main content */}
        <main className="flex-1 px-4 pb-10 pt-4 lg:px-8 lg:pt-6">
          <div className="mx-auto w-full max-w-5xl">{children}</div>
        </main>
      </div>
    </div>
  );
}
