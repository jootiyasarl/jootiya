import { notFound } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase-server";
import { Breadcrumbs, BreadcrumbItem } from "@/components/navigation/Breadcrumbs";
import { AdCard } from "@/components/AdCard";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ChevronLeft, ChevronRight, Grid, List as ListIcon } from "lucide-react";

interface CategoryPageProps {
    params: Promise<{
        slug: string;
    }>;
    searchParams: Promise<{
        page?: string;
    }>;
}

const ITEMS_PER_PAGE = 20;

export async function generateMetadata({ params }: CategoryPageProps) {
    const { slug } = await params;
    const supabase = createSupabaseServerClient();

    const { data: category } = await supabase
        .from("categories")
        .select("name, description, seo_metadata")
        .eq("slug", slug)
        .single();

    if (!category) return { title: "Catégorie introuvable | Jootiya" };

    const seo = (category.seo_metadata as any) || {};
    return {
        title: seo.title || `${category.name} à vendre au Maroc | Jootiya`,
        description: seo.description || category.description || `Découvrez les meilleures offres de ${category.name} sur Jootiya, la plateforme n°1 au Maroc.`,
        keywords: seo.keywords || `${category.name}, occasion, Maroc, Jootiya`,
    };
}

export default async function CategoryPage({ params, searchParams }: CategoryPageProps) {
    const { slug } = await params;
    const { page } = await searchParams;
    const currentPage = parseInt(page || "1");
    const from = (currentPage - 1) * ITEMS_PER_PAGE;
    const to = from + ITEMS_PER_PAGE - 1;

    const supabase = createSupabaseServerClient();

    // 1. Fetch Category & Hierarchy
    const { data: category, error: catError } = await supabase
        .from("categories")
        .select("*, parent_id, description, seo_footer_text")
        .eq("slug", slug)
        .single();

    if (catError || !category) notFound();

    // 2. Fetch Breadcrumbs (Recursive or simple parent)
    const breadcrumbs: BreadcrumbItem[] = [];
    if (category.parent_id) {
        const { data: parent } = await supabase
            .from("categories")
            .select("name, slug")
            .eq("id", category.parent_id)
            .single();
        if (parent) {
            breadcrumbs.push({ label: parent.name, href: `/categories/${parent.slug}` });
        }
    }
    breadcrumbs.push({ label: category.name });

    // 3. Fetch Ads in Category
    console.log("DEBUG: Category Info:", { id: category.id, slug, name: category.name });
    const { data: ads, count, error: adsError } = await supabase
        .from("ads")
        .select("*, profiles(full_name, avatar_url)", { count: "exact" })
        .or(`category_id.eq.${category.id},category.eq.${slug}`)
        .in("status", ["active", "approved"])
        .order("created_at", { ascending: false })
        .range(from, to);

    if (adsError) {
        console.error("DEBUG: DB Error fetching ads:", adsError);
    }
    console.log("DEBUG: Ads result:", { count, length: ads?.length, firstAd: ads?.[0]?.title });

    const totalPages = Math.ceil((count || 0) / ITEMS_PER_PAGE);

    return (
        <div className="min-h-screen bg-zinc-50 pb-20">
            <div className="container mx-auto px-4 py-4 md:py-8">
                <Breadcrumbs items={breadcrumbs} className="mb-4" />

                <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
                    <div>
                        <h1 className="text-2xl md:text-4xl font-black text-zinc-900 mb-2">
                            {category.name}
                        </h1>
                        {category.description && (
                            <p className="text-zinc-500 text-sm md:text-base max-w-2xl">
                                {category.description}
                            </p>
                        )}
                        <div className="mt-2 text-xs font-bold text-orange-600 bg-orange-50 px-3 py-1 rounded-full inline-block">
                            {count || 0} annonces trouvées
                        </div>
                    </div>
                </div>

                {/* Ads Grid */}
                {!ads || ads.length === 0 ? (
                    <div className="bg-white rounded-3xl p-12 text-center border border-zinc-100 shadow-sm">
                        <div className="w-16 h-16 bg-zinc-50 rounded-full flex items-center justify-center mx-auto mb-4">
                            <Grid className="w-8 h-8 text-zinc-300" />
                        </div>
                        <h3 className="text-lg font-bold text-zinc-900 mb-1">Aucune annonce trouvée</h3>
                        <p className="text-zinc-500 text-sm">Soyez le premier à publier dans cette catégorie !</p>
                        <Link href="/post-ad" className="mt-6 inline-block">
                            <Button className="bg-orange-600 hover:bg-orange-700 rounded-full">
                                Publier une annonce
                            </Button>
                        </Link>
                    </div>
                ) : (
                    <>
                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 sm:gap-6" style={{ gridTemplateColumns: 'repeat(2, minmax(0, 1fr))' }}>
                            {ads.map((ad) => (
                                <AdCard key={ad.id} ad={ad as any} />
                            ))}
                        </div>

                        {/* Pagination Controls */}
                        {totalPages > 1 && (
                            <div className="mt-12 flex justify-center items-center gap-2">
                                {currentPage === 1 ? (
                                    <Button
                                        variant="outline"
                                        size="icon"
                                        disabled
                                        className="rounded-full shadow-sm"
                                    >
                                        <ChevronLeft className="h-4 w-4" />
                                    </Button>
                                ) : (
                                    <Link href={`/categories/${slug}?page=${currentPage - 1}`}>
                                        <Button
                                            variant="outline"
                                            size="icon"
                                            className="rounded-full shadow-sm"
                                        >
                                            <ChevronLeft className="h-4 w-4" />
                                        </Button>
                                    </Link>
                                )}

                                <div className="flex items-center gap-2 px-4 py-2 bg-white rounded-full border border-zinc-100 shadow-sm text-sm font-bold">
                                    <span className="text-orange-600">{currentPage}</span>
                                    <span className="text-zinc-300">/</span>
                                    <span className="text-zinc-500">{totalPages}</span>
                                </div>

                                {currentPage === totalPages ? (
                                    <Button
                                        variant="outline"
                                        size="icon"
                                        disabled
                                        className="rounded-full shadow-sm"
                                    >
                                        <ChevronRight className="h-4 w-4" />
                                    </Button>
                                ) : (
                                    <Link href={`/categories/${slug}?page=${currentPage + 1}`}>
                                        <Button
                                            variant="outline"
                                            size="icon"
                                            className="rounded-full shadow-sm"
                                        >
                                            <ChevronRight className="h-4 w-4" />
                                        </Button>
                                    </Link>
                                )}
                            </div>
                        )}
                    </>
                )}
            </div>

            {/* SEO Footer Content */}
            {category.seo_footer_text && (
                <div className="mt-16 pt-8 border-t border-zinc-200">
                    <div className="prose prose-sm prose-zinc max-w-none text-zinc-500 bg-white p-6 md:p-8 rounded-3xl border border-zinc-100 shadow-sm">
                        {category.seo_footer_text.split('\n').map((line: string, i: number) => (
                            <p key={i} className="mb-4 last:mb-0 leading-relaxed">
                                {line}
                            </p>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}
