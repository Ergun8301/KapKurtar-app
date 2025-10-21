/*
  # Create set_role_for_me function for OAuth role assignment

  1. New Function
    - `set_role_for_me(p_role)`: Assigns role to authenticated user after OAuth
      - Creates profile if doesn't exist
      - Creates merchant record if role='merchant'
      - Idempotent: safe to call multiple times
      - Returns the assigned role

  2. Usage
    - Called from frontend after OAuth redirect with role parameter
    - Used in CustomerAuthPage and MerchantAuthPage
    - Handles both 'client' and 'merchant' roles

  3. Security
    - SECURITY DEFINER to allow profile/merchant creation
    - Only operates on current authenticated user (auth.uid())
    - Validates role parameter
*/

CREATE OR REPLACE FUNCTION set_role_for_me(p_role text)
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_auth_id uuid;
  v_profile_id uuid;
  v_user_email text;
BEGIN
  -- Get current authenticated user
  v_auth_id := auth.uid();

  IF v_auth_id IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;

  -- Validate role parameter
  IF p_role NOT IN ('client', 'merchant') THEN
    RAISE EXCEPTION 'Invalid role: must be client or merchant';
  END IF;

  -- Get user email
  SELECT email INTO v_user_email
  FROM auth.users
  WHERE id = v_auth_id;

  -- Ensure profile exists
  INSERT INTO profiles (auth_id, email)
  VALUES (v_auth_id, v_user_email)
  ON CONFLICT (auth_id) DO NOTHING
  RETURNING id INTO v_profile_id;

  -- If profile already existed, get its id
  IF v_profile_id IS NULL THEN
    SELECT id INTO v_profile_id
    FROM profiles
    WHERE auth_id = v_auth_id;
  END IF;

  -- If merchant role, create merchant record if doesn't exist
  IF p_role = 'merchant' THEN
    -- Check if merchant already exists
    IF NOT EXISTS (SELECT 1 FROM merchants WHERE profile_id = v_profile_id) THEN
      INSERT INTO merchants (profile_id, business_name, email)
      VALUES (v_profile_id, 'Mon Commerce', v_user_email);
    END IF;
  END IF;

  RETURN p_role;
END;
$$;
