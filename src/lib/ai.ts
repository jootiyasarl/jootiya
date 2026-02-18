import { Configuration, OpenAIApi } from 'openai-edge';
import { createSupabaseServerClient } from './supabase-server';

const apiKey = process.env.OPENAI_API_KEY;

if (!apiKey) {
  console.warn('Warning: OPENAI_API_KEY is missing from environment variables.');
}

const config = new Configuration({
  apiKey: apiKey,
});

const openai = new OpenAIApi(config);

/**
 * Generates an embedding for the given text using OpenAI's text-embedding-3-small model.
 * Throws a clear error if the API key is missing.
 */
export async function generateEmbedding(text: string): Promise<number[]> {
  if (!process.env.OPENAI_API_KEY) {
    throw new Error('CRITICAL ERROR: OPENAI_API_KEY is missing. Please add it to your environment variables to enable Vector Search.');
  }

  if (!text) return [];

  const input = text.replace(/\n/g, ' ').trim();

  try {
    const response = await openai.createEmbedding({
      model: 'text-embedding-3-small',
      input,
    });

    const data = await response.json();
    
    if (data.error) {
      throw new Error(`OpenAI API Error: ${data.error.message}`);
    }

    return data.data[0].embedding;
  } catch (error) {
    console.error('Failed to generate embedding:', error);
    throw error;
  }
}

/**
 * Updates the embedding for a specific ad.
 */
export async function updateAdEmbedding(adId: string, title: string, description?: string | null) {
  try {
    const supabase = createSupabaseServerClient();
    const combinedText = `${title} ${description || ''}`.trim();
    const embedding = await generateEmbedding(combinedText);

    const { error } = await supabase
      .from('ads')
      .update({ embedding })
      .eq('id', adId);

    if (error) {
      console.error(`Failed to update embedding for ad ${adId}:`, error);
    }
  } catch (err) {
    console.error(`Error in updateAdEmbedding for ad ${adId}:`, err);
  }
}
