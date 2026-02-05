-- Add phone column to profiles table
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS phone TEXT;

-- Policy to allow everyone to read phone numbers (for contact)
-- Existing select policy "Public profiles are viewable by everyone" should cover this if checking `true`.
-- But let's verify if we want to restrict it. For now, marketplaces usually show phone numbers publicly or to logged in users.
-- The existing policy is `USING (true)`, so it's public.
