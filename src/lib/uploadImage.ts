// src/lib/uploadImage.ts
import { supabase } from './supabaseClient';

/**
 * Upload un fichier dans un bucket Supabase et retourne son URL publique.
 * @param file   Le fichier (File) choisi dans un <input type="file" />
 * @param bucket Nom du bucket (ex: 'product-images' | 'profile-avatars' | 'merchant-logos')
 * @param path   Chemin dans le bucket (ex: `${userId}/${uuid}.jpg`)
 */
export async function uploadImageToSupabase(file: File, bucket: string, path: string) {
  if (!file) throw new Error('Aucun fichier sélectionné');

  // Upload (upsert pour écraser si le même nom existe)
  const { error } = await supabase.storage
    .from(bucket)
    .upload(path, file, {
      cacheControl: '3600',
      upsert: true,
      contentType: file.type || 'image/jpeg',
    });

  if (error) {
    // message “Bucket not found” etc. ressortira ici
    throw error;
  }

  // URL publique
  const { data: publicData } = supabase.storage.from(bucket).getPublicUrl(path);
  return publicData?.publicUrl;
}
