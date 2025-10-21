/*
  # Fix set_role_for_me function - Use correct table structure

  1. Problem
    - Previous function tried to use profiles.role column which doesn't exist
    - Profiles table uses auth_id (not id as primary key)
    - Merchants table uses profile_id to reference profiles.id

  2. Solution
    - Create profile with correct columns (auth_id, email, etc.)
    - Don't store "role" in profiles - determine it by merchant table existence
    - Create merchant record with profile_id reference

  3. How it works
    - For ANY user: Creates profile in profiles table
    - For merchant: Also creates record in merchants table
    - Role is determined by: EXISTS(merchant WHERE profile_id = profile.id)
*/

DROP FUNCTION IF EXISTS public.set_role_for_me(text);

CREATE OR REPLACE FUNCTION public.set_role_for_me(p_role text)
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_auth_id uuid;
  v_profile_id uuid;
  v_user_email text;
BEGIN
  -- 1. Get current authenticated user
  v_auth_id := auth.uid();

  IF v_auth_id IS NULL THEN
    RAISE EXCEPTION 'User must be authenticated';
  END IF;

  -- 2. Validate role parameter
  IF p_role NOT IN ('client', 'merchant') THEN
    RAISE EXCEPTION 'Invalid role: must be client or merchant';
  END IF;

  -- 3. Get user email from auth.users
  SELECT email INTO v_user_email
  FROM auth.users
  WHERE id = v_auth_id;

  -- 4. Create or get profile
  -- Note: profiles.id is the primary key, profiles.auth_id references auth.users
  INSERT INTO profiles (auth_id, email, created_at, updated_at)
  VALUES (v_auth_id, v_user_email, now(), now())
  ON CONFLICT (auth_id)
  DO UPDATE SET
    updated_at = now(),
    email = EXCLUDED.email
  RETURNING id INTO v_profile_id;

  -- 5. If merchant role, create merchant record
  IF p_role = 'merchant' THEN
    INSERT INTO merchants (profile_id, business_name, email, created_at, updated_at)
    VALUES (v_profile_id, 'Mon Commerce', v_user_email, now(), now())
    ON CONFLICT (profile_id)
    DO UPDATE SET updated_at = now();
  END IF;

  RETURN p_role;
END;
$$;

-- Grant permissions
GRANT EXECUTE ON FUNCTION public.set_role_for_me(text) TO authenticated;
GRANT EXECUTE ON FUNCTION public.set_role_for_me(text) TO anon;

-- Add helpful comment
COMMENT ON FUNCTION public.set_role_for_me(text) IS
  'Creates profile and optionally merchant record after OAuth login. Call with p_role="client" or "merchant".';
