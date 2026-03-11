import { ReactNode, Suspense } from "react";
import { cn } from "@/lib/utils";
import dynamic from "next/dynamic";

const MobileBottomNav = dynamic(() => import("./MobileBottomNav").then(mod => mod.MobileBottomNav), {
  ssr: false
});

const SidebarAd = dynamic(() => import("@/components/ads/SidebarAd").then(mod => mod.SidebarAd), {
  ssr: false
});

interface RootNavbarShellProps {
  children: ReactNode;
  navbar: ReactNode;
  footer: ReactNode;
}

export function RootNavbarShell({ children, navbar, footer }: RootNavbarShellProps) {
  return (
    <>
      <div className="lg:hidden">
        <MobileBottomNav />
      </div>
      <div>
        <Suspense fallback={<div className="h-16 w-full bg-white border-b border-zinc-200" />}>
          {navbar}
        </Suspense>
      </div>
      <main className="min-h-screen pt-[56px] md:pt-[64px]">
        <div className="main-content-wrapper">
          <div className="max-w-[1440px] mx-auto px-4 md:px-8 relative">
            <div className="flex flex-col lg:flex-row gap-6 lg:gap-8 items-start relative">
              <aside className="hidden xl:block w-40 sticky top-24 shrink-0">
                <SidebarAd />
              </aside>

              <div className="flex-1 min-w-0 w-full">
                {children}
              </div>

              <aside className="hidden xl:block w-40 sticky top-24 shrink-0">
                <SidebarAd />
              </aside>
            </div>
          </div>
        </div>
      </main>
      <div>
        {footer}
      </div>
    </>
  );
}
