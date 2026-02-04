-- RUN THIS IN SUPABASE SQL EDITOR

-- 1. Add missing username column
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS username TEXT UNIQUE;

-- 2. Force schema cache reload
NOTIFY pgrst, 'reload schema';
