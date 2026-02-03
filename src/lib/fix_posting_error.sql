-- RUN THESE SQL COMMANDS IN YOUR SUPABASE SQL EDITOR

-- 1. Ensure the 'ad-images' storage bucket exists and is public
INSERT INTO storage.buckets (id, name, public)
VALUES ('ad-images', 'ad-images', true)
ON CONFLICT (id) DO NOTHING;

-- 2. Allow anyone to VIEW images (Public Access)
CREATE POLICY "Public Access" ON storage.objects FOR SELECT USING (bucket_id = 'ad-images');

-- 3. Allow authenticated users to UPLOAD images
CREATE POLICY "Authenticated users can upload" ON storage.objects FOR INSERT 
WITH CHECK (
  bucket_id = 'ad-images' 
  AND auth.role() = 'authenticated'
);

-- 4. Allow users to DELETE their own images
CREATE POLICY "Users can delete own images" ON storage.objects FOR DELETE
USING (
  bucket_id = 'ad-images' 
  AND (storage.foldername(name))[1] = auth.uid()::text
);

-- 5. Fix possible schema mismatch in 'ads' table
ALTER TABLE public.ads 
ADD COLUMN IF NOT EXISTS image_urls TEXT[] DEFAULT '{}',
ADD COLUMN IF NOT EXISTS city TEXT,
ADD COLUMN IF NOT EXISTS neighborhood TEXT,
ADD COLUMN IF NOT EXISTS category TEXT,
ADD COLUMN IF NOT EXISTS slug TEXT UNIQUE;
