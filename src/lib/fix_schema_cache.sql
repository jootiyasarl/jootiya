-- RUN THIS IN SUPABASE SQL EDITOR

-- 1. Ensure updated_at column exists (just in case)
ALTER TABLE public.ads 
ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW();

-- 2. Force schema cache reload
NOTIFY pgrst, 'reload schema';
