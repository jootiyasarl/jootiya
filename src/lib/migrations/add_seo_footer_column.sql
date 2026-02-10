-- Add SEO footer content column
ALTER TABLE public.categories ADD COLUMN IF NOT EXISTS seo_footer_text TEXT;
