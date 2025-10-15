/*
  # Create get_offers_nearby_dynamic function

  1. Purpose
    - Dynamic function to retrieve nearby offers based on client location and search radius
    - Returns complete offer details including merchant information and distance
    - Optimized for real-time map display with coordinate data

  2. Parameters
    - p_client_id: UUID of the client requesting nearby offers
    - p_radius_meters: Search radius in meters (default: 5000m = 5km)

  3. Return Columns
    - offer_id: UUID of the offer
    - merchant_id: UUID of the merchant
    - merchant_name: Business name of the merchant
    - title: Offer title
    - description: Offer description
    - image_url: URL to offer image
    - price_before: Original price
    - price_after: Discounted price
    - discount_percent: Discount percentage
    - available_from: Start time of offer
    - available_until: End time of offer
    - quantity: Available quantity
    - distance_meters: Distance from client in meters
    - offer_lat: Latitude of offer location
    - offer_lng: Longitude of offer location
    - merchant_street: Merchant street address
    - merchant_city: Merchant city
    - merchant_postal_code: Merchant postal code
    - created_at: Offer creation timestamp

  4. Security
    - SECURITY DEFINER to allow access to location data
    - Granted to authenticated and anon roles
    - Only returns active offers within time window

  5. Notes
    - Uses PostGIS ST_DWithin for efficient spatial queries
    - Results ordered by distance (closest first)
    - Only returns offers with valid locations
    - Client must have a valid location set
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
    ST_Distance(o.location, c.location)::double precision as distance_meters,
    ST_Y(o.location::geometry)::double precision as offer_lat,
    ST_X(o.location::geometry)::double precision as offer_lng,
    m.street as merchant_street,
    m.city as merchant_city,
    m.postal_code as merchant_postal_code,
    o.created_at
  FROM offers o
  INNER JOIN clients c ON c.id = p_client_id
  INNER JOIN merchants m ON m.id = o.merchant_id
  WHERE
    o.is_active = true
    AND now() BETWEEN o.available_from AND o.available_until
    AND o.location IS NOT NULL
    AND c.location IS NOT NULL
    AND ST_DWithin(o.location, c.location, p_radius_meters)
  ORDER BY distance_meters ASC;
END;
$$;

-- Grant execution permissions
GRANT EXECUTE ON FUNCTION get_offers_nearby_dynamic(uuid, integer) TO authenticated;
GRANT EXECUTE ON FUNCTION get_offers_nearby_dynamic(uuid, integer) TO anon;
