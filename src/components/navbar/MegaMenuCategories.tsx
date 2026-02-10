"use client";

import Link from "next/link";

const categories = [
  { name: "Électronique", slug: "electronics" },
  { name: "Maison & Ameublement", slug: "home-furniture" },
  { name: "Véhicules & Transport", slug: "vehicles" },
  { name: "Mode & Chaussures", slug: "fashion" },
  { name: "Outils & Équipement", slug: "tools-equipment" },
  { name: "Loisirs & Divertissement", slug: "hobbies" },
  { name: "Animaux", slug: "animals" },
  { name: "Livres & Études", slug: "books" },
  { name: "Occasion / Déstockage", slug: "used-clearance" },
  { name: "Autres", slug: "other" },
] as const;

export function MegaMenuCategories() {
  return (
    <div className="rounded-2xl border border-zinc-100 bg-white p-4 shadow-lg ring-1 ring-black/5">
      <div className="grid gap-3 sm:grid-cols-2 md:grid-cols-3">
        {categories.map((category) => (
          <Link
            key={category.slug}
            href={`/category/${category.slug}`}
            className="flex items-center justify-between rounded-lg border border-transparent bg-zinc-50 px-3 py-2 text-sm font-medium text-zinc-700 transition-colors hover:border-zinc-200 hover:bg-white hover:text-zinc-900"
          >
            <span>{category.name}</span>
          </Link>
        ))}
      </div>
    </div>
  );
}
