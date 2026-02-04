-- Add missing columns for Category Manager
ALTER TABLE public.categories 
ADD COLUMN IF NOT EXISTS description TEXT,
ADD COLUMN IF NOT EXISTS popularity INT DEFAULT 0;
