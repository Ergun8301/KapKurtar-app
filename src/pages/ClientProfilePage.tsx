import React, { useState, useEffect } from 'react';
import { User, Mail, Phone, Camera, Save } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { supabase } from '../lib/supabaseClient';
import { uploadImageToSupabase } from '../lib/uploadImage';

interface ClientProfile {
  first_name: string | null;
  last_name: string | null;
  email: string | null;
  phone: string | null;
  profile_photo_url: string | null;
}

const ClientProfilePage = () => {
  const { user, loading: authLoading } = useAuth();
  const [profile, setProfile] = useState<ClientProfile | null>(null);
  const [editedProfile, setEditedProfile] = useState<ClientProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isUploadingPhoto, setIsUploadingPhoto] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);

  // Charger le profil
  useEffect(() => {
    const loadProfile = async () => {
      if (!user) {
        setLoading(false);
        return;
      }

      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('first_name, last_name, email, phone, profile_photo_url')
          .eq('auth_id', user.id)
          .maybeSingle();

        if (error) throw error;
        setProfile(data);
        setEditedProfile(data);
        if (data?.profile_photo_url) {
          setPhotoPreview(data.profile_photo_url);
        }
      } catch (error) {
        console.error('Erreur chargement profil:', error);
        setToast({ message: 'Erreur chargement profil', type: 'error' });
      } finally {
        setLoading(false);
      }
    };

    if (!authLoading) {
      loadProfile();
    }
  }, [user, authLoading]);

  // Toast auto-hide
  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => setToast(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [toast]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setEditedProfile((prev) => (prev ? { ...prev, [name]: value } : null));
  };

  const handlePhotoChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;

    const MAX_SIZE = 5 * 1024 * 1024;
    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/heic', 'image/heif', 'image/avif'];

    if (file.size > MAX_SIZE) {
      setToast({ message: 'Photo trop volumineuse (max. 5 Mo)', type: 'error' });
      return;
    }

    if (!validTypes.includes(file.type.toLowerCase())) {
      setToast({ message: 'Format non pris en charge', type: 'error' });
      return;
    }

    setIsUploadingPhoto(true);
    try {
      const path = `${user.id}/avatar_${Date.now()}.jpg`;
      const photoUrl = await uploadImageToSupabase(file, 'profile-avatars', path);

      const { error: updateError } = await supabase
        .from('profiles')
        .update({ profile_photo_url: photoUrl })
        .eq('auth_id', user.id);

      if (updateError) throw updateError;

      setPhotoPreview(photoUrl);
      setProfile((prev) => (prev ? { ...prev, profile_photo_url: photoUrl } : null));
      setEditedProfile((prev) => (prev ? { ...prev, profile_photo_url: photoUrl } : null));
      setToast({ message: '✅ Photo mise à jour', type: 'success' });
    } catch (error: any) {
      console.error('Erreur upload photo:', error);
      setToast({ message: error.message || 'Erreur upload photo', type: 'error' });
    } finally {
      setIsUploadingPhoto(false);
    }
  };

  const handleSaveChanges = async () => {
    if (!user || !editedProfile) return;

    if (!editedProfile.first_name?.trim() || !editedProfile.last_name?.trim()) {
      setToast({ message: 'Prénom et nom sont obligatoires', type: 'error' });
      return;
    }

    setIsSaving(true);
    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          first_name: editedProfile.first_name.trim(),
          last_name: editedProfile.last_name.trim(),
          phone: editedProfile.phone?.trim() || null,
        })
        .eq('auth_id', user.id);

      if (error) throw error;

      setProfile(editedProfile);
      setToast({ message: '✅ Profil mis à jour', type: 'success' });
    } catch (error: any) {
      console.error('Erreur mise à jour profil:', error);
      setToast({ message: error.message || 'Erreur mise à jour', type: 'error' });
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    setEditedProfile(profile);
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#00A690]"></div>
      </div>
    );
  }

  const hasChanges =
    JSON.stringify(profile) !== JSON.stringify(editedProfile);

  return (
    <div className="min-h-screen bg-gray-50 py-4 pb-32">
      <div className="max-w-3xl mx-auto px-4">
        {/* Toast */}
        {toast && (
          <div
            className={`fixed top-4 right-4 z-50 px-4 py-2 rounded-lg shadow-lg ${
              toast.type === 'success' ? 'bg-[#00A690]' : 'bg-red-500'
            } text-white text-sm`}
          >
            {toast.message}
          </div>
        )}

        {/* Profil principal */}
        <div className="bg-white rounded-lg shadow-md p-4">
          {/* Header + Photo en ligne */}
          <div className="flex items-center gap-4 mb-4">
            {/* Photo de profil */}
            <div className="relative flex-shrink-0">
              <div className="w-20 h-20 rounded-full overflow-hidden bg-gray-200 flex items-center justify-center">
                {photoPreview ? (
                  <img src={photoPreview} alt="Profil" className="w-full h-full object-cover" />
                ) : (
                  <User className="w-10 h-10 text-gray-400" />
                )}
              </div>
              <label
                className={`absolute bottom-0 right-0 bg-[#00A690] rounded-full p-1.5 cursor-pointer hover:bg-[#F75C00] transition-colors shadow-lg ${
                  isUploadingPhoto ? 'opacity-50 cursor-not-allowed' : ''
                }`}
              >
                {isUploadingPhoto ? (
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <Camera className="w-4 h-4 text-white" />
                )}
                <input
                  type="file"
                  accept="image/*"
                  onChange={handlePhotoChange}
                  className="hidden"
                  disabled={isUploadingPhoto}
                />
              </label>
            </div>
            {/* Titre */}
            <div>
              <h1 className="text-xl font-bold text-gray-900">Profilim</h1>
              <p className="text-xs text-gray-500">Fotoğrafı değiştirmek için tıklayın</p>
            </div>
          </div>

          {/* Formulaire */}
          <div className="space-y-3">
            {/* Email (lecture seule) */}
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">E-posta</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="email"
                  value={editedProfile?.email || ''}
                  className="w-full pl-9 pr-3 py-2 text-sm border border-gray-300 rounded-lg bg-gray-50 text-gray-500"
                  disabled
                />
              </div>
            </div>

            {/* Prénom + Nom sur la même ligne */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  Ad <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="first_name"
                  value={editedProfile?.first_name || ''}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#00A690] focus:border-transparent"
                  placeholder="Ad"
                  required
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  Soyad <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="last_name"
                  value={editedProfile?.last_name || ''}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#00A690] focus:border-transparent"
                  placeholder="Soyad"
                  required
                />
              </div>
            </div>

            {/* Téléphone */}
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">
                Telefon <span className="text-gray-400">(isteğe bağlı)</span>
              </label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="tel"
                  name="phone"
                  value={editedProfile?.phone || ''}
                  onChange={handleInputChange}
                  className="w-full pl-9 pr-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#00A690] focus:border-transparent"
                  placeholder="Örn: 0532 123 45 67"
                />
              </div>
            </div>

            {/* Boutons d'action */}
            {hasChanges && (
              <div className="flex gap-3 pt-3 border-t border-gray-200">
                <button
                  onClick={handleCancel}
                  className="flex-1 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors font-medium text-sm"
                >
                  İptal
                </button>
                <button
                  onClick={handleSaveChanges}
                  disabled={isSaving}
                  className="flex-1 px-4 py-2 bg-[#00A690] text-white rounded-lg hover:bg-[#F75C00] transition-colors font-medium text-sm disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                >
                  {isSaving ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                      Kaydediliyor...
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4 mr-2" />
                      Kaydet
                    </>
                  )}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ClientProfilePage;