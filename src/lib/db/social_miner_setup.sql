-- Create user_networks table to store Google Contacts
CREATE TABLE IF NOT EXISTS public.user_networks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    contact_name TEXT,
    contact_email TEXT,
    contact_phone TEXT,
    source TEXT DEFAULT 'google_contacts',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, contact_email)
);

-- Enable RLS
ALTER TABLE public.user_networks ENABLE ROW LEVEL SECURITY;

-- Policies: Only user can see their own network
CREATE POLICY "Users can view their own network" 
ON public.user_networks FOR SELECT 
USING (auth.uid() = user_id);

-- Update profiles table for smart profiling
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS profiling_tags TEXT[];
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS last_sync_contacts TIMESTAMP WITH TIME ZONE;
