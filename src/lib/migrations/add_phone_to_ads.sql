-- Add phone column to ads table
ALTER TABLE public.ads 
ADD COLUMN IF NOT EXISTS phone TEXT;

-- Refresh PostgREST cache (Supabase does this automatically usually, but sometimes a manual nudge helps)
-- NOTIFY pgrst, 'reload schema'; 
