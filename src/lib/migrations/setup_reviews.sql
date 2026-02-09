-- Create Reviews Table
CREATE TABLE IF NOT EXISTS public.reviews (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    seller_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    buyer_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    ad_id UUID NOT NULL REFERENCES public.ads(id) ON DELETE CASCADE,
    rating INTEGER CHECK (rating >= 1 AND rating <= 5),
    comment TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    
    -- Constraint: One review per buyer per ad
    UNIQUE(buyer_id, ad_id)
);

-- RLS
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;

-- Everyone can read reviews
DROP POLICY IF EXISTS "Reviews are public" ON public.reviews;
CREATE POLICY "Reviews are public" ON public.reviews
    FOR SELECT USING (true);

-- Authenticated users can create reviews
DROP POLICY IF EXISTS "Users can create reviews" ON public.reviews;
CREATE POLICY "Users create reviews" ON public.reviews
    FOR INSERT WITH CHECK (auth.uid() = buyer_id);

-- Helper function to get seller stats
-- Returns average rating and count
CREATE OR REPLACE FUNCTION public.get_seller_stats(target_seller_id UUID)
RETURNS TABLE (avg_rating NUMERIC, total_reviews BIGINT) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        ROUND(AVG(rating)::numeric, 1) as avg_rating,
        COUNT(*) as total_reviews
    FROM public.reviews
    WHERE seller_id = target_seller_id;
END;
$$ LANGUAGE plpgsql STABLE;
