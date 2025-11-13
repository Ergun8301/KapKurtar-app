import React, { useState, useEffect } from 'react';
import {
  User, Mail, Phone, MapPin, Globe, CreditCard as Edit, Save, X,
  Lock, Heart, Award, Clock, Tag, Camera
} from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { supabase } from '../lib/supabaseClient';
import { uploadImageToSupabase } from '../lib/uploadImage';

interface ClientProfile {
  first_name: string | null;
  last_name: string | null;
  email: string | null;
  phone: string | null;
  street: string | null;
  city: string | null;
  postal_code: string | null;
  country: string | null;
  profile_photo_url: string | null;
}

const ProfilePage = () => {
  const { user, loading: authLoading } = useAuth();
  const [profile, setProfile] = useState<ClientProfile | null>(null);
  const [editedProfile, setEditedProfile] = useState<ClientProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [isEditMode, setIsEditMode] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [passwordData, setPasswordData] = useState({ newPassword: '', confirmPassword: '' });
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [isUploadingPhoto, setIsUploadingPhoto] = useState(false);

  useEffect(() => {
    const loadProfile = async () => {
      if (!user) {
        setLoading(false);
        return;
      }

      try {
        const { data, error } = await supabase
          .from('clients')
          .select('first_name, last_name, email, phone, street, city, postal_code, country, profile_photo_url')
          .eq('id', user.id)
          .maybeSingle();

        if (error) throw error;
        setProfile(data);
        setEditedProfile(data);
        if (data?.profile_photo_url) {
          setAvatarUrl(data.profile_photo_url);
        }
      } catch (error) {
        console.error('Error loading profile:', error);
      } finally {
        setLoading(false);
      }
    };

    if (!authLoading) {
      loadProfile();
    }
  }, [user, authLoading]);

  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => setToast(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [toast]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setEditedProfile(prev => prev ? { ...prev, [name]: value } : null);
  };

  const handleEditClick = () => {
    setIsEditMode(true);
    setEditedProfile(profile);
  };

  const handleCancelEdit = () => {
    setIsEditMode(false);
    setEditedProfile(profile);
  };

  const handleSaveChanges = async () => {
    if (!user || !editedProfile) return;

    setIsSaving(true);
    try {
      const { error } = await supabase
        .from('clients')
        .update({
          first_name: editedProfile.first_name,
          last_name: editedProfile.last_name,
          phone: editedProfile.phone,
          street: editedProfile.street,
          city: editedProfile.city,
          postal_code: editedProfile.postal_code,
          country: editedProfile.country,
        })
        .eq('id', user.id);

      if (error) throw error;

      setProfile(editedProfile);
      setIsEditMode(false);
      setToast({ message: '✅ Profil mis à jour', type: 'success' });
    } catch (error) {
      console.error('Error updating profile:', error);
      setToast({ message: 'Erreur mise à jour du profil', type: 'error' });
    } finally {
      setIsSaving(false);
    }
  };

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setToast({ message: 'Les mots de passe ne correspondent pas', type: 'error' });
      return;
    }

    if (passwordData.newPassword.length < 6) {
      setToast({ message: 'Le mot de passe doit contenir au moins 6 caractères', type: 'error' });
      return;
    }

    setIsChangingPassword(true);
    try {
      const { error } = await supabase.auth.updateUser({
        password: passwordData.newPassword,
      });

      if (error) throw error;

      setToast({ message: 'Mot de passe mis à jour ✅', type: 'success' });
      setShowPasswordModal(false);
      setPasswordData({ newPassword: '', confirmPassword: '' });
    } catch (error: any) {
      console.error('Error updating password:', error);
      setToast({ message: error.message || 'Erreur mise à jour mot de passe', type: 'error' });
    } finally {
      setIsChangingPassword(false);
    }
  };

  // ✅ Correction : upload vers le bucket "profile-avatars"
  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;

    const MAX_SIZE = 5 * 1024 * 1024;
    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/heic', 'image/heif', 'image/avif'];

    if (file.size > MAX_SIZE) {
      setToast({ message: 'Image trop volumineuse (max. 5 Mo).', type: 'error' });
      return;
    }

    if (!validTypes.includes(file.type.toLowerCase())) {
      setToast({ message: 'Format non pris en charge.', type: 'error' });
      return;
    }

    setIsUploadingPhoto(true);
    try {
      const path = `${user.id}/avatar_${Date.now()}.jpg`;
      const photoUrl = await uploadImageToSupabase(file, 'profile-avatars', path);

      const { error: updateError } = await supabase
        .from('clients')
        .update({ profile_photo_url: photoUrl })
        .eq('id', user.id);

      if (updateError) throw updateError;

      setAvatarUrl(photoUrl);
      setToast({ message: '✅ Photo de profil mise à jour', type: 'success' });
    } catch (error: any) {
      console.error('Error uploading photo:', error);
      setToast({ message: error.message || 'Erreur upload photo', type: 'error' });
    } finally {
      setIsUploadingPhoto(false);
    }
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-tilkapp-orange"></div>
      </div>
    );
  }

  const displayValue = (value: string | null) => value || 'Non renseigné';

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">

        {toast && (
          <div className={`fixed top-4 right-4 z-50 px-6 py-3 rounded-lg shadow-lg ${
            toast.type === 'success' ? 'bg-tilkapp-orange' : 'bg-red-500'
          } text-white`}>
            {toast.message}
          </div>
        )}

        {/* Profil principal */}
        <div className="bg-white rounded-lg shadow-md p-8">
          <div className="flex flex-col items-center mb-8">
            <div className="relative mb-4">
              <div className="w-32 h-32 rounded-full overflow-hidden bg-gray-200 flex items-center justify-center">
                {avatarUrl ? (
                  <img src={avatarUrl} alt="Profile" className="w-full h-full object-cover" />
                ) : (
                  <User className="w-16 h-16 text-gray-400" />
                )}
              </div>
              <label className={`absolute bottom-0 right-0 bg-tilkapp-orange rounded-full p-2 cursor-pointer hover:bg-orange-600 transition-colors shadow-lg ${
                isUploadingPhoto ? 'opacity-50 cursor-not-allowed' : ''
              }`}>
                {isUploadingPhoto ? (
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <Camera className="w-5 h-5 text-white" />
                )}
                <input
                  type="file"
                  accept="image/*"
                  capture="environment"
                  onChange={handleAvatarChange}
                  className="hidden"
                  disabled={isUploadingPhoto}
                />
              </label>
            </div>
            <h1 className="text-3xl font-bold text-gray-900">Mon Profil</h1>
          </div>

          {/* ... le reste de ta page inchangé (infos, favoris, activités, etc.) ... */}
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
