-- 1. Create Saved Searches table (if not exists)
CREATE TABLE IF NOT EXISTS public.saved_searches (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    query_text TEXT,
    city TEXT,
    category TEXT,
    radius INTEGER,
    email_alert BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS Policies
ALTER TABLE public.saved_searches ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their own saved searches"
ON public.saved_searches FOR ALL
USING (auth.uid() = user_id);

-- 2. Setup pg_cron for Hourly Digest
-- Note: pg_cron must be enabled in the project extensions dashboard.
CREATE EXTENSION IF NOT EXISTS pg_cron;

-- Schedule the job to run every hour at minute 0
-- This calls the Edge Function via pg_net (implicit or explicit)
-- Since we can't easily call Edge Functions directly from cron without `pg_net` and exact URL,
-- usually we schedule a SQL function that performs the HTTP request.

CREATE OR REPLACE FUNCTION public.trigger_hourly_digest()
RETURNS void AS $$
BEGIN
  -- perform http post to edge function
  -- In Supabase, you often use `pg_net` extension for this.
  -- select net.http_post(
  --   url:='https://YOUR_PROJECT_ID.supabase.co/functions/v1/send-hourly-digest',
  --   headers:='{"Content-Type": "application/json", "Authorization": "Bearer YOUR_SERVICE_ROLE_KEY"}'::jsonb,
  --   body:='{}'::jsonb
  -- );
  -- For now, this is a placeholder to show intent.
  NULL; 
END;
$$ LANGUAGE plpgsql;

-- Schedule it
-- SELECT cron.schedule('hourly-digest', '0 * * * *', 'SELECT public.trigger_hourly_digest()');
