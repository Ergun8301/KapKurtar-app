import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import * as path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '.env') });

async function testSupabaseConnection() {
  const supabaseUrl = process.env.VITE_SUPABASE_URL;
  const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    console.error('❌ Environment variables missing');
    console.error('VITE_SUPABASE_URL:', supabaseUrl ? '✅' : '❌');
    console.error('VITE_SUPABASE_ANON_KEY:', supabaseAnonKey ? '✅' : '❌');
    return;
  }

  console.log('Environment variables loaded:');
  console.log('VITE_SUPABASE_URL:', supabaseUrl);
  console.log('VITE_SUPABASE_ANON_KEY:', supabaseAnonKey.substring(0, 20) + '...');

  const supabase = createClient(supabaseUrl, supabaseAnonKey);

  const { data, error } = await supabase.from('profiles').select('id').limit(1);

  if (error) {
    console.error('❌ Supabase connection failed', error.message);
  } else {
    console.log('✅ Supabase connection successful');
    console.log('Query returned:', data?.length ?? 0, 'row(s)');
  }
}

testSupabaseConnection();
