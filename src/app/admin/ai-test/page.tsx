import { searchAdsVector } from '@/lib/ai/vector-logic';
import { AdCard } from '@/components/AdCard';

export const metadata = {
  title: 'AI Search Test - Jootiya',
  description: 'Test vector similarity search with AI scores.',
};

export default async function AISearchTestPage({
  searchParams,
}: {
  searchParams: { q?: string };
}) {
  const query = searchParams.q || '';
  let results: any[] = [];

  if (query) {
    results = await searchAdsVector(query);
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">AI Search Test 🔍</h1>
      
      <form action="/admin/ai-test" method="GET" className="mb-8">
        <div className="flex gap-2">
          <input
            type="text"
            name="q"
            defaultValue={query}
            placeholder="Search for something (e.g., 'vintage camera', 'luxury apartment')..."
            className="flex-1 p-3 border rounded-lg focus:ring-2 focus:ring-primary outline-none"
          />
          <button
            type="submit"
            className="bg-primary text-white px-6 py-2 rounded-lg font-semibold hover:bg-primary/90 transition-colors"
          >
            Search
          </button>
        </div>
      </form>

      {query && (
        <div>
          <h2 className="text-xl font-semibold mb-4 text-gray-700">
            Results for: <span className="italic text-primary">"{query}"</span>
          </h2>

          {results.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {results.map((ad) => (
                <div key={ad.id} className="relative group">
                  {/* Similarity Score Badge */}
                  <div className="absolute -top-3 -right-3 z-10 bg-green-600 text-white px-3 py-1 rounded-full text-sm font-bold shadow-lg transform group-hover:scale-110 transition-transform">
                    Match: {Math.round(ad.similarity * 100)}%
                  </div>
                  
                  <AdCard
                    ad={{
                      id: ad.id,
                      title: ad.title,
                      price: `${ad.price} MAD`,
                      location: ad.city || 'Maroc',
                      imageUrl: ad.images && ad.images.length > 0 ? ad.images[0] : undefined,
                      slug: ad.slug || ad.id,
                      status: 'active',
                    }}
                  />
                  
                  <div className="mt-2 text-xs text-gray-400 font-mono">
                    ID: {ad.id.substring(0, 8)}...
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-20 bg-gray-50 rounded-xl border-2 border-dashed border-gray-200">
              <p className="text-gray-500">No similar ads found or embeddings not generated yet.</p>
              <p className="text-sm text-gray-400 mt-2">Make sure you have run the sync process in the admin panel.</p>
            </div>
          )}
        </div>
      )}

      {!query && (
        <div className="text-center py-20 bg-gray-50 rounded-xl">
          <p className="text-gray-400 text-lg">Enter a search query to test the AI Vector Search.</p>
        </div>
      )}
    </div>
  );
}
