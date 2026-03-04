-- ============================================
-- Semantic Search Tags System
-- ============================================
-- Automatically generates multilingual and dialect-aware keywords
-- for better search discoverability

-- 1. Add search_tags column to ads table
ALTER TABLE public.ads ADD COLUMN IF NOT EXISTS search_tags TEXT[];

-- Create GIN index for fast array search
CREATE INDEX IF NOT EXISTS idx_ads_search_tags ON public.ads USING gin(search_tags);

-- 2. Create Semantic Keywords Mapping Table
CREATE TABLE IF NOT EXISTS public.semantic_keywords (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    keyword TEXT NOT NULL,
    category TEXT,
    synonyms TEXT[] NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create index for fast keyword lookup
CREATE INDEX IF NOT EXISTS idx_semantic_keywords_keyword ON public.semantic_keywords (keyword);
CREATE INDEX IF NOT EXISTS idx_semantic_keywords_category ON public.semantic_keywords (category);

-- 3. Insert Semantic Keyword Mappings

-- Vehicles
INSERT INTO public.semantic_keywords (keyword, category, synonyms) VALUES
('voiture', 'vehicles', ARRAY['car', 'auto', 'automobile', 'vehicule']),
('car', 'vehicles', ARRAY['voiture', 'vehicle', 'auto']),
('mercedes', 'vehicles', ARRAY['Mercedes', 'Benz', 'car']),
('bmw', 'vehicles', ARRAY['car']),
('toyota', 'vehicles', ARRAY['car']),
('renault', 'vehicles', ARRAY['car']),
('peugeot', 'vehicles', ARRAY['car'])
ON CONFLICT DO NOTHING;

-- Electronics - Phones
INSERT INTO public.semantic_keywords (keyword, category, synonyms) VALUES
('telephone', 'electronics', ARRAY['phone', 'smartphone', 'mobile']),
('phone', 'electronics', ARRAY['telephone', 'smartphone', 'mobile']),
('smartphone', 'electronics', ARRAY['telephone', 'phone', 'mobile']),
('iphone', 'electronics', ARRAY['iPhone', 'Apple', 'phone']),
('samsung', 'electronics', ARRAY['Samsung', 'phone'])
ON CONFLICT DO NOTHING;

-- Electronics - Computers
INSERT INTO public.semantic_keywords (keyword, category, synonyms) VALUES
('ordinateur', 'electronics', ARRAY['computer', 'pc', 'laptop']),
('computer', 'electronics', ARRAY['ordinateur', 'pc', 'laptop']),
('laptop', 'electronics', ARRAY['portable', 'ordinateur']),
('portable', 'electronics', ARRAY['laptop', 'ordinateur'])
ON CONFLICT DO NOTHING;

-- Electronics - TV
INSERT INTO public.semantic_keywords (keyword, category, synonyms) VALUES
('television', 'electronics', ARRAY['tv', 'tele']),
('tv', 'electronics', ARRAY['television', 'tele'])
ON CONFLICT DO NOTHING;

-- Furniture
INSERT INTO public.semantic_keywords (keyword, category, synonyms) VALUES
('meuble', 'furniture', ARRAY['furniture', 'mobilier']),
('canape', 'furniture', ARRAY['sofa', 'meuble']),
('sofa', 'furniture', ARRAY['canape', 'meuble']),
('table', 'furniture', ARRAY['meuble']),
('lit', 'furniture', ARRAY['bed', 'meuble']),
('bed', 'furniture', ARRAY['lit', 'meuble'])
ON CONFLICT DO NOTHING;

-- Clothing
INSERT INTO public.semantic_keywords (keyword, category, synonyms) VALUES
('vetements', 'clothing', ARRAY['clothes', 'mode']),
('chemise', 'clothing', ARRAY['shirt', 'mode']),
('shirt', 'clothing', ARRAY['chemise', 'mode']),
('pantalon', 'clothing', ARRAY['pants', 'mode']),
('chaussures', 'clothing', ARRAY['shoes', 'mode'])
ON CONFLICT DO NOTHING;

-- Real Estate
INSERT INTO public.semantic_keywords (keyword, category, synonyms) VALUES
('maison', 'real_estate', ARRAY['house', 'villa']),
('house', 'real_estate', ARRAY['maison', 'villa']),
('appartement', 'real_estate', ARRAY['flat', 'studio']),
('terrain', 'real_estate', ARRAY['land'])
ON CONFLICT DO NOTHING;

-- 4. Function to Generate Search Tags
CREATE OR REPLACE FUNCTION public.generate_search_tags(
    ad_title TEXT,
    ad_description TEXT,
    ad_category TEXT
)
RETURNS TEXT[] AS $$
DECLARE
    tags TEXT[] := ARRAY[]::TEXT[];
    word TEXT;
    word_clean TEXT;
    synonyms TEXT[];
BEGIN
    -- Extract words from title (split by spaces and common punctuation)
    FOR word IN 
        SELECT unnest(string_to_array(lower(ad_title), ' '))
    LOOP
        -- Clean the word (remove punctuation)
        word_clean := regexp_replace(word, '[^\w\u0600-\u06FF]', '', 'g');
        
        IF length(word_clean) > 2 THEN
            -- Add the word itself
            tags := array_append(tags, word_clean);
            
            -- Look up synonyms
            SELECT sk.synonyms INTO synonyms
            FROM public.semantic_keywords sk
            WHERE lower(sk.keyword) = word_clean
            LIMIT 1;
            
            -- Add synonyms if found
            IF synonyms IS NOT NULL THEN
                tags := tags || synonyms;
            END IF;
        END IF;
    END LOOP;
    
    -- Add category-based keywords
    IF ad_category IS NOT NULL THEN
        SELECT array_agg(DISTINCT unnest_val)
        INTO synonyms
        FROM (
            SELECT unnest(sk.synonyms) as unnest_val
            FROM public.semantic_keywords sk
            WHERE sk.category = lower(ad_category)
            LIMIT 10
        ) sub;
        
        IF synonyms IS NOT NULL THEN
            tags := tags || synonyms;
        END IF;
    END IF;
    
    -- Remove duplicates and nulls
    SELECT array_agg(DISTINCT tag)
    INTO tags
    FROM unnest(tags) AS tag
    WHERE tag IS NOT NULL AND length(tag) > 1;
    
    RETURN tags;
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- 5. Trigger Function to Auto-Generate Tags
CREATE OR REPLACE FUNCTION public.auto_generate_search_tags()
RETURNS TRIGGER AS $$
BEGIN
    -- Generate tags based on title, description, and category
    NEW.search_tags := generate_search_tags(
        NEW.title,
        NEW.description,
        NEW.category
    );
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 6. Create Trigger on Ads Table
DROP TRIGGER IF EXISTS trg_auto_generate_search_tags ON public.ads;
CREATE TRIGGER trg_auto_generate_search_tags
BEFORE INSERT OR UPDATE OF title, description, category ON public.ads
FOR EACH ROW
EXECUTE FUNCTION public.auto_generate_search_tags();

-- 7. Backfill existing ads with search tags
UPDATE public.ads
SET search_tags = generate_search_tags(title, description, category)
WHERE search_tags IS NULL OR array_length(search_tags, 1) IS NULL;
