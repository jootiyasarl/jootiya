-- Create the posts table for SEO-optimized articles
CREATE TABLE IF NOT EXISTS public.posts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    seo_title TEXT,
    slug TEXT UNIQUE NOT NULL,
    content TEXT NOT NULL, -- Rich Text / HTML content
    excerpt TEXT, -- Brief summary for meta_description and card views
    featured_image TEXT,
    author_name TEXT DEFAULT 'Admin Jootiya',
    author_id UUID REFERENCES auth.users(id),
    category TEXT,
    tags TEXT[],
    schema_data JSONB DEFAULT '{}'::jsonb, -- Store custom JSON-LD schema info
    status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'published', 'archived')),
    published_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS (Row Level Security)
ALTER TABLE public.posts ENABLE ROW LEVEL SECURITY;

-- Policy: Anyone can view published posts
CREATE POLICY "Anyone can view published posts" ON public.posts
    FOR SELECT
    USING (status = 'published');

-- Policy: Only Admins can manage posts
-- This assumes you have a 'role' column in your profiles table
CREATE POLICY "Only admins can manage posts" ON public.posts
    FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE profiles.id = auth.uid()
            AND profiles.role = 'admin'
        )
    )
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE profiles.id = auth.uid()
            AND profiles.role = 'admin'
        )
    );

-- Create a trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_posts_updated_at
    BEFORE UPDATE ON public.posts
    FOR EACH ROW
    EXECUTE PROCEDURE update_updated_at_column();
