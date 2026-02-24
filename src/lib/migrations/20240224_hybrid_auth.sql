-- Migration to support Hybrid Auth (Phone + Email) and Fix RLS for Analytics

-- 1. Update Profiles Table
ALTER TABLE public.profiles 
  ALTER COLUMN email DROP NOT NULL,
  ADD COLUMN IF NOT EXISTS phone TEXT UNIQUE,
  ADD COLUMN IF NOT EXISTS password_hash TEXT,
  ADD COLUMN IF NOT EXISTS email_verified BOOLEAN DEFAULT FALSE;

-- 2. Update Ads Table
ALTER TABLE public.ads 
  ADD COLUMN IF NOT EXISTS seller_phone TEXT;

-- 3. Analytics RLS Fix
-- Ensure page_views table exists and has correct RLS
CREATE TABLE IF NOT EXISTS public.page_views (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  path TEXT NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  referrer TEXT,
  user_agent TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.page_views ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow anonymous page views" ON public.page_views;
CREATE POLICY "Allow anonymous page views" 
ON public.page_views FOR INSERT 
WITH CHECK (true);

-- 4. Profiles RLS Fix
DROP POLICY IF EXISTS "Allow public registration" ON public.profiles;
CREATE POLICY "Allow public registration" 
ON public.profiles FOR INSERT 
WITH CHECK (true);

DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;
CREATE POLICY "Users can update their own profile" 
ON public.profiles FOR UPDATE 
USING (auth.uid() = id);

DROP POLICY IF EXISTS "Profiles are viewable by everyone" ON public.profiles;
CREATE POLICY "Profiles are viewable by everyone" 
ON public.profiles FOR SELECT 
USING (true);

-- 5. Admin Categories Policy Fix
DROP POLICY IF EXISTS "Admins can manage categories" ON public.categories;
CREATE POLICY "Admins can manage categories" 
ON public.categories FOR ALL 
USING (
  EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND (email = 'jootiyasarl@gmail.com' OR role = 'super_admin'))
);
