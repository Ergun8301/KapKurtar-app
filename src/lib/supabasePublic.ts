import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error(
    'Missing Supabase environment variables. Please check your .env file.'
  );
}

export const supabasePublic = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: false,
    autoRefreshToken: false,
    detectSessionInUrl: false,
  },
  global: {
    headers: {},
  },
});

export function getPublicImageUrl(imageUrl: string | null | undefined): string {
  if (!imageUrl) {
    return 'https://images.pexels.com/photos/1640777/pexels-photo-1640777.jpeg?auto=compress&cs=tinysrgb&w=400';
  }

  if (imageUrl.startsWith('http')) {
    return imageUrl;
  }

  const { data } = supabasePublic.storage
    .from('product-images')
    .getPublicUrl(imageUrl);

  return data.publicUrl;
}
