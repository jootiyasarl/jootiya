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
    // If there's a search query, use ilike search (search_ads_smart RPC may not exist)
    if (query && query.trim().length > 0) {
        const trimmedQuery = query.trim();
        const partialQuery = trimmedQuery.length >= 3 ? trimmedQuery.substring(0, 3) : trimmedQuery;
        
        const { data: fallbackData, error: fallbackError } = await supabase
            .from('ads')
            .select('*')
            .in('status', ['active', 'approved'])
            .or(`title.ilike.%${trimmedQuery}%,title.ilike.%${partialQuery}%,description.ilike.%${trimmedQuery}%`)
            .limit(100);
        
        if (fallbackError) {
            console.error('Search fallback error:', fallbackError);
        }
        
        let results = fallbackData || [];

        if (results.length > 0) {
            // Apply additional filters to results
            let filteredData = results;

            if (sellerId && IS_UUID.test(sellerId)) {
                filteredData = filteredData.filter((ad: any) => ad.seller_id === sellerId);
            }

            if (category) {
                filteredData = filteredData.filter((ad: any) => ad.category === category);
            }

            if (city && city !== 'Toutes les villes') {
                filteredData = filteredData.filter((ad: any) => 
                    ad.city && ad.city.toLowerCase().includes(city.toLowerCase())
                );
            }

            if (minPrice !== undefined) {
                filteredData = filteredData.filter((ad: any) => ad.price >= minPrice);
            }

            if (maxPrice !== undefined) {
                filteredData = filteredData.filter((ad: any) => ad.price <= maxPrice);
            }

            // Apply sorting
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

    // Regular query with status filtering (no FK join - fetch profiles separately)
    let dbQuery = supabase
        .from('ads')
        .select('*', { count: 'exact' })
        .in('status', ['active', 'approved']);

    if (sellerId && IS_UUID.test(sellerId)) {
        dbQuery = dbQuery.eq('seller_id', sellerId);
    } else if (sellerId) {
        return { ads: [], count: 0 };
    }

    if (category && category !== 'all' && category !== 'Tout' && category !== 'Toutes les catégories') {
        // Broaden search to check both the new UUID column and the legacy SLUG column for maximum compatibility
        if (IS_UUID.test(category)) {
            dbQuery = dbQuery.or(`category_id.eq.${category},category.ilike.${category}`);
        } else {
            // Use ilike for case-insensitive matching on slugs
            dbQuery = dbQuery.or(`category.ilike.${category},category_id.ilike.${category}`);
        }
    }

    if (city && city !== 'Toutes les villes') {
        dbQuery = dbQuery.ilike('city', `%${city}%`);
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

export async function getRelatedAds(supabase: any, category: string, limit: number = 4) {
  const { data, error } = await supabase
    .from("ads")
    .select("*")
    .in('status', ['active', 'approved'])
    .or(`category.ilike.${category},category_id.ilike.${category}`)
    .limit(limit);

  if (error) {
    console.error("Error fetching related ads:", error);
    return [];
  }
  return data || [];
}
