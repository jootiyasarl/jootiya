-- Create user_behavior table for Shadow Tracker
CREATE TABLE IF NOT EXISTS public.user_behavior (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    guest_id TEXT,
    event_type TEXT, -- 'search', 'view'
    ad_id UUID REFERENCES public.ads(id) ON DELETE SET NULL,
    category TEXT,
    query TEXT,
    duration INTEGER, -- time spent in seconds
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.user_behavior ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Users can view their own behavior" 
ON public.user_behavior FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Service role can manage behavior" 
ON public.user_behavior FOR ALL 
USING (true)
WITH CHECK (true);

-- Indexing for performance
CREATE INDEX IF NOT EXISTS idx_user_behavior_user_id ON public.user_behavior(user_id);
CREATE INDEX IF NOT EXISTS idx_user_behavior_guest_id ON public.user_behavior(guest_id);
