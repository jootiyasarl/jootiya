-- RUN THIS IN SUPABASE SQL EDITOR

-- 1. Fix missing columns in profiles table
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS avatar_url TEXT,
ADD COLUMN IF NOT EXISTS full_name TEXT;

-- 2. Force schema cache reload to ensure API sees the new columns
NOTIFY pgrst, 'reload schema';
