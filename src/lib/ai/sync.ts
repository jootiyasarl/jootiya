import { createSupabaseServerClient } from '@/lib/supabase-server';
import { generateEmbedding, prepareAdTextForEmbedding } from './embeddings';

/**
 * Updates the embedding for a single ad.
 */
export async function updateAdEmbedding(adId: string) {
  const supabase = createSupabaseServerClient();

  // 1. Fetch ad details
  const { data: ad, error: fetchError } = await supabase
    .from('ads')
    .select('title, description')
    .eq('id', adId)
    .single();

  if (fetchError || !ad) {
    console.error(`Error fetching ad ${adId} for embedding:`, fetchError);
    return;
  }

  // 2. Generate embedding
  const text = prepareAdTextForEmbedding(ad.title, ad.description);
  const embedding = await generateEmbedding(text);

  // 3. Update ad with embedding
  const { error: updateError } = await supabase
    .from('ads')
    .update({ embedding })
    .eq('id', adId);

  if (updateError) {
    console.error(`Error updating embedding for ad ${adId}:`, updateError);
  }
}

/**
 * Utility to sync embeddings for all ads that don't have one.
 * This can be called from an admin action or a cron job.
 */
export async function syncMissingEmbeddings() {
  const supabase = createSupabaseServerClient();

  // 1. Find ads without embeddings
  const { data: ads, error: fetchError } = await supabase
    .from('ads')
    .select('id, title, description')
    .is('embedding', null)
    .limit(50); // Process in batches to avoid timeouts

  if (fetchError) {
    console.error('Error fetching ads missing embeddings:', fetchError);
    return;
  }

  if (!ads || ads.length === 0) {
    console.log('All ads have embeddings.');
    return;
  }

  console.log(`Syncing embeddings for ${ads.length} ads...`);

  // 2. Process each ad
  for (const ad of ads) {
    try {
      const text = prepareAdTextForEmbedding(ad.title, ad.description);
      const embedding = await generateEmbedding(text);

      await supabase
        .from('ads')
        .update({ embedding })
        .eq('id', ad.id);
    } catch (err) {
      console.error(`Failed to sync embedding for ad ${ad.id}:`, err);
    }
  }

  console.log('Sync batch completed.');
}
