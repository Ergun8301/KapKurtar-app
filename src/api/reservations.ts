import { supabase } from '../lib/supabaseClient';

export interface Reservation {
  id: string;
  client_id: string;
  merchant_id: string;
  offer_id: string;
  quantity: number;
  status: 'pending' | 'confirmed' | 'expired' | 'cancelled';
  created_at: string;
  updated_at: string;
  offer?: {
    title: string;
    description: string;
    price_after: number;
    image_url: string | null;
  };
  merchant?: {
    company_name: string;
    city: string;
  };
  client?: {
    first_name: string;
    last_name: string;
  };
}

export const createReservation = async (offerId: string, merchantId: string, quantity: number = 1) => {
  try {
    console.log('🟢 [SEPET API] Creating reservation with stock check:', { offerId, merchantId, quantity });

    // Get current session
    const { data: { session }, error: sessionError } = await supabase.auth.getSession();

    if (sessionError) {
      console.error('❌ [SEPET API] Session error:', sessionError);
      return { success: false, error: 'Failed to get session: ' + sessionError.message };
    }

    if (!session || !session.user) {
      console.error('❌ [SEPET API] No active session or user');
      return { success: false, error: 'You must be logged in to make a reservation' };
    }

    const userId = session.user.id;
    console.log('✅ [SEPET API] User authenticated:', userId);

    if (quantity < 1) {
      return { success: false, error: 'Quantity must be at least 1' };
    }

    if (!merchantId) {
      console.error('❌ [SEPET API] Missing merchant_id');
      return { success: false, error: 'Invalid offer: missing merchant information' };
    }

    console.log('🚀 [SEPET API] Calling Supabase RPC: create_reservation_dynamic');
    console.log('📤 [SEPET API] RPC parameters:', {
      p_client_id: userId,
      p_offer_id: offerId,
      p_quantity: quantity
    });

    // Call PostgreSQL function for atomic reservation with stock deduction
    const { data, error } = await supabase.rpc('create_reservation_dynamic', {
      p_client_id: userId,
      p_offer_id: offerId,
      p_quantity: quantity
    });

    console.log('🧩 [SEPET API] Supabase RPC raw response:', { data, error });

    if (error) {
      console.error('🚨 [SEPET API] Supabase RPC error:', {
        code: error.code,
        message: error.message,
        details: error.details,
        hint: error.hint
      });
      return { success: false, error: 'Impossible de réserver ❌' };
    }

    console.log('📥 [SEPET API] RPC response received:', data);

    // The function returns a TABLE with reservation details
    if (!data || !Array.isArray(data) || data.length === 0) {
      console.error('❌ [SEPET API] Reservation failed: no data returned');
      return { success: false, error: 'Impossible de réserver ❌' };
    }

    const reservationData = data[0];
    console.log('✅ [SEPET API] Reservation created successfully!');
    console.log('📦 [SEPET API] Reservation data:', reservationData);
    console.log('📊 [SEPET API] Remaining stock:', reservationData.new_quantity);

    return { success: true, data: reservationData };
  } catch (err: any) {
    console.error('💥 [SEPET API] Exception creating reservation:', err);
    return { success: false, error: err.message || 'An unexpected error occurred' };
  }
};

export const getClientReservations = async () => {
  try {
    const { data: { session }, error: sessionError } = await supabase.auth.getSession();

    if (sessionError || !session?.user) {
      console.error('Session error:', sessionError);
      return { success: false, error: 'User not authenticated', data: [] };
    }

    const user = session.user;

    const { data, error } = await supabase
      .from('reservations')
      .select(`
        *,
        offer:offers(title, description, price_after, image_url),
        merchant:merchants(company_name, city)
      `)
      .eq('client_id', user.id)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching client reservations:', error);
      return { success: false, error: error.message, data: [] };
    }

    return { success: true, data: data || [] };
  } catch (err: any) {
    console.error('Exception fetching client reservations:', err);
    return { success: false, error: err.message, data: [] };
  }
};

export const getMerchantReservations = async () => {
  try {
    const { data: { session }, error: sessionError } = await supabase.auth.getSession();

    if (sessionError || !session?.user) {
      console.error('Session error:', sessionError);
      return { success: false, error: 'User not authenticated', data: [] };
    }

    const user = session.user;

    const { data, error } = await supabase
      .from('reservations')
      .select(`
        *,
        offer:offers(title, description, price_after, image_url),
        client:clients(first_name, last_name)
      `)
      .eq('merchant_id', user.id)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching merchant reservations:', error);
      return { success: false, error: error.message, data: [] };
    }

    return { success: true, data: data || [] };
  } catch (err: any) {
    console.error('Exception fetching merchant reservations:', err);
    return { success: false, error: err.message, data: [] };
  }
};

export const updateReservationStatus = async (
  reservationId: string,
  status: 'confirmed' | 'cancelled' | 'expired'
) => {
  try {
    const { data, error } = await supabase
      .from('reservations')
      .update({ status })
      .eq('id', reservationId)
      .select()
      .single();

    if (error) {
      console.error('Error updating reservation status:', error);
      return { success: false, error: error.message };
    }

    console.log('Reservation status updated:', data);
    return { success: true, data };
  } catch (err: any) {
    console.error('Exception updating reservation status:', err);
    return { success: false, error: err.message };
  }
};

export const cancelReservation = async (reservationId: string) => {
  return updateReservationStatus(reservationId, 'cancelled');
};

export const confirmReservation = async (reservationId: string) => {
  return updateReservationStatus(reservationId, 'confirmed');
};
