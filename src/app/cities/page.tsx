import { Metadata } from 'next';
import Link from 'next/link';
import { MapPin, Search, Sparkles, Building2, Map as MapIcon, ChevronLeft } from 'lucide-react';
import { MOROCCAN_CITIES } from '@/lib/constants/cities';

export const metadata: Metadata = {
  title: "Choisissez votre ville | Jootiya - Annonces au Maroc",
  description: "Sélectionnez votre ville marocaine pour parcourir les meilleures offres, la météo et les horaires de prière dans votre région.",
};

export default function CitiesPage() {
  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white font-sans" dir="ltr">
      {/* Background Decor */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[60%] h-[60%] rounded-full bg-orange-600/5 blur-[120px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[60%] h-[60%] rounded-full bg-zinc-800/10 blur-[120px]" />
      </div>

      <main className="relative z-10 container mx-auto px-4 py-16 max-w-5xl">
        {/* Header Section */}
        <div className="text-center space-y-6 mb-16 animate-in fade-in slide-in-from-top-4 duration-700">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-orange-600/10 border border-orange-600/20 text-orange-500 text-xs font-black uppercase tracking-widest mb-4">
            <MapPin className="w-3 h-3" />
            <span>Villes du Maroc</span>
          </div>
          <h1 className="text-5xl md:text-7xl font-black tracking-tighter text-white mb-4">
            Choisissez votre <span className="text-orange-600">ville</span>
          </h1>
          <p className="text-zinc-400 text-lg md:text-xl font-medium max-w-2xl mx-auto leading-relaxed">
            Découvrez les meilleures offres, la météo et les horaires de prière selon votre ville au Maroc.
          </p>
          
          {/* Quick Search Placeholder (Visual Only) */}
          <div className="max-w-md mx-auto relative group mt-8">
            <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-zinc-600 group-focus-within:text-orange-500 transition-colors" />
            </div>
            <div className="w-full h-14 bg-zinc-900/50 border border-zinc-800 rounded-2xl flex items-center pl-12 text-zinc-500 font-bold text-sm">
              Rechercher votre ville...
            </div>
          </div>
        </div>

        {/* Regions & Cities Grid */}
        <div className="space-y-12">
          {MOROCCAN_CITIES.map((region, regionIdx) => (
            <div 
              key={region.region} 
              className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700"
              style={{ animationDelay: `${regionIdx * 100}ms` }}
            >
              <div className="flex items-center gap-4">
                <div className="h-10 w-1 bg-orange-600 rounded-full" />
                <h2 className="text-xl md:text-2xl font-black text-white tracking-tight flex items-center gap-3">
                  <Building2 className="w-5 h-5 text-orange-500" />
                  {region.region}
                </h2>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                {region.cities.map((city) => (
                  <Link
                    key={city}
                    href={`/cities/${city.toLowerCase()}`}
                    className="group relative bg-zinc-900/40 border border-zinc-800/50 rounded-2xl p-4 transition-all hover:bg-orange-600 hover:border-orange-500 hover:scale-[1.05] active:scale-95 shadow-lg overflow-hidden"
                  >
                    <div className="relative z-10 flex items-center justify-between">
                      <span className="font-bold text-sm md:text-base text-zinc-100 group-hover:text-white transition-colors">
                        {city}
                      </span>
                      <ChevronLeft className="w-4 h-4 text-zinc-600 group-hover:text-white group-hover:translate-x-1 transition-all" />
                    </div>
                    {/* Background Icon Decoration */}
                    <MapIcon className="absolute -bottom-4 -right-4 w-16 h-16 text-white/5 group-hover:text-white/10 transition-colors rotate-12" />
                  </Link>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Footer Text */}
        <div className="mt-24 pt-12 border-t border-zinc-900 text-center space-y-4">
          <div className="flex items-center justify-center gap-2 text-orange-500">
            <Sparkles className="w-5 h-5 animate-pulse" />
            <span className="text-sm font-black uppercase tracking-widest">Jootiya Morocco</span>
          </div>
          <p className="text-zinc-600 text-xs font-bold leading-loose max-w-lg mx-auto uppercase tracking-wider">
            Tous droits réservés à Jootiya © 2026. Nous couvrons toutes les régions et villes du Royaume du Maroc pour offrir la meilleure expérience d'achat et de vente locale.
          </p>
        </div>
      </main>
    </div>
  );
}
