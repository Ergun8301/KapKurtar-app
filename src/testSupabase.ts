import { supabase } from './lib/supabaseClient'

export async function testFetchOffers() {
  console.log('🔎 Test: fetch offers via SDK…')
  const { data, error } = await supabase
    .from('offers')
    .select('id,title,price_after,created_at,merchant_id, merchants ( company_name, location )')
    .order('created_at', { ascending: false })
    .limit(5)

  if (error) {
    console.error('❌ Supabase select error:', error)
  } else {
    console.log('✅ Offers result:', data)
  }
}
