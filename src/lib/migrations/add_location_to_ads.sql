-- Add location columns to ads table if they don't exist
ALTER TABLE ads ADD COLUMN IF NOT EXISTS latitude DOUBLE PRECISION;
ALTER TABLE ads ADD COLUMN IF NOT EXISTS longitude DOUBLE PRECISION;
ALTER TABLE ads ADD COLUMN IF NOT EXISTS search_radius_km INT DEFAULT 3;
