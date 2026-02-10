-- 1. Analytics: View Counter Function
CREATE OR REPLACE FUNCTION public.increment_ad_views(ad_id UUID)
RETURNS void AS $$
BEGIN
    UPDATE public.ads
    SET views_count = views_count + 1
    WHERE id = ad_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 2. Soft Delete: Ads Archive Table
CREATE TABLE IF NOT EXISTS public.ads_archive (
    id UUID PRIMARY KEY,
    seller_id UUID,
    category_id UUID,
    title TEXT,
    description TEXT,
    price DECIMAL,
    currency TEXT,
    image_urls TEXT[],
    city TEXT,
    neighborhood TEXT,
    status TEXT,
    views_count INT,
    original_created_at TIMESTAMPTZ,
    archived_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Trigger to Archive on Delete
CREATE OR REPLACE FUNCTION public.archive_deleted_ad()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.ads_archive (
        id, seller_id, category_id, title, description, price, currency, 
        image_urls, city, neighborhood, status, views_count, original_created_at
    )
    VALUES (
        OLD.id, OLD.seller_id, OLD.category_id, OLD.title, OLD.description, 
        OLD.price, OLD.currency, OLD.image_urls, OLD.city, OLD.neighborhood, 
        OLD.status, OLD.views_count, OLD.created_at
    );
    RETURN OLD;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS trg_archive_deleted_ad ON public.ads;
CREATE TRIGGER trg_archive_deleted_ad
BEFORE DELETE ON public.ads
FOR EACH ROW
EXECUTE FUNCTION public.archive_deleted_ad();

-- 4. Cleanup task (Manual or pg_cron)
-- DELETE FROM ads_archive WHERE archived_at < NOW() - INTERVAL '30 days';
