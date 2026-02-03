-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. Profiles Table (Extends Supabase Auth)
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  username TEXT UNIQUE,
  full_name TEXT,
  avatar_url TEXT,
  role TEXT DEFAULT 'buyer' CHECK (role IN ('buyer', 'seller', 'moderator', 'admin', 'super_admin')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Categories Table
CREATE TABLE IF NOT EXISTS public.categories (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  name TEXT UNIQUE NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  icon TEXT, 
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Ads Table
CREATE TABLE IF NOT EXISTS public.ads (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  seller_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  category_id UUID REFERENCES public.categories(id) ON DELETE SET NULL,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  price DECIMAL(10, 2) NOT NULL DEFAULT 0.00,
  currency TEXT DEFAULT 'USD',
  images TEXT[] DEFAULT '{}', 
  location TEXT,
  status TEXT DEFAULT 'pending' CHECK (status IN ('draft', 'pending', 'approved', 'rejected', 'sold', 'archived')),
  views_count INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enables Row Level Security (Always safe to run)
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ads ENABLE ROW LEVEL SECURITY;

-- POLICIES (Drop first to ensure updates are applied)

-- Profiles
DROP POLICY IF EXISTS "Public profiles are viewable by everyone" ON public.profiles;
CREATE POLICY "Public profiles are viewable by everyone" 
ON public.profiles FOR SELECT USING (true);

DROP POLICY IF EXISTS "Users can insert their own profile" ON public.profiles;
CREATE POLICY "Users can insert their own profile" 
ON public.profiles FOR INSERT WITH CHECK (auth.uid() = id);

DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;
CREATE POLICY "Users can update their own profile" 
ON public.profiles FOR UPDATE USING (auth.uid() = id);

-- Categories
DROP POLICY IF EXISTS "Categories are viewable by everyone" ON public.categories;
CREATE POLICY "Categories are viewable by everyone" 
ON public.categories FOR SELECT USING (true);

DROP POLICY IF EXISTS "Admins can manage categories" ON public.categories;
CREATE POLICY "Admins can manage categories" 
ON public.categories FOR ALL 
USING (
  EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('admin', 'super_admin'))
);

-- Ads
DROP POLICY IF EXISTS "Everyone can view approved ads" ON public.ads;
CREATE POLICY "Everyone can view approved ads" 
ON public.ads FOR SELECT 
USING (status = 'approved');

DROP POLICY IF EXISTS "Sellers see their own ads" ON public.ads;
CREATE POLICY "Sellers see their own ads" 
ON public.ads FOR SELECT 
USING (seller_id = auth.uid());

DROP POLICY IF EXISTS "Sellers can create ads" ON public.ads;
CREATE POLICY "Sellers can create ads" 
ON public.ads FOR INSERT 
WITH CHECK (seller_id = auth.uid());

DROP POLICY IF EXISTS "Sellers can update own ads" ON public.ads;
CREATE POLICY "Sellers can update own ads" 
ON public.ads FOR UPDATE 
USING (seller_id = auth.uid());

DROP POLICY IF EXISTS "Sellers can delete own ads" ON public.ads;
CREATE POLICY "Sellers can delete own ads" 
ON public.ads FOR DELETE 
USING (seller_id = auth.uid());

DROP POLICY IF EXISTS "Admins view all ads" ON public.ads;
CREATE POLICY "Admins view all ads" 
ON public.ads FOR SELECT 
USING (
  EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('admin', 'super_admin', 'moderator'))
);

DROP POLICY IF EXISTS "Admins manage all ads" ON public.ads;
CREATE POLICY "Admins manage all ads" 
ON public.ads FOR UPDATE 
USING (
  EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('admin', 'super_admin', 'moderator'))
);
