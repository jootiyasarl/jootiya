-- 1. DROP the existing table to start fresh since it has wrong column names (target_id instead of ad_id)
DROP TABLE IF EXISTS public.reports CASCADE;

-- 2. Create the reports table with the correct schema expected by the UI
CREATE TABLE public.reports (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    reporter_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
    reporter_email text,
    reporter_name text,
    ad_id uuid REFERENCES public.ads(id) ON DELETE CASCADE,
    reported_user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
    target_type text NOT NULL CHECK (target_type IN ('ad', 'user', 'review')),
    reason text NOT NULL,
    description text,
    status text NOT NULL DEFAULT 'open' CHECK (status IN ('open', 'investigating', 'resolved', 'dismissed')),
    created_at timestamptz DEFAULT now() NOT NULL,
    updated_at timestamptz DEFAULT now() NOT NULL
);

-- 3. Enable Row Level Security
ALTER TABLE public.reports ENABLE ROW LEVEL SECURITY;

-- 4. Create Policies
CREATE POLICY "Users can create reports" 
    ON public.reports FOR INSERT 
    WITH CHECK (auth.uid() = reporter_id);

CREATE POLICY "Admins can view and manage all reports" 
    ON public.reports FOR ALL 
    USING (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE id = auth.uid()
            AND (role = 'admin' OR role = 'super_admin')
        )
    );

-- 5. Create or Replace updated_at function
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS trigger AS $$
BEGIN
    new.updated_at = now();
    RETURN new;
END;
$$ LANGUAGE plpgsql;

-- 6. Create Trigger
CREATE TRIGGER set_reports_updated_at 
    BEFORE UPDATE ON public.reports 
    FOR EACH ROW 
    EXECUTE FUNCTION public.handle_updated_at();
