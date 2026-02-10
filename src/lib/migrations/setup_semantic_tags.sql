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

-- Vehicles (مركبات)
INSERT INTO public.semantic_keywords (keyword, category, synonyms) VALUES
('سيارة', 'vehicles', ARRAY['طنوبيل', 'طوموبيل', 'توموبيل', 'مركبة', 'عربة', 'car', 'voiture', 'vehicle', 'auto', 'automobile']),
('طنوبيل', 'vehicles', ARRAY['سيارة', 'طوموبيل', 'توموبيل', 'مركبة', 'عربة', 'car', 'voiture', 'vehicle']),
('car', 'vehicles', ARRAY['سيارة', 'طنوبيل', 'طوموبيل', 'مركبة', 'voiture', 'vehicle', 'auto']),
('voiture', 'vehicles', ARRAY['سيارة', 'طنوبيل', 'car', 'vehicle', 'مركبة']),
('مرسيدس', 'vehicles', ARRAY['Mercedes', 'Benz', 'سيارة', 'طنوبيل', 'car']),
('Mercedes', 'vehicles', ARRAY['مرسيدس', 'Benz', 'سيارة', 'car']),
('BMW', 'vehicles', ARRAY['بي ام دبليو', 'سيارة', 'طنوبيل', 'car']),
('Toyota', 'vehicles', ARRAY['تويوتا', 'سيارة', 'طنوبيل', 'car']),
('Renault', 'vehicles', ARRAY['رينو', 'سيارة', 'طنوبيل', 'car']),
('Peugeot', 'vehicles', ARRAY['بيجو', 'سيارة', 'طنوبيل', 'car'])
ON CONFLICT DO NOTHING;

-- Electronics - Phones (هواتف)
INSERT INTO public.semantic_keywords (keyword, category, synonyms) VALUES
('هاتف', 'electronics', ARRAY['تيليفون', 'موبايل', 'جوال', 'phone', 'smartphone', 'téléphone', 'mobile']),
('تيليفون', 'electronics', ARRAY['هاتف', 'موبايل', 'جوال', 'phone', 'smartphone', 'téléphone']),
('موبايل', 'electronics', ARRAY['هاتف', 'تيليفون', 'جوال', 'phone', 'smartphone', 'mobile']),
('phone', 'electronics', ARRAY['هاتف', 'تيليفون', 'موبايل', 'smartphone', 'téléphone']),
('smartphone', 'electronics', ARRAY['هاتف', 'تيليفون', 'موبايل', 'phone', 'téléphone']),
('iPhone', 'electronics', ARRAY['ايفون', 'آيفون', 'Apple', 'هاتف', 'تيليفون', 'phone']),
('ايفون', 'electronics', ARRAY['iPhone', 'آيفون', 'Apple', 'هاتف', 'phone']),
('Samsung', 'electronics', ARRAY['سامسونج', 'سامسونغ', 'هاتف', 'phone']),
('سامسونج', 'electronics', ARRAY['Samsung', 'سامسونغ', 'هاتف', 'phone'])
ON CONFLICT DO NOTHING;

-- Electronics - Computers (حواسيب)
INSERT INTO public.semantic_keywords (keyword, category, synonyms) VALUES
('كمبيوتر', 'electronics', ARRAY['حاسوب', 'كومبيوتر', 'ordinateur', 'computer', 'PC']),
('حاسوب', 'electronics', ARRAY['كمبيوتر', 'كومبيوتر', 'ordinateur', 'computer', 'PC']),
('ordinateur', 'electronics', ARRAY['كمبيوتر', 'حاسوب', 'computer', 'PC']),
('computer', 'electronics', ARRAY['كمبيوتر', 'حاسوب', 'ordinateur', 'PC']),
('laptop', 'electronics', ARRAY['لابتوب', 'حاسوب محمول', 'portable', 'كمبيوتر محمول']),
('لابتوب', 'electronics', ARRAY['laptop', 'حاسوب محمول', 'portable', 'كمبيوتر'])
ON CONFLICT DO NOTHING;

