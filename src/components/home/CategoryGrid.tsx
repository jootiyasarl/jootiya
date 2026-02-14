import Link from "next/link";
import { Smartphone, Car, Shirt, Package, ArrowRight, Armchair, Hammer, Gamepad2, PawPrint, BookOpen, Tag } from "lucide-react";

const CATEGORIES = [
    { id: "electronics", label: "Électronique", icon: Smartphone, bg: "bg-blue-50 text-blue-600", href: "/categories/electronics" },
    { id: "home-furniture", label: "Maison & Ameublement", icon: Armchair, bg: "bg-green-50 text-green-600", href: "/categories/home-furniture" },
    { id: "vehicles", label: "Véhicules & Transport", icon: Car, bg: "bg-orange-50 text-orange-600", href: "/categories/vehicles" },
    { id: "fashion", label: "Mode & Chaussures", icon: Shirt, bg: "bg-pink-50 text-pink-600", href: "/categories/fashion" },
    { id: "tools-equipment", label: "Outils & Équipement", icon: Hammer, bg: "bg-zinc-100 text-zinc-600", href: "/categories/tools-equipment" },
    { id: "hobbies", label: "Loisirs & Divertissement", icon: Gamepad2, bg: "bg-purple-50 text-purple-600", href: "/categories/hobbies" },
    { id: "animals", label: "Animaux", icon: PawPrint, bg: "bg-amber-50 text-amber-600", href: "/categories/animals" },
    { id: "books", label: "Livres & Études", icon: BookOpen, bg: "bg-sky-50 text-sky-600", href: "/categories/books" },
    { id: "used-clearance", label: "Occasions", icon: Tag, bg: "bg-red-50 text-red-600", href: "/categories/used-clearance" },
    { id: "other", label: "Autres", icon: Package, bg: "bg-slate-50 text-slate-600", href: "/categories/other" },
];

export function CategoryGrid() {
    return (
        <section className="py-6 sm:py-10 bg-white">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between mb-10">
                    <h2 className="text-xl sm:text-2xl font-black tracking-tight text-slate-900">
                        Catégories <span className="text-orange-500 italic">populaires</span>
                    </h2>
                    <Link href="/marketplace" className="text-xs sm:text-sm font-bold text-slate-500 hover:text-orange-600 flex items-center gap-1 transition-colors uppercase tracking-widest">
                        Tout voir <ArrowRight className="h-4 w-4" />
                    </Link>
                </div>

                <div className="flex overflow-x-auto no-scrollbar gap-4 pb-4 -mx-4 px-4 sm:mx-0 sm:px-0 sm:grid sm:grid-cols-10 sm:overflow-visible">
                    {CATEGORIES.map((category) => (
                        <Link
                            key={category.id}
                            href={category.href}
                            className="group flex flex-col items-center justify-center p-2.5 bg-zinc-50/50 border border-zinc-100 rounded-xl transition-all duration-300 hover:bg-white hover:shadow-md hover:-translate-y-1 hover:border-orange-100 min-w-[90px] sm:min-w-0"
                        >
                            <div className={`flex h-9 w-9 items-center justify-center rounded-full ${category.bg} mb-2 transition-transform group-hover:scale-110`}>
                                <category.icon size={18} strokeWidth={2} className="shrink-0" />
                            </div>
                            <span className="text-[10px] font-bold text-zinc-600 text-center line-clamp-1 group-hover:text-zinc-900">
                                {category.label}
                            </span>
                        </Link>
                    ))}
                </div>
            </div>
        </section>
    );
}
