-- Trigger to call the details Edge Function
-- Note: You need to enable net extension and set up the webhook in Dashboard usually, 
-- but here we define the intent.

-- 1. Enable pg_net if not enabled (Supabase handles this usually)
create extension if not exists pg_net;

-- 2. Create the function that calls the Edge Function
create or replace function public.handle_new_ad_notification()
returns trigger as $$
begin
  -- Call the Edge Function (replace URL with your actual project URL)
  -- select net.http_post(
  --     url:='https://YOUR_PROJECT_REF.supabase.co/functions/v1/notify-active-radar',
  --     body:=jsonb_build_object('record', new)
  -- );
  return new;
end;
$$ language plpgsql security definer;

-- 3. Create the Trigger
drop trigger if exists on_ad_created_notify on public.ads;
create trigger on_ad_created_notify
  after insert on public.ads
  for each row
  when (new.status = 'active')
  execute procedure public.handle_new_ad_notification();
