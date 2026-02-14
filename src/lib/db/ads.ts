// Removed unused import

export type AdFilters = {
    query?: string;
    category?: string;
    sellerId?: string;
    minPrice?: number;
    maxPrice?: number;
    city?: string;
    sort?: 'newest' | 'price_asc' | 'price_desc';
};

const IS_UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-5][0-9a-f]{3}-[089ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export async function getAds(supabase: any, { query, category, sellerId, minPrice, maxPrice, city, sort = 'newest' }: AdFilters) {
    // If there's a search query, use smart search function
    if (query && query.trim().length > 0) {
        const { data, error } = await supabase.rpc('search_ads_smart', {
            search_query: query.trim(),
            similarity_threshold: 0.3,
            result_limit: 100 // Get more results for filtering
        });

        if (error) {
            console.error('Smart search error:', error);
            // Fallback to regular query if smart search fails
        } else if (data) {
            // Apply additional filters to smart search results
            let filteredData = data;

            if (sellerId && IS_UUID.test(sellerId)) {
                filteredData = filteredData.filter((ad: any) => ad.seller_id === sellerId);
            }

            if (category) {
                filteredData = filteredData.filter((ad: any) => ad.category === category);
            }

            if (city) {
                filteredData = filteredData.filter((ad: any) => ad.city === city);
            }

            if (minPrice !== undefined) {
                filteredData = filteredData.filter((ad: any) => ad.price >= minPrice);
            }

            if (maxPrice !== undefined) {
                filteredData = filteredData.filter((ad: any) => ad.price <= maxPrice);
            }

            // Apply sorting (smart search already sorts by relevance)
            if (sort !== 'newest') {
                filteredData = [...filteredData].sort((a: any, b: any) => {
                    switch (sort) {
                        case 'price_asc':
                            return a.price - b.price;
                        case 'price_desc':
                            return b.price - a.price;
                        default:
                            return 0;
                    }
                });
            }

            return { ads: filteredData, count: filteredData.length };
        }
    }

    // Regular query with status filtering
    let dbQuery = supabase
        .from('ads')
        .select('*, profiles(full_name, avatar_url, username)', { count: 'exact' })
        .in('status', ['active', 'approved']);

    if (sellerId && IS_UUID.test(sellerId)) {
        dbQuery = dbQuery.eq('seller_id', sellerId);
    } else if (sellerId) {
        return { ads: [], count: 0 };
    }

    if (category) {
        // Broaden search to check both the new UUID column and the legacy SLUG column for maximum compatibility
        if (IS_UUID.test(category)) {
            dbQuery = dbQuery.or(`category_id.eq.${category},category.eq.${category}`);
        } else {
            // Even if it's a slug, some ads might have it in category_id by mistake or it's a slug based ID
            dbQuery = dbQuery.or(`category.eq.${category},category_id.eq.${category}`);
        }
    }

    if (city) {
        dbQuery = dbQuery.eq('city', city);
    }

    if (minPrice !== undefined) dbQuery = dbQuery.gte('price', minPrice);
    if (maxPrice !== undefined) dbQuery = dbQuery.lte('price', maxPrice);

    // Sorting
    switch (sort) {
        case 'price_asc':
            dbQuery = dbQuery.order('price', { ascending: true });
            break;
        case 'price_desc':
            dbQuery = dbQuery.order('price', { ascending: false });
            break;
        case 'newest':
        default:
            dbQuery = dbQuery.order('created_at', { ascending: false });
            break;
    }

    const { data, error, count } = await dbQuery;

    if (error) {
        console.error('Error fetching ads:', error);
        return { ads: [], count: 0, error };
    }

    return { ads: data, count };
}
