import { supabase } from '../lib/supabaseClient';

export const signUp = async (email: string, password: string, userData?: any) => {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
  });
  return { data, error };
};

export const signIn = async (email: string, password: string) => {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });
  return { data, error };
};

export const signInWithGoogle = async () => {
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
  });
  return { data, error };
};

export const signInWithFacebook = async () => {
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'facebook',
  });
  return { data, error };
};

export const signOut = async () => {
  try {
    const { error } = await supabase.auth.signOut();
    return { error };
  } catch (err: any) {
    console.warn('SignOut error (treating as success):', err);
    return { error: null };
  }
};

export const resetPassword = async (email: string) => {
  const { data, error } = await supabase.auth.resetPasswordForEmail(email);
  return { data, error };
};

export const updatePassword = async (newPassword: string) => {
  const { error } = await supabase.auth.updateUser({
    password: newPassword
  });
  return { error };
};

export const getCurrentUser = () => {
  return supabase.auth.getUser();
};

export const getClientProfile = async (userId: string) => {
  try {
    const { data, error } = await supabase
      .from('clients')
      .select('*')
      .eq('id', userId)
      .maybeSingle();

    if (error) throw error;
    return data;
  } catch (error) {
    console.warn('Error fetching client profile:', error);
    return null;
  }
};

export const updateClientProfile = async (userId: string, profileData: any) => {
  try {
    const { data, error } = await supabase
      .from('clients')
      .upsert({
        id: userId,
        ...profileData,
        created_at: profileData.created_at || new Date().toISOString(),
      }, {
        onConflict: 'id'
      })
      .select()
      .single();
    
    if (error) {
      console.error('Update error:', error);
      return { success: false, error: error.message };
    }
    
    return { success: true, data };
  } catch (err: any) {
    console.error('Update exception:', err);
    return { success: false, error: err.message };
  }
};

export const uploadProfilePhoto = async (file: File, userId: string): Promise<string> => {
  const fileExt = file.name.split('.').pop();
  const fileName = `${userId}-${Math.random()}.${fileExt}`;
  const filePath = `profiles/${fileName}`;

  const { error: uploadError } = await supabase.storage
    .from('avatars')
    .upload(filePath, file);

  if (uploadError) throw uploadError;

  const { data } = supabase.storage
    .from('avatars')
    .getPublicUrl(filePath);

  return data.publicUrl;
};

export const upsertClientProfile = async (userId: string, profileData: any) => {
  return updateClientProfile(userId, profileData);
};

export const setClientLocation = async (userId: string, latitude: number, longitude: number) => {
  try {
    const { data, error } = await supabase.rpc('update_client_location', {
      client_id: userId,
      latitude,
      longitude
    });

    if (error) {
      console.error('Error setting client location:', error);
      return { success: false, error: error.message };
    }

    return { success: true, data };
  } catch (err: any) {
    console.error('Exception setting client location:', err);
    return { success: false, error: err.message };
  }
};

export const setMerchantLocation = async (merchantId: string, latitude: number, longitude: number) => {
  try {
    const { data, error } = await supabase.rpc('update_merchant_location', {
      merchant_id: merchantId,
      latitude,
      longitude
    });

    if (error) {
      console.error('Error setting merchant location:', error);
      return { success: false, error: error.message };
    }

    return { success: true, data };
  } catch (err: any) {
    console.error('Exception setting merchant location:', err);
    return { success: false, error: err.message };
  }
};

export const upsertMerchantProfile = async (merchantId: string, profileData: any) => {
  try {
    const { data, error } = await supabase
      .from('merchants')
      .upsert({
        id: merchantId,
        ...profileData,
        created_at: profileData.created_at || new Date().toISOString(),
      }, {
        onConflict: 'id'
      })
      .select()
      .single();

    if (error) {
      console.error('Update merchant error:', error);
      return { success: false, error: error.message };
    }

    return { success: true, data };
  } catch (err: any) {
    console.error('Update merchant exception:', err);
    return { success: false, error: err.message };
  }
};
