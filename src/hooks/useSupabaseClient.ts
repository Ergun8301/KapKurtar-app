import { supabase } from '../lib/supabaseClient';

export function useSupabaseClient() {
  return supabase;
}
