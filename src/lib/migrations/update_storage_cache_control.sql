-- SQL Script to update Cache-Control header for all existing files in Supabase Storage
-- Run this in Supabase Dashboard -> SQL Editor to apply 1-year caching to all old images!

UPDATE storage.objects
SET metadata = jsonb_set(
  COALESCE(metadata, '{}'::jsonb),
  '{cacheControl}',
  '"31536000, immutable"'
)
WHERE bucket_id IN ('ad-images', 'avatars', 'chat-attachments', 'chat-audios');
