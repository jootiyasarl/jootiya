-- Create a geospatial index for performance
CREATE INDEX IF NOT EXISTS idx_ads_location ON ads (latitude, longitude);

-- Function to search ads by radius using Haversine formula
-- Returns ads sorted by distance
CREATE OR REPLACE FUNCTION get_ads_nearby(
  user_lat double precision,
  user_lon double precision,
  radius_km int DEFAULT 50,
  limit_count int DEFAULT 20
)
RETURNS TABLE (
  id uuid,
  title text,
  price numeric,
  currency text,
  city text,
  neighborhood text,
  image_urls text[],
  created_at timestamptz,
  latitude double precision,
  longitude double precision,
  distance double precision
)
LANGUAGE sql
AS $$
  SELECT
    id,
    title,
    price,
    currency,
    city,
    neighborhood,
    image_urls,
    created_at,
    latitude,
    longitude,
    (6371 * acos(
      cos(radians(user_lat)) * cos(radians(latitude)) * cos(radians(longitude) - radians(user_lon)) +
      sin(radians(user_lat)) * sin(radians(latitude))
    )) AS distance
  FROM ads
  WHERE
    latitude IS NOT NULL
    AND longitude IS NOT NULL
    AND status = 'active'
    AND (
      6371 * acos(
        cos(radians(user_lat)) * cos(radians(latitude)) * cos(radians(longitude) - radians(user_lon)) +
        sin(radians(user_lat)) * sin(radians(latitude))
      )
    ) <= radius_km
  ORDER BY distance ASC
  LIMIT limit_count;
$$;
