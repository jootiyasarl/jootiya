-- Create referrals table
CREATE TABLE IF NOT EXISTS public.referrals (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    ad_id UUID REFERENCES public.ads(id) ON DELETE CASCADE,
    referrer_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    visitor_ip TEXT,
    visitor_ua TEXT,
    fingerprint TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(ad_id, visitor_ip, visitor_ua, fingerprint)
);

-- Enable RLS
ALTER TABLE public.referrals ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Public referrals are readable by ad owner" 
ON public.referrals FOR SELECT 
USING (auth.uid() IN (SELECT user_id FROM public.ads WHERE id = referrals.ad_id));

-- Add columns to ads table if they don't exist
ALTER TABLE public.ads 
ADD COLUMN IF NOT EXISTS featured_until TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS referral_count INTEGER DEFAULT 0;

-- Function to handle viral promotion
CREATE OR REPLACE FUNCTION handle_viral_promotion()
RETURNS TRIGGER AS $$
DECLARE
    v_ad_id UUID;
    v_count INTEGER;
BEGIN
    v_ad_id := NEW.ad_id;
    
    -- Update referral count in ads table
    SELECT COUNT(*) INTO v_count FROM public.referrals WHERE ad_id = v_ad_id;
    UPDATE public.ads SET referral_count = v_count WHERE id = v_ad_id;

    -- Promotion logic: If referrals hit 5
    IF v_count >= 5 THEN
        UPDATE public.ads 
        SET is_featured = true,
            featured_until = NOW() + INTERVAL '3 days'
        WHERE id = v_ad_id AND (is_featured = false OR featured_until < NOW());
        
        -- Optional: Logic to send notification could be added here or via Edge Function
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger for viral promotion
DROP TRIGGER IF EXISTS on_referral_added ON public.referrals;
CREATE TRIGGER on_referral_added
AFTER INSERT ON public.referrals
FOR EACH ROW EXECUTE FUNCTION handle_viral_promotion();
