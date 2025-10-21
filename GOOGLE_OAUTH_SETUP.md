# Google OAuth Configuration for SEPET

## ✅ Current Implementation Status

### Environment Variables
- ✅ `VITE_SUPABASE_URL`: Configured
- ✅ `VITE_SUPABASE_ANON_KEY`: Configured
- ✅ Supabase client initialized with auth options

### CustomerAuthPage.tsx (Clients)
- ✅ Google OAuth button implemented
- ✅ Uses `supabase.auth.signInWithOAuth({ provider: 'google' })`
- ✅ Redirects to `/customer/auth` after OAuth
- ✅ `useAuthFlow` hook handles post-auth routing:
  - If `onboarding_completed === false` → `/onboarding/client`
  - If role === 'client' → `/offers`
  - If role === 'merchant' → `/merchant/dashboard`
- ✅ Color palette: Green #3A6932
- ✅ Google logo with official colors

### MerchantAuthPage.tsx (Merchants)
- ✅ Google OAuth button implemented
- ✅ Uses `supabase.auth.signInWithOAuth({ provider: 'google' })`
- ✅ Redirects to `/merchant/auth` after OAuth
- ✅ `useAuthFlow` hook handles post-auth routing:
  - If role === 'merchant' → `/merchant/dashboard`
  - If role === 'client' → `/offers`
- ✅ Color palette: Orange #FF6B35
- ✅ Google logo with official colors

## 🔧 Supabase Dashboard Configuration Required

To enable Google OAuth, you need to configure it in your Supabase Dashboard:

### 1. Enable Google Provider

1. Go to: https://zhabjdyzawffsmvziojl.supabase.co/project/_/auth/providers
2. Find "Google" in the list of providers
3. Enable the toggle

### 2. Get Google OAuth Credentials

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing one
3. Go to "APIs & Services" → "Credentials"
4. Click "Create Credentials" → "OAuth 2.0 Client ID"
5. Configure consent screen if needed
6. Application type: "Web application"
7. Add authorized redirect URIs:
   ```
   https://zhabjdyzawffsmvziojl.supabase.co/auth/v1/callback
   ```
8. Copy the Client ID and Client Secret

### 3. Configure in Supabase

1. In Supabase Dashboard → Authentication → Providers → Google
2. Paste the Client ID
3. Paste the Client Secret
4. Click "Save"

### 4. Add Site URL

1. In Supabase Dashboard → Authentication → URL Configuration
2. Set Site URL to your production domain (e.g., `https://sepet.app`)
3. Add redirect URLs:
   ```
   https://sepet.app/customer/auth
   https://sepet.app/merchant/auth
   ```

### 5. Test Locally

For local development:
1. Add `http://localhost:5173/customer/auth` to redirect URLs
2. Add `http://localhost:5173/merchant/auth` to redirect URLs
3. Set Site URL to `http://localhost:5173`

## 🔄 OAuth Flow

### Customer Flow
```
1. User clicks "Google" button on /customer/auth
2. Redirected to Google OAuth consent screen
3. After approval, Google redirects to: /customer/auth
4. useAuthFlow detects session
5. Calls ensure_profile_exists(user.id)
6. Calls get_user_role(user.id)
7. If onboarding_completed = false:
   → Redirect to /onboarding/client
8. If onboarding_completed = true:
   → Redirect to /offers
```

### Merchant Flow
```
1. User clicks "Google" button on /merchant/auth
2. Redirected to Google OAuth consent screen
3. After approval, Google redirects to: /merchant/auth
4. useAuthFlow detects session
5. Calls ensure_profile_exists(user.id)
6. Calls get_user_role(user.id)
7. If role = 'merchant':
   → Redirect to /merchant/dashboard
8. If role = 'client':
   → Redirect to /offers
```

## 🧪 Testing

### Manual Testing Steps

1. **Test Customer Google Login**:
   - Navigate to `/customer/auth`
   - Click "Google" button
   - Complete Google OAuth flow
   - Verify redirect to `/onboarding/client` (first time) or `/offers` (returning user)

2. **Test Merchant Google Login**:
   - Navigate to `/merchant/auth`
   - Click "Google" button
   - Complete Google OAuth flow
   - Verify redirect to `/merchant/dashboard`

3. **Test Error Handling**:
   - Try OAuth with invalid credentials
   - Verify error message displays in red alert box

### Console Verification

Check browser console for:
```javascript
// Success
Supabase auth state: authenticated

// Error
Error message displayed in component
```

## 📱 UI/UX Details

### Customer Page (Green Theme)
- Primary button: `bg-[#3A6932]` (green)
- Google button: White with border, hover effect
- Separator: "Ou continuer avec"
- Font: Semibold, large touch targets (py-4)

### Merchant Page (Orange Theme)
- Primary button: `bg-[#FF6B35]` (orange)
- Google button: White with border, hover effect
- Separator: "Ou continuer avec"
- Font: Semibold, large touch targets (py-4)

## 🔒 Security Notes

- ✅ Using Supabase anon key (safe for client-side)
- ✅ RLS policies automatically enforced via session JWT
- ✅ No service_role key exposed
- ✅ OAuth tokens handled by Supabase backend
- ✅ Session stored in localStorage with auto-refresh

## ✅ Checklist

- [x] Environment variables configured
- [x] Google OAuth button in CustomerAuthPage
- [x] Google OAuth button in MerchantAuthPage
- [x] Redirect URLs configured
- [x] useAuthFlow handles role-based routing
- [x] Error handling implemented
- [ ] Google Cloud OAuth credentials created
- [ ] Supabase Google provider enabled
- [ ] Production redirect URLs configured
- [ ] Tested on localhost
- [ ] Tested on production

## 🔧 IMPORTANT: Fonction SQL Corrigée

### ❌ Problème avec la première version

La fonction SQL initiale utilisait `profiles.role` qui **n'existe pas** dans votre schéma.

### ✅ Fonction SQL Correcte à Exécuter

**Allez dans Supabase Dashboard → SQL Editor** et exécutez:

```sql
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

GRANT EXECUTE ON FUNCTION public.set_role_for_me(text) TO authenticated;
GRANT EXECUTE ON FUNCTION public.set_role_for_me(text) TO anon;
```

### 🧪 Comment Tester

**NE TESTEZ PAS depuis SQL Editor!** L'erreur "User must be authenticated" est normale car vous n'êtes pas connecté.

**Testez depuis le frontend:**

1. Ouvrez votre app et connectez-vous (email/password)
2. Ouvrez la console (F12)
3. Exécutez:
```javascript
const { data, error } = await supabase.rpc('set_role_for_me', { p_role: 'client' });
console.log('Résultat:', data, error);
```

Si ça retourne `{ data: "client", error: null }` → ✅ **Ça marche!**

### 📊 Vérification dans la base

**Client:**
```sql
SELECT p.*, m.business_name
FROM profiles p
LEFT JOIN merchants m ON m.profile_id = p.id
WHERE p.email = 'votre-email@example.com';
-- Devrait montrer: profile + business_name = NULL
```

**Merchant:**
```sql
SELECT p.*, m.business_name
FROM profiles p
LEFT JOIN merchants m ON m.profile_id = p.id
WHERE p.email = 'votre-email-merchant@example.com';
-- Devrait montrer: profile + business_name = 'Mon Commerce'
```

## 🚀 Next Steps

1. ✅ Appliquer la fonction SQL corrigée ci-dessus
2. Create Google Cloud OAuth credentials
3. Enable Google provider in Supabase Dashboard
4. Add redirect URLs in Supabase
5. Test OAuth flow locally
6. Deploy and test in production
