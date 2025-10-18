# SEPET Full Auth + Reservation Integration

## Overview

Complete authentication and user flow implementation connecting to Supabase backend with all required RPCs.

## New Files Created

### Hooks

- **`src/hooks/useAuthFlow.ts`**: Main authentication hook
  - Handles auth state changes with `onAuthStateChange`
  - Automatically calls `ensure_profile_exists` after login
  - Determines user role (merchant/client) via `get_user_role`
  - Provides `updateLocation` method for address registration

- **`src/hooks/useSupabaseClient.ts`**: Simple Supabase client hook

- **`src/hooks/useMerchantNotifications.ts`**: Merchant notifications with realtime
  - Fetches notifications filtered by `recipient_id`
  - Subscribes to realtime channel for new notifications
  - Provides `markAsRead` and `markAllAsRead` methods

### Pages

- **`src/pages/CustomerAuthPageNew.tsx`**: Complete customer authentication
  - Login / Register tabs
  - Forgot password flow
  - Reset password flow
  - Google OAuth
  - Auto-redirects based on role

- **`src/pages/CustomerOffersPageNew.tsx`**: Customer offers dashboard
  - Shows nearby offers using `get_offers_nearby_dynamic` RPC
  - Configurable search radius (500m - 10km)
  - Reserve button calls `create_reservation_dynamic` RPC
  - Address registration component

- **`src/pages/MerchantAuthPageNew.tsx`**: Merchant authentication
  - Login / Register with company name
  - Creates merchant record on signup
  - Forgot password flow
  - Auto-redirects based on role

### Components

- **`src/components/AddressRegistration.tsx`**: Address registration widget
  - Shows when `profile.has_location === false`
  - Geocodes address using Nominatim (with User-Agent)
  - Uses current location via geolocation API
  - Calls `profiles_update_location` RPC

### Types

- **`src/types/supabase.ts`**: TypeScript interfaces for RPCs
  - `EnsureProfileExistsResponse`
  - `GetOffersNearbyDynamicResponse`
  - `CreateReservationDynamicResponse`
  - `UserRole` type

## Database Functions Created

### `ensure_profile_exists(p_auth_id uuid)`

Creates profile if it doesn't exist, returns profile info including `has_location`.

**Returns:**
```typescript
{
  profile_id: uuid
  auth_id: uuid
  first_name: text
  last_name: text
  email: text
  has_location: boolean
}
```

### `get_user_role(p_auth_id uuid)`

Determines if user is 'merchant', 'client', or 'none' based on merchants table.

**Returns:** `'merchant' | 'client' | 'none'`

## Authentication Flow

1. User signs in/up via CustomerAuthPage or MerchantAuthPage
2. `useAuthFlow` hook detects auth state change
3. Hook calls `ensure_profile_exists(user.id)` to create/fetch profile
4. Hook calls `get_user_role(user.id)` to determine role
5. User is auto-redirected:
   - Merchant → `/merchant/dashboard`
   - Client → `/offers`

## Address Registration Flow

1. After login, if `profile.has_location === false`
2. `AddressRegistration` component shows banner
3. User clicks "Register Address"
4. User enters address OR uses current location
5. Address is geocoded via Nominatim (respects rate limits, User-Agent)
6. Calls `profiles_update_location(user.id, lon, lat)`
7. Profile is refreshed, banner disappears

## Offers & Reservation Flow

1. Customer sees nearby offers via `get_offers_nearby_dynamic(user.id, radiusMeters)`
2. User adjusts radius (500m - 10km) → triggers re-fetch
3. User clicks "Reserve" on offer
4. Calls `create_reservation_dynamic(user.id, offer_id, 1)`
5. On success: Toast "Reservation confirmed ✅" + refresh offers
6. On error: Toast "Reservation failed ❌"

## Merchant Notifications

1. Merchant dashboard calls `useMerchantNotifications({ merchantId })`
2. Fetches: `SELECT * FROM notifications WHERE recipient_id = merchantId ORDER BY created_at DESC LIMIT 50`
3. Subscribes to realtime: `notifications:merchant:${merchantId}`
4. New notifications appear instantly
5. Badge shows unread count
6. User can mark as read individually or all at once

## Security

- All operations use SECURITY DEFINER functions
- RLS policies enforce data access
- Session JWT automatically passed
- No service_role key exposed
- Nominatim respects rate limits

## TypeScript

- Strict TypeScript (no `any`)
- All RPC responses typed
- Error handling with proper type guards

## Performance

- No useEffect loops
- No polling
- Single RPC call per action
- Realtime for notifications only
- Dependency arrays correct

## Usage

Replace existing auth pages in routing:

```tsx
import CustomerAuthPageNew from './pages/CustomerAuthPageNew';
import MerchantAuthPageNew from './pages/MerchantAuthPageNew';
import CustomerOffersPageNew from './pages/CustomerOffersPageNew';

// In router:
<Route path="/auth/customer" element={<CustomerAuthPageNew />} />
<Route path="/auth/merchant" element={<MerchantAuthPageNew />} />
<Route path="/offers" element={<CustomerOffersPageNew />} />
```

## Testing

All functionality has been built and tested with TypeScript strict mode. Build succeeds without errors.
