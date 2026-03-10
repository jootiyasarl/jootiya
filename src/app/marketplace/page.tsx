import Link from 'next/link';
import { 
    Home,
    Smartphone, 
    Car, 
    Shirt, 
    Package, 
    Armchair, 
    Hammer, 
    Gamepad2, 
    PawPrint, 
    BookOpen, 
    Tag,
    ArrowRight,
    Image as ImageIcon
} from "lucide-react";
import { cn } from "@/lib/utils";
import { SellBanner } from '@/components/home/SellBanner';

export const metadata = {
  title: 'Catégories - Jootiya',
  description: 'Explorez toutes les catégories sur le marché Jootiya.',
};

const CATEGORIES_GRID = [
    { id: "home", label: "Accueil", icon: Home, bg: "bg-orange-50 text-orange-600", border: "border-orange-100", href: "/", count: "Page principale" },
    { id: "electronics", label: "Électronique", icon: Smartphone, bg: "bg-blue-50 text-blue-600", border: "border-blue-100", href: "/categories/electronics", count: "Mobiles, PC, TV" },
    { id: "home-furniture", label: "Maison & Ameublement", icon: Armchair, bg: "bg-green-50 text-green-600", border: "border-green-100", href: "/categories/home-furniture", count: "Salons, Déco" },
    { id: "vehicles", label: "Véhicules", icon: Car, bg: "bg-orange-50 text-orange-600", border: "border-orange-100", href: "/categories/vehicles", count: "Voitures, Motos" },
    { id: "fashion", label: "Mode & Chaussures", icon: Shirt, bg: "pink-50 text-pink-600", border: "border-pink-100", href: "/categories/fashion", count: "Vêtements, Acc." },
    { id: "tools-equipment", label: "Outils & Équipement", icon: Hammer, bg: "bg-zinc-50 text-zinc-600", border: "border-zinc-200", href: "/categories/tools-equipment", count: "Bricolage, Pro" },
    { id: "hobbies", label: "Loisirs", icon: Gamepad2, bg: "bg-purple-50 text-purple-600", border: "border-purple-100", href: "/categories/hobbies", count: "Jeux, Sport" },
    { id: "animals", label: "Animaux", icon: PawPrint, bg: "bg-amber-50 text-amber-600", border: "border-amber-100", href: "/categories/animals", count: "Chats, Chiens" },
    { id: "books", label: "Livres & Études", icon: BookOpen, bg: "bg-sky-50 text-sky-600", border: "border-sky-100", href: "/categories/books", count: "Romans, Scolaire" },
    { id: "used-clearance", label: "Occasions", icon: Tag, bg: "bg-red-50 text-red-600", border: "border-red-100", href: "/categories/used-clearance", count: "Vide-grenier" },
    { id: "other", label: "Autres", icon: Package, bg: "bg-slate-50 text-slate-600", border: "border-slate-100", href: "/categories/other", count: "Divers" },
];

export default function MarketplacePage() {
  return (
    <div className="min-h-screen bg-[#F8FAFC] dark:bg-zinc-950 pb-12">
      <div className="max-w-[1440px] mx-auto px-4 md:px-8 py-4 sm:py-6 lg:py-8">
        <div className="flex flex-col lg:flex-row gap-6 lg:gap-8 items-start relative">
          
          {/* Left Sidebar Ad */}
          <aside className="hidden xl:block w-40 sticky top-24 shrink-0">
            <div className="bg-zinc-50 border border-dashed border-zinc-200 rounded-2xl aspect-[1/4] flex flex-col items-center justify-center p-4 text-center">
              <ImageIcon className="w-8 h-8 text-zinc-300 mb-2" />
              <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">Publicité</span>
            </div>
          </aside>

          {/* Main Content Area */}
          <div className="flex-1 min-w-0">
            <div className="text-center mb-8">
              <h1 className="text-3xl md:text-4xl font-black text-zinc-900 dark:text-white mb-4">
                Que recherchez-vous ?
              </h1>
              <p className="text-zinc-500 dark:text-zinc-400 font-medium">
                Parcourez nos catégories pour trouver les meilleures offres
              </p>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3 md:gap-4">
              {CATEGORIES_GRID.map((cat) => {
                const Icon = cat.icon;
                return (
                  <Link
                    key={cat.id}
                    href={cat.href}
                    className="group relative bg-white dark:bg-zinc-900 rounded-[2.5rem] p-6 border border-zinc-100 dark:border-zinc-800 shadow-sm hover:shadow-xl hover:border-orange-200 dark:hover:border-orange-900/30 transition-all duration-300 hover:-translate-y-1 overflow-hidden"
                  >
                    {/* Decorative Background Blob */}
                    <div className={cn(
                      "absolute -right-4 -top-4 w-24 h-24 rounded-full opacity-0 group-hover:opacity-10 transition-opacity duration-300",
                      cat.bg
                    )} />

                    <div className="flex flex-col items-center text-center relative z-10">
                      <div className={cn(
                        "w-16 h-16 rounded-3xl flex items-center justify-center mb-5 transition-transform duration-500 group-hover:rotate-[10deg]",
                        cat.bg,
                        cat.border,
                        "border shadow-sm"
                      )}>
                        <Icon size={32} strokeWidth={2} />
                      </div>
                      
                      <h3 className="text-sm font-black text-zinc-900 dark:text-white uppercase tracking-wider mb-1">
                        {cat.label}
                      </h3>
                      <p className="text-[11px] text-zinc-400 font-bold uppercase tracking-tight mb-4">
                        {cat.count}
                      </p>
                      
                      <div className="mt-auto flex items-center gap-1.5 text-orange-600 text-[10px] font-black uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-all transform translate-y-2 group-hover:translate-y-0">
                        Découvrir
                        <ArrowRight size={12} />
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>

            {/* Sell Banner - Moved to bottom as per user requirement */}
            <div className="mt-12 block">
              <SellBanner />
            </div>
          </div>

          {/* Right Sidebar Ad */}
          <aside className="hidden xl:block w-40 sticky top-24 shrink-0">
            <div className="bg-zinc-50 border border-dashed border-zinc-200 rounded-2xl aspect-[1/4] flex flex-col items-center justify-center p-4 text-center">
              <ImageIcon className="w-8 h-8 text-zinc-300 mb-2" />
              <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">Publicité</span>
            </div>
          </aside>

        </div>
      </div>
    </div>
  );
}
