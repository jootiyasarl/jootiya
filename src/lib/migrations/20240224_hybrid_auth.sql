-- Migration to support Hybrid Auth (Phone + Email)

-- 1. Update Profiles Table
ALTER TABLE public.profiles 
  ALTER COLUMN email DROP NOT NULL,
  ADD COLUMN IF NOT EXISTS phone TEXT UNIQUE,
  ADD COLUMN IF NOT EXISTS password_hash TEXT, -- For custom phone+password auth if not using Supabase Auth Phone
  ADD COLUMN IF NOT EXISTS email_verified BOOLEAN DEFAULT FALSE;

-- 2. Update Ads Table to support phone-based linking
ALTER TABLE public.ads 
  ADD COLUMN IF NOT EXISTS seller_phone TEXT;

-- 3. Update RLS Policies for Profiles to allow phone-based lookups and registration
DROP POLICY IF EXISTS "Users can insert their own profile" ON public.profiles;
CREATE POLICY "Allow public registration" 
ON public.profiles FOR INSERT 
WITH CHECK (true);

DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;
CREATE POLICY "Users can update their own profile" 
ON public.profiles FOR UPDATE 
USING (auth.uid() = id OR phone = (SELECT phone FROM public.profiles WHERE id = auth.uid()));

-- 4. Admin Policy remains strict
DROP POLICY IF EXISTS "Admins can manage categories" ON public.categories;
CREATE POLICY "Admins can manage categories" 
ON public.categories FOR ALL 
USING (
  EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND email = 'jootiyasarl@gmail.com')
);
