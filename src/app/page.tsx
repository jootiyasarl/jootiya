import Image from "next/image";
import Link from "next/link";
import { AdCard } from "@/components/AdCard";
import { NearbyNowSection } from "@/components/NearbyNowSection";

type HomepageAd = {
  id: string;
  title: string;
  price: string;
  location: string;
  distance: string;
  createdAt: string;
  sellerBadge: string;
  isFeatured?: boolean;
};

const categories = [
  {
    id: "phones",
    label: "Téléphones et tablettes",
    icon: "📱",
    description: "Smartphones, tablettes, accessoires",
  },
  {
    id: "home",
    label: "Maison & meubles",
    icon: "🛋️",
    description: "Canapés, tables, décoration",
  },
  {
    id: "vehicles",
    label: "Voitures & véhicules",
    icon: "🚗",
    description: "Voitures, motos, vélos",
  },
  {
    id: "electronics",
    label: "Électronique",
    icon: "💻",
    description: "Ordinateurs, téléviseurs, audio",
  },
  {
    id: "fashion",
    label: "Vêtements & mode",
    icon: "👕",
    description: "Vêtements, chaussures, accessoires",
  },
  {
    id: "sports",
    label: "Sport & loisirs",
    icon: "⚽",
    description: "Équipement sportif, jeux, instruments de musique",
  },
  {
    id: "kids",
    label: "Enfants & bébés",
    icon: "🧸",
    description: "Poussettes, jouets, vêtements pour enfants",
  },
  {
    id: "other",
    label: "Autre",
    icon: "📦",
    description: "Tout le reste",
  },
] as const;

const featuredAds: HomepageAd[] = [
  {
    id: "1",
    title: "iPhone 13 Pro 256 Go en excellent état",
    price: "7,500 MAD",
    location: "Maârif, Casablanca",
    distance: "1,2 km",
    createdAt: "Il y a 3 heures",
    sellerBadge: "Vendeur de confiance",
    isFeatured: true,
  },
  {
    id: "2",
    title: "Table en bois style nordique avec 4 chaises",
    price: "2,300 MAD",
    location: "Gauthier, Casablanca",
    distance: "2,4 km",
    createdAt: "Aujourd'hui",
    sellerBadge: "Vendeur actif",
    isFeatured: true,
  },
  {
    id: "3",
    title: "Vélo Decathlon, récemment révisé",
    price: "1,200 MAD",
    location: "Aïn Diab, Casablanca",
    distance: "3,1 km",
    createdAt: "Hier",
    sellerBadge: "Vendeur de confiance",
    isFeatured: true,
  },
];

const recentAds: HomepageAd[] = [
  {
    id: "4",
    title: "Téléviseur Samsung 55\" 4K, neuf",
    price: "3,900 MAD",
    location: "Maârif, Casablanca",
    distance: "0,9 km",
    createdAt: "À l'instant",
    sellerBadge: "Vendeur de confiance",
  },
  {
    id: "5",
    title: "Fauteuil de bureau avec soutien lombaire",
    price: "650 MAD",
    location: "Bourgogne, Casablanca",
    distance: "1,8 km",
    createdAt: "Il y a 30 minutes",
    sellerBadge: "Vendeur actif",
  },
  {
    id: "6",
    title: "PlayStation 5 avec deux manettes et jeux",
    price: "5,200 MAD",
    location: "Maârif, Casablanca",
    distance: "1,1 km",
    createdAt: "Il y a 1 heure",
    sellerBadge: "Vendeur de confiance",
  },
  {
    id: "7",
    title: "Meuble TV simple, blanc",
    price: "480 MAD",
    location: "Oasis, Casablanca",
    distance: "4,3 km",
    createdAt: "Il y a 2 heures",
    sellerBadge: "Vendeur actif",
  },
  {
    id: "8",
    title: "Xiaomi Redmi Note 12, 8 Go de RAM",
    price: "2,000 MAD",
    location: "Aïn Sebaâ, Casablanca",
    distance: "7,0 km",
    createdAt: "Aujourd'hui",
    sellerBadge: "Vendeur de confiance",
  },
  {
    id: "9",
    title: "Lit bébé en bois avec matelas",
    price: "1,100 MAD",
    location: "Derb Ghallef, Casablanca",
    distance: "3,6 km",
    createdAt: "Aujourd'hui",
    sellerBadge: "Vendeur actif",
  },
];

const allHomepageAds: HomepageAd[] = [...featuredAds, ...recentAds];

const homepageAdsJsonLd = {
  "@context": "https://schema.org",
  "@type": "ItemList",
  itemListElement: allHomepageAds.map((ad, index) => ({
    "@type": "Product",
    position: index + 1,
    name: ad.title,
    description: ad.location,
    offers: {
      "@type": "Offer",
      price: ad.price,
      priceCurrency: "MAD",
      areaServed: ad.location,
    },
  })),
};

