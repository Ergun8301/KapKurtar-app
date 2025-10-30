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
  if (!imageUrl || imageUrl.trim() === '') {
    console.warn('⚠️ getPublicImageUrl: No image URL provided, using placeholder');
    return 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="400" height="300"%3E%3Crect fill="%23e5e7eb" width="400" height="300"/%3E%3Ctext x="50%25" y="50%25" dominant-baseline="middle" text-anchor="middle" font-family="sans-serif" font-size="18" fill="%239ca3af"%3ENo Image%3C/text%3E%3C/svg%3E';
  }

  if (imageUrl.startsWith('http://') || imageUrl.startsWith('https://')) {
    console.log('✅ getPublicImageUrl: Using full URL directly:', imageUrl.substring(0, 80) + '...');
    return imageUrl;
  }

  console.log('🔄 getPublicImageUrl: Generating public URL for path:', imageUrl);
  const { data } = supabasePublic.storage
    .from('product-images')
    .getPublicUrl(imageUrl);

  console.log('✅ getPublicImageUrl: Generated URL:', data.publicUrl.substring(0, 80) + '...');
  return data.publicUrl;
}
