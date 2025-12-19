import Image from "next/image";
import Link from "next/link";

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
  { id: "phones", label: "Phones & tablets", icon: "📱", description: "Smartphones, tablets, accessories" },
  { id: "home", label: "Home & furniture", icon: "🛋️", description: "Sofas, tables, decor" },
  { id: "vehicles", label: "Vehicles", icon: "🚗", description: "Cars, motorbikes, scooters" },
  { id: "electronics", label: "Electronics", icon: "💻", description: "Laptops, TVs, audio" },
  { id: "fashion", label: "Fashion", icon: "👕", description: "Clothing, shoes, accessories" },
  { id: "sports", label: "Sports & hobby", icon: "⚽", description: "Gear, games, instruments" },
  { id: "kids", label: "Kids & baby", icon: "🧸", description: "Strollers, toys, clothes" },
  { id: "other", label: "Other", icon: "📦", description: "Everything else" },
] as const;

const featuredAds: HomepageAd[] = [
  {
    id: "1",
    title: "iPhone 13 Pro 256GB in excellent condition",
    price: "7,500 MAD",
    location: "Maarif, Casablanca",
    distance: "1.2 km",
    createdAt: "3 hours ago",
    sellerBadge: "Verified seller",
    isFeatured: true,
  },
  {
    id: "2",
    title: "Nordic wooden dining table with 4 chairs",
    price: "2,300 MAD",
    location: "Gauthier, Casablanca",
    distance: "2.4 km",
    createdAt: "Today",
    sellerBadge: "Active seller",
    isFeatured: true,
  },
  {
    id: "3",
    title: "Decathlon city bike, recently serviced",
    price: "1,200 MAD",
    location: "Ain Diab, Casablanca",
    distance: "3.1 km",
    createdAt: "Yesterday",
    sellerBadge: "Phone verified",
    isFeatured: true,
  },
];

const recentAds: HomepageAd[] = [
  {
    id: "4",
    title: "Samsung 55\" 4K TV, like new",
    price: "3,900 MAD",
    location: "Maarif, Casablanca",
    distance: "0.9 km",
    createdAt: "Just now",
    sellerBadge: "Phone verified",
  },
  {
    id: "5",
    title: "Office chair with lumbar support",
    price: "650 MAD",
    location: "Bourgogne, Casablanca",
    distance: "1.8 km",
    createdAt: "30 minutes ago",
    sellerBadge: "Active seller",
  },
  {
    id: "6",
    title: "PS5 with two controllers and games",
    price: "5,200 MAD",
    location: "Maarif, Casablanca",
    distance: "1.1 km",
    createdAt: "1 hour ago",
    sellerBadge: "Verified seller",
  },
  {
    id: "7",
    title: "Minimalist TV stand, white",
    price: "480 MAD",
    location: "Oasis, Casablanca",
    distance: "4.3 km",
    createdAt: "2 hours ago",
    sellerBadge: "Active seller",
  },
  {
    id: "8",
    title: "Xiaomi Redmi Note 12, 8GB RAM",
    price: "2,000 MAD",
    location: "Ain Sebaa, Casablanca",
    distance: "7.0 km",
    createdAt: "Today",
    sellerBadge: "Phone verified",
  },
  {
    id: "9",
    title: "Children's wooden bed with mattress",
    price: "1,100 MAD",
    location: "Derb Ghallef, Casablanca",
    distance: "3.6 km",
    createdAt: "Today",
    sellerBadge: "Active seller",
  },
];

