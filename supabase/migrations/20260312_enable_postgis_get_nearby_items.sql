-- Enable PostGIS extension
CREATE EXTENSION IF NOT EXISTS postgis;

-- Add location geography column to ads table
ALTER TABLE public.ads 
ADD COLUMN IF NOT EXISTS location geography(POINT, 4326);

-- Create a spatial index for better performance
CREATE INDEX IF NOT EXISTS ads_location_idx ON public.ads USING GIST (location);

-- Drop the function first to avoid return type mismatch errors
DROP FUNCTION IF EXISTS get_nearby_items(float, float, float, int);

-- Function to search for nearby items (ads)
CREATE OR REPLACE FUNCTION get_nearby_items(
  lat float,
  lon float,
  distance_meters float DEFAULT 50000,
  limit_count int DEFAULT 20
)
RETURNS TABLE (
  id UUID,
  seller_id UUID,
  category_id UUID,
  title TEXT,
  description TEXT,
  price DECIMAL,
  currency TEXT,
  images TEXT[],
  location_name TEXT,
  status TEXT,
  views_count INT,
  created_at TIMESTAMPTZ,
  dist_meters float,
  profiles jsonb
)
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT
    a.id,
    a.seller_id,
    a.category_id,
    a.title,
    a.description,
    a.price,
    a.currency,
    a.images,
    a.location as location_name,
    a.status,
    a.views_count,
    a.created_at,
    ST_Distance(a.location, ST_SetSRID(ST_MakePoint(lon, lat), 4326)::geography) as dist_meters,
    jsonb_build_object(
      'full_name', p.full_name,
      'username', p.username,
      'avatar_url', p.avatar_url
    ) as profiles
  FROM
    public.ads a
  LEFT JOIN public.profiles p ON a.seller_id = p.id
  WHERE
    a.status = 'approved'
    AND ST_DWithin(a.location, ST_SetSRID(ST_MakePoint(lon, lat), 4326)::geography, distance_meters)
  ORDER BY
    a.location <-> ST_SetSRID(ST_MakePoint(lon, lat), 4326)::geography
  LIMIT limit_count;
END;
$$;
