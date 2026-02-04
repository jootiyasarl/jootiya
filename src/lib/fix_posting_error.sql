-- RUN THESE SQL COMMANDS IN YOUR SUPABASE SQL EDITOR

-- 1. Ensure the 'ad-images' storage bucket exists and is public
INSERT INTO storage.buckets (id, name, public)
VALUES ('ad-images', 'ad-images', true)
ON CONFLICT (id) DO NOTHING;

-- 2. Allow anyone to VIEW images (Public Access)
DROP POLICY IF EXISTS "Public Access" ON storage.objects;
CREATE POLICY "Public Access" ON storage.objects FOR SELECT USING (bucket_id = 'ad-images');

-- 3. Allow authenticated users to UPLOAD images
DROP POLICY IF EXISTS "Authenticated users can upload" ON storage.objects;
CREATE POLICY "Authenticated users can upload" ON storage.objects FOR INSERT 
WITH CHECK (
  bucket_id = 'ad-images' 
  AND auth.role() = 'authenticated'
);

-- 4. Allow users to DELETE their own images
DROP POLICY IF EXISTS "Users can delete own images" ON storage.objects;
CREATE POLICY "Users can delete own images" ON storage.objects FOR DELETE
USING (
  bucket_id = 'ad-images' 
  AND (storage.foldername(name))[1] = auth.uid()::text
);

-- 6. FORCE RELOAD CACHE (Fixes "Could not find column in schema cache")
NOTIFY pgrst, 'reload schema';

-- 7. If the column still exists and is causing trouble, we can drop it 
-- (ONLY run this if you are sure you copied data to city/neighborhood)
-- ALTER TABLE public.ads DROP COLUMN IF EXISTS location;
