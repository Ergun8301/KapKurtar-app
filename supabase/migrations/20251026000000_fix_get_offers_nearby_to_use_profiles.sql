/*
  # Fix get_offers_nearby_dynamic to use profiles table

  1. Problem
    - Function uses INNER JOIN on 'clients' table which doesn't have location column
    - Should use 'profiles' table instead which has location geography column
    - available_until can be NULL, causing filter to fail

  2. Solution
    - Recreate function to JOIN on profiles instead of clients
    - Handle NULL available_until by treating it as "no expiry"
    - Keep all other functionality identical

  3. Changes
    - DROP existing function
    - CREATE new version with profiles JOIN
    - Update WHERE clause to handle NULL available_until
*/

DROP FUNCTION IF EXISTS get_offers_nearby_dynamic(uuid, integer);

CREATE OR REPLACE FUNCTION get_offers_nearby_dynamic(
  p_client_id uuid,
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
BEGIN
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
    ST_Distance(o.location, p.location)::double precision as distance_meters,
    ST_Y(o.location::geometry)::double precision as offer_lat,
    ST_X(o.location::geometry)::double precision as offer_lng,
    m.street as merchant_street,
    m.city as merchant_city,
    m.postal_code as merchant_postal_code,
    o.created_at
  FROM offers o
  INNER JOIN profiles p ON p.id = p_client_id
  INNER JOIN merchants m ON m.id = o.merchant_id
  WHERE
    o.is_active = true
    AND now() >= o.available_from
    AND (o.available_until IS NULL OR now() <= o.available_until)
    AND o.location IS NOT NULL
    AND p.location IS NOT NULL
    AND ST_DWithin(o.location, p.location, p_radius_meters)
  ORDER BY distance_meters ASC;
END;
$$;

-- Grant execution permissions
GRANT EXECUTE ON FUNCTION get_offers_nearby_dynamic(uuid, integer) TO authenticated;
GRANT EXECUTE ON FUNCTION get_offers_nearby_dynamic(uuid, integer) TO anon;
