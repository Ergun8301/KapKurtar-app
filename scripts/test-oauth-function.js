// Test de la fonction set_role_for_me depuis la console du navigateur
//
// INSTRUCTIONS:
// 1. Ouvrez votre application dans le navigateur
// 2. Connectez-vous avec email/password OU Google OAuth
// 3. Ouvrez la console (F12)
// 4. Copiez/collez ce code et appuyez sur Entrée

import { supabase } from '../src/lib/supabaseClient';

// Test pour assigner le rôle 'client'
async function testSetRoleClient() {
  console.log('🧪 Test: Assigner rôle CLIENT...');

  const { data: sessionData } = await supabase.auth.getSession();
  if (!sessionData.session) {
    console.error('❌ Vous devez être connecté pour tester');
    return;
  }

  console.log('✅ Utilisateur connecté:', sessionData.session.user.email);

  const { data, error } = await supabase.rpc('set_role_for_me', {
    p_role: 'client'
  });

  if (error) {
    console.error('❌ Erreur:', error);
  } else {
    console.log('✅ Rôle CLIENT assigné avec succès!');
  }

  // Vérifier le profil créé
  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('*')
    .eq('auth_id', sessionData.session.user.id)
    .single();

  if (profileError) {
    console.error('❌ Erreur récupération profil:', profileError);
  } else {
    console.log('📋 Profil créé:', profile);
  }

  // Vérifier qu'il n'y a PAS de merchant
  const { data: merchant } = await supabase
    .from('merchants')
    .select('*')
    .eq('profile_id', profile?.id)
    .maybeSingle();

  if (merchant) {
    console.log('⚠️ Merchant trouvé (ne devrait pas exister pour un client):', merchant);
  } else {
    console.log('✅ Pas de merchant (correct pour un client)');
  }
}

// Test pour assigner le rôle 'merchant'
async function testSetRoleMerchant() {
  console.log('🧪 Test: Assigner rôle MERCHANT...');

  const { data: sessionData } = await supabase.auth.getSession();
  if (!sessionData.session) {
    console.error('❌ Vous devez être connecté pour tester');
    return;
  }

  console.log('✅ Utilisateur connecté:', sessionData.session.user.email);

  const { data, error } = await supabase.rpc('set_role_for_me', {
    p_role: 'merchant'
  });

  if (error) {
    console.error('❌ Erreur:', error);
  } else {
    console.log('✅ Rôle MERCHANT assigné avec succès!');
  }

  // Vérifier le profil
  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('*')
    .eq('auth_id', sessionData.session.user.id)
    .single();

  if (profileError) {
    console.error('❌ Erreur récupération profil:', profileError);
  } else {
    console.log('📋 Profil:', profile);
  }

  // Vérifier que le merchant a été créé
  const { data: merchant, error: merchantError } = await supabase
    .from('merchants')
    .select('*')
    .eq('profile_id', profile?.id)
    .maybeSingle();

  if (merchantError) {
    console.error('❌ Erreur récupération merchant:', merchantError);
  } else if (merchant) {
    console.log('✅ Merchant créé:', merchant);
  } else {
    console.log('❌ Merchant non créé (problème)');
  }
}

// Exporter pour utilisation dans la console
window.testSetRoleClient = testSetRoleClient;
window.testSetRoleMerchant = testSetRoleMerchant;

console.log('✅ Fonctions de test chargées!');
console.log('👉 Tapez: testSetRoleClient() pour tester le rôle client');
console.log('👉 Tapez: testSetRoleMerchant() pour tester le rôle merchant');
