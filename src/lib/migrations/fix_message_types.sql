-- Drop the existing constraint to allow modification
ALTER TABLE public.messages DROP CONSTRAINT IF EXISTS messages_message_type_check;

-- Re-add the constraint with all supported message types
ALTER TABLE public.messages ADD CONSTRAINT messages_message_type_check 
    CHECK (message_type IN ('text', 'image', 'audio', 'file'));

-- Optional: Ensure file_url column exists (just in case, though error didn't complain)
-- ALTER TABLE public.messages ADD COLUMN IF NOT EXISTS file_url TEXT;
