import { createSupabaseServerClient } from "@/lib/supabase-server";
import { notFound } from "next/navigation";
import Image from "next/image";
import { Calendar, Share2, User, ArrowLeft, Clock, Tag } from 'lucide-react';
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Metadata } from 'next';

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const decodedSlug = decodeURIComponent(slug);
  const supabase = createSupabaseServerClient();
  
  const { data: post } = await supabase
    .from("posts")
    .select("title, seo_title, excerpt, featured_image")
    .eq("slug", decodedSlug)
    .eq("status", "published")
    .maybeSingle();

  if (!post) return { title: "Article introuvable | Jootiya" };

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

export default async function BlogPostPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const decodedSlug = decodeURIComponent(slug);
  const supabase = createSupabaseServerClient();

  // جلب المقال من قاعدة البيانات
  const { data: post, error } = await supabase
    .from("posts")
    .select("*")
    .ilike("slug", decodedSlug)
    .maybeSingle();

  // Debug section for Admin or development
  if (!post || post.status !== "published") {
    return (
      <div className="min-h-screen bg-white flex flex-col items-center justify-center p-6 text-center">
        <h1 className="text-2xl font-bold mb-4">Debug Info</h1>
        <p className="mb-2">Slug: {decodedSlug}</p>
        <p className="mb-2">Post Found: {post ? 'Yes' : 'No'}</p>
        {post && <p className="mb-2">Status: {post.status}</p>}
        {error && <p className="text-red-500 mb-4">Error: {error.message}</p>}
        <Link href="/blog" className="text-orange-500 font-bold underline">Retour au blog</Link>
      </div>
    );
  }

  const formattedDate = new Date(post.published_at || post.created_at).toLocaleDateString("fr-FR", {
    day: "numeric",
    month: "long",
    year: "numeric"
  });

  return (
    <article className="min-h-screen bg-white dark:bg-zinc-950 pb-20">
      {/* Header Image Section */}
      <div className="relative h-[45vh] md:h-[65vh] w-full bg-zinc-900">
        {post.featured_image && (
          <Image 
            src={post.featured_image} 
            alt={post.title} 
            fill 
            className="object-cover opacity-70" 
            priority 
          />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-950/20 to-transparent" />
        <div className="absolute inset-0 flex items-end">
          <div className="max-w-4xl mx-auto px-6 w-full pb-16">
            <Link href="/blog" className="inline-flex items-center text-white/80 hover:text-white mb-8 text-sm font-bold bg-white/10 backdrop-blur-md px-4 py-2 rounded-full border border-white/10 transition-all">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Retour au blog
            </Link>
            <h1 className="text-4xl md:text-6xl font-black text-white leading-tight mb-8 tracking-tighter">
              {post.title}
            </h1>
            <div className="flex flex-wrap items-center gap-6 text-white/90 text-sm md:text-base font-bold">
              <div className="flex items-center gap-2">
                <div className="h-8 w-8 rounded-full bg-orange-500 flex items-center justify-center text-[10px] text-white">
                  {post.author_name?.charAt(0) || 'J'}
                </div>
                <div className="flex items-center gap-2"><User className="h-4 w-4 text-orange-500" />{post.author_name || "L'équipe Jootiya"}</div>
              </div>
              <div className="flex items-center gap-2 text-white/60">
                <Calendar className="h-4 w-4 text-orange-500" />
                {formattedDate}
              </div>
              <div className="flex items-center gap-2 text-white/60">
                <Tag className="h-4 w-4 text-orange-500" />
                {post.category || "Actualités"}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="max-w-4xl mx-auto px-6 -mt-12 relative z-10">
        <div className="bg-white dark:bg-zinc-900 rounded-[2.5rem] p-8 md:p-16 shadow-2xl border border-zinc-100 dark:border-zinc-800">
          {post.excerpt && (
            <div className="mb-12">
              <p className="text-xl md:text-2xl text-zinc-600 dark:text-zinc-400 font-medium leading-relaxed italic border-l-4 border-orange-500 pl-8">
                {post.excerpt}
              </p>
            </div>
          )}

          <div 
            className="prose prose-lg md:prose-xl prose-orange dark:prose-invert max-w-none
              prose-headings:font-black prose-headings:tracking-tighter prose-headings:text-zinc-900 dark:prose-headings:text-white
              prose-p:leading-relaxed prose-p:text-zinc-700 dark:prose-p:text-zinc-300
              prose-img:rounded-3xl prose-img:shadow-2xl prose-img:my-12
              prose-strong:text-zinc-900 dark:prose-strong:text-white
              prose-a:text-orange-600 prose-a:font-bold prose-a:no-underline hover:prose-a:underline"
            dangerouslySetInnerHTML={{ __html: post.content }}
          />

          <div className="mt-20 pt-10 border-t border-zinc-100 dark:border-zinc-800 flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex flex-col gap-1">
              <span className="text-[10px] font-black uppercase text-zinc-400 tracking-[0.2em]">Partager cet article</span>
              <div className="text-zinc-900 dark:text-white font-bold">Aidez votre communauté à s'informer</div>
            </div>
            <Button className="rounded-2xl bg-orange-600 hover:bg-orange-700 text-white px-8 h-14 font-black shadow-xl shadow-orange-500/20 transition-all active:scale-95 gap-3">
              <Share2 className="h-5 w-5" />
              Partager maintenant
            </Button>
          </div>
        </div>
      </div>
    </article>
  );
}