-- Electronics - TV (تلفاز)
INSERT INTO public.semantic_keywords (keyword, category, synonyms) VALUES
('تلفاز', 'electronics', ARRAY['تلفزيون', 'TV', 'télévision', 'television']),
('تلفزيون', 'electronics', ARRAY['تلفاز', 'TV', 'télévision', 'television']),
('TV', 'electronics', ARRAY['تلفاز', 'تلفزيون', 'télévision', 'television'])
ON CONFLICT DO NOTHING;

-- Furniture (أثاث)
INSERT INTO public.semantic_keywords (keyword, category, synonyms) VALUES
('أثاث', 'furniture', ARRAY['meuble', 'furniture', 'mobilier']),
('كنبة', 'furniture', ARRAY['صالون', 'canapé', 'sofa', 'أثاث']),
('صالون', 'furniture', ARRAY['كنبة', 'canapé', 'sofa', 'أثاث']),
('canapé', 'furniture', ARRAY['كنبة', 'صالون', 'sofa', 'أثاث']),
('sofa', 'furniture', ARRAY['كنبة', 'صالون', 'canapé', 'أثاث']),
('طاولة', 'furniture', ARRAY['table', 'mesa', 'أثاث']),
('table', 'furniture', ARRAY['طاولة', 'mesa', 'أثاث']),
('سرير', 'furniture', ARRAY['فراش', 'lit', 'bed', 'أثاث']),
('lit', 'furniture', ARRAY['سرير', 'فراش', 'bed', 'أثاث']),
('bed', 'furniture', ARRAY['سرير', 'فراش', 'lit', 'أثاث'])
ON CONFLICT DO NOTHING;

-- Clothing (ملابس)
INSERT INTO public.semantic_keywords (keyword, category, synonyms) VALUES
('ملابس', 'clothing', ARRAY['لباس', 'vêtements', 'clothes', 'clothing']),
('قميص', 'clothing', ARRAY['chemise', 'shirt', 'ملابس']),
('chemise', 'clothing', ARRAY['قميص', 'shirt', 'ملابس']),
('shirt', 'clothing', ARRAY['قميص', 'chemise', 'ملابس']),
('سروال', 'clothing', ARRAY['بنطلون', 'pantalon', 'pants', 'ملابس']),
('بنطلون', 'clothing', ARRAY['سروال', 'pantalon', 'pants', 'ملابس']),
('pantalon', 'clothing', ARRAY['سروال', 'بنطلون', 'pants', 'ملابس']),
('حذاء', 'clothing', ARRAY['صباط', 'chaussures', 'shoes', 'ملابس']),
('صباط', 'clothing', ARRAY['حذاء', 'chaussures', 'shoes', 'ملابس']),
('chaussures', 'clothing', ARRAY['حذاء', 'صباط', 'shoes', 'ملابس'])
ON CONFLICT DO NOTHING;

-- Real Estate (عقارات)
INSERT INTO public.semantic_keywords (keyword, category, synonyms) VALUES
('دار', 'real_estate', ARRAY['منزل', 'بيت', 'maison', 'house', 'عقار']),
('منزل', 'real_estate', ARRAY['دار', 'بيت', 'maison', 'house', 'عقار']),
('بيت', 'real_estate', ARRAY['دار', 'منزل', 'maison', 'house', 'عقار']),
('maison', 'real_estate', ARRAY['دار', 'منزل', 'بيت', 'house', 'عقار']),
('house', 'real_estate', ARRAY['دار', 'منزل', 'بيت', 'maison', 'عقار']),
('شقة', 'real_estate', ARRAY['appartement', 'apartment', 'عقار']),
('appartement', 'real_estate', ARRAY['شقة', 'apartment', 'عقار']),
('apartment', 'real_estate', ARRAY['شقة', 'appartement', 'عقار']),
('أرض', 'real_estate', ARRAY['terrain', 'land', 'عقار']),
('terrain', 'real_estate', ARRAY['أرض', 'land', 'عقار'])
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
