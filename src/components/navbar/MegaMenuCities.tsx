"use client";

import Link from "next/link";

const cities = [
  {
    name: "Casablanca",
    slug: "casablanca",
    districts: [
      { name: "Sidi Moumen", slug: "sidi-moumen" },
      { name: "Ain Chock", slug: "ain-chock" },
      { name: "Bernoussi", slug: "bernoussi" },
    ],
  },
  {
    name: "Rabat",
    slug: "rabat",
    districts: [
      { name: "Agdal", slug: "agdal" },
      { name: "Yacoub El Mansour", slug: "yacoub-el-mansour" },
    ],
  },
] as const;

export function MegaMenuCities() {
  return (
    <div className="rounded-2xl border border-zinc-100 bg-white p-4 shadow-lg ring-1 ring-black/5">
      <div className="grid gap-6 md:grid-cols-3">
        {cities.map((city) => (
          <div key={city.slug} className="space-y-2">
            <h3 className="text-xs font-semibold uppercase tracking-wide text-zinc-500">
              {city.name}
            </h3>
            <ul className="space-y-1 text-sm">
              {city.districts.map((district) => (
                <li key={district.slug}>
                  <Link
                    href={`/cities/${city.slug}/${district.slug}`}
                    className="block rounded-md px-2 py-1 text-zinc-600 transition-colors hover:bg-zinc-50 hover:text-zinc-900"
                  >
                    {district.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </div>
  );
}
