export interface GetOffersNearbyDynamicResponse {
  offer_id: string;
  merchant_id: string;
  title: string;
  description: string;
  price_before: number;
  price_after: number;
  discount_percent: number;
  quantity: number;
  distance_meters: number;
  merchant_lat?: number;
  merchant_lng?: number;
  merchant_street?: string;
  merchant_city?: string;
  merchant_postal_code?: string;
  image_url?: string;
  available_until?: string;
}

export interface CreateReservationDynamicResponse {
  reservation_id: string;
  offer_id: string;
  client_id: string;
  quantity: number;
  new_quantity: number;
  status: string;
  created_at: string;
}

export interface EnsureProfileExistsResponse {
  profile_id: string;
  auth_id: string;
  first_name: string | null;
  last_name: string | null;
  email: string | null;
  has_location: boolean;
  onboarding_completed: boolean;
  preferences: Record<string, unknown>;
  search_radius_meters: number;
  city: string | null;
  locale: string;
}

export type UserRole = 'merchant' | 'client' | 'none';

export interface UserPreferences {
  halal?: boolean;
  vegan?: boolean;
  eco?: boolean;
}

export interface MerchantOpeningHours {
  monday?: { open: string; close: string };
  tuesday?: { open: string; close: string };
  wednesday?: { open: string; close: string };
  thursday?: { open: string; close: string };
  friday?: { open: string; close: string };
  saturday?: { open: string; close: string };
  sunday?: { open: string; close: string };
}
