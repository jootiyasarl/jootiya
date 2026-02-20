import { createSupabaseServerClient } from "@/lib/supabase-server";
import { notFound } from "next/navigation";
import Image from "next/image";
import { 
  Calendar, 
  User, 
  ChevronRight, 
  Share2, 
  MessageCircle, 
  Clock, 
  ArrowLeft,
  List as ListIcon
} from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const supabase = createSupabaseServerClient();
  
  const { data: post } = await supabase
    .from("posts")
    .select("title, seo_title, excerpt, featured_image")
    .eq("slug", slug)
    .eq("status", "published")
    .maybeSingle();

  if (post) {
    return {
      title: post.seo_title || post.title,
      description: post.excerpt,
      openGraph: {
        title: post.seo_title || post.title,
        description: post.excerpt,
        images: post.featured_image ? [{ url: post.featured_image }] : [],
        type: 'article',
      }
    };
  }
  return { title: "Article introuvable" };
}

export default async function BlogPostPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const supabase = createSupabaseServerClient();

  const { data: post } = await supabase
    .from("posts")
    .select("*, profiles(full_name, avatar_url)")
    .eq("slug", slug)
    .eq("status", "published")
    .maybeSingle();

  if (!post) {
    notFound();
  }

  // Calculate reading time
  const wordCount = post.content?.split(/\s+/).length || 0;
  const readingTime = Math.max(1, Math.ceil(wordCount / 200));

  // Extract headings for Table of Contents
  const headings = post.content?.match(/<h[23][^>]*>(.*?)<\/h[23]>/g)?.map((h: string) => {
    const text = h.replace(/<[^>]*>/g, '');
    const id = text.toLowerCase().replace(/[^\w ]+/g, '').replace(/ +/g, '-');
    return { text, id, level: h.startsWith('<h2') ? 2 : 3 };
  }) || [];

  const shareUrl = `https://jootiya.com/blog/${post.slug}`;
  const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(`${post.title} - ${shareUrl}`)}`;

  return (
    <div className="min-h-screen bg-white">
      {/* Breadcrumbs */}
      <div className="bg-zinc-50 border-b border-zinc-100">
        <nav className="max-w-5xl mx-auto px-4 py-4">
          <ol className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-zinc-400">
            <li><Link href="/" className="hover:text-orange-500 transition-colors">Accueil</Link></li>
            <li><ChevronRight className="h-3 w-3" /></li>
            <li><Link href="/blog" className="hover:text-orange-500 transition-colors">Blog</Link></li>
            <li><ChevronRight className="h-3 w-3" /></li>
            <li className="text-zinc-900 truncate max-w-[200px]">{post.title}</li>
          </ol>
        </nav>
      </div>

      <article className="max-w-5xl mx-auto px-4 py-12 md:py-20">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-16">
          
          {/* Main Content */}
          <div className="lg:col-span-8 space-y-10">
            <header className="space-y-6">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-orange-500/10 border border-orange-500/20 text-orange-500 text-[10px] font-black uppercase tracking-[0.2em]">
                {post.category || "Général"}
              </div>
              <h1 className="text-4xl md:text-6xl font-black tracking-tighter text-zinc-900 leading-[1.1]">
                {post.title}
              </h1>
              <div className="flex flex-wrap items-center gap-6 text-xs font-bold text-zinc-400 uppercase tracking-widest pt-4 border-t border-zinc-100">
                <div className="flex items-center gap-2 text-zinc-900">
                  <div className="h-8 w-8 rounded-full bg-orange-500/10 flex items-center justify-center">
                    <User className="h-4 w-4 text-orange-500" />
                  </div>
                  <span>{post.profiles?.full_name || post.author_name || "Équipe Jootiya"}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-zinc-300" />
                  {new Date(post.published_at || post.created_at).toLocaleDateString('fr-FR', {
                    day: 'numeric',
                    month: 'long',
                    year: 'numeric'
                  })}
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-zinc-300" />
                  {readingTime} min de lecture
                </div>
              </div>
            </header>

            {post.featured_image && (
              <div className="relative aspect-video rounded-[2.5rem] overflow-hidden shadow-2xl shadow-orange-500/5">
                <Image 
                  src={post.featured_image} 
                  alt={post.title}
                  fill
                  className="object-cover"
                  loading="lazy"
                />
              </div>
            )}

            {/* Content Body */}
            <div 
              className="prose prose-lg md:prose-xl prose-orange max-w-none 
                prose-headings:font-black prose-headings:tracking-tighter prose-headings:text-zinc-900
                prose-p:leading-relaxed prose-p:text-zinc-600
                prose-strong:text-zinc-900 prose-strong:font-bold
                prose-img:rounded-[2rem] prose-img:shadow-xl prose-img:my-12
                prose-blockquote:border-l-4 prose-blockquote:border-orange-500 prose-blockquote:bg-orange-50/50 prose-blockquote:py-4 prose-blockquote:px-8 prose-blockquote:rounded-r-2xl prose-blockquote:italic"
              dangerouslySetInnerHTML={{ __html: post.content }}
            />
          </div>

          {/* Sidebar */}
          <aside className="lg:col-span-4 space-y-10">
            <div className="sticky top-24 space-y-10">
              
              {/* Table of Contents */}
              {headings.length > 0 && (
                <div className="p-8 bg-zinc-50 rounded-[2.5rem] border border-zinc-100">
                  <h3 className="text-sm font-black uppercase tracking-[0.2em] text-zinc-900 mb-6 flex items-center gap-2">
                    <ListIcon className="h-4 w-4 text-orange-500" />
                    Sommaire
                  </h3>
                  <nav className="space-y-4">
                    {headings.map((h: any, i: number) => (
                      <a 
                        key={i} 
                        href={`#${h.id}`}
                        className={cn(
                          "block text-sm font-bold transition-colors hover:text-orange-500",
                          h.level === 2 ? "text-zinc-600" : "text-zinc-400 pl-4 text-xs"
                        )}
                      >
                        {h.text}
                      </a>
                    ))}
                  </nav>
                </div>
              )}

              {/* Share Card */}
              <div className="p-8 bg-zinc-950 text-white rounded-[2.5rem] shadow-2xl shadow-orange-900/20">
                <h3 className="text-sm font-black uppercase tracking-[0.2em] text-orange-500 mb-6 flex items-center gap-2">
                  <Share2 className="h-4 w-4" />
                  Partager
                </h3>
                <p className="text-sm text-zinc-400 font-medium leading-relaxed mb-6">
                  Vous avez aimé cet article ? Partagez-le avec votre réseau.
                </p>
                <div className="grid grid-cols-1 gap-3">
                  <Button 
                    className="w-full bg-[#25D366] hover:bg-[#22c35e] text-white font-black uppercase tracking-widest text-[10px] h-12 rounded-2xl"
                  >
                    <a href={whatsappUrl} target="_blank" rel="noopener noreferrer" className="flex items-center justify-center w-full h-full">
                      <MessageCircle className="h-4 w-4 mr-2" />
                      WhatsApp
                    </a>
                  </Button>
                </div>
              </div>

            </div>
          </aside>
        </div>
      </article>

      {/* Floating Mobile Share Button */}
      <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 md:hidden w-[90%] max-w-[300px]">
        <Button 
          className="w-full bg-[#25D366] hover:bg-[#22c35e] text-white font-black uppercase tracking-widest text-xs h-14 rounded-2xl shadow-2xl shadow-[#25D366]/40 flex items-center justify-center gap-2"
        >
          <a href={whatsappUrl} target="_blank" rel="noopener noreferrer" className="flex items-center justify-center w-full h-full">
            <MessageCircle className="h-5 w-5 mr-2" />
            Partager sur WhatsApp
          </a>
        </Button>
      </div>

      {/* Back to Blog */}
      <div className="max-w-5xl mx-auto px-4 pb-20">
        <Link 
          href="/blog" 
          className="inline-flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400 hover:text-orange-500 transition-colors"
        >
          <ArrowLeft className="h-3 w-3" />
          Retour au blog
        </Link>
      </div>
    </div>
  );
}
