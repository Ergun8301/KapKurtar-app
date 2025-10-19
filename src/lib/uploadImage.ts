import { supabase } from './supabaseClient'

/**
 * Upload une image dans le bucket Supabase "product-images"
 * @param file - Le fichier image à uploader
 * @param path - Le chemin dans le bucket (ex: offers/{merchant_id}/{uuid}.jpg)
 * @returns L’URL publique de l’image uploadée
 */
export async function uploadImageToSupabase(file: File, path: string): Promise<string | null> {
  try {
    // 🔹 1. Upload vers le bon bucket
    const { data, error } = await supabase.storage
      .from('product-images') // ⚠️ assure-toi que ce nom correspond bien à ton bucket
      .upload(path, file, {
        cacheControl: '3600',
        upsert: false,
        contentType: file.type || 'image/jpeg',
      });

    if (error) {
      console.error('❌ Erreur upload Supabase:', error.message);
      throw error;
    }

    console.log('✅ Image uploadée avec succès :', data);

    // 🔹 2. Générer l’URL publique
    const { data: publicUrlData } = supabase.storage
      .from('product-images')
      .getPublicUrl(path);

    return publicUrlData.publicUrl || null;
  } catch (err: any) {
    console.error('❌ Erreur générale upload image:', err.message);
    return null;
  }
}
