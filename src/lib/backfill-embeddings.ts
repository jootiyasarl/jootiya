import { createSupabaseServerClient } from './supabase-server';
import { generateEmbedding } from './ai';

/**
 * Backfills embeddings for ads that don't have them yet.
 * Run this once to update existing ads.
 */
export async function backfillAdsEmbeddings() {
  const supabase = createSupabaseServerClient();

  console.log('Fetching ads without embeddings...');
  
  const { data: ads, error } = await supabase
    .from('ads')
    .select('id, title, description')
    .is('embedding', null)
    .eq('status', 'active');

  if (error) {
    console.error('Error fetching ads:', error);
    return;
  }

  if (!ads || ads.length === 0) {
    console.log('No ads need embedding backfill.');
    return;
  }

  console.log(`Processing ${ads.length} ads...`);

  for (const ad of ads) {
    try {
      const combinedText = `${ad.title} ${ad.description || ''}`.trim();
      console.log(`Generating embedding for: ${ad.title}`);
      
      const embedding = await generateEmbedding(combinedText);
      
      const { error: updateError } = await supabase
        .from('ads')
        .update({ embedding })
        .eq('id', ad.id);

      if (updateError) {
        console.error(`Failed to update ad ${ad.id}:`, updateError);
      } else {
        console.log(`Successfully updated ad: ${ad.title}`);
      }
    } catch (err) {
      console.error(`Error processing ad ${ad.id}:`, err);
    }
  }

  console.log('Backfill completed.');
}
