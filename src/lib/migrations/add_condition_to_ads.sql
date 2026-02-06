ALTER TABLE ads 
ADD COLUMN IF NOT EXISTS condition TEXT DEFAULT 'used' CHECK (condition IN ('new', 'used'));
