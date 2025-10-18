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
