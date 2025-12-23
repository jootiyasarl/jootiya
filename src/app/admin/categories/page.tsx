import { CategoryManager } from "@/components/categories/CategoryManager";

export default function AdminCategoriesPage() {
  return (
    <div className="space-y-6">
      <div className="space-y-1">
        <h1 className="text-lg font-semibold text-zinc-50 md:text-xl">
          Categories
        </h1>
        <p className="text-xs text-zinc-400 md:text-sm">
          Manage marketplace categories used for navigation and programmatic
          SEO pages.
        </p>
      </div>

      <CategoryManager />
    </div>
  );
}
