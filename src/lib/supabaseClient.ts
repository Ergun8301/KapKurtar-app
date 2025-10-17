import { createClient } from '@supabase/supabase-js'

// Récupération des variables d'environnement
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

// Logs de contrôle
console.log('✅ SepetV2 connected to:', supabaseUrl || '❌ MISSING')
console.log('Supabase environment check:', {
  hasUrl: !!supabaseUrl,
  hasKey: !!supabaseAnonKey,
  url: supabaseUrl ? `${supabaseUrl.slice(0, 35)}...` : '❌ MISSING',
})

// Sécurité : arrêt si une variable est absente
if (!supabaseUrl || !supabaseAnonKey) {
  console.error('🚨 Missing Supabase environment variables!')
  console.error('VITE_SUPABASE_URL:', supabaseUrl || '❌ MISSING')
  console.error('VITE_SUPABASE_ANON_KEY:', supabaseAnonKey ? '✅ EXISTS' : '❌ MISSING')
  throw new Error(
    'Supabase configuration error — please check your .env file and restart the dev server.'
  )
}

// Client Supabase avec options recommandées (session persistante)
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
    storage: localStorage,
  },
})
