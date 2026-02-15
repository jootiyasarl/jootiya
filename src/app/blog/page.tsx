import Link from 'next/link';
import Image from 'next/image';

export const metadata = {
  title: "Blog - Actualités et Analyses du Marché Marocain | Jootiya",
  description: "Découvrez nos derniers articles sur l'e-commerce, la logistique et la transformation digitale au Maroc.",
};

const blogPosts = [
  {
    title: "L'Écosystème du Commerce Électronique au Maroc : Infrastructure, Logistique et Perspectives 2026",
    slug: "ecosysteme-commerce-maroc",
    excerpt: "Le paysage du commerce numérique au Maroc connaît une mutation profonde, portée par une accélération sans précédent de la digitalisation...",
    date: "15 Février 2026",
    category: "Analyse",
    image: "https://ssfcfvuosxxmvsdoktws.supabase.co/storage/v1/object/public/blog/blog_post_1.png"
  }
];

export default function BlogListing() {
  return (
    <div className="min-h-screen bg-white py-16 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <h1 className="text-4xl font-extrabold text-zinc-900 sm:text-5xl">
            Blog & Perspectives
          </h1>
          <p className="mt-4 text-xl text-zinc-600">
            Analyses stratégiques et actualités du marché marocain.
          </p>
        </div>

        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
          {blogPosts.map((post) => (
            <article key={post.slug} className="flex flex-col overflow-hidden rounded-2xl shadow-sm border border-zinc-100 hover:shadow-md transition-shadow">
              <Link href={`/blog/${post.slug}`} className="flex-shrink-0 relative h-48 w-full">
                <Image
                  src={post.image}
                  alt={post.title}
                  fill
                  className="object-cover"
                />
              </Link>
              <div className="flex flex-1 flex-col justify-between p-6">
                <div className="flex-1">
                  <p className="text-sm font-bold text-orange-600 uppercase tracking-wider">
                    {post.category}
                  </p>
                  <Link href={`/blog/${post.slug}`} className="mt-2 block">
                    <h2 className="text-xl font-bold text-zinc-900 hover:text-orange-600 transition-colors">
                      {post.title}
                    </h2>
                    <p className="mt-3 text-base text-zinc-500 line-clamp-3">
                      {post.excerpt}
                    </p>
                  </Link>
                </div>
                <div className="mt-6 flex items-center">
                  <div className="text-sm text-zinc-400">
                    <time dateTime="2026-02-15">{post.date}</time>
                  </div>
                </div>
              </div>
            </article>
          ))}
        </div>
      </div>
    </div>
  );
}
