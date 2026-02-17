import { createSupabaseServerClient } from '@/lib/supabase-server';
import { generateEmbedding } from './embeddings';

/**
 * Performs a vector similarity search for ads.
 */
export async function searchAdsVector(query: string, limit: number = 20) {
  const supabase = createSupabaseServerClient();

  try {
    // 1. Generate embedding for the search query
    const queryEmbedding = await generateEmbedding(query);

    // 2. Call the RPC function match_ads
    const { data: ads, error } = await supabase.rpc('match_ads', {
      query_embedding: queryEmbedding,
      match_threshold: 0.5, // Similarity threshold (0 to 1)
      match_count: limit,
    });

    if (error) {
      console.error('Error in vector search:', error);
      return [];
    }

    return ads;
  } catch (error) {
    console.error('Vector search failed:', error);
    return [];
  }
}
