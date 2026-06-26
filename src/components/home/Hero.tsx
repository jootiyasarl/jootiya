"use client";

import Link from "next/link";
import { Search, PlusCircle, MapPin } from "lucide-react";

const QUICK_CATEGORIES = [
  { label: "Électronique", slug: "electronics" },
  { label: "Véhicules", slug: "vehicles" },
  { label: "Maison", slug: "home-furniture" },
  { label: "Mode", slug: "fashion" },
  { label: "Outils", slug: "tools-equipment" },
  { label: "Loisirs", slug: "hobbies" },
];

export function Hero() {
  return (
    <section className="hero bg-gradient-to-br from-orange-50 via-white to-blue-50 dark:from-zinc-900 dark:via-zinc-950 dark:to-zinc-900">
      <div className="hero-content text-center max-w-5xl mx-auto px-4 py-12 sm:py-16 lg:py-20">
        <div className="max-w-3xl mx-auto space-y-6">
          <span className="badge badge-primary badge-soft badge-lg uppercase tracking-widest">
            <MapPin className="h-3.5 w-3.5 mr-1" />
            Annonces au Maroc
          </span>

          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-zinc-900 dark:text-white tracking-tight leading-[1.1]">
            Vendez et achetez <span className="text-orange-600">près de chez vous</span>
          </h1>

          <p className="text-base sm:text-lg text-zinc-600 dark:text-zinc-300 max-w-2xl mx-auto">
            Des milliers d&apos;annonces entre particuliers et professionnels. Simple, rapide et sécurisé.
          </p>

          <div className="join w-full max-w-xl mx-auto mt-4">
            <div className="join-item flex-1">
              <label className="input input-bordered flex items-center gap-2 w-full h-14 bg-white dark:bg-zinc-900 rounded-l-2xl rounded-r-none border-zinc-200 dark:border-zinc-700">
                <Search className="h-5 w-5 text-zinc-400" />
                <input
                  type="text"
                  placeholder="Rechercher téléphone, voiture, meuble..."
                  className="grow text-sm font-medium"
                />
              </label>
            </div>
            <Link
              href="/marketplace"
              className="btn btn-primary join-item h-14 px-6 rounded-r-2xl rounded-l-none text-sm font-black uppercase tracking-wide"
            >
              Rechercher
            </Link>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-2 pt-2">
            <span className="text-xs font-bold text-zinc-500 dark:text-zinc-400">Populaire :</span>
            {QUICK_CATEGORIES.map((cat) => (
              <Link
                key={cat.slug}
                href={`/marketplace/category/${cat.slug}`}
                className="badge badge-outline badge-soft hover:badge-primary transition-colors text-xs font-bold"
              >
                {cat.label}
              </Link>
            ))}
          </div>

          <Link
            href="/poste-annonce"
            className="btn btn-primary btn-lg mt-4 inline-flex items-center gap-2 shadow-xl shadow-orange-500/20"
          >
            <PlusCircle className="h-5 w-5" />
            Déposer une annonce gratuite
          </Link>
        </div>
      </div>
    </section>
  );
}
