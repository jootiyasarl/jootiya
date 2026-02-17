import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

/**
 * Generates an embedding for the given text using OpenAI's text-embedding-3-small model.
 * This model produces 1536-dimensional vectors.
 */
export async function generateEmbedding(text: string): Promise<number[]> {
  if (!text) return [];
  
  // Clean text to remove extra whitespaces and newlines
  const input = text.replace(/\n/g, ' ').trim();

  try {
    const response = await openai.embeddings.create({
      model: 'text-embedding-3-small',
      input,
    });

    return response.data[0].embedding;
  } catch (error) {
    console.error('Error generating embedding:', error);
    throw error;
  }
}

/**
 * Combines ad title and description for a more comprehensive embedding.
 */
export function prepareAdTextForEmbedding(title: string, description: string): string {
  return `${title} ${description}`.slice(0, 8000); // OpenAI limit is around 8191 tokens
}
