"use client";

import { Search, MapPin, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export function HeroSection() {
    return (
        <div className="relative overflow-hidden bg-zinc-900 pb-16 pt-20 sm:pb-24 sm:pt-32 lg:pb-32 lg:pt-40">
            {/* Background Gradients */}
            <div className="absolute inset-0 z-0">
                <div className="absolute top-0 -left-4 w-72 h-72 bg-blue-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob"></div>
                <div className="absolute top-0 -right-4 w-72 h-72 bg-purple-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-2000"></div>
                <div className="absolute -bottom-8 left-20 w-72 h-72 bg-pink-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-4000"></div>
                <div className="absolute inset-0 bg-[url('/grid.svg')] bg-center [mask-image:linear-gradient(180deg,white,rgba(255,255,255,0))]"></div>
            </div>

            <div className="relative z-10 mx-auto max-w-7xl px-6 lg:px-8 text-center text-white">
                <div className="mx-auto max-w-2xl">
                    <h1 className="text-4xl font-bold tracking-tight sm:text-6xl bg-gradient-to-r from-blue-200 via-white to-purple-200 bg-clip-text text-transparent">
                        Tout ce dont vous avez besoin, <br /> en un seul endroit.
                    </h1>
                    <p className="mt-6 text-lg leading-8 text-zinc-300">
                        Le meilleur marché en ligne pour acheter et vendre au Maroc. Électronique, immobilier, voitures, et plus encore. Vendez et achetez en toute sécurité et simplicité.
                    </p>

                    {/* Search Bar */}
                    <div className="mt-10 flex flex-col gap-2 sm:flex-row sm:justify-center">
                        <div className="relative w-full max-w-lg">
                            <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-zinc-400">
                                <Search className="h-5 w-5" />
                            </div>
                            <input
                                type="text"
                                placeholder="Rechercher un téléphone, une voiture, un appartement..."
                                className="block w-full rounded-full border-0 bg-white/10 py-4 pl-10 pr-4 text-white placeholder:text-zinc-400 focus:ring-2 focus:ring-inset focus:ring-blue-500 sm:text-sm sm:leading-6 backdrop-blur-md"
                            />
                        </div>
                        <Button size="lg" className="rounded-full bg-blue-600 hover:bg-blue-500 text-white px-8 py-6 text-base shadow-lg shadow-blue-500/25 transition-all hover:scale-105">
                            Rechercher maintenant
                        </Button>
                    </div>

                    <div className="mt-8 flex items-center justify-center gap-x-6 text-sm">
                        <span className="text-zinc-400">Les plus recherchés :</span>
                        <div className="flex gap-2">
                            <span className="px-3 py-1 rounded-full bg-white/5 border border-white/10 hover:bg-white/10 cursor-pointer transition-colors">iPhone 15</span>
                            <span className="px-3 py-1 rounded-full bg-white/5 border border-white/10 hover:bg-white/10 cursor-pointer transition-colors">Appartement</span>
                            <span className="px-3 py-1 rounded-full bg-white/5 border border-white/10 hover:bg-white/10 cursor-pointer transition-colors">Golf 7</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
