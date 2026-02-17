import { createSupabaseServerClient } from '@/lib/supabase-server';
import { generateEmbedding } from './embedding-service';

/**
 * Performs a vector similarity search for products.
 * This is an implementation for the 'products' table as requested in Step C.
 */
export async function searchProductsVector(query: string, limit: number = 10) {
  const supabase = createSupabaseServerClient();

  try {
    // 1. Generate embedding for the search query
    const queryEmbedding = await generateEmbedding(query);

    // 2. Call the RPC function match_products (defined in 2026_vector_search.sql)
    const { data: products, error } = await supabase.rpc('match_products', {
      query_embedding: queryEmbedding,
      match_threshold: 0.5, // Similarity threshold (0 to 1)
      match_count: limit,
    });

    if (error) {
      console.error('Error in products vector search:', error);
      return [];
    }

    return products;
  } catch (error) {
    console.error('Products vector search failed:', error);
    return [];
  }
}

/**
 * Implementation for the main 'ads' table used in Jootiya.
 */
export async function searchAdsVector(query: string, limit: number = 20) {
  const supabase = createSupabaseServerClient();

  try {
    const queryEmbedding = await generateEmbedding(query);

    const { data: ads, error } = await supabase.rpc('match_ads', {
      query_embedding: queryEmbedding,
      match_threshold: 0.4,
      match_count: limit,
    });

    if (error) {
      console.error('Error in ads vector search:', error);
      return [];
    }

    return ads;
  } catch (error) {
    console.error('Ads vector search failed:', error);
    return [];
  }
}
