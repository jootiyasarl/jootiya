-- Create site_settings table
CREATE TABLE IF NOT EXISTS public.site_settings (
    id text PRIMARY KEY DEFAULT 'site',
    site_name text,
    site_tagline text,
    primary_domain text,
    default_seo_title text,
    default_seo_description text,
    default_seo_image_url text,
    terms_url text,
    privacy_url text,
    contact_email text,
    contact_phone text,
    contact_address text,
    created_at timestamptz DEFAULT now() NOT NULL,
    updated_at timestamptz DEFAULT now() NOT NULL,
    CONSTRAINT single_row CHECK (id = 'site')
);

-- Enable RLS
ALTER TABLE public.site_settings ENABLE ROW LEVEL SECURITY;

-- Create Policies
CREATE POLICY "Public can view site settings" 
    ON public.site_settings FOR SELECT 
    USING (true);

CREATE POLICY "Admins can manage site settings" 
    ON public.site_settings FOR ALL 
    USING (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE id = auth.uid()
            AND (role = 'admin' OR role = 'super_admin')
        )
    );

-- Initial insert if not exists
INSERT INTO public.site_settings (id, site_name)
VALUES ('site', 'Jootiya')
ON CONFLICT (id) DO NOTHING;

-- Trigger for updated_at
DROP TRIGGER IF EXISTS set_site_settings_updated_at ON public.site_settings;
CREATE TRIGGER set_site_settings_updated_at 
    BEFORE UPDATE ON public.site_settings 
    FOR EACH ROW 
    EXECUTE FUNCTION public.handle_updated_at();
