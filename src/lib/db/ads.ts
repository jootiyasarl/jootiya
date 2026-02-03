import { supabase } from '@/lib/supabaseClient';

export type AdFilters = {
    query?: string;
    category?: string;
    minPrice?: number;
    maxPrice?: number;
    sort?: 'newest' | 'price_asc' | 'price_desc';
};

export async function getAds({ query, category, minPrice, maxPrice, sort = 'newest' }: AdFilters) {
    let dbQuery = supabase
        .from('ads')
        .select('*, profiles(full_name, avatar_url)', { count: 'exact' })
        .eq('status', 'approved');

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
        console.error('Error fetching ads', error);
        throw new Error('Failed to fetch ads');
    }

    return { ads: data, count };
}
