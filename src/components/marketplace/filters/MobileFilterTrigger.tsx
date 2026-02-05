"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Filter, X } from "lucide-react";
import { MarketplaceFilterSidebar } from "./MarketplaceFilterSidebar";
import { MarketplaceFilterSidebarProps } from "@/types/components/marketplace";

export function MobileFilterTrigger(props: MarketplaceFilterSidebarProps) {
    const [isOpen, setIsOpen] = useState(false);

    return (
        <>
            <Button
                variant="outline"
                onClick={() => setIsOpen(true)}
                className="flex lg:hidden items-center gap-2 rounded-xl border-zinc-200 h-12 px-4 font-bold text-zinc-700 active:scale-95 transition-all shadow-sm"
            >
                <Filter className="w-4 h-4" />
                Filtrer
            </Button>

            {isOpen && (
                <div className="fixed inset-0 z-[100] flex flex-col bg-white animate-in slide-in-from-bottom duration-300">
                    <div className="flex items-center justify-between border-b p-4">
                        <h2 className="text-lg font-black">Filtres</h2>
                        <button
                            onClick={() => setIsOpen(false)}
                            className="p-2 rounded-full bg-zinc-100 text-zinc-600"
                        >
                            <X className="w-6 h-6" />
                        </button>
                    </div>

                    <div className="flex-1 overflow-y-auto p-4">
                        {/* Force visibility of the sidebar content inside the mobile drawer */}
                        <div className="block">
                            <MarketplaceFilterSidebar
                                {...props}
                                // Custom class to ensure it's visible even if the component itself has 'hidden lg:block'
                                className="!block !w-full !border-none !shadow-none !p-0"
                            />
                        </div>
                    </div>

                    <div className="border-t p-4">
                        <Button
                            className="w-full h-14 rounded-2xl bg-blue-600 text-white font-bold text-lg shadow-lg shadow-blue-100"
                            onClick={() => setIsOpen(false)}
                        >
                            Voir les résultats
                        </Button>
                    </div>
                </div>
            )}
        </>
    );
}
