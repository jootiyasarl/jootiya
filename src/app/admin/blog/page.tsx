"use client";

import dynamic from "next/dynamic";
import { useState, useEffect } from "react";
import { createSupabaseBrowserClient } from "@/lib/supabase";

const BlogEditor = dynamic(() => import("@/components/admin/blog/BlogEditor").then(mod => mod.BlogEditor), {
  ssr: false,
  loading: () => <div className="h-[400px] w-full bg-zinc-100 animate-pulse rounded-xl flex items-center justify-center text-zinc-400">Loading Editor...</div>
});

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { Loader2, Save, ArrowLeft, Globe, Eye } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { generateSlug } from "@/lib/seo-utils";

export default function BlogAdminPage() {
  const [loading, setLoading] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [checkingAuth, setCheckingAuth] = useState(true);
  const router = useRouter();
  const supabase = createSupabaseBrowserClient();

  const [formData, setPostData] = useState({
    title: "",
    seo_title: "",
    slug: "",
    content: "",
    excerpt: "",
    featured_image: "",
    category: "News",
    status: "draft"
  });

  useEffect(() => {
    console.log("Starting auth check...");
    async function checkAdmin() {
      try {
        const { data: { user }, error: userError } = await supabase.auth.getUser();
        console.log("User:", user, "Error:", userError);
        
        if (userError || !user) {
          console.log("No user found, redirecting to login");
          router.push("/login?redirectTo=/admin/blog");
          return;
        }

        const { data: profile, error: profileError } = await supabase
          .from("profiles")
          .select("role")
          .eq("id", user.id)
          .maybeSingle();

        console.log("Profile:", profile, "Error:", profileError);

        if (profileError) throw profileError;

        if (profile?.role !== "admin" && profile?.role !== "super_admin") {
          console.log("Access denied: role is", profile?.role);
          toast.error("Access denied. Admin only.");
          router.push("/");
          return;
        }

        console.log("Admin verified");
        setIsAdmin(true);
      } catch (err) {
        console.error("Auth check critical error:", err);
        router.push("/");
      } finally {
        setCheckingAuth(false);
      }
    }
    checkAdmin();
  }, [supabase, router]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title || !formData.content) {
      toast.error("Title and Content are required");
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
      toast.success("Post saved successfully!");
      router.push("/blog");
    } catch (error: any) {
      toast.error(error.message || "Failed to save post");
    } finally {
      setLoading(false);
    }
  };

  if (checkingAuth) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-orange-600" />
      </div>
    );
  }

  if (!isAdmin) return null;

  return (
    <div className="max-w-5xl mx-auto px-4 py-10">
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-4">
          <Link href="/admin">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </Link>
          <h1 className="text-3xl font-bold">New Blog Post</h1>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" onClick={() => router.back()}>Cancel</Button>
          <Button onClick={handleSave} disabled={loading} className="bg-orange-600 hover:bg-orange-700">
            {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
            Save Post
          </Button>
        </div>
      </div>

      <form onSubmit={handleSave} className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-8 space-y-6">
          <div className="space-y-2">
            <label className="text-sm font-bold">Post Title</label>
            <Input 
              placeholder="Enter a catchy title..." 
              value={formData.title}
              onChange={(e) => setPostData({...formData, title: e.target.value})}
              className="text-lg font-semibold h-12"
            />
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-sm font-bold">Content</label>
              <span className="text-xs text-zinc-400 font-medium">Auto-saves locally</span>
            </div>
            <BlogEditor 
              content={formData.content} 
              onChange={(content) => setPostData({...formData, content})} 
            />
          </div>
        </div>

        <div className="lg:col-span-4 space-y-6">
          <div className="p-6 bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-100 dark:border-zinc-800 shadow-sm space-y-6">
            <h2 className="font-bold flex items-center gap-2 border-b pb-4">
              <Globe className="h-4 w-4 text-orange-600" />
              SEO Settings
            </h2>
            
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase text-zinc-400 tracking-wider">SEO Title</label>
              <Input 
                placeholder="Google search title..." 
                value={formData.seo_title}
                onChange={(e) => setPostData({...formData, seo_title: e.target.value})}
              />
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold uppercase text-zinc-400 tracking-wider">URL Slug</label>
              <Input 
                placeholder="url-path-here" 
                value={formData.slug}
                onChange={(e) => setPostData({...formData, slug: e.target.value})}
              />
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold uppercase text-zinc-400 tracking-wider">Meta Description</label>
              <Textarea 
                placeholder="Brief summary for search engines..." 
                value={formData.excerpt}
                onChange={(e) => setPostData({...formData, excerpt: e.target.value})}
                className="h-24 resize-none text-sm"
              />
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold uppercase text-zinc-400 tracking-wider">Featured Image URL</label>
              <Input 
                placeholder="https://..." 
                value={formData.featured_image}
                onChange={(e) => setPostData({...formData, featured_image: e.target.value})}
              />
            </div>

            <div className="space-y-2 pt-4 border-t">
              <label className="text-xs font-bold uppercase text-zinc-400 tracking-wider">Status</label>
              <select 
                className="w-full p-2 rounded-lg border bg-transparent"
                value={formData.status}
                onChange={(e) => setPostData({...formData, status: e.target.value})}
              >
                <option value="draft">Draft</option>
                <option value="published">Published</option>
                <option value="archived">Archived</option>
              </select>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}
