import Link from "next/link";
import { Smartphone, Car, Shirt, Package, ArrowRight, Armchair, Hammer, Gamepad2, PawPrint, BookOpen, Tag } from "lucide-react";

const CATEGORIES = [
    { id: "electronics", label: "Électronique", icon: Smartphone, color: "bg-orange-100 text-orange-600", href: "/marketplace?category=electronics" },
    { id: "home-furniture", label: "Maison & Ameublement", icon: Armchair, color: "bg-green-100 text-green-600", href: "/marketplace?category=home-furniture" },
    { id: "vehicles", label: "Véhicules & Transport", icon: Car, color: "bg-orange-100 text-orange-600", href: "/marketplace?category=vehicles" },
    { id: "fashion", label: "Mode & Chaussures", icon: Shirt, color: "bg-pink-100 text-pink-600", href: "/marketplace?category=fashion" },
    { id: "tools-equipment", label: "Outils & Équipement", icon: Hammer, color: "bg-stone-100 text-stone-600", href: "/marketplace?category=tools-equipment" },
    { id: "hobbies", label: "Loisirs & Divertissement", icon: Gamepad2, color: "bg-purple-100 text-purple-600", href: "/marketplace?category=hobbies" },
    { id: "animals", label: "Animaux", icon: PawPrint, color: "bg-amber-100 text-amber-600", href: "/marketplace?category=animals" },
    { id: "books", label: "Livres & Études", icon: BookOpen, color: "bg-sky-100 text-sky-600", href: "/marketplace?category=books" },
    { id: "used-clearance", label: "Occasions / Vide-grenier", icon: Tag, color: "bg-red-100 text-red-600", href: "/marketplace?category=used-clearance" },
    { id: "other", label: "Autres", icon: Package, color: "bg-zinc-100 text-zinc-600", href: "/marketplace?category=other" },
];

export function CategoryGrid() {
    return (
        <section className="py-16 bg-zinc-50">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between mb-8">
                    <h2 className="text-2xl font-bold tracking-tight text-zinc-900">Parcourir les catégories</h2>
                    <Link href="/marketplace" className="text-sm font-medium text-orange-500 hover:text-orange-600 flex items-center gap-1">
                        Tout voir <ArrowRight className="h-4 w-4" />
                    </Link>
                </div>

                <div className="grid grid-cols-2 gap-3 sm:gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-5">
                    {CATEGORIES.map((category) => (
                        <Link
                            key={category.id}
                            href={category.href}
                            className="group relative flex flex-col items-center justify-center rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm transition-all hover:border-orange-200 hover:shadow-md hover:-translate-y-1"
                        >
                            <div className={`mb-4 inline-flex h-12 w-12 items-center justify-center rounded-full ${category.color} transition-transform group-hover:scale-110`}>
                                <category.icon className="h-6 w-6" />
                            </div>
                            <span className="text-sm font-medium text-zinc-900 group-hover:text-orange-600 text-center">
                                {category.label}
                            </span>
                        </Link>
                    ))}
                </div>
            </div>
        </section>
    );
}
