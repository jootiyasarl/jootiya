"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Menu, ChevronDown, ArrowLeft, ExternalLink, User } from "lucide-react";
import { DashboardSidebar } from "@/components/dashboard-sidebar";
import { NotificationBell } from "@/components/notifications/NotificationBell";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { supabase } from "@/lib/supabaseClient";

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = React.useState(false);
  const router = useRouter();

  const handleBackToHome = () => {
    router.push("/");
  };

  const handleProfileClick = () => {
    router.push("/dashboard/profile");
  };

  const handleSubscriptionClick = () => {
    router.push("/dashboard/subscription");
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();

    try {
      await fetch("/api/auth/logout", { method: "POST" });
    } catch (error) {
      console.error("Failed to clear auth session", error);
    }

    router.replace("/login");
  };

  return (
    <div className="flex min-h-screen bg-zinc-50/50">
      {/* Desktop sidebar */}
      <div className="hidden lg:flex lg:w-72 lg:flex-col shrink-0">
        <DashboardSidebar />
      </div>

      {/* Mobile sidebar drawer */}
      {sidebarOpen && (
        <>
          <div
            className="fixed inset-0 z-[60] bg-black/40 backdrop-blur-sm lg:hidden transition-opacity border-none"
            onClick={() => setSidebarOpen(false)}
          />
          <div className="fixed inset-y-0 left-0 z-[70] w-[85%] max-w-sm bg-white lg:hidden animate-in slide-in-from-left duration-300 ease-out flex flex-col shadow-2xl">
            <DashboardSidebar onItemClick={() => setSidebarOpen(false)} />
          </div>
        </>
      )}

      {/* Main column */}
      <div className="flex min-h-screen flex-1 flex-col">
        {/* Topbar */}
        <header className="sticky top-0 z-50 flex h-16 md:h-20 items-center justify-between border-b bg-white/80 px-4 backdrop-blur-xl lg:px-10">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden p-2 text-zinc-600 hover:bg-zinc-100 rounded-xl transition-colors"
            >
              <Menu className="w-6 h-6" />
            </button>

            <div className="hidden sm:flex flex-col">
              <span className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400">
                Espace Vendeur
              </span>
              <span className="text-sm font-black text-zinc-900 uppercase tracking-tight">
                Console de gestion
              </span>
            </div>

            <div className="h-8 w-px bg-zinc-100 mx-2 hidden lg:block" />

            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="h-10 px-4 rounded-xl text-sm font-bold text-orange-600 hover:bg-orange-50 transition-all flex items-center gap-2 group"
              onClick={handleBackToHome}
            >
              <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
              <span>Voir le site</span>
            </Button>
          </div>

          <div className="flex items-center gap-3">
            <NotificationBell />

            <DropdownMenu>
              <DropdownMenuTrigger className="flex items-center gap-3 rounded-2xl border border-zinc-100 bg-white p-1 pr-4 text-left shadow-sm transition hover:bg-zinc-50 outline-none hover:ring-4 hover:ring-zinc-100">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-zinc-900 text-[13px] font-black uppercase text-white shadow-lg shadow-black/10">
                  SA
                </div>
                <div className="hidden flex-col leading-tight md:flex">
                  <span className="text-[13px] font-black text-zinc-900 uppercase tracking-tight">
                    Vendeur
                  </span>
                  <span className="text-[10px] font-bold text-zinc-400 truncate max-w-[100px]">
                    Actif
                  </span>
                </div>
                <ChevronDown className="ml-1 h-4 w-4 text-zinc-400" />
              </DropdownMenuTrigger>

              <DropdownMenuContent className="mt-2 w-56 rounded-2xl border-zinc-100 shadow-2xl p-2">
                <DropdownMenuLabel className="px-3 pb-2 pt-1 text-[11px] font-black uppercase tracking-widest text-zinc-400">
                  Gestion Compte
                </DropdownMenuLabel>
                <DropdownMenuItem onClick={handleProfileClick} className="rounded-xl px-3 py-2.5 font-bold text-sm cursor-pointer hover:bg-zinc-50 gap-3">
                  <User className="w-4 h-4 text-zinc-400" /> Profil
                </DropdownMenuItem>
                <DropdownMenuItem onClick={handleSubscriptionClick} className="rounded-xl px-3 py-2.5 font-bold text-sm cursor-pointer hover:bg-zinc-50 gap-3">
                  <CreditCard className="w-4 h-4 text-zinc-400" /> Abonnement
                </DropdownMenuItem>
                <DropdownMenuSeparator className="my-2 bg-zinc-50" />
                <DropdownMenuItem onClick={handleSignOut} className="rounded-xl px-3 py-2.5 font-bold text-sm cursor-pointer text-red-600 hover:bg-red-50 gap-3">
                  <LogOut className="w-4 h-4 text-red-400" /> Déconnexion
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </header>

        {/* Main content */}
        <main className="flex-1 px-4 pb-20 pt-8 lg:px-10 lg:pt-10">
          <div className="mx-auto w-full max-w-7xl">{children}</div>
        </main>
      </div>
    </div>
  );
}

import { CreditCard, LogOut } from "lucide-react";
