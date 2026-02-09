import Link from "next/link";
import { Smartphone, Car, Shirt, Package, ArrowRight, Armchair, Hammer, Gamepad2, PawPrint, BookOpen, Tag } from "lucide-react";

const CATEGORIES = [
    { id: "electronics", label: "Électronique", icon: Smartphone, bg: "bg-blue-50 text-blue-600", href: "/marketplace?category=electronics" },
    { id: "home-furniture", label: "Maison & Ameublement", icon: Armchair, bg: "bg-green-50 text-green-600", href: "/marketplace?category=home-furniture" },
    { id: "vehicles", label: "Véحicules & Transport", icon: Car, bg: "bg-orange-50 text-orange-600", href: "/marketplace?category=vehicles" },
    { id: "fashion", label: "Mode & Chaussures", icon: Shirt, bg: "bg-pink-50 text-pink-600", href: "/marketplace?category=fashion" },
    { id: "tools-equipment", label: "Outils & Équipement", icon: Hammer, bg: "bg-zinc-100 text-zinc-600", href: "/marketplace?category=tools-equipment" },
    { id: "hobbies", label: "Loisirs & Diverتissement", icon: Gamepad2, bg: "bg-purple-50 text-purple-600", href: "/marketplace?category=hobbies" },
    { id: "animals", label: "Animaux", icon: PawPrint, bg: "bg-amber-50 text-amber-600", href: "/marketplace?category=animals" },
    { id: "books", label: "Livres & Études", icon: BookOpen, bg: "bg-sky-50 text-sky-600", href: "/marketplace?category=books" },
    { id: "used-clearance", label: "Occasions", icon: Tag, bg: "bg-red-50 text-red-600", href: "/marketplace?category=used-clearance" },
    { id: "other", label: "Autres", icon: Package, bg: "bg-slate-50 text-slate-600", href: "/marketplace?category=other" },
];

export function CategoryGrid() {
    return (
        <section className="py-12 sm:py-20 bg-white">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between mb-10">
                    <h2 className="text-xl sm:text-2xl font-black tracking-tight text-slate-900">
                        Catégories <span className="text-orange-500 italic">populaires</span>
                    </h2>
                    <Link href="/marketplace" className="text-xs sm:text-sm font-bold text-slate-500 hover:text-orange-600 flex items-center gap-1 transition-colors uppercase tracking-widest">
                        Tout voir <ArrowRight className="h-4 w-4" />
                    </Link>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 sm:gap-6">
                    {CATEGORIES.map((category) => (
                        <Link
                            key={category.id}
                            href={category.href}
                            className="group flex flex-col items-center justify-center p-6 bg-white border border-gray-100 rounded-2xl transition-all duration-300 hover:shadow-md hover:scale-105 active:scale-95"
                        >
                            <div className={`flex h-12 w-12 items-center justify-center rounded-full ${category.bg} mb-4 transition-transform group-hover:rotate-6`}>
                                <category.icon size={24} strokeWidth={1.5} className="shrink-0" />
                            </div>
                            <span className="text-sm font-medium text-slate-800 text-center line-clamp-1">
                                {category.label}
                            </span>
                        </Link>
                    ))}
                </div>
            </div>
        </section>
    );
}
