-- 1. Favorites System
CREATE TABLE IF NOT EXISTS public.favorites (
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    ad_id UUID REFERENCES public.ads(id) ON DELETE CASCADE NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    PRIMARY KEY(user_id, ad_id)
);

-- RLS for Favorites
ALTER TABLE public.favorites ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view their own favorites" ON public.favorites;
CREATE POLICY "Users can view their own favorites" 
ON public.favorites FOR SELECT 
USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can add to their own favorites" ON public.favorites;
CREATE POLICY "Users can add to their own favorites" 
ON public.favorites FOR INSERT 
WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can remove from their own favorites" ON public.favorites;
CREATE POLICY "Users can remove from their own favorites" 
ON public.favorites FOR DELETE 
USING (auth.uid() = user_id);

-- 2. Internal Notifications System
CREATE TABLE IF NOT EXISTS public.notifications (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    type TEXT DEFAULT 'info',
    is_read BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS for Notifications
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view their own notifications" ON public.notifications;
CREATE POLICY "Users can view their own notifications" 
ON public.notifications FOR SELECT 
USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "System can insert notifications" ON public.notifications;
CREATE POLICY "System can insert notifications" 
ON public.notifications FOR INSERT 
WITH CHECK (true); -- Usually restricted to service role in practice, or specific functions

-- 3. Follow-up System (Ad Health Check)
-- Function to be called daily by pg_cron
CREATE OR REPLACE FUNCTION public.check_ad_follow_ups()
RETURNS void AS $$
DECLARE
    ad_record RECORD;
BEGIN
    FOR ad_record IN 
        SELECT id, seller_id, title 
        FROM public.ads 
        WHERE status = 'approved' 
        AND created_at::date = (NOW() - INTERVAL '15 days')::date
    LOOP
        INSERT INTO public.notifications (user_id, title, message, type)
        VALUES (
            ad_record.seller_id,
            'متابعة الإعلان: ' || ad_record.title,
            'هل بعت ' || ad_record.title || '؟ لا تنسَ تحديث حالة الإعلان إلى (تم البيع) لتجنب الاتصالات غير الضرورية وللحفاظ على مصداقية بروفايلك.',
            'follow_up'
        );
    END LOOP;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Scheduling (Note: This requires pg_cron enabled in Supabase)
-- SELECT cron.schedule('0 9 * * *', 'SELECT public.check_ad_follow_ups()');

-- 4. Price Drop Notification System
-- Function to notify users when a favorited ad's price drops
CREATE OR REPLACE FUNCTION public.notify_price_drop()
RETURNS TRIGGER AS $$
DECLARE
    fav_record RECORD;
BEGIN
    -- Only proceed if price has actually decreased
    IF NEW.price < OLD.price THEN
        -- Find all users who have favorited this ad
        FOR fav_record IN 
            SELECT user_id 
            FROM public.favorites 
            WHERE ad_id = NEW.id
        LOOP
            -- Create notification for each user
            INSERT INTO public.notifications (user_id, title, message, type)
            VALUES (
                fav_record.user_id,
                'خبر سار! انخفاض في السعر 🎉',
                'خبر سار! الهمزة التي تتابعها "' || NEW.title || '" انخفض سعرها الآن! سارع بالشراء',
                'price_drop'
            );
        END LOOP;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to detect price changes
DROP TRIGGER IF EXISTS trg_notify_price_drop ON public.ads;
CREATE TRIGGER trg_notify_price_drop
AFTER UPDATE OF price ON public.ads
FOR EACH ROW
WHEN (NEW.price < OLD.price)
EXECUTE FUNCTION public.notify_price_drop();
