-- ============================================
-- Smart Search Engine Migration
-- ============================================
-- This migration enables fuzzy search, autocomplete, and intelligent search
-- with weighted results (title > description)

-- 1. Enable pg_trgm Extension for Fuzzy Matching
CREATE EXTENSION IF NOT EXISTS pg_trgm;

-- 2. Create Full-Text Search Indexes
-- GIN index for trigram-based fuzzy matching on title
CREATE INDEX IF NOT EXISTS idx_ads_title_trgm ON public.ads USING gin (title gin_trgm_ops);

-- GIN index for trigram-based fuzzy matching on description
CREATE INDEX IF NOT EXISTS idx_ads_description_trgm ON public.ads USING gin (description gin_trgm_ops);

-- Full-text search index for title (Arabic support)
CREATE INDEX IF NOT EXISTS idx_ads_title_fts ON public.ads USING gin (to_tsvector('arabic', coalesce(title, '')));

-- Full-text search index for description (Arabic support)
CREATE INDEX IF NOT EXISTS idx_ads_description_fts ON public.ads USING gin (to_tsvector('arabic', coalesce(description, '')));

-- 3. Smart Search Function with Weighting
-- Searches both title and description with fuzzy matching
-- Title matches are weighted higher than description matches
-- NOW INCLUDES: Semantic tags search for multilingual/dialect support
CREATE OR REPLACE FUNCTION public.search_ads_smart(
    search_query TEXT,
    similarity_threshold FLOAT DEFAULT 0.3,
    result_limit INT DEFAULT 20
)
RETURNS TABLE (
    id UUID,
    seller_id UUID,
    title TEXT,
    description TEXT,
    price DECIMAL,
    currency TEXT,
    image_urls TEXT[],
    city TEXT,
    neighborhood TEXT,
    category TEXT,
    created_at TIMESTAMPTZ,
    views_count INT,
    rank REAL,
    similarity REAL
) AS $$
DECLARE
    search_words TEXT[];
BEGIN
    -- Split search query into words for tag matching
    search_words := string_to_array(lower(search_query), ' ');
    
    RETURN QUERY
    SELECT 
        a.id,
        a.seller_id,
        a.title,
        a.description,
        a.price,
        a.currency,
        a.image_urls,
        a.city,
        a.neighborhood,
        a.category,
        a.created_at,
        a.views_count,
        -- Weighted ranking: title (A) > description (B)
        ts_rank(
            setweight(to_tsvector('arabic', coalesce(a.title, '')), 'A') ||
            setweight(to_tsvector('arabic', coalesce(a.description, '')), 'B'),
            plainto_tsquery('arabic', search_query)
        ) AS rank,
        -- Trigram similarity for fuzzy matching
        GREATEST(
            similarity(a.title, search_query),
            similarity(coalesce(a.description, ''), search_query)
        ) AS similarity
    FROM public.ads a
    WHERE 
        a.status = 'approved'
        AND (
            -- Full-text search match
            (
                setweight(to_tsvector('arabic', coalesce(a.title, '')), 'A') ||
                setweight(to_tsvector('arabic', coalesce(a.description, '')), 'B')
            ) @@ plainto_tsquery('arabic', search_query)
            OR
            -- Fuzzy match on title
            similarity(a.title, search_query) > similarity_threshold
            OR
            -- Fuzzy match on description
            similarity(coalesce(a.description, ''), search_query) > similarity_threshold
            OR
            -- NEW: Semantic tags search (multilingual/dialect support)
            (
                a.search_tags IS NOT NULL 
                AND a.search_tags && search_words
            )
        )
    ORDER BY rank DESC, similarity DESC, a.created_at DESC
    LIMIT result_limit;
END;
$$ LANGUAGE plpgsql STABLE;

-- 4. Autocomplete Function
-- Fast prefix matching for real-time suggestions
CREATE OR REPLACE FUNCTION public.autocomplete_ads(
    search_prefix TEXT,
    result_limit INT DEFAULT 5
)
RETURNS TABLE (
    id UUID,
    title TEXT,
    price DECIMAL,
    currency TEXT,
    image_url TEXT
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        a.id,
        a.title,
        a.price,
        a.currency,
        CASE 
            WHEN array_length(a.image_urls, 1) > 0 THEN a.image_urls[1]
            ELSE NULL
        END AS image_url
    FROM public.ads a
    WHERE 
        a.status = 'approved'
        AND (
            -- Prefix match on title
            a.title ILIKE search_prefix || '%'
            OR
            -- Trigram similarity for fuzzy prefix matching
            similarity(a.title, search_prefix) > 0.3
        )
    ORDER BY 
        -- Exact prefix matches first
        CASE WHEN a.title ILIKE search_prefix || '%' THEN 0 ELSE 1 END,
        -- Then by similarity
        similarity(a.title, search_prefix) DESC,
        -- Then by popularity
        a.views_count DESC,
        -- Finally by recency
        a.created_at DESC
    LIMIT result_limit;
END;
$$ LANGUAGE plpgsql STABLE;

-- 5. Similar Ads Function (Fallback for No Results)
-- Returns suggested ads when search returns no results
CREATE OR REPLACE FUNCTION public.get_similar_ads(
    search_category TEXT DEFAULT NULL,
    search_city TEXT DEFAULT NULL,
    result_limit INT DEFAULT 8
)
RETURNS TABLE (
    id UUID,
    seller_id UUID,
    title TEXT,
    description TEXT,
    price DECIMAL,
    currency TEXT,
    image_urls TEXT[],
    city TEXT,
    neighborhood TEXT,
    category TEXT,
    created_at TIMESTAMPTZ,
    views_count INT
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        a.id,
        a.seller_id,
        a.title,
        a.description,
        a.price,
        a.currency,
        a.image_urls,
        a.city,
        a.neighborhood,
        a.category,
        a.created_at,
        a.views_count
    FROM public.ads a
    WHERE 
        a.status = 'approved'
        AND (
            -- Match category if provided
            (search_category IS NULL OR a.category = search_category)
            OR
            -- Match city if provided
            (search_city IS NULL OR a.city = search_city)
        )
    ORDER BY 
        -- Prioritize same category and city
        CASE 
            WHEN a.category = search_category AND a.city = search_city THEN 0
            WHEN a.category = search_category THEN 1
            WHEN a.city = search_city THEN 2
            ELSE 3
        END,
        -- Then by popularity
        a.views_count DESC,
        -- Finally by recency
        a.created_at DESC
    LIMIT result_limit;
END;
$$ LANGUAGE plpgsql STABLE;

-- 6. Create indexes for better performance on filters
CREATE INDEX IF NOT EXISTS idx_ads_category ON public.ads (category) WHERE status = 'approved';
CREATE INDEX IF NOT EXISTS idx_ads_city ON public.ads (city) WHERE status = 'approved';
CREATE INDEX IF NOT EXISTS idx_ads_status_created ON public.ads (status, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_ads_views_count ON public.ads (views_count DESC) WHERE status = 'approved';
