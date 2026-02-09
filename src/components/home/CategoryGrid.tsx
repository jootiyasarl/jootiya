import Link from "next/link";
import { Smartphone, Car, Shirt, Package, ArrowRight, Armchair, Hammer, Gamepad2, PawPrint, BookOpen, Tag } from "lucide-react";

const CATEGORIES = [
    { id: "electronics", label: "Électronique", icon: Smartphone, href: "/marketplace?category=electronics" },
    { id: "home-furniture", label: "Maison & Ameublement", icon: Armchair, href: "/marketplace?category=home-furniture" },
    { id: "vehicles", label: "Véhicules & Transport", icon: Car, href: "/marketplace?category=vehicles" },
    { id: "fashion", label: "Mode & Chaussures", icon: Shirt, href: "/marketplace?category=fashion" },
    { id: "tools-equipment", label: "Outils & Équipement", icon: Hammer, href: "/marketplace?category=tools-equipment" },
    { id: "hobbies", label: "Loisirs & Diverتissement", icon: Gamepad2, href: "/marketplace?category=hobbies" },
    { id: "animals", label: "Animaux", icon: PawPrint, href: "/marketplace?category=animals" },
    { id: "books", label: "Livres & Études", icon: BookOpen, href: "/marketplace?category=books" },
    { id: "used-clearance", label: "Occasions / Vide-grenier", icon: Tag, href: "/marketplace?category=used-clearance" },
    { id: "other", label: "Autres", icon: Package, href: "/marketplace?category=other" },
];

export function CategoryGrid() {
    return (
        <section className="py-8 sm:py-16 bg-zinc-50">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between mb-6 sm:mb-8">
                    <h2 className="text-lg sm:text-2xl font-black tracking-tight text-zinc-900 uppercase">Catégories</h2>
                    <Link href="/marketplace" className="text-xs sm:text-sm font-bold text-orange-500 hover:text-orange-600 flex items-center gap-1 uppercase tracking-tight">
                        Tout <ArrowRight className="h-3 w-3 sm:h-4 sm:w-4" />
                    </Link>
                </div>

                <div className="grid grid-cols-4 sm:grid-cols-5 md:grid-cols-6 lg:grid-cols-8 xl:grid-cols-10 gap-4 sm:gap-8">
                    {CATEGORIES.map((category) => (
                        <Link
                            key={category.id}
                            href={category.href}
                            className="group flex flex-col items-center gap-4 transition-all hover:-translate-y-1"
                        >
                            <div className="flex h-14 w-14 sm:h-16 sm:w-16 items-center justify-center rounded-[2rem] bg-zinc-50 border border-zinc-100 text-slate-700 transition-all group-hover:bg-white group-hover:shadow-lg group-hover:border-orange-100 group-active:scale-95">
                                <category.icon size={28} className="transition-transform group-hover:scale-110" />
                            </div>
                            <span className="text-[11px] sm:text-xs font-bold text-zinc-500 group-hover:text-zinc-900 text-center transition-colors">
                                {category.label}
                            </span>
                        </Link>
                    ))}
                </div>
            </div>
        </section>
    );
}