export default function Home() {
  return (
    <div dir="ltr" lang="fr" className="min-h-screen bg-zinc-50 text-zinc-900">
      <div className="mx-auto flex min-h-screen max-w-6xl flex-col px-4 pb-10 pt-4 sm:px-6 lg:px-8">
        <main className="flex-1 space-y-10 pt-6">
          <section className="grid gap-6 rounded-3xl bg-white px-5 py-6 shadow-sm sm:px-8 sm:py-10 lg:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)]">
            <div className="space-y-4 text-right">
              <p className="text-xs font-medium uppercase tracking-wide text-zinc-500">
                Un marché local simple
              </p>
              <h1 className="text-2xl font-semibold tracking-tight text-zinc-900 sm:text-3xl">
                Achetez et vendez en toute sécurité près de chez vous
              </h1>
              <p className="text-sm leading-relaxed text-zinc-600">
                Des personnes réelles, proches de vous. Pas de spam, pas de bazar.
                Jootiya vous aide à trouver des offres près de chez vous, avec une
                expérience simple et fluide.
              </p>
              <div className="flex flex-wrap justify-end gap-3">
                <button className="inline-flex items-center justify-center rounded-full bg-zinc-900 px-4 py-2 text-sm font-medium text-zinc-50">
                  Voir ce qu'il y a près de chez moi
                </button>
                <Link
                  href="/dashboard/ads/create"
                  className="inline-flex items-center justify-center rounded-full border border-zinc-200 bg-white px-4 py-2 text-sm font-medium text-zinc-800"
                >
                  Publier votre première annonce
                </Link>
              </div>
            </div>
            <div className="hidden flex-col justify-between gap-4 rounded-2xl border border-dashed border-zinc-200 bg-zinc-50 p-4 text-sm text-zinc-500 sm:flex">
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium uppercase tracking-wide text-zinc-500">
                  Aperçu
                </span>
                <span className="text-xs text-zinc-400">Annonces à proximité</span>
              </div>
              <div className="grid gap-3 sm:grid-cols-2">
                {featuredAds.slice(0, 2).map((ad) => (
                  <div
                    key={ad.id}
                    className="flex flex-col gap-2 rounded-xl border border-zinc-100 bg-white p-3 text-xs text-zinc-700"
                  >
                    <div className="h-20 rounded-lg bg-zinc-100" />
                    <div className="space-y-1">
                      <p className="line-clamp-2 font-medium text-zinc-900">{ad.title}</p>
                      <p className="text-[11px] text-zinc-500">
                        {ad.location} • {ad.distance}
                      </p>
                      <p className="text-sm font-semibold text-zinc-900">{ad.price}</p>
                    </div>
                  </div>
                ))}
              </div>
              <span className="text-xs text-zinc-400">
                Des résultats locaux et propres, sans publicités intrusives.
              </span>
            </div>
          </section>

          <section className="space-y-4">
            <div className="flex items-baseline justify-between">
              <div>
                <h2 className="text-base font-semibold tracking-tight text-zinc-900">
                  Près de chez vous maintenant
                </h2>
                <p className="text-xs text-zinc-500">
                  Annonces proches de votre quartier, classées par distance.
                </p>
              </div>
            </div>
            <NearbyNowSection />
          </section>

          <section className="rounded-3xl border border-zinc-100 bg-white px-5 py-4 sm:px-6">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div className="text-right">
                <p className="text-xs font-medium uppercase tracking-wide text-zinc-500">
                  Vous consultez
                </p>
                <p className="text-sm font-medium text-zinc-900">Maârif, Casablanca</p>
                <p className="text-xs text-zinc-500">
                  Changez de quartier pour voir d'autres annonces.
                </p>
              </div>
              <div className="flex flex-wrap gap-2">
                <button className="inline-flex items-center rounded-full border border-zinc-200 bg-zinc-50 px-3 py-2 text-xs font-medium text-zinc-700">
                  Changer de quartier
                </button>
                <button className="inline-flex items-center rounded-full bg-zinc-900 px-3 py-2 text-xs font-medium text-zinc-50">
                  Utiliser ma position actuelle
                </button>
              </div>
            </div>
            <div className="mt-3 flex flex-wrap gap-2 text-xs text-zinc-600">
              <span className="text-zinc-500">Quartiers à proximité :</span>
              {["Maârif", "Gauthier", "Aïn Diab"].map((name) => (
                <span
                  key={name}
                  className="inline-flex items-center rounded-full bg-zinc-100 px-3 py-1 text-xs font-medium text-zinc-700"
                >
                  {name}
                </span>
              ))}
            </div>
          </section>

          <section className="space-y-4">
            <div className="flex items-baseline justify-between">
              <div className="text-right">
                <h2 className="text-base font-semibold tracking-tight text-zinc-900">
                  Parcourir par catégorie
                </h2>
                <p className="text-xs text-zinc-500">
                  Un début simple avec des catégories claires, sans encombrement
                  ni complexité.
                </p>
              </div>
            </div>
            <div className="grid gap-3 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
              {categories.map((category) => (
                <button
                  key={category.id}
                  className="flex flex-col items-end gap-2 rounded-2xl border border-zinc-100 bg-zinc-50 px-4 py-3 text-right transition hover:border-zinc-200 hover:bg-white"
                >
                  <span className="text-lg">{category.icon}</span>
                  <span className="text-sm font-medium text-zinc-900">{category.label}</span>
                  <span className="text-xs text-zinc-500">{category.description}</span>
                </button>
              ))}
            </div>
          </section>

          <section className="space-y-4">
            <div className="flex items-baseline justify-between">
              <div className="text-right">
                <h2 className="text-base font-semibold tracking-tight text-zinc-900">
                  Annonces en vedette près de chez vous
                </h2>
                <p className="text-xs text-zinc-500">
                  De vendeurs de confiance et actifs dans votre zone.
                </p>
              </div>
              <button className="text-xs font-medium text-zinc-600 hover:text-zinc-800">
                Voir tout
              </button>
            </div>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {featuredAds.map((ad) => (
                <AdCard key={ad.id} ad={ad} variant="featured" />
              ))}
            </div>
          </section>

          <section className="space-y-4">
            <div className="flex items-baseline justify-between">
              <div className="text-right">
                <h2 className="text-base font-semibold tracking-tight text-zinc-900">
                  Dernières annonces à Maârif
                </h2>
                <p className="text-xs text-zinc-500">
                  Annonces ajoutées au cours des dernières 24 heures.
                </p>
              </div>
              <Link href="/marketplace" className="text-xs font-medium text-zinc-600 hover:text-zinc-800">
                Voir toutes les annonces
              </Link>
            </div>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {recentAds.map((ad) => (
                <AdCard key={ad.id} ad={ad} variant="default" />
              ))}
            </div>
          </section>

          <section className="rounded-3xl border border-zinc-100 bg-white px-5 py-6 sm:px-6">
            <div className="mb-4 flex items-center justify-between">
              <div className="text-right">
                <h2 className="text-base font-semibold tracking-tight text-zinc-900">
                  Confiance & sécurité
                </h2>
                <p className="text-xs text-zinc-500">
                  Des règles claires et des outils simples pour garder les
                  transactions sûres entre vendeurs et acheteurs.
                </p>
              </div>
              <Link href="#" className="text-xs font-medium text-zinc-600 hover:text-zinc-800">
                Conseils de sécurité
              </Link>
            </div>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <div className="space-y-1 rounded-2xl bg-zinc-50 p-4">
                <p className="text-sm font-medium text-zinc-900">Vendeurs de confiance</p>
                <p className="text-xs text-zinc-600">
                  Cherchez le badge de confiance sur les comptes et les annonces
                  avant de conclure.
                </p>
              </div>
              <div className="space-y-1 rounded-2xl bg-zinc-50 p-4">
                <p className="text-sm font-medium text-zinc-900">Priorité à votre quartier</p>
                <p className="text-xs text-zinc-600">
                  Essayez de rencontrer dans des lieux publics, connus et proches
                  de chez vous.
                </p>
              </div>
              <div className="space-y-1 rounded-2xl bg-zinc-50 p-4">
                <p className="text-sm font-medium text-zinc-900">Messagerie privée</p>
                <p className="text-xs text-zinc-600">
                  Gardez votre numéro de téléphone privé jusqu'à ce que vous
                  soyez à l'aise pour le partager.
                </p>
              </div>
              <div className="space-y-1 rounded-2xl bg-zinc-50 p-4">
                <p className="text-sm font-medium text-zinc-900">Conseils simples</p>
                <p className="text-xs text-zinc-600">
                  Quelques étapes simples pour éviter les arnaques et garder le
                  contrôle.
                </p>
              </div>
            </div>
          </section>
        </main>

        <footer className="mt-10 border-t border-zinc-100 pt-6 text-xs text-zinc-500">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-2">
              <span className="font-medium text-zinc-800">Jootiya</span>
              <span>•</span>
              <span>Un marché en ligne simple pour tous</span>
            </div>
            <div className="flex flex-wrap gap-3">
              <Link href="#" className="hover:text-zinc-700">
                Aide & FAQ
              </Link>
              <Link href="#" className="hover:text-zinc-700">
                Sécurité
              </Link>
              <Link href="#" className="hover:text-zinc-700">
                Conditions
              </Link>
              <Link href="#" className="hover:text-zinc-700">
                Confidentialité
              </Link>
            </div>
          </div>
        </footer>
      </div>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(homepageAdsJsonLd) }}
      />
    </div>
  );
}
