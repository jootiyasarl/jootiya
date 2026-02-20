"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowRight, BookOpen, Calendar } from "lucide-react";
import { supabase } from "@/lib/supabaseClient";

export function BlogSection() {
  const [posts, setPosts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchLatestPosts() {
      try {
        const { data, error } = await supabase
          .from("posts")
          .select("*")
          .eq("status", "published")
          .order("published_at", { ascending: false })
          .limit(3);

        if (!error && data) {
          setPosts(data);
        }
      } catch (err) {
        console.error("Error fetching blog posts for homepage:", err);
      } finally {
        setLoading(false);
      }
    }

    fetchLatestPosts();
  }, []);

  if (loading || posts.length === 0) return null;

  return (
    <section className="py-24 bg-zinc-50/50 rounded-[3rem] border border-zinc-100/50 my-16">
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
          <div className="space-y-4">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-orange-500/10 border border-orange-500/20 text-orange-600 text-[10px] font-black uppercase tracking-[0.2em]">
              <BookOpen className="h-3 w-3" />
              Actualités & Conseils
            </div>
            <h2 className="text-4xl font-black tracking-tighter text-zinc-900 leading-none">
              Dernièrement sur <span className="text-orange-500">le Blog</span>
            </h2>
            <p className="text-zinc-500 font-medium max-w-xl">
              Découvrez nos derniers articles pour réussir vos ventes et vos achats sur Jootiya.
            </p>
          </div>
          <Link 
            href="/blog" 
            className="group flex items-center gap-3 px-6 py-3 bg-white border border-zinc-200 rounded-2xl text-sm font-bold text-zinc-900 hover:border-orange-500/30 hover:shadow-xl hover:shadow-orange-500/5 transition-all duration-300"
          >
            Voir tous les articles
            <ArrowRight className="h-4 w-4 text-orange-500 transition-transform group-hover:translate-x-1" />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {posts.map((post) => (
            <Link 
              key={post.id} 
              href={`/blog/${post.slug}`}
              className="group flex flex-col bg-white rounded-[2rem] border border-zinc-100 overflow-hidden hover:shadow-2xl hover:shadow-orange-500/10 hover:-translate-y-2 transition-all duration-500"
            >
              <div className="relative aspect-[16/10] overflow-hidden">
                <img 
                  src={post.featured_image || "/images/placeholder-blog.jpg"} 
                  alt={post.title}
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                />
                <div className="absolute top-4 left-4 px-3 py-1 bg-white/90 backdrop-blur-md rounded-full text-[10px] font-black uppercase tracking-widest text-zinc-900 shadow-sm">
                  {post.category || "Général"}
                </div>
              </div>

              <div className="p-6 flex flex-col flex-1">
                <div className="flex items-center gap-3 text-[10px] font-bold text-zinc-400 uppercase tracking-widest mb-3">
                  <Calendar className="h-3 w-3 text-orange-500/50" />
                  {new Date(post.published_at || post.created_at).toLocaleDateString('fr-FR', {
                    day: 'numeric',
                    month: 'short',
                    year: 'numeric'
                  })}
                </div>
                <h3 className="text-lg font-black text-zinc-900 leading-tight mb-3 group-hover:text-orange-500 transition-colors line-clamp-2">
                  {post.title}
                </h3>
                <p className="text-zinc-500 text-xs leading-relaxed line-clamp-2 mb-6 flex-1">
                  {post.excerpt}
                </p>
                <div className="flex items-center gap-2 text-orange-500 text-[10px] font-black uppercase tracking-widest pt-4 border-t border-zinc-50">
                  Lire la suite
                  <ArrowRight className="h-3 w-3 transition-transform group-hover:translate-x-1" />
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
