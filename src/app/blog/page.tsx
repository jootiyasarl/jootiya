import Link from "next/link";
import { getPublishedPosts } from "@/lib/db/blog";
import { Calendar, ArrowRight, BookOpen } from "lucide-react";

export const metadata = {
  title: "Blog Jootiya - Conseils E-commerce et Marketplace au Maroc",
  description: "Découvrez nos derniers articles sur le e-commerce, la vente en ligne et les tendances du marché au Maroc.",
};

export default async function BlogListing() {
  const posts = await getPublishedPosts();

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <section className="bg-zinc-950 text-white py-24 px-4 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-1/3 h-full bg-orange-500/5 blur-[120px] rounded-full -translate-y-1/2 translate-x-1/2" />
        <div className="max-w-6xl mx-auto text-center space-y-6 relative z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-orange-500/10 border border-orange-500/20 text-orange-500 text-[10px] font-black uppercase tracking-[0.2em]">
            <BookOpen className="h-3 w-3" />
            Le Blog Officiel
          </div>
          <h1 className="text-5xl md:text-7xl font-black tracking-tighter leading-tight">
            Conseils & <span className="text-orange-500">Tendances</span>
          </h1>
          <p className="text-zinc-400 max-w-2xl mx-auto text-lg font-medium leading-relaxed">
            Votre guide ultime pour réussir la vente en ligne au Maroc. 
            Découvrez nos analyses et stratégies pour booster votre business.
          </p>
        </div>
      </section>

      {/* Posts Grid */}
      <section className="max-w-6xl mx-auto px-4 py-24">
        {posts.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
            {posts.map((post) => (
              <Link 
                key={post.id} 
                href={`/blog/${post.slug}`}
                className="group flex flex-col bg-white rounded-[2.5rem] border border-zinc-100 overflow-hidden hover:shadow-2xl hover:shadow-orange-500/10 hover:-translate-y-2 transition-all duration-500"
              >
                <div className="relative aspect-[16/10] overflow-hidden">
                  <img 
                    src={post.featured_image || "/images/placeholder-blog.jpg"} 
                    alt={post.title}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                    loading="lazy"
                  />
                  <div className="absolute top-4 left-4 px-3 py-1 bg-white/90 backdrop-blur-md rounded-full text-[10px] font-black uppercase tracking-widest text-zinc-900 shadow-sm">
                    {post.category || "Général"}
                  </div>
                </div>

                <div className="p-8 flex-1 flex flex-col">
                  <div className="flex items-center gap-4 text-[10px] font-bold text-zinc-400 uppercase tracking-widest mb-4">
                    <span className="flex items-center gap-1.5">
                      <Calendar className="h-3 w-3 text-orange-500/50" />
                      {new Date(post.published_at || post.created_at).toLocaleDateString('fr-FR', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric'
                      })}
                    </span>
                  </div>
                  
                  <h2 className="text-xl font-black text-zinc-900 leading-tight mb-4 group-hover:text-orange-500 transition-colors">
                    {post.title}
                  </h2>
                  
                  <p className="text-zinc-500 text-sm leading-relaxed line-clamp-3 mb-8 flex-1">
                    {post.excerpt}
                  </p>

                  <div className="flex items-center gap-2 text-orange-500 text-[10px] font-black uppercase tracking-widest pt-6 border-t border-zinc-50">
                    Lire l'article
                    <ArrowRight className="h-3 w-3 transition-transform group-hover:translate-x-1" />
                  </div>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="text-center py-32 bg-zinc-50 rounded-[3rem] border border-dashed border-zinc-200">
            <BookOpen className="h-12 w-12 text-zinc-300 mx-auto mb-4" />
            <p className="text-zinc-500 font-bold uppercase tracking-widest text-xs">Aucun article publié pour le moment.</p>
          </div>
        )}
      </section>
    </div>
  );
}
