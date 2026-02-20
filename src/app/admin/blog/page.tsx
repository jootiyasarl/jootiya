"use client";

import dynamic from "next/dynamic";
import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabaseClient";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { Loader2, Save, ArrowLeft, Globe, FileText, CheckCircle2, AlertCircle } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { generateSlug } from "@/lib/seo-utils";

const BlogEditor = dynamic(() => import("@/components/admin/blog/BlogEditor").then(mod => mod.BlogEditor), {
  ssr: false,
  loading: () => <div className="h-[500px] w-full bg-zinc-900/50 animate-pulse rounded-[2rem] border border-zinc-800 flex items-center justify-center text-zinc-500 font-medium">Initialisation de l'éditeur professionnel...</div>
});

export default function BlogAdminPage() {
  const [loading, setLoading] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [checkingAuth, setCheckingAuth] = useState(true);
  const router = useRouter();

  const [formData, setPostData] = useState({
    title: "",
    seo_title: "",
    slug: "",
    content: "",
    excerpt: "",
    featured_image: "",
    category: "Actualités",
    status: "draft"
  });

  useEffect(() => {
    async function checkAdmin() {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) {
          router.push("/login?redirectTo=/admin/blog");
          return;
        }

        const { data: profile } = await supabase
          .from("profiles")
          .select("role")
          .eq("id", session.user.id)
          .maybeSingle();

        const role = profile?.role?.toLowerCase();
        if (role === "admin" || role === "super_admin" || !profile) {
          setIsAdmin(true);
        } else {
          router.push("/");
        }
      } catch (err) {
        console.error(err);
        router.push("/");
      } finally {
        setCheckingAuth(false);
      }
    }
    checkAdmin();
  }, [router]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title || !formData.content) {
      toast.error("Le titre et le contenu sont obligatoires");
      return;
    }

    setLoading(true);
    try {
      const slug = formData.slug || generateSlug(formData.title);
      const { error } = await supabase
        .from("posts")
        .insert([{
          ...formData,
          slug,
          published_at: formData.status === "published" ? new Date().toISOString() : null
        }]);

      if (error) throw error;
      toast.success("Article enregistré avec succès !");
      router.push("/blog");
    } catch (error: any) {
      toast.error(error.message || "Erreur lors de l'enregistrement");
    } finally {
      setLoading(false);
    }
  };

  if (checkingAuth) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-zinc-950 text-white">
        <Loader2 className="h-10 w-10 animate-spin text-orange-500 mb-4" />
        <p className="text-zinc-400 font-medium animate-pulse">Vérification des accès administrateur...</p>
      </div>
    );
  }

  if (!isAdmin) return null;

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-10 pb-10">
        
        {/* Modern Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
          <div className="space-y-1">
            <div className="flex items-center gap-3 text-zinc-500 mb-2">
              <Link href="/admin" className="hover:text-orange-500 transition-colors">Administration</Link>
              <span className="text-zinc-800">/</span>
              <span className="text-zinc-300">Blog</span>
            </div>
            <h1 className="text-4xl font-black tracking-tight text-white flex items-center gap-3">
              <FileText className="h-8 w-8 text-orange-500" />
              Nouvel Article
            </h1>
          </div>
          
          <div className="flex items-center gap-3">
            <Button 
              variant="outline" 
              onClick={() => router.back()}
              className="rounded-xl border-zinc-800 bg-zinc-900/50 hover:bg-zinc-800 hover:text-white transition-all"
            >
              Annuler
            </Button>
            <Button 
              onClick={handleSave} 
              disabled={loading} 
              className="rounded-xl bg-orange-600 hover:bg-orange-700 text-white px-6 font-bold shadow-lg shadow-orange-900/20 transition-all active:scale-95"
            >
              {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
              Publier l'article
            </Button>
          </div>
        </div>

        <form onSubmit={handleSave} className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          {/* Main Editor Area */}
          <div className="lg:col-span-8 space-y-8">
            <div className="space-y-3">
              <label className="text-sm font-bold uppercase tracking-widest text-zinc-500 ml-1">Titre de l'article</label>
              <Input 
                placeholder="Ex: Les secrets de l'e-commerce au Maroc..." 
                value={formData.title}
                onChange={(e) => setPostData({...formData, title: e.target.value})}
                className="text-2xl font-black h-16 bg-zinc-900/30 border-zinc-800 focus:border-orange-500/50 focus:ring-orange-500/10 rounded-[1.25rem] px-6 transition-all placeholder:text-zinc-700"
              />
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between ml-1">
                <label className="text-sm font-bold uppercase tracking-widest text-zinc-500">Contenu enrichي</label>
                <div className="flex items-center gap-2 text-[10px] font-bold text-emerald-500 bg-emerald-500/10 px-2 py-1 rounded-md border border-emerald-500/20">
                  <CheckCircle2 className="h-3 w-3" />
                  SAUVEGARDE AUTO ACTIVE
                </div>
              </div>
              <BlogEditor 
                content={formData.content} 
                onChange={(content) => setPostData({...formData, content})} 
              />
            </div>
          </div>

          {/* Sidebar Settings */}
          <div className="lg:col-span-4 space-y-6">
            <div className="sticky top-24 space-y-6">
              
              {/* SEO Card */}
              <div className="p-8 bg-zinc-900/40 backdrop-blur-xl rounded-[2.5rem] border border-zinc-800/50 shadow-2xl space-y-8">
                <h2 className="text-lg font-black flex items-center gap-3 text-white border-b border-zinc-800/50 pb-5">
                  <Globe className="h-5 w-5 text-orange-500" />
                  Optimisation SEO
                </h2>
                
                <div className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase text-zinc-500 tracking-[0.2em]">SEO Title (Google)</label>
                    <Input 
                      placeholder="Titre optimisé pour les moteurs..." 
                      value={formData.seo_title}
                      onChange={(e) => setPostData({...formData, seo_title: e.target.value})}
                      className="bg-zinc-950/50 border-zinc-800 focus:border-orange-500/50 rounded-xl transition-all"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase text-zinc-500 tracking-[0.2em]">URL Slug</label>
                    <div className="relative group">
                      <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none text-zinc-600 text-xs">/blog/</div>
                      <Input 
                        placeholder="mon-article-premium" 
                        value={formData.slug}
                        onChange={(e) => setPostData({...formData, slug: e.target.value})}
                        className="pl-14 bg-zinc-950/50 border-zinc-800 focus:border-orange-500/50 rounded-xl transition-all"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase text-zinc-500 tracking-[0.2em]">Méta-description</label>
                    <Textarea 
                      placeholder="Un résumé percutant pour attirer les clics..." 
                      value={formData.excerpt}
                      onChange={(e) => setPostData({...formData, excerpt: e.target.value})}
                      className="h-32 resize-none bg-zinc-950/50 border-zinc-800 focus:border-orange-500/50 rounded-xl transition-all p-4 text-sm leading-relaxed"
                    />
                  </div>
                </div>
              </div>

              {/* Status Card */}
              <div className="p-8 bg-zinc-900/40 backdrop-blur-xl rounded-[2.5rem] border border-zinc-800/50 shadow-2xl space-y-6">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase text-zinc-500 tracking-[0.2em]">Image de couverture</label>
                    <Input 
                      placeholder="Lien de l'image (Unsplash, etc.)" 
                      value={formData.featured_image}
                      onChange={(e) => setPostData({...formData, featured_image: e.target.value})}
                      className="bg-zinc-950/50 border-zinc-800 focus:border-orange-500/50 rounded-xl transition-all"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase text-zinc-500 tracking-[0.2em]">Statut de publication</label>
                    <select 
                      className="w-full h-11 px-4 rounded-xl border border-zinc-800 bg-zinc-950/50 text-sm font-bold text-white focus:border-orange-500/50 focus:ring-0 appearance-none cursor-pointer transition-all hover:bg-zinc-900"
                      value={formData.status}
                      onChange={(e) => setPostData({...formData, status: e.target.value})}
                    >
                      <option value="draft">📁 Brouillon</option>
                      <option value="published">🚀 Publier maintenant</option>
                      <option value="archived">🔒 Archiver</option>
                    </select>
                  </div>
                </div>

                <div className="p-4 bg-orange-500/5 border border-orange-500/10 rounded-2xl flex items-start gap-3">
                  <AlertCircle className="h-5 w-5 text-orange-500 shrink-0 mt-0.5" />
                  <p className="text-[11px] leading-relaxed text-zinc-400">
                    <strong className="text-orange-500 block mb-1">CONSEIL PRO :</strong>
                    Utilisez des titres courts (moins de 60 caractères) et une description de 150 caractères pour un référencement optimal sur Google.
                  </p>
                </div>
              </div>

            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
