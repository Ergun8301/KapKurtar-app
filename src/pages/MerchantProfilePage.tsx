import React, { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import { supabase } from '../lib/supabaseClient';
import { uploadImageToSupabase } from '../lib/uploadImage';
import { Upload, X } from 'lucide-react';

/**
 * Page de profil marchand :
 * Permet de changer le logo du commerce, le nom, la description, etc.
 */
const MerchantProfilePage = () => {
  const { user } = useAuth();
  const [merchant, setMerchant] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [preview, setPreview] = useState<string | null>(null);
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  // Charger les infos du marchand
  useEffect(() => {
    if (!user) return;
    loadMerchant();
  }, [user]);

  const loadMerchant = async () => {
    try {
      const { data, error } = await supabase.from('merchants').select('*').eq('id', user?.id).single();
      if (error) throw error;
      setMerchant(data);
    } catch (error: any) {
      setToast({ message: 'Erreur chargement profil marchand', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  // Upload du logo
  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;

    const MAX_SIZE = 3 * 1024 * 1024;
    if (file.size > MAX_SIZE) {
      setToast({ message: 'Logo trop volumineux (max. 3 Mo).', type: 'error' });
      return;
    }

    setLogoFile(file);
    const reader = new FileReader();
    reader.onloadend = () => setPreview(reader.result as string);
    reader.readAsDataURL(file);
  };

  const handleSaveLogo = async () => {
    if (!user || !logoFile) return;
    setUploading(true);
    try {
      const path = `${user.id}/logo_${Date.now()}.jpg`;
      const url = await uploadImageToSupabase(logoFile, 'merchant-logos', path);

      const { error } = await supabase.from('merchants').update({ logo_url: url }).eq('id', user.id);
      if (error) throw error;

      setMerchant({ ...merchant, logo_url: url });
      setToast({ message: '✅ Logo mis à jour avec succès', type: 'success' });
      setLogoFile(null);
      setPreview(null);
    } catch (err: any) {
      console.error(err);
      setToast({ message: 'Erreur lors du téléchargement du logo', type: 'error' });
    } finally {
      setUploading(false);
    }
  };

  const handleUpdateInfo = async () => {
    if (!user || !merchant) return;
    try {
      const { error } = await supabase
        .from('merchants')
        .update({
          name: merchant.name,
          description: merchant.description,
        })
        .eq('id', user.id);
      if (error) throw error;
      setToast({ message: '✅ Informations mises à jour', type: 'success' });
    } catch (err: any) {
      setToast({ message: 'Erreur mise à jour infos', type: 'error' });
    }
  };

  if (loading)
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-tilkapp-blue"></div>
      </div>
    );

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center py-10">
      {toast && (
        <div
          className={`fixed top-4 right-4 px-4 py-2 rounded-lg shadow-md text-white ${
            toast.type === 'success' ? 'bg-tilkapp-blue' : 'bg-red-500'
          }`}
        >
          {toast.message}
        </div>
      )}

      <div className="bg-white rounded-2xl shadow p-8 w-full max-w-lg">
        <h1 className="text-2xl font-bold text-center mb-6 text-gray-800">Profil commerçant</h1>

        {/* Logo actuel */}
        <div className="flex flex-col items-center mb-6">
          {preview ? (
            <div className="relative">
              <img
                src={preview}
                alt="Prévisualisation"
                className="w-40 h-40 object-cover rounded-full shadow"
              />
              <button
                onClick={() => {
                  setPreview(null);
                  setLogoFile(null);
                }}
                className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          ) : merchant?.logo_url ? (
            <img
              src={merchant.logo_url}
              alt="Logo du commerçant"
              className="w-40 h-40 object-cover rounded-full shadow"
            />
          ) : (
            <div className="w-40 h-40 rounded-full bg-gray-200 flex items-center justify-center text-gray-500 text-sm">
              Aucun logo
            </div>
          )}

          <label className="mt-4 cursor-pointer flex items-center gap-2 text-blue-600 hover:text-blue-700 font-medium">
            <Upload className="w-5 h-5" />
            <span>Changer de logo</span>
            <input
              type="file"
              accept="image/*"
              capture="environment"
              onChange={handleLogoUpload}
              className="hidden"
            />
          </label>

          {preview && (
            <button
              onClick={handleSaveLogo}
              disabled={uploading}
              className="mt-3 px-6 py-2 bg-blue-700 text-white rounded-lg hover:bg-blue-800 transition"
            >
              {uploading ? 'Téléchargement...' : 'Enregistrer le logo'}
            </button>
          )}
        </div>

        {/* Infos du marchand */}
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Nom du commerce</label>
            <input
              type="text"
              value={merchant?.name || ''}
              onChange={(e) => setMerchant({ ...merchant, name: e.target.value })}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-400"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
            <textarea
              value={merchant?.description || ''}
              onChange={(e) => setMerchant({ ...merchant, description: e.target.value })}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-400"
              rows={3}
              placeholder="Décris ton commerce..."
            />
          </div>

          <button
            onClick={handleUpdateInfo}
            className="w-full bg-blue-700 text-white py-3 rounded-lg hover:bg-blue-800 transition-colors"
          >
            Enregistrer les informations
          </button>
        </div>
      </div>
    </div>
  );
};

export default MerchantProfilePage;
