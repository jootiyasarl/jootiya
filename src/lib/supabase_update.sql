-- 1. Ensure columns exist for the new Premium UI
ALTER TABLE public.ads 
ADD COLUMN IF NOT EXISTS image_urls TEXT[] DEFAULT '{}',
ADD COLUMN IF NOT EXISTS city TEXT,
ADD COLUMN IF NOT EXISTS neighborhood TEXT,
ADD COLUMN IF NOT EXISTS is_featured BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS category TEXT, -- Using text for simple filtering, or link to categories table
ADD COLUMN IF NOT EXISTS views_count INT DEFAULT 0;

-- 2. Create the View Counter Function (RPC)
-- This allows the front-end to increment views without race conditions
CREATE OR REPLACE FUNCTION increment_ad_views(ad_id UUID)
RETURNS void AS $$
BEGIN
  UPDATE public.ads
  SET views_count = views_count + 1
  WHERE id = ad_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 3. Optimization Indexes
CREATE INDEX IF NOT EXISTS idx_ads_status ON public.ads(status);
CREATE INDEX IF NOT EXISTS idx_ads_category ON public.ads(category);
CREATE INDEX IF NOT EXISTS idx_ads_city ON public.ads(city);
CREATE INDEX IF NOT EXISTS idx_ads_featured ON public.ads(is_featured) WHERE is_featured = true;

-- 4. Ensure RLS allows the View Counter to run
-- (Functions marked SECURITY DEFINER run with the privileges of the creator)

-- 5. Verification: Check if columns exist
-- SELECT column_name, data_type 
-- FROM information_schema.columns 
-- WHERE table_name = 'ads';
