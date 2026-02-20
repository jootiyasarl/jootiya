-- Function to clean up expired featured ads
CREATE OR REPLACE FUNCTION cleanup_expired_featured_ads()
RETURNS void AS $$
BEGIN
    UPDATE public.ads
    SET is_featured = false,
        featured_until = NULL
    WHERE is_featured = true 
      AND featured_until IS NOT NULL 
      AND featured_until < NOW();
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Note: In a real Supabase environment, you would schedule this using pg_cron:
-- SELECT cron.schedule('0 0 * * *', 'SELECT cleanup_expired_featured_ads();');
-- Or use a Supabase Edge Function triggered by a GitHub Action/Cron service.
