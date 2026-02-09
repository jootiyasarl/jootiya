-- Migration: Setup Support & Reporting System

-- 1. Reports Table (for Ads and Users)
CREATE TABLE IF NOT EXISTS public.reports (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    target_type TEXT NOT NULL, -- 'ad', 'user'
    ad_id UUID REFERENCES public.ads(id) ON DELETE CASCADE,
    reported_user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    reporter_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    reporter_email TEXT,
    reporter_name TEXT,
    reason TEXT NOT NULL, -- 'احتيال', 'محتوى غير لائق', 'سعر وهمي'
    status TEXT DEFAULT 'open', -- 'open', 'dismissed', 'resolved'
    details JSONB
);

-- 2. Support Tickets Table (Help center)
CREATE TABLE IF NOT EXISTS public.support_tickets (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    user_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    subject TEXT NOT NULL,
    message TEXT NOT NULL,
    email TEXT,
    status TEXT DEFAULT 'pending', -- 'pending', 'in_progress', 'resolved'
    priority TEXT DEFAULT 'medium',
    category TEXT -- 'technical', 'billing', 'general'
);

-- 3. Moderation Logs (Audit trail)
CREATE TABLE IF NOT EXISTS public.moderation_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    action_type TEXT NOT NULL,
    report_id UUID REFERENCES public.reports(id) ON DELETE SET NULL,
    target_type TEXT,
    target_ad_id UUID,
    target_user_id UUID,
    moderator_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    moderator_email TEXT,
    notes TEXT
);

-- 4. Auto-Shadow Ban Logic (Trigger)
-- Feature: If an ad gets >= 3 Scam reports in less than 1 hour, it gets auto-hidden.
CREATE OR REPLACE FUNCTION public.check_ad_scam_reports()
RETURNS TRIGGER AS $$
DECLARE
    scam_report_count INTEGER;
BEGIN
    -- Only act on 'ad' reports with scam-related reasons
    IF NEW.target_type = 'ad' AND NEW.ad_id IS NOT NULL 
       AND (NEW.reason ILIKE '%scam%' OR NEW.reason ILIKE '%fraud%' OR NEW.reason ILIKE '%احتيال%') THEN
        
        -- Count scam reports in the last hour for this specific ad
        SELECT COUNT(*) INTO scam_report_count
        FROM public.reports
        WHERE ad_id = NEW.ad_id
          AND target_type = 'ad'
          AND created_at > NOW() - INTERVAL '1 hour'
          AND (reason ILIKE '%scam%' OR reason ILIKE '%fraud%' OR reason ILIKE '%احتيال%');

        -- If count >= 3, shadow ban the ad by changing its status
        IF scam_report_count >= 3 THEN
            UPDATE public.ads
            SET status = 'pending', -- Setting to pending hides it from public but allows admin review
                description = '[AUTO-MODERATED: SCAM REPORTS] ' || description
            WHERE id = NEW.ad_id;
        END IF;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_check_ad_scam_reports ON public.reports;
CREATE TRIGGER trg_check_ad_scam_reports
AFTER INSERT ON public.reports
FOR EACH ROW
EXECUTE FUNCTION public.check_ad_scam_reports();

-- 5. Row Level Security Policies
ALTER TABLE public.reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.support_tickets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.moderation_logs ENABLE ROW LEVEL SECURITY;

-- Reports: Public/Users can insert, Admins can manage
DROP POLICY IF EXISTS "Anyone can report" ON public.reports;
CREATE POLICY "Anyone can report" ON public.reports FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Admins can manage reports" ON public.reports;
CREATE POLICY "Admins can manage reports" ON public.reports FOR ALL USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('admin', 'super_admin'))
);

-- Support Tickets: Anyone can create, Admins can manage
DROP POLICY IF EXISTS "Anyone can create tickets" ON public.support_tickets;
CREATE POLICY "Anyone can create tickets" ON public.support_tickets FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Admins can manage tickets" ON public.support_tickets;
CREATE POLICY "Admins can manage tickets" ON public.support_tickets FOR ALL USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('admin', 'super_admin'))
);

-- Moderation Logs: Admin only for audit
DROP POLICY IF EXISTS "Admins can see logs" ON public.moderation_logs;
CREATE POLICY "Admins can see logs" ON public.moderation_logs FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('admin', 'super_admin'))
);
