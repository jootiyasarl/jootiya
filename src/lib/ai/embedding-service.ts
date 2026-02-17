import { Configuration, OpenAIApi } from 'openai-edge';

const config = new Configuration({
  apiKey: process.env.OPENAI_API_KEY,
});

const openai = new OpenAIApi(config);

/**
 * Generates an embedding for the given text using OpenAI's text-embedding-3-small model.
 * This function uses openai-edge for better performance in Edge environments.
 */
export async function generateEmbedding(text: string): Promise<number[]> {
  if (!text) return [];

  // Clean text to remove extra whitespaces and newlines
  const input = text.replace(/\n/g, ' ').trim();

  try {
    const response = await openai.createEmbedding({
      model: 'text-embedding-3-small',
      input,
    });

    const data = await response.json();
    
    if (data.error) {
      throw new Error(data.error.message || 'OpenAI API Error');
    }

    return data.data[0].embedding;
  } catch (error) {
    console.error('Error generating embedding with openai-edge:', error);
    throw error;
  }
}

/**
 * Prepares product data for embedding by combining title and description.
 */
export function prepareProductText(title: string, description: string): string {
  return `${title} ${description}`.slice(0, 8000);
}
