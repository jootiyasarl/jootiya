-- Migration: Add Review Moderation
-- 1. Add role column to profiles if not exists (Middleware needs this)
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS role TEXT DEFAULT 'buyer';

-- 2. Add status column to reviews
ALTER TABLE public.reviews ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'pending';

-- 3. Add index for performance
CREATE INDEX IF NOT EXISTS idx_reviews_status ON public.reviews(status);

-- 4. Initialize existing reviews to approved
UPDATE public.reviews SET status = 'approved' WHERE status = 'pending';

-- 5. Update seller stats function to only count approved reviews
CREATE OR REPLACE FUNCTION public.get_seller_stats(target_seller_id UUID)
RETURNS TABLE (avg_rating NUMERIC, total_reviews BIGINT) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        ROUND(COALESCE(AVG(rating), 0)::numeric, 1) as avg_rating,
        COUNT(*) as total_reviews
    FROM public.reviews
    WHERE seller_id = target_seller_id AND status = 'approved';
END;
$$ LANGUAGE plpgsql STABLE;

-- 6. Trigger for Auto-Moderation (The "Senior Engineer" Touch)
CREATE OR REPLACE FUNCTION public.auto_moderate_review()
RETURNS TRIGGER AS $$
DECLARE
    good_words TEXT[] := ARRAY[
        'شكراً', 'نقي', 'معقول', 'سريع', 'ممتاز', 'تبرك الله', 
        'top', 'excellent', 'parfait', 'bon', 'original', 'merci', 'mercia',
        'service', 'rapide', 'fiable', 'meryem', 'jootiya'
    ];
    bad_words TEXT[] := ARRAY[
        'خايب', 'شلاهبي', 'نصاب', 'حضي', 'ارناك',
        'arnaque', 'bad', 'nul', 'scam', 'fraud'
    ];
    word TEXT;
    is_good BOOLEAN := false;
    is_bad BOOLEAN := false;
BEGIN
    -- Handle null comment
    IF NEW.comment IS NULL OR NEW.comment = '' THEN
        NEW.status := 'pending';
        RETURN NEW;
    END IF;

    -- Check for bad words first
    FOREACH word IN ARRAY bad_words
    LOOP
        IF NEW.comment ILIKE '%' || word || '%' THEN
            is_bad := true;
            EXIT;
        END IF;
    END LOOP;

    IF is_bad OR NEW.rating < 3 THEN
        NEW.status := 'pending';
        RETURN NEW;
    END IF;

    -- Check if rating is 5 and has good words
    IF NEW.rating = 5 THEN
        FOREACH word IN ARRAY good_words
        LOOP
            IF NEW.comment ILIKE '%' || word || '%' THEN
                is_good := true;
                EXIT;
            END IF;
        END LOOP;
        
        IF is_good THEN
            NEW.status := 'approved';
        END IF;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_auto_moderate_review ON public.reviews;
CREATE TRIGGER trg_auto_moderate_review
BEFORE INSERT ON public.reviews
FOR EACH ROW
EXECUTE FUNCTION public.auto_moderate_review();

-- 7. RLS Policies for Admin
-- Allow admin to delete/update reviews
DROP POLICY IF EXISTS "Admin can manage reviews" ON public.reviews;
CREATE POLICY "Admin can manage reviews" ON public.reviews
    FOR ALL 
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.profiles 
            WHERE profiles.id = auth.uid() AND profiles.role IN ('admin', 'super_admin')
        )
    );

-- Update Public Access to only approved reviews
DROP POLICY IF EXISTS "Reviews are public" ON public.reviews;
CREATE POLICY "Reviews are public" ON public.reviews
    FOR SELECT USING (status = 'approved');
