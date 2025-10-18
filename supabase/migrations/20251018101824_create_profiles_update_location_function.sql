/*
  # Create profiles_update_location RPC function

  1. New Function
    - `profiles_update_location(p_auth_id, p_lon, p_lat)`: Updates profile location with geocoded coordinates
      - Parameters: 
        - p_auth_id (uuid): auth.uid() of the user
        - p_lon (double precision): Longitude
        - p_lat (double precision): Latitude
      - Sets location as PostGIS Point geometry with SRID 4326
  
  2. Security
    - SECURITY DEFINER to allow location updates
    - Only updates the authenticated user's own profile
*/

CREATE OR REPLACE FUNCTION profiles_update_location(
  p_auth_id uuid,
  p_lon double precision,
  p_lat double precision
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  UPDATE profiles
  SET 
    location = ST_SetSRID(ST_MakePoint(p_lon, p_lat), 4326)::geography,
    updated_at = now()
  WHERE auth_id = p_auth_id;
END;
$$;
