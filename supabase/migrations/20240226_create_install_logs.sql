-- Create install_logs table to track PWA installations
CREATE TABLE IF NOT EXISTS public.install_logs (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    platform TEXT, -- 'web', 'android', 'ios'
    user_agent TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable Row Level Security
ALTER TABLE public.install_logs ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Anyone can insert an install log" 
ON public.install_logs FOR INSERT 
WITH CHECK (true);

CREATE POLICY "Admins can view all install logs" 
ON public.install_logs FOR SELECT 
USING (auth.jwt() ->> 'email' = 'jootiyasarl@gmail.com');
