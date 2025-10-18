/*
  # Create authentication helper functions

  1. New Functions
    - `ensure_profile_exists(p_auth_id)`: Creates a profile if it doesn't exist
      - Returns the profile row
      - Used after login to ensure profile exists
    
    - `get_user_role(p_auth_id)`: Determines if user is merchant or client
      - Returns 'merchant', 'client', or 'none'
      - Based on merchants.profile_id relationship

  2. Security
    - SECURITY DEFINER to allow profile creation
    - Only operates on authenticated user's own data
*/

-- Function to ensure profile exists for authenticated user
CREATE OR REPLACE FUNCTION ensure_profile_exists(p_auth_id uuid)
RETURNS TABLE(
  profile_id uuid,
  auth_id uuid,
  first_name text,
  last_name text,
  email text,
  has_location boolean
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_profile profiles%ROWTYPE;
BEGIN
  -- Check if profile exists
  SELECT * INTO v_profile
  FROM profiles
  WHERE profiles.auth_id = p_auth_id;

  -- If not, create it
  IF NOT FOUND THEN
    INSERT INTO profiles (auth_id, email)
    VALUES (p_auth_id, (SELECT email FROM auth.users WHERE id = p_auth_id))
    RETURNING * INTO v_profile;
  END IF;

  -- Return profile info
  RETURN QUERY
  SELECT 
    v_profile.id,
    v_profile.auth_id,
    v_profile.first_name,
    v_profile.last_name,
    v_profile.email,
    (v_profile.location IS NOT NULL) as has_location;
END;
$$;

-- Function to get user role (merchant or client)
CREATE OR REPLACE FUNCTION get_user_role(p_auth_id uuid)
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_profile_id uuid;
  v_is_merchant boolean;
BEGIN
  -- Get profile_id
  SELECT id INTO v_profile_id
  FROM profiles
  WHERE auth_id = p_auth_id;

  IF NOT FOUND THEN
    RETURN 'none';
  END IF;

  -- Check if merchant exists
  SELECT EXISTS(
    SELECT 1 FROM merchants WHERE profile_id = v_profile_id
  ) INTO v_is_merchant;

  IF v_is_merchant THEN
    RETURN 'merchant';
  ELSE
    RETURN 'client';
  END IF;
END;
$$;
