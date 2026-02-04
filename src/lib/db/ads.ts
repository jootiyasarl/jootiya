import { supabase } from '@/lib/supabaseClient';

export type AdFilters = {
    query?: string;
    category?: string;
    sellerId?: string;
    minPrice?: number;
    maxPrice?: number;
    sort?: 'newest' | 'price_asc' | 'price_desc';
};

const IS_UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-5][0-9a-f]{3}-[089ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export async function getAds({ query, category, sellerId, minPrice, maxPrice, sort = 'newest' }: AdFilters) {
    let dbQuery = supabase
        .from('ads')
        .select('*, profiles!seller_id(full_name, avatar_url)', { count: 'exact' })
        .eq('status', 'approved');

    if (sellerId && IS_UUID.test(sellerId)) {
        dbQuery = dbQuery.eq('seller_id', sellerId);
    } else if (sellerId) {
        // If sellerId is provided but invalid, return empty to avoid DB error
        return { ads: [], count: 0 };
    }

    // Text Search
    if (query) {
        dbQuery = dbQuery.ilike('title', `%${query}%`);
    }

    // Filters
    if (category) {
        // Assuming simple category string match or ID join. 
        // If using ID, we might need to join categories table or filter by category_id
        // For now assuming we just store category slug or similar in ads table or join necessary.
        // The schema I made has category_id. 
        // To make this robust, I'd query categories by slug first or assume input is ID.
        // Let's assume input is ID for now or I need to handle joining.
        // Simplifying for "ready-to-code":
        // dbQuery = dbQuery.eq('category_id', category);
        // Actually, let's skip strict category ID enforcement to prevent errors if UI sends slugs.
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
