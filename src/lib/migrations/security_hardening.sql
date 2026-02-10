-- SECURITY HARDENING & PROFESSIONAL FEATURES MIGRATION

-- 1. Anti-Spam Rate Limiting for Ad Posting
CREATE OR REPLACE FUNCTION public.check_ad_rate_limit()
RETURNS TRIGGER AS $$
DECLARE
    ad_count INTEGER;
BEGIN
    -- Count ads posted by this user in the last 60 seconds
    SELECT COUNT(*) INTO ad_count
    FROM public.ads
    WHERE seller_id = NEW.seller_id
      AND created_at > NOW() - INTERVAL '1 minute';

    -- Limit: 3 ads per minute
    IF ad_count >= 3 THEN
        RAISE EXCEPTION 'Rate limit exceeded. Please wait a minute before posting more ads.';
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_check_ad_rate_limit ON public.ads;
CREATE TRIGGER trg_check_ad_rate_limit
BEFORE INSERT ON public.ads
FOR EACH ROW
EXECUTE FUNCTION public.check_ad_rate_limit();

-- 2. Automated Ad Expiry (Archive after 60 days)
-- Note: Requires pg_cron extension to be enabled in Supabase
-- SELECT cron.schedule('0 0 * * *', $$ UPDATE ads SET status = 'archived' WHERE (status = 'active' OR status = 'approved') AND created_at < NOW() - INTERVAL '60 days' $$);

-- For manual execution or trigger-based cleanup (less efficient but reliable without cron)
CREATE OR REPLACE FUNCTION public.archive_old_ads()
RETURNS void AS $$
BEGIN
    UPDATE public.ads
    SET status = 'archived'
    WHERE (status = 'active' OR status = 'approved')
      AND created_at < NOW() - INTERVAL '60 days';
END;
$$ LANGUAGE plpgsql;

-- 3. Enhanced RLS Policies (Tightening)

-- Profiles: Ensure update only for owner
DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;
CREATE POLICY "Users can update their own profile" 
ON public.profiles FOR UPDATE 
USING (auth.uid() = id)
WITH CHECK (auth.uid() = id);

-- Ads: Ensure update/delete only for owner or admin
DROP POLICY IF EXISTS "Sellers can update own ads" ON public.ads;
CREATE POLICY "Sellers can update own ads" 
ON public.ads FOR UPDATE 
USING (
    auth.uid() = seller_id OR 
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('admin', 'super_admin'))
);

DROP POLICY IF EXISTS "Sellers can delete own ads" ON public.ads;
CREATE POLICY "Sellers can delete own ads" 
ON public.ads FOR DELETE 
USING (
    auth.uid() = seller_id OR 
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('admin', 'super_admin'))
);

-- Reviews: Ensure update/delete only for owner or admin
DROP POLICY IF EXISTS "Users can update their own reviews" ON public.reviews;
CREATE POLICY "Users can update their own reviews" 
ON public.reviews FOR UPDATE 
USING (
    auth.uid() = buyer_id OR 
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('admin', 'super_admin'))
);

-- 4. Storage Hardening (ad-images bucket)
-- Note: These policies target the 'storage.objects' table
DROP POLICY IF EXISTS "Users can delete own images" ON storage.objects;
CREATE POLICY "Users can delete own images" ON storage.objects 
FOR DELETE 
USING (
    bucket_id = 'ad-images' AND 
    (auth.uid()::text = (storage.foldername(name))[1] OR 
     EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('admin', 'super_admin')))
);

-- 5. Chat Read Receipts Support
ALTER TABLE public.messages ADD COLUMN IF NOT EXISTS read_at TIMESTAMPTZ;
CREATE INDEX IF NOT EXISTS idx_messages_read_at ON public.messages(read_at) WHERE read_at IS NULL;
