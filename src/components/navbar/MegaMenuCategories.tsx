"use client";

import Link from "next/link";

const categories = [
  { name: "إلكترونيات", slug: "electronics" },
  { name: "المنزل و الأثاث", slug: "home-furniture" },
  { name: "سيارات و نقل", slug: "vehicles" },
  { name: "ملابس و أحذية", slug: "fashion" },
  { name: "أدوات و معدات", slug: "tools-equipment" },
  { name: "ترفيه و هوايات", slug: "hobbies" },
  { name: "حيوانات", slug: "animals" },
  { name: "كتب و دراسة", slug: "books" },
  { name: "مستعمل / تصفية", slug: "used-clearance" },
  { name: "أخرى", slug: "other" },
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
