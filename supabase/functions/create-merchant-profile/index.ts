import { createClient } from 'jsr:@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Client-Info, Apikey',
};

interface MerchantProfileData {
  company_name: string;
  first_name?: string;
  last_name?: string;
  phone?: string;
  street?: string;
  city?: string;
  postal_code?: string;
  country?: string;
  email?: string;
}

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { status: 200, headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const authHeader = req.headers.get('Authorization');
    if (!authHeader) throw new Error('Missing Authorization header');

    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    if (authError || !user) throw new Error('Invalid authentication token');

    const body: MerchantProfileData = await req.json();

    // 🔍 Trouver le profil lié à cet utilisateur
    const { data: profileRow, error: profileError } = await supabase
      .from('profiles')
      .select('id')
      .eq('auth_id', user.id)
      .single();

    if (profileError || !profileRow) throw new Error('Profile not found for this user');

    // 🧩 Préparer la ligne marchand
    const merchantData = {
      profile_id: profileRow.id,
      company_name: body.company_name,
      email: user.email || body.email,
      first_name: body.first_name,
      last_name: body.last_name,
      phone: body.phone,
      street: body.street,
      city: body.city,
      postal_code: body.postal_code,
      country: body.country || 'FR',
    };

    // 🧠 Upsert avec clé unique profile_id
    const { data: merchant, error: insertError } = await supabase
      .from('merchants')
      .upsert(merchantData, { onConflict: 'profile_id' })
      .select()
      .single();

    if (insertError) throw insertError;

    console.log('✅ Merchant profile created:', merchant);

    return new Response(JSON.stringify({
      success: true,
      merchant,
      message: 'Merchant profile created successfully',
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error: any) {
    console.error('❌ Error in create-merchant-profile:', error);
    return new Response(JSON.stringify({
      success: false,
      error: error.message || 'Internal server error',
      details: error.toString(),
    }), {
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
