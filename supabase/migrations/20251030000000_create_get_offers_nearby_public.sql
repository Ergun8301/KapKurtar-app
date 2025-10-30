/*
  # Create get_offers_nearby_public function

  1. Purpose
    - Public function to retrieve nearby offers based on coordinates
    - Works for both authenticated and anonymous users
    - Returns complete offer details including image_url

  2. Parameters
    - p_longitude: Longitude of the search center
    - p_latitude: Latitude of the search center
    - p_radius_meters: Search radius in meters

  3. Return Columns
    - All offer details including image_url
    - Distance calculated from provided coordinates

  4. Security
    - SECURITY DEFINER to allow access to location data
    - Granted to authenticated and anon roles
*/

CREATE OR REPLACE FUNCTION get_offers_nearby_public(
  p_longitude double precision,
  p_latitude double precision,
  p_radius_meters integer DEFAULT 5000
)
RETURNS TABLE(
  offer_id uuid,
  merchant_id uuid,
  merchant_name text,
  title text,
  description text,
  image_url text,
  price_before numeric,
  price_after numeric,
  discount_percent integer,
  available_from timestamptz,
  available_until timestamptz,
  quantity integer,
  distance_meters double precision,
  offer_lat double precision,
  offer_lng double precision,
  merchant_street text,
  merchant_city text,
  merchant_postal_code text,
  created_at timestamptz
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  search_point geography;
BEGIN
  -- Create geography point from coordinates
  search_point := ST_SetSRID(ST_MakePoint(p_longitude, p_latitude), 4326)::geography;

  RETURN QUERY
  SELECT
    o.id as offer_id,
    o.merchant_id,
    m.company_name as merchant_name,
    o.title,
    o.description,
    o.image_url,
    o.price_before,
    o.price_after,
    o.discount_percent,
    o.available_from,
    o.available_until,
    o.quantity,
    ST_Distance(o.location, search_point)::double precision as distance_meters,
    ST_Y(o.location::geometry)::double precision as offer_lat,
    ST_X(o.location::geometry)::double precision as offer_lng,
    m.street as merchant_street,
    m.city as merchant_city,
    m.postal_code as merchant_postal_code,
    o.created_at
  FROM offers o
  INNER JOIN merchants m ON m.id = o.merchant_id
  WHERE
    o.is_active = true
    AND now() >= o.available_from
    AND (o.available_until IS NULL OR now() <= o.available_until)
    AND o.location IS NOT NULL
    AND ST_DWithin(o.location, search_point, p_radius_meters)
  ORDER BY distance_meters ASC;
END;
$$;

-- Grant execution permissions
GRANT EXECUTE ON FUNCTION get_offers_nearby_public(double precision, double precision, integer) TO authenticated;
GRANT EXECUTE ON FUNCTION get_offers_nearby_public(double precision, double precision, integer) TO anon;
