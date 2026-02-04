// Removed unused import

export type AdFilters = {
    query?: string;
    category?: string;
    sellerId?: string;
    minPrice?: number;
    maxPrice?: number;
    sort?: 'newest' | 'price_asc' | 'price_desc';
};

const IS_UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-5][0-9a-f]{3}-[089ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export async function getAds(supabase: any, { query, category, sellerId, minPrice, maxPrice, sort = 'newest' }: AdFilters) {
    let dbQuery = supabase
        .from('ads')
        .select('*, profiles(full_name, avatar_url)', { count: 'exact' })
        .eq('status', 'approved');

    if (sellerId && IS_UUID.test(sellerId)) {
        dbQuery = dbQuery.eq('seller_id', sellerId);
    } else if (sellerId) {
        return { ads: [], count: 0 };
    }

    if (query) {
        dbQuery = dbQuery.ilike('title', `%${query}%`);
    }

    if (category) {
        dbQuery = dbQuery.eq('category', category);
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