export default function Home() {
  return (
    <div className="min-h-screen bg-zinc-50 text-zinc-900">
      <div className="mx-auto flex min-h-screen max-w-6xl flex-col px-4 pb-10 pt-4 sm:px-6 lg:px-8">
        <header className="flex items-center justify-between gap-3 border-b border-zinc-100 pb-4">
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-zinc-900">
                <Image src="/next.svg" alt="Jootiya logo" width={18} height={18} className="dark:invert" />
              </div>
              <span className="text-lg font-semibold tracking-tight">Jootiya</span>
            </div>
          </div>
          <div className="hidden flex-1 items-center gap-3 md:flex">
            <div className="flex-1">
              <div className="flex items-center gap-2 rounded-full border border-zinc-200 bg-white px-4 py-2 text-sm text-zinc-500 shadow-sm">
                <span className="truncate">Search for bikes, phones, furniture</span>
              </div>
            </div>
            <button className="inline-flex items-center gap-2 rounded-full border border-zinc-200 bg-white px-3 py-2 text-xs font-medium text-zinc-700 shadow-sm">
              <span className="h-2 w-2 rounded-full bg-emerald-500" />
              <span>Maarif, Casablanca</span>
            </button>
          </div>
          <div className="flex items-center gap-3">
            <button className="hidden text-sm font-medium text-zinc-700 md:inline-flex">Login</button>
            <button className="inline-flex items-center justify-center rounded-full bg-zinc-900 px-4 py-2 text-sm font-medium text-zinc-50">
              Post an ad
            </button>
          </div>
        </header>

        <main className="flex-1 space-y-10 pt-6">
          <section className="grid gap-6 rounded-3xl bg-white px-5 py-6 shadow-sm sm:px-8 sm:py-10 lg:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)]">
            <div className="space-y-4">
              <p className="text-xs font-medium uppercase tracking-wide text-zinc-500">Local marketplace</p>
              <h1 className="text-2xl font-semibold tracking-tight text-zinc-900 sm:text-3xl">
                Buy and sell safely in your neighborhood.
              </h1>
              <p className="text-sm leading-relaxed text-zinc-600">
                Real people, nearby. No spammy listings, no chaos. Jootiya helps you find trusted offers close to home,
                with a clean and calm experience.
              </p>
              <div className="flex flex-wrap gap-3">
                <button className="inline-flex items-center justify-center rounded-full bg-zinc-900 px-4 py-2 text-sm font-medium text-zinc-50">
                  Start browsing near me
                </button>
                <button className="inline-flex items-center justify-center rounded-full border border-zinc-200 bg-white px-4 py-2 text-sm font-medium text-zinc-800">
                  Post your first ad
                </button>
              </div>
            </div>
            <div className="hidden flex-col justify-between gap-4 rounded-2xl border border-dashed border-zinc-200 bg-zinc-50 p-4 text-sm text-zinc-500 sm:flex">
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium uppercase tracking-wide text-zinc-500">Preview</span>
                <span className="text-xs text-zinc-400">Nearby listings</span>
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
              <span className="text-xs text-zinc-400">Clean, local results. No banner spam.</span>
            </div>
          </section>

          <section className="rounded-3xl border border-zinc-100 bg-white px-5 py-4 sm:px-6">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-xs font-medium uppercase tracking-wide text-zinc-500">Browsing in</p>
                <p className="text-sm font-medium text-zinc-900">Maarif, Casablanca</p>
                <p className="text-xs text-zinc-500">Change your neighborhood to see different results.</p>
              </div>
              <div className="flex flex-wrap gap-2">
                <button className="inline-flex items-center rounded-full border border-zinc-200 bg-zinc-50 px-3 py-2 text-xs font-medium text-zinc-700">
                  Change location
                </button>
                <button className="inline-flex items-center rounded-full bg-zinc-900 px-3 py-2 text-xs font-medium text-zinc-50">
                  Use my location
                </button>
              </div>
            </div>
            <div className="mt-3 flex flex-wrap gap-2 text-xs text-zinc-600">
              <span className="text-zinc-500">Popular nearby:</span>
              {["Maarif", "Gauthier", "Ain Diab"].map((name) => (
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
              <div>
                <h2 className="text-base font-semibold tracking-tight text-zinc-900">Browse by category</h2>
                <p className="text-xs text-zinc-500">Start with a simple set of categories. No clutter, no noise.</p>
              </div>
            </div>
            <div className="grid gap-3 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
              {categories.map((category) => (
                <button
                  key={category.id}
                  className="flex flex-col items-start gap-2 rounded-2xl border border-zinc-100 bg-zinc-50 px-4 py-3 text-left transition hover:border-zinc-200 hover:bg-white"
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
              <div>
                <h2 className="text-base font-semibold tracking-tight text-zinc-900">Featured in your area</h2>
                <p className="text-xs text-zinc-500">From verified and active sellers near you.</p>
              </div>
              <button className="text-xs font-medium text-zinc-600 hover:text-zinc-800">View all</button>
            </div>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {featuredAds.map((ad) => (
                <AdCard key={ad.id} ad={ad} variant="featured" />
              ))}
            </div>
          </section>

          <section className="space-y-4">
            <div className="flex items-baseline justify-between">
              <div>
                <h2 className="text-base font-semibold tracking-tight text-zinc-900">Latest in Maarif</h2>
                <p className="text-xs text-zinc-500">Fresh listings from the last 24 hours.</p>
              </div>
              <Link href="/marketplace" className="text-xs font-medium text-zinc-600 hover:text-zinc-800">
                Open marketplace
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
              <div>
                <h2 className="text-base font-semibold tracking-tight text-zinc-900">Trust & safety</h2>
                <p className="text-xs text-zinc-500">
                  Clear rules and simple tools to keep buyers and sellers safe.
                </p>
              </div>
              <Link href="#" className="text-xs font-medium text-zinc-600 hover:text-zinc-800">
                View safety tips
              </Link>
            </div>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <div className="space-y-1 rounded-2xl bg-zinc-50 p-4">
                <p className="text-sm font-medium text-zinc-900">Verified sellers</p>
                <p className="text-xs text-zinc-600">
                  Look for verification badges on profiles and listings before you commit.
                </p>
              </div>
              <div className="space-y-1 rounded-2xl bg-zinc-50 p-4">
                <p className="text-sm font-medium text-zinc-900">Neighborhood-first</p>
                <p className="text-xs text-zinc-600">
                  Meet in familiar, public places in your own area whenever possible.
                </p>
              </div>
              <div className="space-y-1 rounded-2xl bg-zinc-50 p-4">
                <p className="text-sm font-medium text-zinc-900">Private messaging</p>
                <p className="text-xs text-zinc-600">
                  Keep your phone number private until you are ready to share it.
                </p>
              </div>
              <div className="space-y-1 rounded-2xl bg-zinc-50 p-4">
                <p className="text-sm font-medium text-zinc-900">Simple safety tips</p>
                <p className="text-xs text-zinc-600">
                  A short checklist to help you avoid common scams and stay in control.
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
              <span>Marketplace as a Service</span>
            </div>
            <div className="flex flex-wrap gap-3">
              <Link href="#" className="hover:text-zinc-700">
                Help & FAQ
              </Link>
              <Link href="#" className="hover:text-zinc-700">
                Safety
              </Link>
              <Link href="#" className="hover:text-zinc-700">
                Terms
              </Link>
              <Link href="#" className="hover:text-zinc-700">
                Privacy
              </Link>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
}

function AdCard({ ad, variant = "default" }: { ad: HomepageAd; variant?: "default" | "featured" }) {
  const isFeatured = variant === "featured" || ad.isFeatured;

  return (
    <article
      className={[
        "flex flex-col overflow-hidden rounded-2xl border bg-white shadow-sm transition",
        isFeatured ? "border-zinc-900/10 shadow-md" : "border-zinc-100 hover:-translate-y-0.5 hover:shadow-md",
      ].join(" ")}
    >
      <div className="relative">
        <div className="h-40 bg-zinc-100" />
        {isFeatured ? (
          <div className="absolute left-3 top-3 inline-flex items-center rounded-full bg-zinc-900/90 px-2 py-0.5 text-[10px] font-medium text-zinc-50">
            Featured
          </div>
        ) : null}
      </div>
      <div className="flex flex-1 flex-col gap-2 px-3.5 pb-3.5 pt-3">
        <div className="space-y-1">
          <h3 className="line-clamp-2 text-sm font-medium text-zinc-900">{ad.title}</h3>
          <p className="text-sm font-semibold text-zinc-900">{ad.price}</p>
        </div>
        <div className="mt-auto space-y-1">
          <p className="text-xs text-zinc-600">
            {ad.location} • {ad.distance}
          </p>
          <div className="flex items-center justify-between text-[11px] text-zinc-500">
            <span>{ad.createdAt}</span>
            <span className="inline-flex items-center rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-medium text-emerald-700">
              {ad.sellerBadge}
            </span>
          </div>
        </div>
      </div>
    </article>
  );
}
