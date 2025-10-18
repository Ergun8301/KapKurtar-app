/*
  # Add onboarding fields to profiles table

  1. New Columns
    - `onboarding_completed` (boolean): Tracks if user completed onboarding
    - `preferences` (jsonb): Stores user preferences (halal, vegan, eco, etc.)
    - `search_radius_meters` (integer): Default search radius for client
    - `city` (text): User's city name
    - `locale` (text): User's preferred language (tr/fr)
    
  2. Updates
    - Drop and recreate ensure_profile_exists with new return type
    - Add default values for new fields
*/

-- Add onboarding tracking
ALTER TABLE profiles
ADD COLUMN IF NOT EXISTS onboarding_completed boolean DEFAULT false;

-- Add user preferences as JSONB
ALTER TABLE profiles
ADD COLUMN IF NOT EXISTS preferences jsonb DEFAULT '{}'::jsonb;

-- Add search radius for clients (default 3km)
ALTER TABLE profiles
ADD COLUMN IF NOT EXISTS search_radius_meters integer DEFAULT 3000;

-- Add city name
ALTER TABLE profiles
ADD COLUMN IF NOT EXISTS city text;

-- Add locale preference (default 'fr')
ALTER TABLE profiles
ADD COLUMN IF NOT EXISTS locale text DEFAULT 'fr';

-- Create index on onboarding_completed for faster queries
CREATE INDEX IF NOT EXISTS idx_profiles_onboarding_completed 
ON profiles(onboarding_completed);

-- Drop old function
DROP FUNCTION IF EXISTS ensure_profile_exists(uuid);

-- Recreate with new return type
CREATE OR REPLACE FUNCTION ensure_profile_exists(p_auth_id uuid)
RETURNS TABLE(
  profile_id uuid,
  auth_id uuid,
  first_name text,
  last_name text,
  email text,
  has_location boolean,
  onboarding_completed boolean,
  preferences jsonb,
  search_radius_meters integer,
  city text,
  locale text
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_profile profiles%ROWTYPE;
BEGIN
  SELECT * INTO v_profile
  FROM profiles
  WHERE profiles.auth_id = p_auth_id;

  IF NOT FOUND THEN
    INSERT INTO profiles (auth_id, email)
    VALUES (p_auth_id, (SELECT email FROM auth.users WHERE id = p_auth_id))
    RETURNING * INTO v_profile;
  END IF;

  RETURN QUERY
  SELECT 
    v_profile.id,
    v_profile.auth_id,
    v_profile.first_name,
    v_profile.last_name,
    v_profile.email,
    (v_profile.location IS NOT NULL) as has_location,
    v_profile.onboarding_completed,
    v_profile.preferences,
    v_profile.search_radius_meters,
    v_profile.city,
    v_profile.locale;
END;
$$;
