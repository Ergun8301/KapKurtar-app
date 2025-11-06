import { createClient } from '@supabase/supabase-js'

// ✅ Variables d'environnement (URL + clé publique)
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error(
    '❌ Missing Supabase environment variables. Please check your .env file.'
  )
}

// ✅ Création du client Supabase complet (avec Realtime activé)
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
    storage: localStorage,
    storageKey: 'supabase.auth.token',
  },
  realtime: {
    params: {
      eventsPerSecond: 10, // limite pour éviter les boucles
    },
  },
})
