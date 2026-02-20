-- 1. Create referrals table first
CREATE TABLE IF NOT EXISTS public.referrals (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    ad_id UUID REFERENCES public.ads(id) ON DELETE CASCADE,
    referrer_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    visitor_ip TEXT,
    visitor_ua TEXT,
    fingerprint TEXT,
    is_valid BOOLEAN DEFAULT TRUE,
    rejection_reason TEXT,
    time_on_page INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Add columns to ads table if they don't exist
ALTER TABLE public.ads ADD COLUMN IF NOT EXISTS featured_until TIMESTAMP WITH TIME ZONE;
ALTER TABLE public.ads ADD COLUMN IF NOT EXISTS referral_count INTEGER DEFAULT 0;

-- 3. Add columns to profiles table if they don't exist
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS is_ghost_banned BOOLEAN DEFAULT FALSE;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS viral_flag_count INTEGER DEFAULT 0;

-- 4. Create robust unique index
DROP INDEX IF EXISTS unique_referral_idx;
CREATE UNIQUE INDEX unique_referral_idx ON public.referrals (ad_id, fingerprint);

-- 5. Enable RLS
ALTER TABLE public.referrals ENABLE ROW LEVEL SECURITY;

-- 6. Policies
DROP POLICY IF EXISTS "Public referrals are readable by ad owner" ON public.referrals;
CREATE POLICY "Public referrals are readable by ad owner" 
ON public.referrals FOR SELECT 
USING (auth.uid() IN (SELECT user_id FROM public.ads WHERE id = referrals.ad_id));

-- 7. Ghost Ban & Flagging Function
CREATE OR REPLACE FUNCTION increment_viral_flag(target_user_id UUID)
RETURNS void AS $$
BEGIN
    UPDATE public.profiles
    SET viral_flag_count = COALESCE(viral_flag_count, 0) + 1,
        is_ghost_banned = CASE 
            WHEN COALESCE(viral_flag_count, 0) + 1 >= 3 THEN TRUE 
            ELSE is_ghost_banned 
        END
    WHERE id = target_user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 8. Viral Promotion Logic with Ghost Ban
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
    SELECT user_id INTO v_seller_id FROM public.ads WHERE id = v_ad_id;
    SELECT is_ghost_banned INTO v_is_ghost_banned FROM public.profiles WHERE id = v_seller_id;

    -- Count ONLY valid referrals
    SELECT COUNT(*) INTO v_count 
    FROM public.referrals 
    WHERE ad_id = v_ad_id AND is_valid = TRUE;

    -- Ghost Ban Logic: Cap at 4 if user is ghost banned
    IF v_is_ghost_banned IS TRUE AND v_count >= 5 THEN
        v_count := 4;
    END IF;

    -- Update referral count in ads table
    UPDATE public.ads SET referral_count = v_count WHERE id = v_ad_id;

    -- Promotion logic: If valid referrals hit 5 and NOT ghost banned
    IF v_count >= 5 AND (v_is_ghost_banned IS FALSE OR v_is_ghost_banned IS NULL) THEN
        UPDATE public.ads 
        SET is_featured = true,
            featured_until = NOW() + INTERVAL '3 days'
        WHERE id = v_ad_id AND (is_featured = false OR featured_until < NOW());
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 9. Re-create Trigger
DROP TRIGGER IF EXISTS on_referral_added ON public.referrals;
CREATE TRIGGER on_referral_added
AFTER INSERT ON public.referrals
FOR EACH ROW EXECUTE FUNCTION handle_viral_promotion();
