-- Refine referrals table for Anti-Cheat
ALTER TABLE public.referrals ADD COLUMN IF NOT EXISTS is_valid BOOLEAN DEFAULT TRUE;
ALTER TABLE public.referrals ADD COLUMN IF NOT EXISTS rejection_reason TEXT;
ALTER TABLE public.referrals ADD COLUMN IF NOT EXISTS time_on_page INTEGER DEFAULT 0;

-- Add ghost_ban to profiles
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS is_ghost_banned BOOLEAN DEFAULT FALSE;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS viral_flag_count INTEGER DEFAULT 0;

-- Drop old unique constraint if it exists and create a more robust one
ALTER TABLE public.referrals DROP CONSTRAINT IF EXISTS referrals_ad_id_visitor_ip_visitor_ua_fingerprint_key;
DROP INDEX IF EXISTS unique_referral_idx;
CREATE UNIQUE INDEX IF NOT EXISTS unique_referral_idx ON public.referrals (ad_id, fingerprint);

-- Refined Trigger for Viral Promotion with Anti-Cheat Logic
CREATE OR REPLACE FUNCTION handle_viral_promotion()
RETURNS TRIGGER AS $$
DECLARE
    v_ad_id UUID;
    v_count INTEGER;
    v_seller_id UUID;
    v_is_ghost_banned BOOLEAN;
BEGIN
    v_ad_id := NEW.ad_id;
    
    -- Get seller info
    SELECT seller_id INTO v_seller_id FROM public.ads WHERE id = v_ad_id;
    SELECT is_ghost_banned INTO v_is_ghost_banned FROM public.profiles WHERE id = v_seller_id;

    -- Count ONLY valid referrals
    SELECT COUNT(*) INTO v_count 
    FROM public.referrals 
    WHERE ad_id = v_ad_id AND is_valid = TRUE;

    -- Ghost Ban Logic: Cap at 4 if user is ghost banned
    IF v_is_ghost_banned AND v_count >= 5 THEN
        v_count := 4;
    END IF;

    -- Update referral count in ads table (this drives the UI counter)
    UPDATE public.ads SET referral_count = v_count WHERE id = v_ad_id;

    -- Promotion logic: If valid referrals hit 5 and NOT ghost banned
    IF v_count >= 5 AND NOT v_is_ghost_banned THEN
        UPDATE public.ads 
        SET is_featured = true,
            featured_until = NOW() + INTERVAL '3 days'
        WHERE id = v_ad_id AND (is_featured = false OR featured_until < NOW());
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
